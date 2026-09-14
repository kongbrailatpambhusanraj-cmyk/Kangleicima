"use client";

import React, { useState, useEffect, useRef, useId } from "react";
import MovieCard from "@/components/MovieCard";
import { Loader2, Film, ChevronDown, Search } from "lucide-react";

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
  viewCount?: number | null;
  duration?: number | null;
}

interface InfiniteCatalogProps {
  initialMovies: Movie[];
  initialTotal: number;
  catalogType: "movies" | "leela" | "all";
  initialGenre?: string;
  initialSearch?: string;
}

const BATCH_SIZE = 24;

function dedupe(arr: Movie[]): Movie[] {
  const map = new Map<string, Movie>();
  for (const item of arr) {
    if (item && item.id) {
      map.set(item.id, item);
    }
  }
  return Array.from(map.values());
}

export default function InfiniteCatalog({
  initialMovies,
  initialTotal,
  catalogType,
  initialGenre = "",
  initialSearch = "",
}: InfiniteCatalogProps) {
  const catalogInstanceId = useId();
  const [mounted, setMounted] = useState(false);
  const [movies, setMovies] = useState<Movie[]>(() => dedupe(initialMovies));
  const [total, setTotal] = useState<number>(initialTotal);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [search, setSearch] = useState<string>(initialSearch);

  const searchRef = useRef(search);
  const isMountedRef = useRef(false);
  const loadMoreButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setMovies(dedupe(initialMovies));
    setTotal(initialTotal);
    setPage(1);
  }, [initialMovies, initialTotal]);

  // Live Search & Genre Pagination fetch sync
  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      return;
    }

    if (searchRef.current === search) return;
    searchRef.current = search;

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/movies/catalog?type=${catalogType}&genre=${encodeURIComponent(
            initialGenre
          )}&page=1&limit=${BATCH_SIZE}&search=${encodeURIComponent(search)}`
        );
        const data = await res.json();
        setMovies(dedupe(data.movies || []));
        setTotal(data.total || 0);
        setPage(1);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search, catalogType, initialGenre]);

  const loadNextPage = async () => {
    if (loading || movies.length >= total) return;
    setLoading(true);
    const nextPage = page + 1;

    try {
      const res = await fetch(
        `/api/movies/catalog?type=${catalogType}&genre=${encodeURIComponent(
          initialGenre
        )}&page=${nextPage}&limit=${BATCH_SIZE}&search=${encodeURIComponent(
          search
        )}`
      );
      const data = await res.json();

      if (data.movies && data.movies.length > 0) {
        setMovies((prev) => {
          const map = new Map<string, Movie>();
          for (const m of prev) map.set(m.id, m);
          for (const m of data.movies) map.set(m.id, m);
          return Array.from(map.values());
        });
        setPage(nextPage);
        setTotal(data.total);
      }
    } catch (err) {
      console.error("Pagination error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Automatically trigger loadNextPage when the Load More button enters viewport
  useEffect(() => {
    const buttonElement = loadMoreButtonRef.current;
    if (!buttonElement) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && movies.length < total) {
          loadNextPage();
        }
      },
      { threshold: 0.1, rootMargin: "300px" }
    );

    observer.observe(buttonElement);

    return () => {
      if (buttonElement) observer.unobserve(buttonElement);
    };
  }, [loading, movies.length, total, page, search, initialGenre, catalogType]);

  const hasMore = movies.length < total;

  if (!mounted) {
    return (
      <div className="space-y-6">
        <div className="w-full h-14 bg-zinc-950 border border-zinc-800/80 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4.5">
          {initialMovies.map((_, i) => (
            <div key={i} className="w-full aspect-video bg-zinc-900 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Live Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-zinc-950 border border-zinc-800/80 p-3.5 rounded-2xl">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search titles or artists..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-600 transition"
          />
        </div>

        <div className="text-xs text-zinc-400 font-semibold self-end sm:self-auto">
          Showing <span className="text-white font-bold">{movies.length}</span> of{" "}
          <span className="text-red-500 font-bold">{total}</span> titles
        </div>
      </div>

      {/* Grid */}
      {movies.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4.5">
          {movies.map((movie, index) => (
            <div
              key={`${catalogInstanceId}-${movie.id}-${index}`}
              className="w-full"
            >
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-zinc-500 text-sm flex flex-col items-center gap-2">
          <Film size={28} className="text-zinc-600" />
          <span>No content matching your search.</span>
        </div>
      )}

      {/* Auto-Trigger Load More Section */}
      {hasMore && (
        <div className="pt-8 pb-12 flex justify-center">
          <button
            ref={loadMoreButtonRef}
            type="button"
            onClick={loadNextPage}
            disabled={loading}
            className="group flex items-center gap-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-red-600 text-white font-black text-xs uppercase tracking-wider px-8 py-3.5 rounded-xl transition shadow-lg active:scale-95 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin text-red-500" />
                <span>Loading Titles...</span>
              </>
            ) : (
              <>
                <ChevronDown size={16} className="text-red-500 group-hover:translate-y-0.5 transition-transform" />
                <span>Load More ({total - movies.length} remaining)</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}