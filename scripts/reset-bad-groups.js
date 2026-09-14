const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function resetBadGroups() {
  console.log('Resetting corrupted movie group associations in database...');

  const result = await prisma.movie.updateMany({
    data: {
      groupId: null,
    },
  });

  console.log(`\nSuccessfully reset groupId on ${result.count} movies.`);
  console.log('All series parts will now be matched accurately on demand using the updated title parser.');
}

resetBadGroups()
  .catch((err) => console.error('Reset error:', err))
  .finally(async () => {
    await prisma.$disconnect();
  });