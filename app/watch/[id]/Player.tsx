"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';

export default function Player({ movie }: { movie: any }) {
  const router = useRouter();

  const youtubeId = movie.youtubeVideoId;

  return (
    <div className="w-screen h-screen bg-black relative">
      <button onClick={() => router.back()} className="absolute top-8 left-8 z-50 text-white hover:text-gray-300">
        <X size={40} />
      </button>
      <div className="w-full h-full flex items-center justify-center">
        {youtubeId ? (
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=0`}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="flex flex-col items-center text-white gap-4">
             <p>Video not embeddable.</p>
             {movie.sourceUrl && (
               <a href={movie.sourceUrl} target="_blank" rel="noopener noreferrer" className="bg-red-600 px-8 py-3 rounded">
                 Watch on Official Source
               </a>
             )}
          </div>
        )}
      </div>
    </div>
  );
}
