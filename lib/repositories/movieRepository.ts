import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { getAvailableFilter } from '@/lib/utils/eligibility';

export const movieRepository = {
  findMany: async (where: Prisma.MovieWhereInput, orderBy: any, take?: number, publicOnly = false) => {
    const finalWhere = publicOnly ? { ...where, ...getAvailableFilter() } : where;
    const allMovies = await prisma.movie.findMany({
      where: finalWhere,
      orderBy,
      take: take ? take * 5 : undefined, // Fetch more to allow for grouping representative selection
    });

    // Grouping logic
    const groupedMovies = new Map();
    for (const movie of allMovies) {
      if (movie.groupId) {
        if (!groupedMovies.has(movie.groupId)) {
          // If first time seeing this groupId, use this movie as representative
          groupedMovies.set(movie.groupId, movie);
        }
      } else {
        // No groupId, add directly (standalone movie)
        groupedMovies.set(movie.id, movie);
      }
    }

    // Convert back to array and respect original take limit
    const result = Array.from(groupedMovies.values());
    return take ? result.slice(0, take) : result;
  },
  findFirst: async (where: Prisma.MovieWhereInput, orderBy: any, publicOnly = false) => {
    const finalWhere = publicOnly ? { ...where, ...getAvailableFilter() } : where;
    return await prisma.movie.findFirst({
        where: finalWhere,
        orderBy
    });
  },
  getFeaturedFullFilms: async (take = 20) => {
    return await movieRepository.findMany({ isFullMovie: true }, { relevanceScore: 'desc' }, take, true);
  },
  getPopularFilms: async (take = 20) => {
    return await movieRepository.findMany({}, { viewCount: 'desc' }, take, true);
  },
  getDiscoveredFilms: async (take = 20) => {
    return await movieRepository.findMany({ isDiscovered: true }, { createdAt: 'desc' }, take, true);
  },
  getAllFilms: async (take = 20) => {
    // For randomized selection in PostgreSQL:
    const publicFilter = getAvailableFilter();

    // We need to use raw SQL for true database-level randomization.
    // However, Prisma doesn't directly support `orderBy: 'random()'`
    // inside `findMany` easily without custom SQL mapping or raw queries.

    // As a workaround that works with Prisma and respects the connection limit,
    // we can use a raw query or if the count is small, fetch all IDs and pick randomly.
    // Since we have ~1100 films, fetching all IDs is okay if scoped properly.

    // Given the connection constraint, let's use the raw approach.
    return await prisma.$queryRaw`
        SELECT * FROM "Movie"
        WHERE "availabilityStatus" != 'UNAVAILABLE'
        ORDER BY RANDOM()
        LIMIT ${take}
    ` as any[];
  }
};
