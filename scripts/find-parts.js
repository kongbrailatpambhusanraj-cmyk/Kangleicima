const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findPotentialParts() {
    const allMovies = await prisma.movie.findMany();

    // Simple Part grouping: find titles that have the same prefix
    const titleGroups = {};
    for (const movie of allMovies) {
        // Normalize title: remove common things
        const normalized = movie.title.toLowerCase().replace(/part\s*\d+/g, '').trim();
        if (!titleGroups[normalized]) titleGroups[normalized] = [];
        titleGroups[normalized].push(movie);
    }

    const potentialParts = Object.values(titleGroups).filter(group => group.length > 1);

    console.log("Potential Part Groups:");
    potentialParts.slice(0, 10).forEach(group => {
        console.log(`\nGroup: ${group[0].title}`);
        group.forEach(m => console.log(` - ${m.title}`));
    });

    await prisma.$disconnect();
}

findPotentialParts().catch(console.error);
