import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** True when the app is configured to read the live Supabase catalog. */
export function isDbConfigured(): boolean {
  return URL.length > 0 && ANON.length > 0;
}

let client: SupabaseClient | null = null;

/**
 * Anon client (reads via the public-read RLS policies).
 * Throws when env is missing — callers in lib/data/catalog.ts fall back to the static bake.
 */
export function supabase(): SupabaseClient {
  if (!isDbConfigured()) {
    throw new Error(
      "Supabase env missing (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY)"
    );
  }
  if (!client) {
    client = createClient(URL, ANON, { auth: { persistSession: false } });
  }
  return client;
}
