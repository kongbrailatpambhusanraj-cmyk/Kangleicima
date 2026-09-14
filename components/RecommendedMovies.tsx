import MovieCard from "@/components/MovieCard";
import { prisma } from "@/lib/prisma";
import { getAvailableFilter } from "@/lib/utils/eligibility";

export interface RecommendedMoviesProps {
  genre?: string;
  currentId: string;
}

export default async function RecommendedMovies({
  genre,
  currentId,
}: RecommendedMoviesProps) {
  const movies = await prisma.movie.findMany({
    where: {
      ...getAvailableFilter(),
      id: { not: currentId },
      ...(genre ? { genres: { has: genre } } : {}),
    },
    orderBy: { viewCount: "desc" },
    take: 12,
    select: {
      id: true,
      title: true,
      thumbnail: true,
      youtubeVideoId: true,
      sourceUrl: true,
    },
  });

  if (movies.length === 0) {
    return (
      <section className="mt-10">
        <p className="text-sm text-gray-400">No related films found.</p>
      </section>
    );
  }

  return (
    <section className="mt-10">
      <h2 className="text-xl font-bold mb-4">More Like This</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {movies.map((movie) => (
          <MovieCard
            key={movie.id}
            movie={{ ...movie, inMyList: false }}
          />
        ))}
      </div>
    </section>
  );
}
