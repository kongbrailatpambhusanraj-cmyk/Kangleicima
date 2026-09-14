const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // 1. Create/Identify canonical record
  const canonicalMovieId = "c9c4fa56-7cc3-48a3-8cf3-ab8ec9d15e29"; // VDF Thasana playlist record

  // 2. Identify movies to be turned to parts
  const moviesToMerge = await prisma.movie.findMany({
    where: {
        id: { not: canonicalMovieId },
        title: { contains: "VDF Thasana" },
    }
  });

  console.log(`Found ${moviesToMerge.length} parts to merge.`);

  for (const movie of moviesToMerge) {
    // 3. Create MoviePart
    let partOrder = 0;
    if (movie.title.includes("Part 2")) partOrder = 2;
    else if (movie.title.includes("Part 3")) partOrder = 3;
    else if (movie.title.includes("Part 4")) partOrder = 4;
    else partOrder = 1; // Default

    await prisma.moviePart.create({
      data: {
        movieId: canonicalMovieId,
        partOrder: partOrder,
        title: movie.title,
        sourceUrl: movie.sourceUrl || "",
        videoId: movie.youtubeVideoId,
      }
    });

    // 4. Delete old movie
    await prisma.movie.delete({ where: { id: movie.id } });
    console.log(`Merged and deleted: ${movie.title}`);
  }

  await prisma.$disconnect();
}
main();
