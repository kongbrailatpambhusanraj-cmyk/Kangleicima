import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function calculateRelevance(movie: { title: string }, query: string) {
  const q = query.toLowerCase();
  const t = movie.title.toLowerCase();

  if (t === q) return 100; // Exact match
  if (t.startsWith(q)) return 80; // Starts with
  if (t.includes(q)) return 60; // Contains

  return 0;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    const movies = await prisma.movie.findMany({ take: 20 });
    return NextResponse.json(movies);
  }

  // Fetch potentially relevant movies (using DB filter for basic containment)
  const movies = await prisma.movie.findMany({
    where: {
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { genres: { has: query } }
      ]
    }
  });

  // Rank in memory
  const ranked = movies
      .map(m => ({ ...m, relevance: calculateRelevance(m, query) }))
      .sort((a, b) => b.relevance - a.relevance);

  return NextResponse.json(ranked);
}
