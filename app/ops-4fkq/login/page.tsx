import { redirect } from "next/navigation";
import { headers } from "next/headers";
import {
  isAdminConfigured,
  isAuthenticated,
  loginAllowed,
  clientKey,
  loginSucceeded,
  startSession,
  verifyCredentials,
} from "@/lib/admin/auth";

export const metadata = { robots: "noindex", title: "Sign in" };
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function signIn(formData: FormData) {
  "use server";

  const key = clientKey(await headers());

  if (!loginAllowed(key)) {
    // Redirect rather than render: the server action stays a pure redirect and
    // no detail is echoed back into the form.
    redirect("/ops-4fkq/login?error=locked");
  }

  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");

  // Do the work even when the fields are empty. Returning early on empty input
  // would make "empty form" distinguishable from "wrong password" by timing.
  const ok = verifyCredentials(username, password);

  if (ok) {
    loginSucceeded(key);
    await startSession();
    redirect("/ops-4fkq");
  }

  // One generic message for every failure mode. Naming the field that was wrong
  // would confirm a valid username to an attacker.
  redirect("/ops-4fkq/login?error=invalid");
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  if (await isAuthenticated()) redirect("/ops-4fkq");

  const configured = isAdminConfigured();
  const error = searchParams.error;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 p-4 text-slate-200">
      <form
        action={signIn}
        className="w-full max-w-sm space-y-4 rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl"
      >
        <div className="mb-2 flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-sm font-bold text-emerald-400">
            ///
          </span>
          <div>
            <h1 className="text-base font-extrabold text-white">Ops console</h1>
            <p className="text-xs text-slate-500">Technical team only</p>
          </div>
        </div>

        {!configured ? (
          <div className="space-y-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-200">
            <p className="font-bold">Not configured.</p>
            <p>
              Set <code className="font-mono">ADMIN_USERNAME</code> and{" "}
              <code className="font-mono">ADMIN_PASSWORD</code> in the deployment environment, then
              redeploy. Env changes only apply to fresh deployments.
            </p>
          </div>
        ) : (
          <>
            {error === "invalid" ? (
              <p role="alert" className="rounded-lg border border-red-500/40 bg-red-500/10 p-2.5 text-xs text-red-200">
                Incorrect username or password.
              </p>
            ) : null}
            {error === "locked" ? (
              <p role="alert" className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-2.5 text-xs text-amber-200">
                Too many attempts. Wait 15 minutes.
              </p>
            ) : null}

            <div>
              <label htmlFor="username" className="text-xs font-medium text-slate-400">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                autoFocus
                required
                // 16px minimum: below that iOS zooms the viewport on focus.
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-base text-white focus:border-[#2c87c3] focus:outline-none sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="password" className="text-xs font-medium text-slate-400">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-base text-white focus:border-[#2c87c3] focus:outline-none sm:text-sm"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-[#2c87c3] py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#3d97d1]"
            >
              Sign in
            </button>
          </>
        )}

        <a href="/" className="block text-center text-xs text-slate-500 transition-colors hover:text-slate-300">
          Back to the public site
        </a>
      </form>
    </main>
  );
}