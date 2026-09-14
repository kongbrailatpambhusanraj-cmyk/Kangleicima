const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const missing = await prisma.movie.count({ where: { thumbnail: '' } });
  const featured = await prisma.movie.count({ where: { isFeatured: true } });
  const popular = await prisma.movie.count({ where: { isPopular: true } });

  console.log('Missing thumbnails (empty string):', missing);
  console.log('Featured:', featured);
  console.log('Popular:', popular);

  await prisma.$disconnect();
}

check();
