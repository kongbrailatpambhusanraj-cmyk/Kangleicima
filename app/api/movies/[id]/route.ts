import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const movie = await prisma.movie.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        thumbnail: true,
        youtubeVideoId: true,
        genres: true,
        isFullMovie: true,
        sourceUrl: true,
      },
    });

    if (!movie) {
      return NextResponse.json({ error: 'Movie not found' }, { status: 404 });
    }

    return NextResponse.json({ movie });
  } catch (error: any) {
    console.error('Failed to retrieve movie details:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}