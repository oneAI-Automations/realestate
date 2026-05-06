import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";

function isValidUrl(url: string) {
  try {
    const u = new URL(url);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

export const isSupabaseConfigured =
  !!supabaseUrl && !!supabaseAnonKey && isValidUrl(supabaseUrl);

const client: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

type AuthError = { message: string };

export const supabase = {
  auth: {
    signInWithPassword: (creds: { email: string; password: string }) =>
      client
        ? client.auth.signInWithPassword(creds)
        : Promise.resolve({
            data: { user: null, session: null },
            error: { message: "Supabase not configured" } as AuthError,
          }),
    getUser: () =>
      client
        ? client.auth.getUser()
        : Promise.resolve({ data: { user: null }, error: null }),
    signOut: () =>
      client
        ? client.auth.signOut()
        : Promise.resolve({ error: null }),
    onAuthStateChange: (
      ..._args: Parameters<SupabaseClient["auth"]["onAuthStateChange"]>
    ) =>
      client
        ? client.auth.onAuthStateChange(..._args)
        : { data: { subscription: { unsubscribe: () => {} } } },
  },
};
