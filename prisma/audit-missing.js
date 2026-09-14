const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function audit() {
    const titles = ['VDF', 'Thasana', 'Yaiskul Pakhang Angouba'];

    for (const title of titles) {
        const movie = await prisma.movie.findFirst({
            where: {
                title: {
                    contains: title,
                    mode: 'insensitive'
                }
            }
        });

        if (movie) {
            console.log(`Found: ${title} - ID: ${movie.id}`);
        } else {
            console.log(`Missing: ${title}`);
        }
    }

    await prisma.$disconnect();
}

audit();
