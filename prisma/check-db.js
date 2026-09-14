const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const count = await prisma.movie.count();
    console.log("Total movies in DB:", count);
}

check();
