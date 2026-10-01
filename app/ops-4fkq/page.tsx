import { redirect } from "next/navigation";
import { endSession, isAuthenticated } from "@/lib/admin/auth";
import { buildAdminData } from "@/lib/admin/data";
import AdminShell from "@/components/admin/AdminShell";

export const metadata = { robots: "noindex", title: "Ops" };

/**
 * Dynamic, and that is a security boundary rather than a performance choice.
 *
 * Without this the route is prerendered at BUILD time: the auth check is
 * evaluated during the build and its result is frozen into a static HTML file.
 * Measured before this line existed: a request with correct credentials, a
 * request with wrong credentials and a request with none all returned a
 * byte-identical 47KB page, because the decision had already been made.
 *
 * The safe failure mode is a permanently locked console. The unsafe one is a
 * build that happens to have ADMIN_PASSWORD set: the authenticated console gets
 * written to disk and served to anyone who requests the path with no cookie.
 */
export const dynamic = "force-dynamic";

/** node:crypto is used by lib/admin/auth for HMAC session signing. Edge would
 *  fail to resolve it at module load and throw on every request. */
export const runtime = "nodejs";

async function signOut() {
  "use server";
  await endSession();
  redirect("/ops-4fkq/login");
}

export default async function OpsPage() {
  // One guard, one login UI. Fails closed when the credentials are unset.
  if (!(await isAuthenticated())) redirect("/ops-4fkq/login");

  // One fetch pass for the whole console. The old page computed its figures
  // inline in JSX, running PRODUCTS.find over OFFERS three times per request.
  const data = await buildAdminData();

  return <AdminShell data={data} signOutAction={signOut} consolePath="/ops-4fkq" />;
}