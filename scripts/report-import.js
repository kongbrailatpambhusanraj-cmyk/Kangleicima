const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function report() {
  const total = await prisma.movie.count();
  const playable = await prisma.movie.count({ where: { availabilityStatus: 'AVAILABLE' } });
  const membersOnly = await prisma.movie.count({ where: { availabilityStatus: { in: ['MEMBERS-ONLY', 'PRIVATE', 'UNAVAILABLE', 'EMBEDDING-DISABLED'] } } });

  console.log(`Total canonical movies: ${total}`);
  console.log(`Playable: ${playable}`);
  console.log(`Excluded/Members-only/Restricted: ${membersOnly}`);

  await prisma.$disconnect();
}

report();
