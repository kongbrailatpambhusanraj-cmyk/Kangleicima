import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// Helper to parse part numbers from title (e.g. "Movie Title Part 2" -> 2)
function extractPartNumber(title: string): number {
  const match = title.match(/part\s*(\d+)/i);
  return match ? parseInt(match[1], 10) : 1;
}

// Helper to extract the core title family name without "Part X"
function getBaseTitle(title: string): string {
  return title
    .replace(/part\s*\d+/gi, "")
    .replace(/\[.*?\]|\(.*?\)/g, "")
    .trim();
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ error: "Missing movie ID" }, { status: 400 });
    }

    // 1. Locate the current movie
    const currentMovie = await prisma.movie.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        thumbnail: true,
        description: true,
        genres: true,
        groupId: true,
      },
    });

    if (!currentMovie) {
      return NextResponse.json({ parts: [] });
    }

    let siblingMovies: Array<{
      id: string;
      title: string;
      thumbnail: string;
      description: string | null;
      genres: string[];
      groupId: string | null;
    }> = [];

    // 2. Fetch siblings by groupId if assigned
    if (currentMovie.groupId) {
      siblingMovies = await prisma.movie.findMany({
        where: {
          groupId: currentMovie.groupId,
          availabilityStatus: { not: "UNAVAILABLE" },
        },
        select: {
          id: true,
          title: true,
          thumbnail: true,
          description: true,
          genres: true,
          groupId: true,
        },
      });
    }

    // 3. Fallback: match by title family if no groupId or only 1 item returned
    if (siblingMovies.length <= 1) {
      const baseTitle = getBaseTitle(currentMovie.title);

      if (baseTitle.length > 2) {
        siblingMovies = await prisma.movie.findMany({
          where: {
            title: {
              contains: baseTitle,
              mode: "insensitive",
            },
            availabilityStatus: { not: "UNAVAILABLE" },
          },
          select: {
            id: true,
            title: true,
            thumbnail: true,
            description: true,
            genres: true,
            groupId: true,
          },
          take: 8,
        });
      }
    }

    // Always include the current movie if list is empty
    if (siblingMovies.length === 0) {
      siblingMovies = [currentMovie];
    }

    // 4. Format and sort parts sequentially
    const formattedParts = siblingMovies
      .map((m) => {
        const partNumber = extractPartNumber(m.title);
        return {
          id: m.id,
          title: m.title,
          thumbnail: m.thumbnail,
          description: m.description,
          genres: m.genres,
          partNumber,
          displayBadge: `Part ${partNumber}`,
        };
      })
      .sort((a, b) => a.partNumber - b.partNumber);

    return NextResponse.json({
      parts: formattedParts,
      totalParts: formattedParts.length,
    });
  } catch (error) {
    console.error("Error retrieving movie series parts:", error);
    return NextResponse.json({ parts: [] }, { status: 500 });
  }
}