import { redirect } from "next/navigation";
import { headers } from "next/headers";
import {
  isAdminConfigured,
  isAuthenticated,
  loginAllowed,
  loginSucceeded,
  retryAfterMs,
  startSession,
  verifyCredentials,
} from "@/lib/admin/auth";

export const metadata = { robots: "noindex", title: "Admin - Sign in" };
export const dynamic = "force-dynamic";

async function signIn(formData: FormData) {
  "use server";

  const h = await headers();
  const key = (await import("@/lib/admin/auth")).clientKey(h);

  if (!loginAllowed(key)) {
    // Redirect with a flag rather than rendering the error here, so the server
    // action stays a pure redirect and no detail is echoed into the form.
    redirect("/admin-kh7/login?error=locked");
  }

  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");

  // Do the work even when the fields are empty: returning early on empty input
  // would make "empty form" distinguishable from "wrong credentials" by timing.
  const ok = verifyCredentials(username, password);

  if (ok) {
    loginSucceeded(key);
    await startSession();
    redirect("/admin-kh7");
  }

  // One generic message for every failure mode. Naming which field was wrong
  // would confirm a valid username to an attacker.
  redirect("/admin-kh7/login?error=invalid");
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: { error?: string; retry?: string };
}) {
  // Already signed in? Skip the form.
  if (await isAuthenticated()) redirect("/admin-kh7");

  const configured = isAdminConfigured();
  const error = searchParams.error;
  const retrySec = searchParams.retry ? Number(searchParams.retry) : 0;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center p-4">
      <form
        action={signIn}
        className="bg-slate-900 border border-slate-800 rounded-2xl p-8 w-full max-w-sm shadow-2xl space-y-4"
      >
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
            ??
          </div>
          <div>
            <h1 className="font-extrabold text-white text-base">DZ-PartPicker Ops</h1>
            <p className="text-xs text-slate-500">Restricted to the technical team</p>
          </div>
        </div>

        {!configured ? (
          <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-200 space-y-1">
            <p className="font-bold">Admin access is not configured.</p>
            <p>
              Set <code className="font-mono">ADMIN_USERNAME</code> and{" "}
              <code className="font-mono">ADMIN_PASSWORD</code> in the deployment environment, then
              redeploy.
            </p>
          </div>
        ) : (
          <>
            {error === "invalid" && (
              <p role="alert" className="rounded-lg border border-red-500/40 bg-red-500/10 p-2.5 text-xs text-red-200">
                Incorrect username or password.
              </p>
            )}
            {error === "locked" && (
              <p role="alert" className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-2.5 text-xs text-amber-200">
                Too many attempts. Try again in {retrySec > 0 ? retrySec : 900} seconds.
              </p>
            )}

            <div>
              <label htmlFor="username" className="text-xs text-slate-400 font-medium">
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
                className="mt-1 w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-base sm:text-sm text-white focus:border-[#2c87c3] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="password" className="text-xs text-slate-400 font-medium">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="mt-1 w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-base sm:text-sm text-white focus:border-[#2c87c3] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-[#2c87c3] hover:bg-[#3d97d1] text-white font-bold text-sm py-2.5 transition-colors"
            >
              Sign in
            </button>
          </>
        )}

        <a href="/" className="block text-center text-xs text-slate-500 hover:text-slate-300">
          Back to the public site
        </a>
      </form>
    </main>
  );
}
