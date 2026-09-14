const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding category metadata...");
  // Set some featured
  const featured = await prisma.movie.updateMany({
    where: { title: { contains: "VDF" } },
    data: { isFeatured: true, isPopular: true, isRecentlyAdded: false }
  });
  console.log(`Updated ${featured.count} featured movies`);

  // Set some discovered
  const discovered = await prisma.movie.updateMany({
    where: { title: { contains: "Tamo" } },
    data: { isDiscovered: true, isRecentlyAdded: false }
  });
  console.log(`Updated ${discovered.count} discovered movies`);

  await prisma.$disconnect();
}
main();
