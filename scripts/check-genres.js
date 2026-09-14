const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkData() {
    const movies = await prisma.movie.findMany({ take: 20 });
    movies.forEach(m => console.log(`Title: ${m.title}, Genres: ${JSON.stringify(m.genres)}, Score: ${m.relevanceScore}, Created: ${m.createdAt}`));
    await prisma.$disconnect();
}

checkData().catch(console.error);
