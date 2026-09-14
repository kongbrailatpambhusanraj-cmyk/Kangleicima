"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import MovieCard from './MovieCard';

interface Movie {
  id: string;
  title: string;
  thumbnail: string;
  youtubeVideoId: string | null;
  sourceUrl: string | null;
  isFullMovie?: boolean;
  groupId?: string | null;
  inMyList: boolean;
}

interface InfiniteMovieGridProps {
  initialMovies: Movie[];
  initialHasMore: boolean;
  pageSize?: number;
  apiPath?: string;
}

export default function InfiniteMovieGrid({
  initialMovies,
  initialHasMore,
  pageSize = 18,
  apiPath = '/api/movies/browse',
}: InfiniteMovieGridProps) {
  const [movies, setMovies] = useState<Movie[]>(initialMovies);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Synchronous refs prevent race conditions & stale state closures on PC
  const pageRef = useRef(2);
  const isFetchingRef = useRef(false);
  const hasMoreRef = useRef(initialHasMore);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const fetchNextPage = useCallback(async () => {
    if (isFetchingRef.current || !hasMoreRef.current) return;

    isFetchingRef.current = true;
    setIsLoadingMore(true);

    try {
      const currentPage = pageRef.current;
      const separator = apiPath.includes('?') ? '&' : '?';
      const res = await fetch(`${apiPath}${separator}page=${currentPage}&limit=${pageSize}`);

      if (!res.ok) throw new Error('Failed to fetch movies');

      const data = await res.json();
      const newMovies: Movie[] = data.movies || [];

      if (newMovies.length === 0) {
        hasMoreRef.current = false;
        setHasMore(false);
      } else {
        setMovies((prev) => {
          const existingIds = new Set(prev.map((m) => m.id));
          const deduped = newMovies.filter((m) => !existingIds.has(m.id));
          return [...prev, ...deduped];
        });

        const more = Boolean(data.hasMore);
        hasMoreRef.current = more;
        setHasMore(more);

        if (more) {
          pageRef.current += 1;
        }
      }
    } catch (err) {
      console.error('Pagination error:', err);
    } finally {
      setIsLoadingMore(false);
      isFetchingRef.current = false;
    }
  }, [apiPath, pageSize]);

  // 1. Intersection Observer for Mobile and standard scrolling
  useEffect(() => {
    const target = sentinelRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreRef.current && !isFetchingRef.current) {
          fetchNextPage();
        }
      },
      {
        rootMargin: '500px', // Starts loading well ahead of the bottom
        threshold: 0,
      }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [fetchNextPage]);

  // 2. Window Scroll Listener (Guarantees PC mouse-wheel triggers page 3, 4, etc.)
  useEffect(() => {
    const handleScroll = () => {
      if (isFetchingRef.current || !hasMoreRef.current) return;

      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // When user scrolls within 600px of the bottom on PC
      if (scrollY + windowHeight >= documentHeight - 600) {
        fetchNextPage();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [fetchNextPage]);

  // 3. Desktop Auto-Fill: If a widescreen monitor fits all cards without scrolling, load more
  useEffect(() => {
    if (
      document.documentElement.scrollHeight <= window.innerHeight + 200 &&
      hasMoreRef.current &&
      !isFetchingRef.current
    ) {
      fetchNextPage();
    }
  }, [movies.length, fetchNextPage]);

  return (
    <div className="w-full">
      {/* Responsive Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 justify-items-center">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}

        {/* Skeleton cards while fetching next batch */}
        {isLoadingMore &&
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={`skeleton-${i}`}
              className="w-[140px] sm:w-[200px] md:w-[240px] lg:w-[280px] aspect-[16/9] bg-zinc-900/80 rounded-lg animate-pulse border border-zinc-800/40"
            />
          ))}
      </div>

      {/* Target Anchor */}
      <div ref={sentinelRef} className="h-20 w-full pointer-events-none" />

      {!hasMore && movies.length > 0 && (
        <p className="text-zinc-500 text-xs text-center py-8">
          You've reached the end of the collection
        </p>
      )}
    </div>
  );
}