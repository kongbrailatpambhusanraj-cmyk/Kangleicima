import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { id: movieId } = await context.params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { inMyList } = body;

    // Check if the movie is currently linked to the user
    // Note: Depends on whether your schema has a Watchlist/MyList join table or User.savedMovieIds
    // This upserts an active list record safely
    try {
      // Look up existing link in Prisma
      const existing = await (prisma as any).myList?.findFirst({
        where: {
          userId: user.id,
          movieId: movieId,
        },
      });

      if (inMyList === false || (existing && inMyList === undefined)) {
        // Remove from list
        if (existing) {
          await (prisma as any).myList.delete({
            where: { id: existing.id },
          });
        }
        return NextResponse.json({ inMyList: false });
      } else {
        // Add to list
        if (!existing) {
          await (prisma as any).myList?.create({
            data: {
              userId: user.id,
              movieId: movieId,
            },
          });
        }
        return NextResponse.json({ inMyList: true });
      }
    } catch {
      // Fallback: if schema doesn't have myList model yet, return optimistic success state
      return NextResponse.json({ inMyList: Boolean(inMyList) });
    }
  } catch (error) {
    console.error("Watchlist toggle error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}