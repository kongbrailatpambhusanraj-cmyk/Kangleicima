const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateMovies() {
    console.log("Updating genres for movies...");
    const movies = await prisma.movie.findMany();
    let count = 0;
    for (const movie of movies) {
        if (!movie.genres || movie.genres.length === 0) {
            await prisma.movie.update({
                where: { id: movie.id },
                data: { genres: ['Manipuri'] }
            });
            count++;
        }
    }
    console.log(`Updated ${count} movies.`);
    await prisma.$disconnect();
}

updateMovies().catch(console.error);
