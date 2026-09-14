"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { 
  User, 
  Mail, 
  Bookmark, 
  Film, 
  LogOut, 
  ArrowLeft, 
  ShieldCheck, 
  Calendar,
  ExternalLink
} from "lucide-react";

interface UserProfileStats {
  watchlistCount: number;
  joinedDate: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<UserProfileStats>({
    watchlistCount: 0,
    joinedDate: "",
  });

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;

      if (!currentUser) {
        router.push("/login");
        return;
      }

      setUser(currentUser);

      // Fetch saved watchlist count
      try {
        const res = await fetch(
          `/api/watchlist?userId=${currentUser.id}&email=${encodeURIComponent(currentUser.email || "")}`
        );
        if (res.ok) {
          const data = await res.json();
          setStats({
            watchlistCount: data.movieIds?.length || data.movies?.length || 0,
            joinedDate: currentUser.created_at
              ? new Date(currentUser.created_at).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })
              : "Active Member",
          });
        }
      } catch (err) {
        console.error("Failed to load profile metrics:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const displayName = user.user_metadata?.full_name || user.email?.split("@")[0] || "Cinema Enthusiast";
  const avatarUrl = user.user_metadata?.avatar_url;

  return (
    <main className="min-h-screen bg-black text-white pt-24 pb-20 px-4 sm:px-8 lg:px-12 max-w-4xl mx-auto">
      {/* Back Link */}
      <div className="mb-6">
        <Link
          href="/browse"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} /> Back to Catalog
        </Link>
      </div>

      <div className="space-y-8">
        {/* ── PROFILE HEADER CARD ──────────────────────────────────── */}
        <div className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
            {/* Avatar */}
            <div className="relative">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-red-600/60 shadow-lg shadow-red-950/40"
                />
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-zinc-900 border border-zinc-700 flex items-center justify-center text-red-500 shadow-lg">
                  <User size={48} />
                </div>
              )}
              <div className="absolute -bottom-2 -right-2 bg-red-600 text-white p-1.5 rounded-lg shadow-md">
                <ShieldCheck size={16} />
              </div>
            </div>

            {/* Profile Info */}
            <div className="space-y-2 text-center sm:text-left flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
                    {displayName}
                  </h1>
                  <p className="text-zinc-400 text-xs sm:text-sm flex items-center justify-center sm:justify-start gap-1.5 mt-0.5">
                    <Mail size={14} className="text-zinc-500" />
                    {user.email}
                  </p>
                </div>

                <button
                  onClick={handleSignOut}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-red-950/40 border border-zinc-800 hover:border-red-600/60 text-zinc-300 hover:text-red-400 text-xs font-semibold transition active:scale-95 shadow-sm"
                >
                  <LogOut size={15} />
                  <span>Sign Out</span>
                </button>
              </div>

              <div className="pt-3 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-zinc-500">
                <span className="flex items-center gap-1.5">
                  <Calendar size={13} />
                  Member since {stats.joinedDate}
                </span>
                <span className="inline-block w-1 h-1 rounded-full bg-zinc-700" />
                <span className="text-zinc-400">Authenticated via Google</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── STATS & METRICS ──────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <Link
            href="/my-list"
            className="group bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700 rounded-2xl p-6 transition-all shadow-lg hover:shadow-red-950/20 flex items-center justify-between"
          >
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                <Bookmark size={14} className="text-red-500" /> Watchlist
              </span>
              <p className="text-3xl font-black text-white group-hover:text-red-500 transition-colors">
                {stats.watchlistCount}
              </p>
              <p className="text-xs text-zinc-500">Titles currently saved in your list</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-white group-hover:border-zinc-700 transition">
              <ExternalLink size={18} />
            </div>
          </Link>

          <Link
            href="/browse"
            className="group bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700 rounded-2xl p-6 transition-all shadow-lg hover:shadow-red-950/20 flex items-center justify-between"
          >
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                <Film size={14} className="text-red-500" /> Film Catalog
              </span>
              <p className="text-3xl font-black text-white group-hover:text-red-500 transition-colors">
                Explore
              </p>
              <p className="text-xs text-zinc-500">Stream Shumang Leela and Manipuri films</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-white group-hover:border-zinc-700 transition">
              <ExternalLink size={18} />
            </div>
          </Link>
        </div>

        {/* ── ACCOUNT DETAILS & SECURITY ───────────────────────────── */}
        <div className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-300">
            Account Details
          </h2>

          <div className="space-y-3 text-xs divide-y divide-zinc-900">
            <div className="flex items-center justify-between pt-2">
              <span className="text-zinc-500">Provider</span>
              <span className="font-semibold text-zinc-300">Google OAuth 2.0</span>
            </div>
            <div className="flex items-center justify-between pt-3">
              <span className="text-zinc-500">User ID</span>
              <span className="font-mono text-zinc-400 text-[11px] truncate max-w-[200px] sm:max-w-none">
                {user.id}
              </span>
            </div>
            <div className="flex items-center justify-between pt-3">
              <span className="text-zinc-500">Session Status</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}