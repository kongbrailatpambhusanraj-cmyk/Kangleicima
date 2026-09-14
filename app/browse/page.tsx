import { prisma } from "@/lib/prisma";
import InfiniteCatalog from "@/components/InfiniteCatalog";
import Link from "next/link";
import { Clapperboard } from "lucide-react";

interface BrowsePageProps {
  searchParams: Promise<{
    q?: string;
    genre?: string;
  }>;
}

export const revalidate = 0;

const GENRE_FILTERS = [
  "All",
  "Sumang Leela",
  "Manipuri Cinema",
  "Drama",
];

const BATCH_SIZE = 24;

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const { q, genre } = await searchParams;

  const searchQuery = q?.trim() || "";
  const selectedGenre = genre && genre !== "All" ? genre : null;

  const whereClause: any = {
    availabilityStatus: { not: "UNAVAILABLE" },
  };

  if (searchQuery) {
    whereClause.OR = [
      { title: { contains: searchQuery, mode: "insensitive" } },
      { description: { contains: searchQuery, mode: "insensitive" } },
      { channelTitle: { contains: searchQuery, mode: "insensitive" } },
    ];
  }

  if (selectedGenre) {
    if (selectedGenre === "Sumang Leela") {
      whereClause.OR = [
        ...(whereClause.OR || []),
        { genres: { has: "Sumang Leela" } },
        { genres: { has: "Shumang Leela" } },
        { genres: { has: "Leela" } },
        { title: { contains: "Leela", mode: "insensitive" } },
        { title: { contains: "Shumang", mode: "insensitive" } },
      ];
    } else {
      whereClause.genres = { has: selectedGenre };
    }
  }

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
      orderBy: searchQuery ? [{ viewCount: "desc" }, { id: "asc" }] : [{ createdAt: "desc" }, { id: "asc" }],
      take: BATCH_SIZE,
    }),
    prisma.movie.count({ where: whereClause }),
  ]);

  const serializedMovies = movies.map((m) => ({
    ...m,
    viewCount: m.viewCount !== null && m.viewCount !== undefined ? Number(m.viewCount) : null,
  }));

  return (
    <main className="min-h-screen bg-black text-white pt-24 pb-24 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-800/80 pb-6">
          <div>
            <div className="flex items-center gap-2 text-red-600 mb-1">
              <Clapperboard size={18} />
              <span className="text-xs font-bold uppercase tracking-widest">Archive</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wide">
              {searchQuery ? (
                <>
                  Results for <span className="text-red-600">"{searchQuery}"</span>
                </>
              ) : selectedGenre ? (
                <>
                  <span className="text-red-600">{selectedGenre}</span> Collection
                </>
              ) : (
                <>
                  Manipuri <span className="text-red-600">Cinema & Leela</span>
                </>
              )}
            </h1>
            <p className="text-zinc-400 text-xs mt-1">
              Total {total} titles available in archive.
            </p>
          </div>

          {(searchQuery || selectedGenre) && (
            <Link
              href="/browse"
              className="text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 px-3.5 py-1.5 rounded-lg transition self-start sm:self-auto"
            >
              Reset Filters
            </Link>
          )}
        </div>

        {/* Genre Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {GENRE_FILTERS.map((g) => {
            const isSelected = (!selectedGenre && g === "All") || selectedGenre === g;
            const targetHref =
              g === "All"
                ? searchQuery
                  ? `/browse?q=${encodeURIComponent(searchQuery)}`
                  : "/browse"
                : searchQuery
                ? `/browse?q=${encodeURIComponent(searchQuery)}&genre=${encodeURIComponent(g)}`
                : `/browse?genre=${encodeURIComponent(g)}`;

            return (
              <Link
                key={g}
                href={targetHref}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition shrink-0 border ${
                  isSelected
                    ? "bg-red-600 border-red-500 text-white shadow-md shadow-red-950"
                    : "bg-zinc-900/90 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700"
                }`}
              >
                {g}
              </Link>
            );
          })}
        </div>

        {/* Catalog Grid with Auto Infinite Scrolling */}
        <InfiniteCatalog
          initialMovies={serializedMovies}
          initialTotal={total}
          catalogType="all"
          initialGenre={selectedGenre || ""}
          initialSearch={searchQuery}
        />
      </div>
    </main>
  );
}