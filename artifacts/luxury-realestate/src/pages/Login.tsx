import { useState } from "react";
import { useLocation } from "wouter";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { Lock } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!isSupabaseConfigured || !supabase) {
      setError("Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
      return;
    }
    setLoading(true);
    setError("");
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (authError) {
      setError(authError.message);
    } else {
      setLocation("/admin");
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <p className="font-serif text-[#D4AF37] text-2xl mb-1">Elite Estates</p>
          <p className="text-white/30 text-xs tracking-[0.4em] uppercase">Owner Portal</p>
        </div>

        <div className="border border-white/10 p-8 bg-[#0a0a0a]">
          <div className="flex items-center justify-center mb-8">
            <div className="w-12 h-12 border border-[#D4AF37]/40 flex items-center justify-center">
              <Lock size={20} className="text-[#D4AF37]" />
            </div>
          </div>

          {!isSupabaseConfigured && (
            <div className="mb-6 p-4 border border-yellow-500/30 bg-yellow-500/5 text-yellow-400 text-xs leading-relaxed">
              Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable login.
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <div>
              <label className="text-white/40 text-xs tracking-widest uppercase block mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full bg-black border border-white/20 text-white px-4 py-3 text-sm focus:outline-none focus:border-[#D4AF37] transition-colors placeholder-white/20"
                placeholder="admin@example.com"
                data-testid="input-email"
              />
            </div>
            <div>
              <label className="text-white/40 text-xs tracking-widest uppercase block mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full bg-black border border-white/20 text-white px-4 py-3 text-sm focus:outline-none focus:border-[#D4AF37] transition-colors placeholder-white/20"
                placeholder="••••••••"
                data-testid="input-password"
              />
            </div>

            {error && (
              <p
                className="text-red-400 text-xs border border-red-500/20 bg-red-500/5 px-3 py-2"
                data-testid="text-error"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#D4AF37] text-black font-bold text-xs tracking-widest uppercase py-4 hover:bg-[#e8c94a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              data-testid="btn-login"
            >
              {loading ? "Authenticating..." : "Access Dashboard"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
