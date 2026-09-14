const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanExplanations() {
  console.log('Searching database for explanation and recap videos...');

  // 1. Find all matching records first so we can view them
  const targets = await prisma.movie.findMany({
    where: {
      OR: [
        { title: { contains: 'explain', mode: 'insensitive' } },
        { title: { contains: 'explanation', mode: 'insensitive' } },
        { title: { contains: 'recap', mode: 'insensitive' } },
        { title: { contains: 'breakdown', mode: 'insensitive' } },
      ],
    },
    select: {
      id: true,
      title: true,
    },
  });

  if (targets.length === 0) {
    console.log('No explanation videos found in database.');
    return;
  }

  console.log(`Found ${targets.length} explanation entries to purge:`);
  targets.forEach((m) => console.log(` - ${m.title}`));

  // 2. Permanently delete them
  const deleteResult = await prisma.movie.deleteMany({
    where: {
      id: {
        in: targets.map((m) => m.id),
      },
    },
  });

  console.log(`\n Successfully purged ${deleteResult.count} explanation videos from database!`);
}

cleanExplanations()
  .catch((err) => {
    console.error('Error during cleanup:', err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });