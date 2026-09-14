"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Play, Info, Plus, Check } from "lucide-react";

interface Movie {
  id: string;
  title: string;
  thumbnail: string;
  youtubeVideoId?: string | null;
  sourceUrl?: string | null;
  description?: string | null;
  genres?: string[];
  isFullMovie?: boolean;
  groupId?: string | null;
  inMyList?: boolean;
  viewCount?: bigint | number | null;
  duration?: number | null;
}

interface MovieCardProps {
  movie: Movie;
}

export default function MovieCard({ movie }: MovieCardProps) {
  const router = useRouter();
  const [inList, setInList] = useState(Boolean(movie.inMyList));
  const [listLoading, setListLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [parts, setParts] = useState<any[]>([]);
  const [loadingParts, setLoadingParts] = useState(false);

  const partMatch = movie.title.match(/part\s*(\d+)/i);
  const partBadge = partMatch ? `Part ${partMatch[1]}` : null;

  const formatViews = (views?: bigint | number | null) => {
    if (!views) return null;
    const count = typeof views === "bigint" ? Number(views) : views;
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M views`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K views`;
    return `${count} views`;
  };

  const toggleWatchlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (listLoading) return;

    setListLoading(true);
    const newState = !inList;
    setInList(newState);

    try {
      await fetch(`/api/movies/${movie.id}/mylist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inMyList: newState }),
      });
    } catch {
      setInList(!newState);
    } finally {
      setListLoading(false);
    }
  };

  const openQuickInfo = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setModalOpen(true);

    if (parts.length === 0) {
      setLoadingParts(true);
      try {
        const res = await fetch(`/api/movies/${movie.id}/parts`);
        const data = await res.json();
        setParts(data.parts || []);
      } catch {
        setParts([]);
      } finally {
        setLoadingParts(false);
      }
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    openQuickInfo();
  };

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={handleCardClick}
        style={{ touchAction: "pan-x pan-y" }}
        className="group relative w-full aspect-video rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800/80 hover:border-red-600/80 transition-all duration-300 shadow-md hover:shadow-2xl hover:shadow-red-950/40 hover:-translate-y-1 cursor-pointer select-none"
      >
        {/* Pure Poster Image */}
        <img
          src={movie.thumbnail}
          alt={movie.title}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out pointer-events-none"
        />

        {/* Shaded Backdrop */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          {partBadge ? (
            <span className="bg-red-600 text-white font-black text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md shadow-md">
              {partBadge}
            </span>
          ) : (
            <span />
          )}

          {movie.isFullMovie && (
            <span className="bg-black/80 border border-zinc-700/80 text-zinc-300 font-bold text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded backdrop-blur-sm">
              Full HD
            </span>
          )}
        </div>

        {/* Tiny Bottom-Right Corner Action Buttons (Always visible or softly styled) */}
        <div className="absolute bottom-1.5 right-1.5 z-20 flex items-center gap-1">
          <button
            type="button"
            onClick={toggleWatchlist}
            title={inList ? "Remove from List" : "Add to List"}
            className={`p-1 rounded-md backdrop-blur-md border transition shadow-sm ${
              inList
                ? "bg-red-600 border-red-500 text-white"
                : "bg-black/75 border-zinc-700/80 text-zinc-300 hover:text-white hover:bg-zinc-900"
            }`}
          >
            {inList ? <Check size={11} /> : <Plus size={11} />}
          </button>

          <button
            type="button"
            onClick={(e) => openQuickInfo(e)}
            title="Series Parts & Info"
            className="p-1 rounded-md bg-black/75 backdrop-blur-md border border-zinc-700/80 text-zinc-300 hover:text-white hover:bg-zinc-900 transition shadow-sm"
          >
            <Info size={11} />
          </button>
        </div>

        {/* Movie Details & Title (Reveals on Hover) */}
        <div className="absolute bottom-0 left-0 right-0 p-2.5 sm:p-3 z-10 flex flex-col justify-end opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
          <h3 className="text-xs sm:text-sm font-black text-white tracking-wide truncate drop-shadow-md group-hover:text-red-400 transition-colors">
            {movie.title}
          </h3>

          <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-semibold mt-0.5">
            {formatViews(movie.viewCount) && (
              <span className="text-emerald-400">{formatViews(movie.viewCount)}</span>
            )}
            {movie.genres?.[0] && (
              <>
                <span className="text-zinc-600">•</span>
                <span className="truncate max-w-[100px]">{movie.genres[0]}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-1.5 mt-2.5">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/watch/${movie.id}`);
              }}
              className="flex-1 flex items-center justify-center gap-1.5 bg-red-600 hover:bg-red-500 text-white font-bold text-[11px] py-1.5 rounded-lg shadow-md transition active:scale-95"
            >
              <Play size={12} className="fill-current" />
              <span>Watch</span>
            </button>
          </div>
        </div>
      </div>

      {/* Series Sibling & Quick Info Modal */}
      {modalOpen && (
        <div
          onClick={() => setModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="relative aspect-video w-full bg-zinc-900">
              <img
                src={movie.thumbnail}
                alt={movie.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                <div>
                  <h2 className="text-base sm:text-lg font-black uppercase text-white drop-shadow">
                    {movie.title}
                  </h2>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {formatViews(movie.viewCount)}
                  </p>
                </div>
                <Link
                  href={`/watch/${movie.id}`}
                  className="flex items-center gap-1.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow-lg shadow-red-950"
                >
                  <Play size={13} className="fill-current" />
                  <span>Play</span>
                </Link>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-zinc-300 text-xs leading-relaxed max-h-24 overflow-y-auto">
                {movie.description || "Digital cinema record preserved on KangleiCima."}
              </p>

              <div className="border-t border-zinc-800/80 pt-3">
                <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
                  Available Parts & Episodes
                </div>

                {loadingParts ? (
                  <div className="text-xs text-zinc-500">Checking series parts...</div>
                ) : parts.length > 1 ? (
                  <div className="flex flex-wrap gap-2">
                    {parts.map((part) => {
                      const isCurrent = part.id === movie.id;
                      return (
                        <Link
                          key={part.id}
                          href={`/watch/${part.id}`}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                            isCurrent
                              ? "bg-red-600 text-white shadow-md shadow-red-950"
                              : "bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800"
                          }`}
                        >
                          <Play size={10} className="fill-current" />
                          <span>{part.displayBadge || `Part ${part.partNumber}`}</span>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-xs text-zinc-500">Single complete feature film.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}