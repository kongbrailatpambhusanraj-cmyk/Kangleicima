import { prisma } from "@/lib/prisma";
import InfiniteCatalog from "@/components/InfiniteCatalog";
import Link from "next/link";
import { Theater, ArrowLeft, Play } from "lucide-react";

export const revalidate = 0;

export default async function LeelaPage() {
  const BATCH_SIZE = 24;

  const leelaCondition = {
    availabilityStatus: { not: "UNAVAILABLE" as const },
    OR: [
      { genres: { has: "Sumang Leela" } },
      { genres: { has: "Leela" } },
      { title: { contains: "Leela", mode: "insensitive" as const } },
      { description: { contains: "Leela", mode: "insensitive" as const } },
    ],
  };

  const [spotlight, movies, total] = await Promise.all([
    prisma.movie.findFirst({
      where: leelaCondition,
      orderBy: [
        { viewCount: "desc" },
        { id: "asc" },
      ],
    }),
    prisma.movie.findMany({
      where: leelaCondition,
      select: {
        id: true,
        title: true,
        thumbnail: true,
        youtubeVideoId: true,
        sourceUrl: true,
        genres: true,
        isFullMovie: true,
        groupId: true,
        viewCount: true,
        duration: true,
      },
      orderBy: [
        { viewCount: "desc" },
        { id: "asc" },
      ],
      take: BATCH_SIZE,
    }),
    prisma.movie.count({ where: leelaCondition }),
  ]);

  const serializedMovies = movies.map((m) => ({
    ...m,
    viewCount:
      m.viewCount !== null && m.viewCount !== undefined
        ? Number(m.viewCount)
        : null,
  }));

  return (
    <main className="min-h-screen bg-black text-white pt-20 pb-24 px-4 sm:px-8">
      {spotlight && (
        <div className="relative w-full h-[40vh] sm:h-[50vh] rounded-3xl overflow-hidden bg-zinc-950 border border-zinc-800 mb-10 flex items-end p-6 sm:p-10">
          <img
            src={spotlight.thumbnail}
            alt={spotlight.title}
            className="absolute inset-0 w-full h-full object-cover opacity-30 brightness-75"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

          <div className="relative z-10 max-w-xl space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/20 border border-red-600 text-red-500 text-[11px] font-black uppercase tracking-wider">
              <Theater size={13} />
              <span>Sumang Leela Spotlight</span>
            </div>
            <h1 className="text-xl sm:text-3xl font-black uppercase tracking-tight text-white line-clamp-2">
              {spotlight.title}
            </h1>
            <div className="pt-2">
              <Link
                href={`/watch/${spotlight.id}`}
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-red-950 transition active:scale-95"
              >
                <Play size={14} className="fill-current" />
                <span>Watch Spotlight Play</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-zinc-800/80 pb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wide">
            Sumang Leela <span className="text-red-600">Collection</span>
          </h2>
          <p className="text-zinc-400 text-xs mt-1">
            Total {total} stage plays preserved in archive.
          </p>
        </div>

        <Link
          href="/"
          className="self-start sm:self-auto flex items-center gap-1.5 text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-3.5 py-2 rounded-lg text-zinc-300 hover:text-white transition"
        >
          <ArrowLeft size={14} />
          <span>Home</span>
        </Link>
      </div>

      <InfiniteCatalog
        initialMovies={serializedMovies}
        initialTotal={total}
        catalogType="leela"
      />
    </main>
  );
}