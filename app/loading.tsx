import React from "react";

export default function Loading() {
  return (
    <main className="min-h-screen bg-black text-white overflow-hidden pb-24">
      {/* Hero Skeleton */}
      <div className="w-full h-[55vh] sm:h-[65vh] md:h-[75vh] bg-zinc-900/60 animate-pulse relative">
        <div className="absolute bottom-16 left-4 sm:left-8 space-y-3 max-w-md">
          <div className="w-32 h-5 bg-zinc-800 rounded-full" />
          <div className="w-72 h-10 bg-zinc-800 rounded-lg" />
          <div className="w-56 h-4 bg-zinc-800 rounded" />
          <div className="w-36 h-10 bg-zinc-800 rounded-xl mt-2" />
        </div>
      </div>

      {/* Row Skeletons */}
      <div className="relative z-20 -mt-12 space-y-8 pl-4 sm:pl-8">
        {[1, 2, 3].map((row) => (
          <div key={row} className="space-y-3">
            <div className="w-44 h-5 bg-zinc-800/80 rounded" />
            <div className="flex gap-3 overflow-hidden">
              {[1, 2, 3, 4, 5, 6].map((card) => (
                <div
                  key={card}
                  className="w-[150px] sm:w-[210px] md:w-[250px] aspect-[16/9] bg-zinc-900/80 rounded-md shrink-0 animate-pulse"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}