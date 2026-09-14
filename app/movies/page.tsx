import { prisma } from "@/lib/prisma";
import InfiniteCatalog from "@/components/InfiniteCatalog";
import Link from "next/link";
import { Film, ArrowLeft } from "lucide-react";

export const revalidate = 0;

export default async function MoviesPage() {
  const BATCH_SIZE = 24;

  const whereClause = {
    availabilityStatus: { not: "UNAVAILABLE" as const },
    NOT: {
      genres: { has: "Sumang Leela" },
    },
  };

  const [movies, total] = await Promise.all([
    prisma.movie.findMany({
      where: whereClause,
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
    prisma.movie.count({ where: whereClause }),
  ]);

  const serializedMovies = movies.map((m) => ({
    ...m,
    viewCount:
      m.viewCount !== null && m.viewCount !== undefined
        ? Number(m.viewCount)
        : null,
  }));

  return (
    <main className="min-h-screen bg-black text-white pt-24 pb-20 px-4 sm:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-zinc-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 text-red-600 mb-1">
            <Film size={18} />
            <span className="text-xs font-bold uppercase tracking-widest">
              Archive
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wide">
            Full <span className="text-red-600">Movies</span>
          </h1>
          <p className="text-zinc-400 text-xs mt-1">
            Total {total} Manipuri cinema releases recorded in repository.
          </p>
        </div>

        <Link
          href="/"
          className="self-start sm:self-auto flex items-center gap-1.5 text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-3.5 py-2 rounded-lg text-zinc-300 hover:text-white transition"
        >
          <ArrowLeft size={14} />
          <span>Back to Home</span>
        </Link>
      </div>

      <InfiniteCatalog
        initialMovies={serializedMovies}
        initialTotal={total}
        catalogType="movies"
      />
    </main>
  );
}