const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clear() {
    console.log("Clearing database...");
    const deleted = await prisma.movie.deleteMany({});
    console.log(`Cleared ${deleted.count} movies.`);
    await prisma.$disconnect();
}

clear();
