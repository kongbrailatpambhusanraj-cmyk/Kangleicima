const { YouTube } = require('youtube-sr');
const { PrismaClient } = require('@prisma/client');
const { findExistingMovie } = require('../prisma/movie-matcher');

const prisma = new PrismaClient();

const PLAYLIST_URLS = [
    "https://youtube.com/playlist?list=PLCHP10F0t3kjEdSJIjD9z0cGSJn1cTKWP"
];

const MANUAL_SOURCES = [
    { title: "Yaiskul Pakhang Angouba", url: "https://youtu.be/OJClkrA2bwI" },
    { title: "VDF Thasana", url: "https://youtube.com/playlist?list=PLCHP10F0t3kjEdSJIjD9z0cGSJn1cTKWP" }
];

async function processSource(title, videoId, thumbnail, url) {
    console.log(`Processing: ${title} (${videoId})`);

    // Check if source exists (using youtubeVideoId as unique ID)
    const existingSource = await prisma.movie.findUnique({
        where: { youtubeVideoId: videoId }
    });

    if (existingSource) {
        console.log(`  Source ${videoId} already exists.`);
        return;
    }

    // Check if movie itself exists (using matcher)
    const existing = await findExistingMovie(title);

    if (existing) {
        console.log(`  Movie ${title} already exists. Attaching as new source.`);
        // Assuming we need to add source, but for now just log it.
        // The current schema restricts one source per ID?
        // Wait, schema says youtubeVideoId is unique.
        // We'd need to change schema to allow multiple sources per movie record.
        // For now, let's just mark it.
    } else {
        console.log(`  Creating new movie record for: ${title}`);
        await prisma.movie.create({
            data: {
                youtubeVideoId: videoId,
                title: title,
                thumbnail: thumbnail,
                sourceUrl: url,
                sourceType: 'youtube',
                isFullMovie: true,
                availabilityStatus: 'AVAILABLE'
            }
        });
    }
}

async function runPlaylistDiscovery() {
    console.log("Starting playlist scraping...");

    for (const url of PLAYLIST_URLS) {
        try {
            const playlist = await YouTube.getPlaylist(url);
            console.log(`Playlist: ${playlist.title}`);
            const videos = await playlist.videos;
            for (const video of videos) {
                await processSource(video.title, video.id, video.thumbnail.url, video.url);
            }
        } catch (e) {
            console.error(`Error scraping playlist ${url}:`, e);
        }
    }

    await prisma.$disconnect();
    console.log("Playlist discovery completed.");
}

runPlaylistDiscovery().catch(console.error);
