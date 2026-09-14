import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = 36;
    const skip = (page - 1) * limit;

    let whereClause: any = {};

    if (filter === 'leela') {
      whereClause = {
        OR: [
          { title: { contains: 'shumang', mode: 'insensitive' } },
          { title: { contains: 'sumang', mode: 'insensitive' } },
          { title: { contains: 'leela', mode: 'insensitive' } },
          { genres: { has: 'Shumang Leela' } },
        ],
      };
    } else if (filter === 'film') {
      whereClause = {
        isFullMovie: true,
      };
    }

    const [movies, totalCount] = await Promise.all([
      prisma.movie.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          description: true,
          thumbnail: true,
          youtubeVideoId: true,
          genres: true,
          isFullMovie: true,
          groupId: true,
          viewCount: true,
        },
      }),
      prisma.movie.count({ where: whereClause }),
    ]);

    const sanitized = movies.map((m) => ({
      ...m,
      viewCount: m.viewCount ? m.viewCount.toString() : null,
    }));

    return NextResponse.json({
      movies: sanitized,
      hasMore: skip + movies.length < totalCount,
      totalCount,
    });
  } catch (error: any) {
    console.error('Failed to load movies page:', error);
    return NextResponse.json({ error: 'Database error', movies: [], hasMore: false }, { status: 500 });
  }
}