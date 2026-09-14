const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fix() {
  console.log('Starting data fix...');

  // 1. Fix Missing Thumbnails (Batching)
  const moviesWithNoThumbnail = await prisma.movie.findMany({
    where: { thumbnail: '', NOT: { youtubeVideoId: null } }
  });

  console.log(`Found ${moviesWithNoThumbnail.length} movies to update.`);

  const updates = moviesWithNoThumbnail.map(movie =>
    prisma.movie.update({
      where: { id: movie.id },
      data: { thumbnail: `https://img.youtube.com/vi/${movie.youtubeVideoId}/hqdefault.jpg` }
    })
  );

  // Split into smaller chunks to avoid timeout
  const chunkSize = 50;
  for (let i = 0; i < updates.length; i += chunkSize) {
    const chunk = updates.slice(i, i + chunkSize);
    await prisma.$transaction(chunk);
    console.log(`Updated ${Math.min(i + chunkSize, updates.length)} / ${updates.length}`);
  }

  // 2. Populate Featured & Popular Rows
  await prisma.movie.updateMany({ data: { isFeatured: false, isPopular: false } });

  const moviesToFeature = await prisma.movie.findMany({
    take: 30,
    orderBy: { relevanceScore: 'desc' },
    where: { NOT: { thumbnail: '' } }
  });

  const idsToFeature = moviesToFeature.map(m => m.id);
  await prisma.movie.updateMany({
    where: { id: { in: idsToFeature } },
    data: { isFeatured: true, isPopular: true }
  });
  console.log(`Updated ${idsToFeature.length} movies as Featured and Popular.`);

  await prisma.$disconnect();
  console.log('Finished data fix.');
}

fix();
