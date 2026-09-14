import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Helper: Safely resolve or link user & profile
async function getOrCreateProfile(userId: string, userEmail?: string | null) {
  let dbUser = null;

  // 1. Match by email first (ensures Google OAuth maps to existing user records)
  if (userEmail) {
    dbUser = await prisma.user.findUnique({
      where: { email: userEmail },
    });
  }

  // 2. If not found by email, match by user ID
  if (!dbUser && userId) {
    dbUser = await prisma.user.findUnique({
      where: { id: userId },
    });
  }

  // 3. Create user if absent
  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: {
        id: userId,
        email: userEmail || `${userId}@auth.supabase`,
      },
    });
  }

  // 4. Ensure user profile exists
  let profile = await prisma.profile.findFirst({
    where: { userId: dbUser.id },
  });

  if (!profile) {
    profile = await prisma.profile.create({
      data: {
        userId: dbUser.id,
        name: dbUser.email ? dbUser.email.split('@')[0] : 'Member',
      },
    });
  }

  return { dbUser, profile };
}

// GET: Retrieve watchlist
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const userEmail = searchParams.get('email');

  if (!userId && !userEmail) {
    return NextResponse.json({ error: 'Missing user credentials', movies: [], movieIds: [] }, { status: 400 });
  }

  try {
    const { profile } = await getOrCreateProfile(userId || '', userEmail);

    const savedItems = await prisma.watchListItem.findMany({
      where: { profileId: profile.id },
      orderBy: { addedAt: 'desc' },
    });

    const movieIds = savedItems.map((item) => item.movieId);

    if (movieIds.length === 0) {
      return NextResponse.json({ movies: [], movieIds: [] });
    }

    const movies = await prisma.movie.findMany({
      where: { id: { in: movieIds } },
    });

    const sanitizedMovies = movies.map((m) => ({
      ...m,
      viewCount: m.viewCount ? m.viewCount.toString() : null,
      inMyList: true,
    }));

    sanitizedMovies.sort((a, b) => movieIds.indexOf(a.id) - movieIds.indexOf(b.id));

    return NextResponse.json({ movies: sanitizedMovies, movieIds });
  } catch (err: any) {
    console.error('Watchlist GET error:', err);
    return NextResponse.json({ error: err.message || 'Database error', movies: [], movieIds: [] }, { status: 500 });
  }
}

// POST: Add or Remove movie
export async function POST(request: Request) {
  try {
    const { userId, userEmail, movieId } = await request.json();

    if (!movieId || (!userId && !userEmail)) {
      return NextResponse.json({ error: 'Missing movieId or user details' }, { status: 400 });
    }

    const { profile } = await getOrCreateProfile(userId, userEmail);

    const existing = await prisma.watchListItem.findFirst({
      where: {
        profileId: profile.id,
        movieId,
      },
    });

    if (existing) {
      await prisma.watchListItem.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ inMyList: false, message: 'Removed from watchlist' });
    } else {
      await prisma.watchListItem.create({
        data: {
          profileId: profile.id,
          movieId,
        },
      });
      return NextResponse.json({ inMyList: true, message: 'Added to watchlist' });
    }
  } catch (err: any) {
    console.error('Watchlist POST error:', err);
    return NextResponse.json({ error: err.message || 'Database error' }, { status: 500 });
  }
}