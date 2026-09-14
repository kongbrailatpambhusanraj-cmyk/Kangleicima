const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkMovies() {
    const movie = await prisma.movie.findFirst();
    console.log("Sample movie genres:", movie ? movie.genres : "No movies found");
    await prisma.$disconnect();
}

checkMovies().catch(console.error);
