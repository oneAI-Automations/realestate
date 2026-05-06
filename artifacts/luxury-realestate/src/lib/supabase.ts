import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";

// Debug: log first 20 chars of URL to browser console (safe — no key exposure)
if (import.meta.env.DEV) {
  console.log("[Supabase] URL prefix:", supabaseUrl.slice(0, 30) || "(empty)");
  console.log("[Supabase] Key set:", !!supabaseAnonKey);
}

function isValidUrl(url: string) {
  if (!url) return false;
  try {
    const u = new URL(url);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

export const isSupabaseConfigured =
  !!supabaseUrl && !!supabaseAnonKey && isValidUrl(supabaseUrl);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
