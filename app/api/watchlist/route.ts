import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextResponse, type NextRequest } from "next/server";

// GET: Retrieve all watchlist movies for the current user
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !user.email) {
      return NextResponse.json({ items: [] }, { status: 401 });
    }

    // Safely lookup the user by unique email
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email },
    });

    if (!dbUser) {
      return NextResponse.json({ items: [] });
    }

    const userProfile = await prisma.profile.findFirst({
      where: { userId: dbUser.id },
    });

    if (!userProfile) {
      return NextResponse.json({ items: [] });
    }

    const watchListEntries = await prisma.watchListItem.findMany({
      where: {
        profileId: userProfile.id,
      },
      orderBy: {
        addedAt: "desc",
      },
    });

    const movieIds = watchListEntries.map((entry) => entry.movieId);

    const movies =
      movieIds.length > 0
        ? await prisma.movie.findMany({
            where: {
              id: { in: movieIds },
            },
          })
        : [];

    const orderedMovies = movieIds
      .map((id) => movies.find((m) => m.id === id))
      .filter((m): m is NonNullable<typeof m> => Boolean(m));

    return NextResponse.json({ items: orderedMovies });
  } catch (error) {
    console.error("Error retrieving watchlist:", error);
    return NextResponse.json(
      { error: "Failed to load watchlist" },
      { status: 500 }
    );
  }
}

// POST: Add or Remove a movie using { movieId } in request body
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { movieId } = body;

    if (!movieId) {
      return NextResponse.json(
        { error: "movieId is required" },
        { status: 400 }
      );
    }

    // 1. Safely resolve or link User by unique email (prevents unique constraint error)
    const dbUser = await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        id: user.id,
        email: user.email,
      },
    });

    // 2. Ensure Profile exists for this dbUser
    let userProfile = await prisma.profile.findFirst({
      where: { userId: dbUser.id },
    });

    if (!userProfile) {
      userProfile = await prisma.profile.create({
        data: {
          userId: dbUser.id,
          name:
            user.user_metadata?.full_name ||
            user.email.split("@")[0] ||
            "Default",
        },
      });
    }

    // 3. Toggle WatchListItem entry in database
    const existing = await prisma.watchListItem.findFirst({
      where: {
        profileId: userProfile.id,
        movieId: movieId,
      },
    });

    if (existing) {
      await prisma.watchListItem.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ inList: false, message: "Removed from list" });
    } else {
      await prisma.watchListItem.create({
        data: {
          profileId: userProfile.id,
          movieId: movieId,
        },
      });
      return NextResponse.json({ inList: true, message: "Added to list" });
    }
  } catch (error) {
    console.error("Error toggling watchlist item:", error);
    return NextResponse.json(
      { error: "Failed to update watchlist" },
      { status: 500 }
    );
  }
}