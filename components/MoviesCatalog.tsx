"use client";

import React, { useState, useMemo } from "react";
import MovieCard from "@/components/MovieCard";
import { Search, Film, Loader2, ChevronDown } from "lucide-react";

interface Movie {
  id: string;
  title: string;
  thumbnail: string;
  youtubeVideoId: string | null;
  sourceUrl?: string | null;
  description?: string | null;
  genres?: string[];
  isFullMovie?: boolean;
  groupId?: string | null;
  viewCount?: bigint | number | null;
  duration?: number | null;
}

interface MoviesCatalogProps {
  initialMovies: Movie[];
}

const BATCH_SIZE = 18; // 18 movies per page (3 full rows on desktop)

export default function MoviesCatalog({ initialMovies }: MoviesCatalogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"views" | "latest" | "title">("views");
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Filter & sort across full collection
  const filteredMovies = useMemo(() => {
    let list = [...initialMovies];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.genres?.some((g) => g.toLowerCase().includes(q))
      );
    }

    if (sortBy === "views") {
      list.sort((a, b) => Number(b.viewCount || 0) - Number(a.viewCount || 0));
    } else if (sortBy === "title") {
      list.sort((a, b) => a.title.localeCompare(b.title));
    }

    return list;
  }, [initialMovies, searchTerm, sortBy]);

  const displayedMovies = filteredMovies.slice(0, visibleCount);
  const hasMore = visibleCount < filteredMovies.length;
  const remaining = filteredMovies.length - visibleCount;

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + BATCH_SIZE);
      setIsLoadingMore(false);
    }, 150);
  };

  return (
    <div className="space-y-6">
      {/* Search & Sort Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-zinc-950 border border-zinc-800/80 p-3 rounded-2xl">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setVisibleCount(BATCH_SIZE);
            }}
            placeholder="Search films or genres..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-600 transition"
          />
        </div>

        <div className="flex items-center justify-between w-full sm:w-auto gap-4">
          <div className="text-xs text-zinc-400 font-semibold">
            Showing <span className="text-white font-bold">{displayedMovies.length}</span> of{" "}
            <span className="text-red-500 font-bold">{filteredMovies.length}</span> films
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none focus:border-red-600 cursor-pointer"
          >
            <option value="views">Most Popular</option>
            <option value="latest">Default Order</option>
            <option value="title">Title (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Spaced 16:9 Cinema Grid */}
      {displayedMovies.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4.5">
          {displayedMovies.map((movie) => (
            <div key={movie.id} className="w-full">
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-zinc-500 text-sm flex flex-col items-center gap-2">
          <Film size={28} className="text-zinc-600" />
          <span>No movies matching "{searchTerm}"</span>
        </div>
      )}

      {/* Load More Button */}
      {hasMore && (
        <div className="pt-10 pb-6 flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="group flex items-center gap-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-red-600 text-white font-black text-xs uppercase tracking-wider px-8 py-3.5 rounded-xl transition shadow-lg active:scale-95 cursor-pointer"
          >
            {isLoadingMore ? (
              <>
                <Loader2 size={16} className="animate-spin text-red-500" />
                <span>Loading Films...</span>
              </>
            ) : (
              <>
                <ChevronDown size={16} className="text-red-500 group-hover:translate-y-0.5 transition-transform" />
                <span>Load More Films ({remaining} remaining)</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}