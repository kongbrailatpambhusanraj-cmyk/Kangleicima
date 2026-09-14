const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function backup() {
    try {
        const movies = await prisma.movie.findMany();
        fs.writeFileSync('backups/catalogue-backup-2026-09-09.json', JSON.stringify(movies, null, 2));
        console.log("Total movies backed up:", movies.length);
    } catch (error) {
        console.error("Backup failed:", error);
    } finally {
        await prisma.$disconnect();
    }
}

backup();
