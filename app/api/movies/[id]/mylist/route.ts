import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextResponse, type NextRequest } from "next/server";

// GET: Check whether a movie is in the user's watchlist
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: movieId } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !user.email) {
      return NextResponse.json({ inMyList: false, inList: false });
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: user.email },
    });

    if (!dbUser) {
      return NextResponse.json({ inMyList: false, inList: false });
    }

    const userProfile = await prisma.profile.findFirst({
      where: { userId: dbUser.id },
    });

    if (!userProfile) {
      return NextResponse.json({ inMyList: false, inList: false });
    }

    const existing = await prisma.watchListItem.findFirst({
      where: {
        profileId: userProfile.id,
        movieId: movieId,
      },
    });

    const isSaved = Boolean(existing);
    return NextResponse.json({ inMyList: isSaved, inList: isSaved });
  } catch (error) {
    console.error("Error checking watchlist status:", error);
    return NextResponse.json({ inMyList: false, inList: false });
  }
}

// POST: Add or Remove movie from the watchlist
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: movieId } = await params;
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user || !user.email) {
      console.log("[MyList API] User is not authenticated or missing email:", authError);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log(`[MyList API] Processing movie: ${movieId} for user: ${user.email}`);

    // Parse body if provided
    let requestedState: boolean | undefined = undefined;
    try {
      const body = await request.json();
      if (body && typeof body.inMyList === "boolean") {
        requestedState = body.inMyList;
      }
    } catch {
      // Body empty or not JSON, proceed to toggle
    }

    // 1. Ensure User exists by unique email
    const dbUser = await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        id: user.id,
        email: user.email,
      },
    });

    // 2. Ensure Profile exists
    let userProfile = await prisma.profile.findFirst({
      where: { userId: dbUser.id },
    });

    if (!userProfile) {
      userProfile = await prisma.profile.create({
        data: {
          userId: dbUser.id,
          name: user.user_metadata?.full_name || user.email.split("@")[0] || "Default",
        },
      });
    }

    // 3. Find existing item in WatchListItem
    const existing = await prisma.watchListItem.findFirst({
      where: {
        profileId: userProfile.id,
        movieId: movieId,
      },
    });

    let isNowInList = false;

    if (requestedState !== undefined) {
      if (requestedState && !existing) {
        await prisma.watchListItem.create({
          data: {
            profileId: userProfile.id,
            movieId: movieId,
          },
        });
        isNowInList = true;
        console.log(`[MyList API] Successfully added movie: ${movieId}`);
      } else if (!requestedState && existing) {
        await prisma.watchListItem.delete({
          where: { id: existing.id },
        });
        isNowInList = false;
        console.log(`[MyList API] Successfully removed movie: ${movieId}`);
      } else {
        isNowInList = Boolean(existing);
      }
    } else {
      // Direct Toggle Mode
      if (existing) {
        await prisma.watchListItem.delete({
          where: { id: existing.id },
        });
        isNowInList = false;
        console.log(`[MyList API] Toggled off: removed movie: ${movieId}`);
      } else {
        await prisma.watchListItem.create({
          data: {
            profileId: userProfile.id,
            movieId: movieId,
          },
        });
        isNowInList = true;
        console.log(`[MyList API] Toggled on: added movie: ${movieId}`);
      }
    }

    return NextResponse.json({ inMyList: isNowInList, inList: isNowInList });
  } catch (error) {
    console.error("[MyList API] Fatal error in POST:", error);
    return NextResponse.json({ error: "Failed to update watchlist" }, { status: 500 });
  }
}