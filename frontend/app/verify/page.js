"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

function VerifyOtpForm() {
  const { verifyOtp, resendOtp } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const initialEmail = params.get("email") || "";

  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    try {
      await verifyOtp(email, code);
      router.push("/login?verified=1");
    } catch (err) {
      const data = err?.response?.data;
      const msg = data ? Object.values(data).flat().join(" ") : "Verification failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const onResend = async () => {
    setError("");
    setInfo("");
    setResending(true);
    try {
      await resendOtp(email);
      setInfo("A new code has been sent to your email.");
    } catch (err) {
      const data = err?.response?.data;
      const msg = data ? Object.values(data).flat().join(" ") : "Could not resend code.";
      setError(msg);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-6 py-20">
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-1.5 text-xs text-emerald-300">
          📩 One more step
        </span>
        <h1 className="mt-5 font-display text-3xl font-bold text-white">Verify your email</h1>
        <p className="mt-2 text-sm text-slate-400">Enter the 6-digit code we emailed to you.</p>
      </div>

      <div className="glass-card mt-8 rounded-3xl p-6 shadow-glow sm:p-8">
        {error && (
          <div className="mb-4 rounded-xl border border-red-400/30 bg-red-400/10 px-3 py-2 text-sm text-red-300">
            {error}
          </div>
        )}
        {info && (
          <div className="mb-4 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-300">
            {info}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-300">Verification code</label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              maxLength={6}
              placeholder="123456"
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 text-center text-lg font-semibold tracking-[0.5em] text-white placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-gradient-to-r from-emerald-500 to-sky-500 py-2.5 text-sm font-semibold text-black shadow-glow transition hover:brightness-110 disabled:opacity-60"
          >
            {loading ? "Verifying…" : "Verify account"}
          </button>
        </form>

        <button
          onClick={onResend}
          disabled={resending}
          className="mt-3 w-full text-sm text-emerald-400 hover:text-emerald-300 disabled:opacity-60"
        >
          {resending ? "Sending…" : "Resend code"}
        </button>

        <p className="mt-6 text-center text-sm text-slate-400">
          <Link href="/login" className="font-medium text-emerald-400 hover:text-emerald-300">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={null}>
      <VerifyOtpForm />
    </Suspense>
  );
}
