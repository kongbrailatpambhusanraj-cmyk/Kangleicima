const { YouTube } = require('youtube-sr');
const { PrismaClient } = require('@prisma/client');
const { findExistingMovie } = require('../prisma/movie-matcher');

const prisma = new PrismaClient();

// Playlist for essential films from the user-provided link
const PLAYLIST_ID = 'PLCHP10F0t3kjEdSJIjD9z0cGSJn1cTKWP';

async function scrapePlaylist() {
    console.log(`Starting robust scrape for playlist: ${PLAYLIST_ID}`);

    try {
        // Use search to find playlist items if getPlaylist fails directly
        // YouTube-sr search often works better for playlists than raw playlist fetching
        const results = await YouTube.search(`https://www.youtube.com/playlist?list=${PLAYLIST_ID}`, {
            limit: 200,
            type: 'video'
        });

        console.log(`Found ${results.length} items to process.`);

        for (const video of results) {
            console.log(`Processing: ${video.title}`);
            const existingSource = await prisma.movie.findUnique({
                where: { youtubeVideoId: video.id }
            });

            if (existingSource) continue;

            const existing = await findExistingMovie(video.title);

            if (existing) {
                console.log(`  Movie ${video.title} (ID: ${existing.id}) exists. Skipping.`);
            } else {
                await prisma.movie.create({
                    data: {
                        youtubeVideoId: video.id,
                        title: video.title,
                        thumbnail: video.thumbnail.url,
                        sourceUrl: video.url,
                        sourceType: 'youtube',
                        isFullMovie: true,
                        availabilityStatus: 'AVAILABLE'
                    }
                });
                console.log(`  Created movie record: ${video.title}`);
            }
        }
    } catch (e) {
        console.error("Discovery error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

scrapePlaylist().catch(console.error);
