import { prisma } from "@/lib/prisma";
import Hero from "@/components/Hero";
import Row from "@/components/Row";
import DonationReminder from "@/components/DonationReminder";

export const revalidate = 60;

const movieSelect = {
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
} as const;

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default async function HomePage() {
  // Base condition: Exclude non-playable / unavailable entries
  const baseFilter = {
    availabilityStatus: { not: "UNAVAILABLE" as const },
  };

  // Dedicated filters for Sumang Leela
  const leelaCondition = {
    OR: [
      { genres: { has: "Sumang Leela" } },
      { genres: { has: "Leela" } },
      { title: { contains: "Leela", mode: "insensitive" as const } },
    ],
  };

  // Movies must be full-length films and NOT Leela plays
  const standardMovieFilter = {
    ...baseFilter,
    isFullMovie: true,
    NOT: leelaCondition,
  };

  // --- BATCH 1: Primary rows & Hero Spotlight (4 concurrent queries) ---
  const [heroMovie, featuredFullFilms, popularFilms, sumangLeelaFilms] =
    await Promise.all([
      // Hero Spotlight
      prisma.movie.findFirst({
        where: { ...standardMovieFilter, isFeatured: true },
        orderBy: { viewCount: "desc" },
        select: { ...movieSelect, description: true },
      }),

      // 1. Featured Full Films
      prisma.movie.findMany({
        where: { ...standardMovieFilter, isFeatured: true },
        take: 24,
        orderBy: { viewCount: "desc" },
        select: movieSelect,
      }),

      // 2. Popular Films (Highest view counts among full films)
      prisma.movie.findMany({
        where: standardMovieFilter,
        take: 24,
        orderBy: { viewCount: "desc" },
        select: movieSelect,
      }),

      // 3. Sumang Leela (Strictly theatrical/drama plays)
      prisma.movie.findMany({
        where: {
          ...baseFilter,
          ...leelaCondition,
        },
        take: 24,
        orderBy: { createdAt: "desc" },
        select: movieSelect,
      }),
    ]);

  // --- BATCH 2: Secondary & Discovered rows (3 concurrent queries) ---
  const [discoveredPool, recentlyAddedFilms, allFilmsPool] =
    await Promise.all([
      // 4. Discovered Films (Freshly ingested full-length candidates)
      prisma.movie.findMany({
        where: {
          ...standardMovieFilter,
          isDiscovered: true,
        },
        take: 30,
        select: movieSelect,
      }),

      // 5. Recently Added
      prisma.movie.findMany({
        where: standardMovieFilter,
        take: 24,
        orderBy: { createdAt: "desc" },
        select: movieSelect,
      }),

      // 6. All Films Pool (Random pool for catalog diversity)
      prisma.movie.findMany({
        where: standardMovieFilter,
        take: 36,
        select: movieSelect,
      }),
    ]);

  const discoveredFilms = shuffle(discoveredPool);
  const allFilms = shuffle(allFilmsPool);
  const activeHero = heroMovie || popularFilms[0] || null;

  return (
    <main className="min-h-screen bg-black text-white pb-24 overflow-x-hidden">
      {activeHero && <Hero movie={activeHero} />}

      <div className="relative z-20 -mt-8 sm:-mt-16 md:-mt-24 space-y-7 sm:space-y-11 pl-4 sm:pl-8">
        {featuredFullFilms.length > 0 && (
          <Row title="Featured Full Films" movies={featuredFullFilms} batchSize={10} />
        )}

        {popularFilms.length > 0 && (
          <Row title="Popular Films" movies={popularFilms} batchSize={10} />
        )}

        {discoveredFilms.length > 0 && (
          <Row title="Discovered Films" movies={discoveredFilms} batchSize={10} />
        )}

        {recentlyAddedFilms.length > 0 && (
          <Row title="Recently Added" movies={recentlyAddedFilms} batchSize={10} />
        )}

        {sumangLeelaFilms.length > 0 && (
          <Row title="Sumang Leela" movies={sumangLeelaFilms} batchSize={10} />
        )}

        {allFilms.length > 0 && (
          <Row title="All Films" movies={allFilms} batchSize={10} />
        )}
      </div>

      <DonationReminder />
    </main>
  );
}