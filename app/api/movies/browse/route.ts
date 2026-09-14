import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1);
  const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '18', 10), 1), 30);
  const skip = (page - 1) * limit;

  const q = searchParams.get('q');
  const genre = searchParams.get('genre');

  const where: Prisma.MovieWhereInput = {
    NOT: { availabilityStatus: 'UNAVAILABLE' },
  };

  if (q) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
      { genres: { has: q } },
    ];
  }

  if (genre && genre !== 'All') {
    where.genres = { has: genre };
  }

  try {
    const movies = await prisma.movie.findMany({
      where,
      // Sort by createdAt so all 1,000+ movies load continuously
      orderBy: [
        { createdAt: 'desc' },
        { id: 'desc' },
      ],
      take: limit + 1,
      skip,
      select: {
        id: true,
        title: true,
        thumbnail: true,
        youtubeVideoId: true,
        sourceUrl: true,
        isFullMovie: true,
        groupId: true,
      },
    });

    const hasMore = movies.length > limit;
    const paginatedMovies = (hasMore ? movies.slice(0, limit) : movies).map((m) => ({
      ...m,
      inMyList: false,
    }));

    return NextResponse.json(
      {
        movies: paginatedMovies,
        hasMore,
        nextPage: hasMore ? page + 1 : null,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120',
        },
      }
    );
  } catch (error) {
    console.error('Browse API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch movies' },
      { status: 500 }
    );
  }
}