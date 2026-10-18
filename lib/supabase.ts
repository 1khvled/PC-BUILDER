import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const DEFAULT_SUPABASE_URL = "https://sculmoqvdfcohnvtsrsb.supabase.co";
// Publishable (anon) key only: it ships in every browser bundle by design and
// reads run under RLS. The service-role key that used to live here was PUBLIC
// in this repo - treat it as compromised and rotate it in the Supabase
// dashboard, then keep it exclusively in CI secrets / .env.local for scripts.
// Do not reinstate a service-role fallback anywhere in app code.
const DEFAULT_SUPABASE_KEY = "sb_publishable_-cT3trWXAE6Ld0-w_xh-yQ_Ao3MQ6xr";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_KEY;

/** True when the app is configured to read the live Supabase catalog. */
export function isDbConfigured(): boolean {
  return URL.length > 0 && KEY.length > 0;
}

let client: SupabaseClient | null = null;

/**
 * Supabase client to read the live Supabase catalog.
 * Uses environment variables when set, and falls back to the project URL +
 * publishable key so Vercel deployments and preview environments always
 * connect directly to the live Supabase DB (read-only, RLS enforced).
 */
export function supabase(): SupabaseClient {
  if (!isDbConfigured()) {
    throw new Error(
      "Supabase env missing (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY)"
    );
  }
  if (!client) {
    client = createClient(URL, KEY, { auth: { persistSession: false } });
  }
  return client;
}
