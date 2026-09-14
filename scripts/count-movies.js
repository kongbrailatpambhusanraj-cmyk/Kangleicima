const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function count() {
    const count = await prisma.movie.count();
    console.log(`Movie count: ${count}`);
    await prisma.$disconnect();
}
count();
