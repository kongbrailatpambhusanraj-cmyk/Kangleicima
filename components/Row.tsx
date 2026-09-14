"use client";

import React, { useRef, useState } from "react";
import MovieCard from "@/components/MovieCard";
import { ChevronLeft, ChevronRight, Plus, Loader2 } from "lucide-react";

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
  inMyList?: boolean;
  displayBadge?: string | null;
  partNumber?: number | null;
  viewCount?: bigint | number | null;
  duration?: number | null;
}

interface RowProps {
  title: string;
  movies: Movie[];
  batchSize?: number;
}

export default function Row({ title, movies, batchSize = 10 }: RowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [isMoved, setIsMoved] = useState(false);
  const [visibleCount, setVisibleCount] = useState(batchSize);
  const [loadingMore, setLoadingMore] = useState(false);

  const displayedMovies = movies.slice(0, visibleCount);
  const hasMore = visibleCount < movies.length;

  const handleScroll = (direction: "left" | "right") => {
    setIsMoved(true);
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollDistance = clientWidth * 0.75;
      const target =
        direction === "left"
          ? scrollLeft - scrollDistance
          : scrollLeft + scrollDistance;

      rowRef.current.scrollTo({ left: target, behavior: "smooth" });
    }
  };

  const handleLoadMore = () => {
    setLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + batchSize);
      setLoadingMore(false);
    }, 150);
  };

  if (!movies || movies.length === 0) return null;

  return (
    <section className="space-y-2.5 group/row relative select-none">
      {/* Clean Header */}
      <div className="flex items-center justify-between pr-4 sm:pr-8">
        <h2 className="text-sm sm:text-base md:text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
          <span className="w-1 h-3.5 sm:h-4 bg-red-600 rounded-full inline-block" />
          <span>{title}</span>
        </h2>
      </div>

      {/* Carousel Track */}
      <div className="relative">
        {/* Left Arrow (Desktop) */}
        <button
          type="button"
          onClick={() => handleScroll("left")}
          aria-label="Scroll Left"
          className={`hidden md:flex absolute top-0 bottom-0 left-0 z-40 w-10 bg-black/75 hover:bg-black/95 text-white items-center justify-center transition-all duration-200 backdrop-blur-[2px] ${
            !isMoved ? "hidden" : "flex"
          }`}
        >
          <ChevronLeft size={22} className="group-hover/row:scale-110 transition-transform" />
        </button>

        {/* 16:9 Movie Track with native horizontal auto-scrolling */}
        <div
          ref={rowRef}
          className="flex items-center gap-2.5 sm:gap-3.5 overflow-x-auto scrollbar-none scroll-smooth pb-3 pt-1 pr-4 sm:pr-8"
          style={{
            WebkitOverflowScrolling: "touch",
            scrollSnapType: "x mandatory",
          }}
        >
          {displayedMovies.map((movie) => (
            <div
              key={movie.id}
              className="w-[155px] sm:w-[210px] md:w-[250px] lg:w-[280px] shrink-0"
              style={{ scrollSnapAlign: "start" }}
            >
              <MovieCard movie={movie} />
            </div>
          ))}

          {/* End-of-row "Load More" Card */}
          {hasMore && (
            <div
              className="w-[130px] sm:w-[160px] md:w-[180px] aspect-video shrink-0 flex items-center justify-center"
              style={{ scrollSnapAlign: "start" }}
            >
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="w-full h-full flex flex-col items-center justify-center gap-1.5 bg-zinc-950/80 hover:bg-zinc-900 border border-zinc-800 hover:border-red-600/80 rounded-xl text-zinc-400 hover:text-white transition duration-200 group/btn shadow-md active:scale-95"
              >
                <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 group-hover/btn:bg-red-600 group-hover/btn:border-red-500 flex items-center justify-center text-white transition">
                  {loadingMore ? (
                    <Loader2 size={15} className="animate-spin text-white" />
                  ) : (
                    <Plus size={16} />
                  )}
                </div>
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
                  {loadingMore ? "Loading..." : "Load More"}
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Right Arrow (Desktop) */}
        <button
          type="button"
          onClick={() => handleScroll("right")}
          aria-label="Scroll Right"
          className="hidden md:flex absolute top-0 bottom-0 right-0 z-40 w-10 bg-black/75 hover:bg-black/95 text-white items-center justify-center transition-all duration-200 backdrop-blur-[2px] opacity-0 group-hover/row:opacity-100"
        >
          <ChevronRight size={22} className="group-hover/row:scale-110 transition-transform" />
        </button>
      </div>
    </section>
  );
}