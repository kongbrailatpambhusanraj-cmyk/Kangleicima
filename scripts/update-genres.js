const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateMovies() {
    console.log("Updating genres for movies...");
    const result = await prisma.movie.updateMany({
        where: {
            genres: {
                isEmpty: true
            }
        },
        data: {
            genres: ['Manipuri']
        }
    });
    console.log(`Updated ${result.count} movies.`);
    await prisma.$disconnect();
}

updateMovies().catch(console.error);
