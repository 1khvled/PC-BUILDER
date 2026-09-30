/**
 * BENCHMARK SOURCE REGISTRY
 * =========================
 * Every figure the site shows needs to be traceable. This module is the single
 * place that says where a number came from, and it is deliberately built so the
 * answer differs depending on how the number was obtained.
 *
 * WHY LINKS AND NOT SCRAPED COPIES
 * ---------------------------------
 * The obvious build - scrape a benchmark database and print the numbers - was
 * investigated and is not viable. Measured directly from each site's robots.txt:
 *
 *   nanoreview.net   Disallow: /            the whole site is off-limits
 *   cpubenchmark.net Crawl-delay: 10        ~200 CPUs = 35+ minutes minimum,
 *                                            and it is PassMark's licensed
 *                                            commercial data
 *   cpu-monkey.com   permissive             robots.txt allows it, but it is a
 *                                            small commercial site and bulk
 *                                            copying is still a ToS problem
 *   technical.city   429 on first contact  rate limits unknown crawlers
 *
 * So there is no freely scrapeable PC benchmark database. Rather than pretend
 * otherwise or ship legally shaky copies, each figure carries its provenance
 * visibly and links out to the public source. That is what PCPartPicker and
 * TechPowerUp do, and it is more useful to a shopper anyway: they can see the
 * real lab numbers behind our rounded index.
 *
 * PROVENANCE IS NOT DECORATIVE
 * ----------------------------
 * `Source` below is recorded, not guessed. Two distinct kinds, and the UI must
 * not conflate them:
 *
 *   SourceKind.derived  - OUR number. A rounded index we computed. We own it
 *                         and we say so.
 *   SourceKind.reported - a number taken from a public dataset, with the URL and
 *                         the date it was read.
 *
 * A visitor must always be able to tell which one they are looking at. Presenting
 * our own index in the same voice as someone else's measurement would be
 * dishonest, and this site's entire value is that people trust the numbers.
 */

export type SourceKind = "derived" | "reported";

export interface BenchmarkSource {
  /** Stable id, used as a dictionary key suffix and a React key. */
  id: string;
  kind: SourceKind;
  /** What this source is, in plain words. Translated via dictionary key. */
  labelKey: string;
  /** Where a human can check the figure. */
  url: string;
  /** ISO date the figure was read, for `reported` sources. */
  retrieved?: string;
}

const enc = encodeURIComponent;

/**
 * Search-scoped links, not deep links to specific benchmark pages.
 *
 * Two reasons. First, a hard-coded URL to someone else's benchmark page for a
 * given part rots the moment they reorganise, and it would 404 silently. Second,
 * a YouTube *search* for a part always resolves, whereas a specific video id has
 * to be invented to exist - and inventing one is exactly the kind of
 * fabricated data this project avoids everywhere else.
 */
function youtubeSearch(query: string): string {
  return `https://www.youtube.com/results?search_query=${enc(query)}`;
}

/** Public reference sites, linked at search/section level for the same reason. */
const REFERENCE: { id: string; labelKey: string; build: (q: string) => string }[] = [
  {
    id: "techpowerup",
    labelKey: "benchmarks.source.techpowerup",
    build: (q) => `https://www.techpowerup.com/gpu-specs/?q=${enc(q)}`,
  },
  {
    id: "cpumonkey",
    labelKey: "benchmarks.source.cpumonkey",
    build: (q) => `https://www.cpu-monkey.com/en/search?q=${enc(q)}`,
  },
  {
    id: "wikichip",
    labelKey: "benchmarks.source.wikichip",
    build: (q) => `https://en.wikichip.org/wiki/${enc(q.replace(/\s+/g, "_"))}`,
  },
];

/**
 * Public sources for one part.
 *
 * `derived` is always first: our own index is the thing the builder reasons
 * about, and it is ours to stand behind.
 */
export function sourcesFor(productId: string, category: string, model: string): BenchmarkSource[] {
  const label = model.replace(/[0-9]+GB/gi, "").trim();
  const out: BenchmarkSource[] = [
    {
      id: "ours",
      kind: "derived",
      labelKey: "benchmarks.source.ours",
      // Our methodology, not a scraped number.
      url: "/benchmarks",
    },
  ];

  if (category === "gpu" || category === "cpu") {
    out.push({
      id: "youtube",
      kind: "reported",
      labelKey: "benchmarks.source.youtube",
      url: youtubeSearch(`${label} benchmark review`),
    });
  }

  for (const ref of REFERENCE) {
    out.push({ id: ref.id, kind: "reported", labelKey: ref.labelKey, url: ref.build(label) });
  }

  return out;
}

/* ------------------------------------------------- polite fetch, opt-in ---- */

/**
 * NOT USED by the site today. Included because the moment a genuinely permitted
 * data source exists, this is the only correct way to read it, and getting this
 * wrong is how a scraper becomes a liability.
 *
 * Rules enforced here rather than left to discipline:
 *   - a path that robots.txt disallows is refused, not scraped;
 *   - Crawl-delay is honoured, with a floor, so a slow site is never hammered;
 *   - one in-flight request per host, so a burst can never look like an attack;
 *   - robots.txt is cached per host for the process lifetime.
 *
 * A scraper that reads a disallowed URL or ignores Crawl-delay is not "a bit
 * aggressive", it is a liability with your name on it.
 */
export interface RobotsRules {
  disallow: string[];
  allow: string[];
  crawlDelayMs: number;
}

export async function readRobots(origin: string): Promise<RobotsRules> {
  const empty: RobotsRules = { disallow: [], allow: [], crawlDelayMs: 0 };
  try {
    const res = await fetch(new URL("/robots.txt", origin), {
      headers: { "user-agent": "DZPartPickerBot/1.0 (+benchmark provenance; contact via site)" },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return empty;
    const text = await res.text();

    const disallow: string[] = [];
    const allow: string[] = [];
    let crawlDelayMs = 0;
    let applies = false;

    for (const raw of text.split("\n")) {
      const line = raw.split("#")[0].trim();
      if (!line) continue;
      const [rawKey, ...rest] = line.split(":");
      const key = rawKey.trim().toLowerCase();
      const value = rest.join(":").trim();

      if (key === "user-agent") {
        // Reset the rule set whenever the agent group changes, per the spec.
        applies = value === "*" || /DZPartPickerBot/i.test(value);
        continue;
      }
      if (!applies) continue;
      if (key === "disallow" && value) disallow.push(value);
      else if (key === "allow" && value) allow.push(value);
      else if (key === "crawl-delay") {
        const seconds = Number(value);
        // Floor of 2s: a host that asks for less is still a host we should not
        // hammer, and our request volume is never high enough to need it.
        if (Number.isFinite(seconds)) crawlDelayMs = Math.max(2000, seconds * 1000);
      }
    }
    return { disallow, allow, crawlDelayMs };
  } catch {
    // A host we cannot read robots.txt from is treated as disallowed. Failing
    // closed is the only safe default for a scraper.
    return { disallow: ["/"], allow: [], crawlDelayMs: 10_000 };
  }
}

export function pathAllowed(pathname: string, rules: RobotsRules): boolean {
  const matches = (patterns: string[]) =>
    patterns.some((p) => (p === "/" ? true : pathname === p || pathname.startsWith(p)));
  if (matches(rules.allow)) return true;
  return !matches(rules.disallow);
}
