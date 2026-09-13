// Full-market refresh driver: drives /api/cron/refresh job by job,
// merges full.json, then bakes live.ts + supabase-seed.json.
// Resumable via refresh-progress.json. Run a local dev server first.
//
//   npm run dev                              # terminal 1 (port 3000)
//   node scripts/refresh-full.mjs            # terminal 2 (all jobs)
//   node scripts/refresh-full.mjs --limit 20 # bounded run, resume later
//   node scripts/refresh-full.mjs --merge-only [--push]
//
// Flags: --base URL --limit N --stores a,b --skip-ok --merge-only --push
import fs from "fs";
import { execSync } from "child_process";

const _argv = process.argv.slice(2);
const args = {};
for (let i = 0; i < _argv.length; i++) {
  const m = _argv[i].match(/^--([^=]+)(=(.*))?$/);
  if (!m) continue;
  if (m[3] !== undefined) args[m[1]] = m[3];
  else if (i + 1 < _argv.length && !_argv[i + 1].startsWith("--")) args[m[1]] = _argv[++i];
  else args[m[1]] = true;
}
const BASE = String(args.base || "http://localhost:3000");
const LIMIT = args.limit ? Number(args.limit) : Infinity;
const ONLY_STORES = args["stores"] ? String(args["stores"]).split(",") : [];
const SKIP_OK = Boolean(args["skip-ok"]);
const MERGE_ONLY = Boolean(args["merge-only"]);
const PUSH = Boolean(args.push);
const ROOT = new URL("../", import.meta.url).pathname.replace(/^\//, "") + "/";
const PROGRESS = ROOT + "refresh-progress.json";

function loadEnv() {
  const env = {};
  try {
    for (const line of fs.readFileSync(ROOT + ".env.local", "utf8").split(/\r?\n/)) {
      const i = line.indexOf("=");
      if (i > 0) env[line.slice(0, i).trim()] = line.slice(i + 1).trim();
    }
  } catch { /* optional */ }
  return env;
}
const ENV = loadEnv();

async function get(path, timeoutMs = 240000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const headers = {};
    if (ENV.CRON_SECRET) headers.Authorization = `Bearer ${ENV.CRON_SECRET}`;
    const r = await fetch(`${BASE}${path}`, { headers, signal: ctrl.signal });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  } finally {
    clearTimeout(t);
  }
}

function loadProgress() {
  try {
    return JSON.parse(fs.readFileSync(PROGRESS, "utf8"));
  } catch {
    return { done: {}, report: {} };
  }
}
function saveProgress(p) {
  fs.writeFileSync(PROGRESS, JSON.stringify(p));
}

async function main() {
  const prog = loadProgress();
  prog.done = prog.done || {};
  prog.report = prog.report || {};

  if (!MERGE_ONLY) {
    const matrix = await get("/api/cron/refresh?matrix=1");
    const jobs = [];
    for (const [store, cats] of Object.entries(matrix.stores)) {
      if (ONLY_STORES.length && !ONLY_STORES.includes(store)) continue;
      for (const cat of cats) jobs.push({ kind: "store", store, cat, key: `${store}/${cat}` });
    }
    let queries = [];
    if (!SKIP_OK) {
      const { queries: qs } = await get("/api/cron/refresh?oklist=1");
      queries = qs || [];
    }
    for (const q of queries) jobs.push({ kind: "ok", q, key: `ouedkniss:${q}` });
    const pending = jobs.filter((j) => !prog.done[j.key]);
    console.log(`jobs: total=${jobs.length} done=${jobs.length - pending.length} pending=${pending.length} limit=${LIMIT === Infinity ? "inf" : LIMIT}`);
    let ran = 0;
    for (const job of pending) {
      if (ran >= LIMIT) break;
      const path = job.kind === "store"
        ? `/api/cron/refresh?store=${encodeURIComponent(job.store)}&cat=${encodeURIComponent(job.cat)}&full=1&ok=0`
        : `/api/cron/refresh?okq=${encodeURIComponent(job.q)}`;
      let lastErr = null;
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const data = await get(path);
          const rep = data.report || {};
          for (const [k, v] of Object.entries(rep)) {
            if (k === "ouedkniss:all") {
              prog.report["ouedkniss:all"] = [...(prog.report["ouedkniss:all"] || []), ...(Array.isArray(v) ? v : [])];
            } else {
              prog.report[k] = v;
            }
          }
          prog.done[job.key] = { at: new Date().toISOString() };
          lastErr = null;
          break;
        } catch (e) {
          lastErr = e;
          await new Promise((r) => setTimeout(r, 3000));
        }
      }
      if (lastErr) {
        prog.done[job.key] = { at: new Date().toISOString(), error: String(lastErr.message || lastErr).slice(0, 160) };
        console.log(`FAIL ${job.key}: ${lastErr.message || lastErr}`);
      } else {
        const e = prog.report[job.key];
        console.log(`ok ${job.key}: ${e && typeof e.count === "number" ? e.count : JSON.stringify(e).slice(0, 80)}`);
      }
      saveProgress(prog);
      ran++;
      await new Promise((r) => setTimeout(r, 1500));
    }
    const remaining = jobs.filter((j) => !prog.done[j.key] || prog.done[j.key].error).length;
    console.log(`run done. remaining jobs with no data: ${remaining}`);
    if (remaining > 0) {
      console.log("Re-run to continue (progress saved). Skipping merge.");
      return;
    }
  }

  // Merge full.json (backup previous), then bake + seed.
  if (fs.existsSync(ROOT + "full.json")) fs.copyFileSync(ROOT + "full.json", ROOT + "full.prev.json");
  fs.writeFileSync(ROOT + "full.json", JSON.stringify({ ok: true, report: prog.report }));
  console.log("full.json written, report keys=" + Object.keys(prog.report).length);
  execSync("node bake.cjs", { cwd: ROOT, stdio: "inherit" });
  execSync("node scripts/seed-from-live.cjs", { cwd: ROOT, stdio: "inherit" });
  const seed = JSON.parse(fs.readFileSync(ROOT + "supabase-seed.json", "utf8"));
  console.log(`seed ready: products=${seed.products.length} stores=${seed.stores.length} offers=${seed.offers.length} day=${seed.day}`);

  if (PUSH) {
    if (!ENV.SUPABASE_SERVICE_ROLE_KEY) throw new Error("SUPABASE_SERVICE_ROLE_KEY missing in .env.local");
    execSync("node scripts/push-supabase.mjs", {
      cwd: ROOT,
      stdio: "inherit",
      env: {
        ...process.env,
        SUPABASE_URL: ENV.NEXT_PUBLIC_SUPABASE_URL,
        SUPABASE_SERVICE_KEY: ENV.SUPABASE_SERVICE_ROLE_KEY,
      },
    });
  }
  console.log("REFRESH DONE");
}

main().catch((e) => {
  console.error("REFRESH FAILED:", e.message);
  process.exit(1);
});
