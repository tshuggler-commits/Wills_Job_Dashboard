"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password");
    } else {
      router.push("/dashboard");
    }
  }

  const inputClass =
    "w-full px-4 h-12 text-sm border border-border rounded-std bg-surface text-text-primary outline-none focus:border-text-primary transition-colors";

  return (
    <div className="min-h-screen login-gradient flex flex-col items-center justify-center px-4">
      {/* Branding */}
      <div className="flex flex-col items-center mb-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/icons/icon-192x192.png"
          alt=""
          className="w-20 h-20 rounded-2xl"
        />
        <h1 className="text-[28px] font-bold text-white mt-4">
          Career Compass
        </h1>
        <p className="text-sm text-white/70 mt-1">
          Will&apos;s Job Search Dashboard
        </p>
      </div>

      {/* Login card */}
      <div className="w-full max-w-[360px] bg-white rounded-2xl p-8 shadow-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wide">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wide">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className={inputClass}
            />
          </div>

          {error && (
            <p className="text-sm text-red font-medium">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-green text-white font-semibold text-sm rounded-std hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>

      {/* Footer */}
      <p className="text-white/40 text-xs mt-8">
        Built with care by Tanya
      </p>
    </div>
  );
}
