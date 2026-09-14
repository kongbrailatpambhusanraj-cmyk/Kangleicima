"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Play, Info, Sparkles } from "lucide-react";

interface HeroMovie {
  id: string;
  title: string;
  description?: string | null;
  thumbnail: string;
  genres?: string[];
  duration?: number | null;
  viewCount?: bigint | number | null;
}

interface HeroProps {
  movie: HeroMovie;
}

export default function Hero({ movie }: HeroProps) {
  const [imgLoaded, setImgLoaded] = useState(false);

  // Format view count cleanly (e.g., 25.4K)
  const formatViews = (views?: bigint | number | null) => {
    if (!views) return null;
    const num = typeof views === "bigint" ? Number(views) : views;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M views`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K views`;
    return `${num} views`;
  };

  return (
    <div className="relative w-full h-[55vh] sm:h-[65vh] md:h-[75vh] lg:h-[82vh] bg-zinc-950 overflow-hidden select-none">
      {/* Background Backdrop Poster */}
      {movie.thumbnail && (
        <img
          src={movie.thumbnail}
          alt={movie.title}
          onLoad={() => setImgLoaded(true)}
          className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-700 ${
            imgLoaded ? "opacity-45 scale-100 filter brightness-90" : "opacity-0 scale-105"
          }`}
        />
      )}

      {/* Cinematic Vignettes */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent z-10 w-full md:w-3/4" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-10" />

      {/* Text & Quick Actions */}
      <div className="absolute bottom-12 sm:bottom-20 md:bottom-28 left-4 sm:left-8 z-20 max-w-xl sm:max-w-2xl space-y-3 sm:space-y-4">
        {/* Spotlight Pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/20 border border-red-600/80 text-red-500 text-[11px] font-black uppercase tracking-widest backdrop-blur-md shadow-lg shadow-red-950/40">
          <Sparkles size={13} />
          <span>Featured Presentation</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-white drop-shadow-2xl line-clamp-2">
          {movie.title}
        </h1>

        {/* Metadata Badges */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs text-zinc-300 font-semibold drop-shadow-md">
          {formatViews(movie.viewCount) && (
            <span className="text-emerald-400 font-bold bg-emerald-950/40 border border-emerald-800/60 px-2 py-0.5 rounded">
              {formatViews(movie.viewCount)}
            </span>
          )}
          <span className="bg-zinc-900/90 border border-zinc-700/80 px-2 py-0.5 rounded uppercase tracking-wider text-[10px] text-zinc-200">
            Full HD
          </span>
          {movie.genres?.slice(0, 2).map((g, idx) => (
            <span key={idx} className="text-zinc-400">
              • {g}
            </span>
          ))}
        </div>

        {/* Overview */}
        <p className="text-zinc-300 text-xs sm:text-sm md:text-base line-clamp-3 leading-relaxed drop-shadow-md max-w-xl">
          {movie.description || "Stream authentic Manipuri cinema and celebrated stage performances in full digital format."}
        </p>

        {/* Call to Actions */}
        <div className="pt-2 flex items-center gap-3">
          <Link
            href={`/watch/${movie.id}`}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-xl shadow-red-950 active:scale-95 transition"
          >
            <Play size={17} className="fill-current" />
            <span>Play Now</span>
          </Link>
          <Link
            href={`/movie/${movie.id}`}
            className="flex items-center gap-2 bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-xl backdrop-blur-md transition active:scale-95"
          >
            <Info size={17} />
            <span>More Info</span>
          </Link>
        </div>
      </div>
    </div>
  );
}