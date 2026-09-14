import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.max(1, parseInt(searchParams.get("limit") || "24", 10));
  const type = searchParams.get("type") || "all";
  const search = searchParams.get("search")?.trim() || "";
  const genre = searchParams.get("genre")?.trim() || "";

  const skip = (page - 1) * limit;

  const whereClause: any = {
    availabilityStatus: { not: "UNAVAILABLE" },
  };

  // Flexible Genre Matching covering all variation tags used by import scripts
  if (genre && genre !== "All") {
    if (genre === "Sumang Leela") {
      whereClause.OR = [
        { genres: { has: "Sumang Leela" } },
        { genres: { has: "Shumang Leela" } },
        { genres: { has: "Leela" } },
        { title: { contains: "Leela", mode: "insensitive" } },
        { title: { contains: "Shumang", mode: "insensitive" } },
      ];
    } else {
      whereClause.genres = { has: genre };
    }
  } else if (type === "leela") {
    whereClause.OR = [
      { genres: { has: "Sumang Leela" } },
      { genres: { has: "Shumang Leela" } },
      { genres: { has: "Leela" } },
      { title: { contains: "Leela", mode: "insensitive" } },
    ];
  } else if (type === "movies") {
    whereClause.NOT = {
      OR: [
        { genres: { has: "Sumang Leela" } },
        { genres: { has: "Shumang Leela" } },
        { title: { contains: "Leela", mode: "insensitive" } },
      ],
    };
  }

  // Search filter
  if (search) {
    whereClause.AND = [
      ...(whereClause.AND || []),
      {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
          { channelTitle: { contains: search, mode: "insensitive" } },
        ],
      },
    ];
  }

  try {
    const [movies, total] = await Promise.all([
      prisma.movie.findMany({
        where: whereClause,
        select: {
          id: true,
          title: true,
          thumbnail: true,
          youtubeVideoId: true,
          sourceUrl: true,
          genres: true,
          isFullMovie: true,
          groupId: true,
          viewCount: true,
          duration: true,
        },
        orderBy: search ? [{ viewCount: "desc" }, { id: "asc" }] : [{ createdAt: "desc" }, { id: "asc" }],
        skip: skip,
        take: limit,
      }),
      prisma.movie.count({ where: whereClause }),
    ]);

    const serializedMovies = movies.map((m) => ({
      ...m,
      viewCount:
        m.viewCount !== null && m.viewCount !== undefined
          ? Number(m.viewCount)
          : null,
    }));

    return NextResponse.json({
      movies: serializedMovies,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + movies.length < total,
    });
  } catch (error) {
    console.error("Error fetching catalog API:", error);
    return NextResponse.json(
      { error: "Failed to fetch catalog" },
      { status: 500 }
    );
  }
}