const { YouTube } = require('youtube-sr');
const { PrismaClient } = require('@prisma/client');
const { findExistingMovie } = require('../prisma/movie-matcher');

const prisma = new PrismaClient();

const MANUAL_SOURCES = [
    { title: "Yaiskul Pakhang Angouba", videoId: "OJClkrA2bwI" },
    { title: "VDF Thasana", videoId: "PLCHP10F0t3kjEdSJIjD9z0cGSJn1cTKWP" } // Assuming playlist ID is treated as source
];

async function processSource(title, videoId) {
    console.log(`Processing: ${title} (${videoId})`);

    // Check if source exists
    const existingSource = await prisma.movie.findUnique({
        where: { youtubeVideoId: videoId }
    });

    if (existingSource) {
        console.log(`  Source ${videoId} already exists.`);
        return;
    }

    // Check if movie itself exists
    const existing = await findExistingMovie(title);

    if (existing) {
        console.log(`  Movie ${title} already exists.`);
    } else {
        console.log(`  Creating new movie record for: ${title}`);
        await prisma.movie.create({
            data: {
                youtubeVideoId: videoId,
                title: title,
                thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
                sourceUrl: `https://youtube.com/watch?v=${videoId}`,
                sourceType: 'youtube',
                isFullMovie: true,
                availabilityStatus: 'AVAILABLE'
            }
        });
    }
}

async function runManualDiscovery() {
    for (const source of MANUAL_SOURCES) {
        await processSource(source.title, source.videoId);
    }
    await prisma.$disconnect();
    console.log("Manual discovery completed.");
}

runManualDiscovery().catch(console.error);
