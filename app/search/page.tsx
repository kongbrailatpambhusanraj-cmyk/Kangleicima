import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const filter = searchParams.get('filter') || 'all';

    if (!query.trim()) {
      return NextResponse.json({ results: [] });
    }

    let whereClause: any = {
      title: { contains: query.trim(), mode: 'insensitive' },
    };

    if (filter === 'leela') {
      whereClause = {
        AND: [
          { title: { contains: query.trim(), mode: 'insensitive' } },
          {
            OR: [
              { title: { contains: 'shumang', mode: 'insensitive' } },
              { title: { contains: 'sumang', mode: 'insensitive' } },
              { title: { contains: 'leela', mode: 'insensitive' } },
              { genres: { has: 'Shumang Leela' } },
            ],
          },
        ],
      };
    } else if (filter === 'film') {
      whereClause = {
        AND: [
          { title: { contains: query.trim(), mode: 'insensitive' } },
          { isFullMovie: true },
        ],
      };
    }

    const movies = await prisma.movie.findMany({
      where: whereClause,
      take: 40,
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
    });

    const sanitized = movies.map((m) => ({
      ...m,
      viewCount: m.viewCount ? m.viewCount.toString() : null,
    }));

    return NextResponse.json({ results: sanitized });
  } catch (error: any) {
    console.error('Search error:', error);
    return NextResponse.json({ results: [] }, { status: 500 });
  }
}

// Default export for App Router page (placeholder - this should be a proper page component)
export default function SearchPage() {
  return (
    <div className="pt-24 p-8 text-white min-h-screen bg-black">
      <h1 className="text-3xl font-bold mb-8">Search</h1>
      <p className="text-gray-400">Search page - use the search bar in the navbar</p>
    </div>
  );
}