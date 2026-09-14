"use client";

import React, { useState, useEffect } from 'react';
import { X, Play, Plus, Check, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Movie {
  id: string;
  title: string;
  description: string | null;
  thumbnail: string;
  genres: string[];
  youtubeVideoId?: string | null;
}

interface SiblingPart {
  id: string;
  title: string;
  thumbnail: string;
  description?: string | null;
  genres?: string[];
  partNumber?: number;
  displayBadge?: string | null;
}

interface MovieModalProps {
  movieId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const MovieModal = ({ movieId, isOpen, onClose }: MovieModalProps) => {
  const router = useRouter();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [activeModalMovie, setActiveModalMovie] = useState<Movie | null>(null);
  const [parts, setParts] = useState<SiblingPart[]>([]);
  const [loadingParts, setLoadingParts] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isTogglingList, setIsTogglingList] = useState(false);

  useEffect(() => {
    if (movieId && isOpen) {
      setLoadingParts(true);
      setParts([]);
      
      // Fetch movie details
      fetch(`/api/movies/${movieId}`)
        .then((res) => res.json())
        .then((data) => {
          setMovie(data);
          setActiveModalMovie(data);
        })
        .catch((err) => console.error("Error loading movie modal:", err))
        .finally(() => setLoadingParts(false));

      // Fetch related parts / series siblings if available
      fetch(`/api/movies/${movieId}/parts`)
        .then((res) => res.json())
        .then((data) => {
          if (data.parts && data.parts.length > 0) {
            setParts(data.parts);
          }
        })
        .catch(() => {
          // Fallback if parts endpoint is structured differently
          setParts([]);
        });
    }
  }, [movieId, isOpen]);

  if (!isOpen || !movie || !activeModalMovie) return null;

  const handleModalPlay = () => {
    router.push(`/watch/${activeModalMovie.id}`);
    onClose();
  };

  const handleSelectPart = (sibling: SiblingPart) => {
    setActiveModalMovie({
      ...activeModalMovie,
      id: sibling.id,
      title: sibling.title,
      thumbnail: sibling.thumbnail || activeModalMovie.thumbnail,
      description: sibling.description || activeModalMovie.description,
    });
  };

  const handleWatchlistToggle = async () => {
    if (isTogglingList) return;
    setIsTogglingList(true);
    try {
      const res = await fetch(`/api/movies/${activeModalMovie.id}/mylist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inMyList: !isSaved }),
      });
      const data = await res.json();
      if (data.inMyList !== undefined) {
        setIsSaved(data.inMyList);
      } else {
        setIsSaved(!isSaved);
      }
    } catch (err) {
      console.error("Watchlist toggle error:", err);
    } finally {
      setIsTogglingList(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-zinc-950 border border-zinc-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl relative shadow-2xl scrollbar-hide"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 text-white z-20 p-2 bg-black/70 rounded-full hover:bg-black/90 transition border border-zinc-700"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {/* Hero Preview Thumbnail */}
        <div className="aspect-[16/9] w-full relative bg-zinc-900">
          <img 
            src={activeModalMovie.thumbnail} 
            alt={activeModalMovie.title} 
            className="w-full h-full object-cover" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
        </div>

        {/* Content Section */}
        <div className="p-5 sm:p-6 space-y-4">
          <div>
            <h2 className="text-lg sm:text-2xl font-black text-white uppercase tracking-wide">
              {activeModalMovie.title}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-2 leading-relaxed">
              {activeModalMovie.description || "Manipuri digital cinema performance catalog entry."}
            </p>
          </div>

          {/* Genres */}
          <div className="flex gap-1.5 flex-wrap">
            {activeModalMovie.genres && activeModalMovie.genres.map((genre) => (
              <span key={genre} className="bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-md text-xs text-zinc-300 font-medium">
                {genre}
              </span>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button 
              onClick={handleModalPlay} 
              className="bg-red-600 hover:bg-red-500 text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 text-xs sm:text-sm shadow-lg shadow-red-950 transition active:scale-95"
            >
              <Play fill="currentColor" size={15} /> Play Movie
            </button>

            <button
              onClick={handleWatchlistToggle}
              disabled={isTogglingList}
              className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 px-4 py-2.5 rounded-lg font-semibold flex items-center gap-2 text-xs sm:text-sm transition active:scale-95"
            >
              {isSaved ? <Check size={16} className="text-red-500" /> : <Plus size={16} />}
              <span>{isSaved ? "Saved to List" : "Add to List"}</span>
            </button>
          </div>

          {/* Loading Parts Indicator & Part Selector */}
          <div className="pt-3 border-t border-zinc-800/80">
            {loadingParts ? (
              <div className="flex items-center gap-2 text-zinc-400 text-xs py-2">
                <Loader2 size={14} className="animate-spin text-red-600" />
                <span>Checking for series parts...</span>
              </div>
            ) : parts.length > 1 ? (
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Select Part:
                </div>
                <div className="flex flex-wrap gap-2 bg-zinc-900/60 border border-zinc-800/80 p-2 rounded-xl">
                  {parts.map((p, idx) => {
                    const isActive = p.id === activeModalMovie.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleSelectPart(p)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                          isActive
                            ? "bg-red-600 text-white shadow-md shadow-red-950"
                            : "bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700"
                        }`}
                      >
                        {isActive && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                        <span>{p.displayBadge || `Part ${idx + 1}`}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieModal;