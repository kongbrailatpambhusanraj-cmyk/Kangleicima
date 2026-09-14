"use client";

import React, { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function LoginPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setErrorMsg("");

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
      }
    } catch {
      setErrorMsg("An unexpected error occurred during sign-in.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full bg-black text-white flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Floating Back to Home */}
      <div className="absolute top-6 left-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-zinc-400 hover:text-white bg-zinc-900/80 border border-zinc-800 px-4 py-2 rounded-full text-xs font-semibold backdrop-blur-md transition"
        >
          <ArrowLeft size={14} />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-sm bg-zinc-950/90 border border-zinc-800/90 rounded-2xl p-7 shadow-2xl relative z-10 text-center">
        {/* Brand Header */}
        <div className="mb-6">
          <Link href="/" className="font-black text-2xl tracking-wider select-none inline-flex items-center">
            <span className="text-white">KANGLEI</span>
            <span className="text-red-600 ml-0.5">CIMA</span>
          </Link>
          <p className="text-zinc-400 text-xs mt-2">
            Sign in to access your Watchlist and synced history.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-950/40 border border-red-800/60 rounded-xl text-red-400 text-xs font-medium text-left">
            {errorMsg}
          </div>
        )}

        {/* Google Sign-In Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-3 px-4 bg-white hover:bg-zinc-100 text-zinc-900 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-3 transition shadow-lg active:scale-95 disabled:opacity-70 cursor-pointer"
        >
          {loading ? (
            <Loader2 size={18} className="animate-spin text-zinc-900" />
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          )}
          <span>{loading ? "Connecting..." : "Continue with Google"}</span>
        </button>

        <p className="text-[11px] text-zinc-500 mt-6 leading-normal">
          By continuing, you agree to KangleiCima Terms of Service and Privacy Policy.
        </p>
      </div>
    </main>
  );
}