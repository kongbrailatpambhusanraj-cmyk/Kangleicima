const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function groupParts() {
    const allMovies = await prisma.movie.findMany();
    const titleGroups = {};
    for (const movie of allMovies) {
        const normalized = movie.title.toLowerCase().replace(/part\s*\d+/g, '').trim();
        if (!titleGroups[normalized]) titleGroups[normalized] = [];
        titleGroups[normalized].push(movie);
    }

    const potentialParts = Object.values(titleGroups).filter(group => group.length > 1);

    for (const group of potentialParts) {
        const groupId = group[0].id; // Use the first movie's ID as the group ID
        for (const movie of group) {
            await prisma.movie.update({
                where: { id: movie.id },
                data: { groupId: groupId }
            });
        }
        console.log(`Grouped ${group.length} parts under ${group[0].title}`);
    }

    await prisma.$disconnect();
}

groupParts().catch(console.error);
