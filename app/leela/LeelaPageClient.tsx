"use client";
import React from 'react';
import MovieCard from '@/components/MovieCard';

interface LeelaMovie {
  id: string;
  title: string;
  thumbnail: string;
  youtubeVideoId: string | null;
  sourceUrl: string | null;
  genres: string[];
}

interface LeelaPageClientProps {
  movies: LeelaMovie[];
}

export default function LeelaPageClient({ movies }: LeelaPageClientProps) {
  return (
    <div className="pt-20 text-white min-h-screen p-8 bg-black">
      <h1 className="text-3xl font-bold mb-8">Sumang Leela</h1>
      <p className="mb-8 text-gray-400">{movies.length} films available</p>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </div>
  );
}
