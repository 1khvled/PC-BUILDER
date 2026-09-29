import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const DEFAULT_SUPABASE_URL = "https://sculmoqvdfcohnvtsrsb.supabase.co";
const DEFAULT_SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjdWxtb3F2ZGZjb2hudnRzcnNiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTI1MzUzOSwiZXhwIjoyMTA0ODI5NTM5fQ.E3z8bCYuPwQ2apMz5Swk0nDQb0t5D3w4PERWsppj06Y";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  DEFAULT_SUPABASE_KEY;

/** True when the app is configured to read the live Supabase catalog. */
export function isDbConfigured(): boolean {
  return URL.length > 0 && KEY.length > 0;
}

let client: SupabaseClient | null = null;

/**
 * Supabase client to read the live Supabase catalog.
 * Uses environment variables when set, and falls back to production project credentials
 * so Vercel deployments and preview environments ALWAYS connect directly to live Supabase DB.
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
