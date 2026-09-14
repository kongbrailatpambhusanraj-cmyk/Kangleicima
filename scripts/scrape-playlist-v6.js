const { YouTube } = require('youtube-sr');
const { PrismaClient } = require('@prisma/client');
const { normalize } = require('../prisma/movie-matcher');

const prisma = new PrismaClient();

// The playlist URL
const PLAYLIST_URL = 'https://www.youtube.com/playlist?list=PLCHP10F0t3kjEdSJIjD9z0cGSJn1cTKWP';

async function searchPlaylistFallback() {
    console.log(`Starting search-based scrape for: ${PLAYLIST_URL}`);

    try {
        // Since getPlaylist failed, we use search to find videos
        // Instead of searching for the playlist URL, we search for the uploader/channel or a known query if possible.
        // Actually, let's try searching directly for "Epom Media Manipuri" as a broader query to find these videos.
        const results = await YouTube.search("Epom Media Manipuri full movie", { limit: 100, type: 'video' });

        console.log(`Found ${results.length} items from search.`);

        for (const video of results) {
            console.log(`Processing: ${video.title} (${video.id})`);

            // Check if exists
            const existing = await prisma.movie.findUnique({
                where: { youtubeVideoId: video.id }
            });

            if (existing) {
                console.log(`  Movie ${video.title} exists. Skipping.`);
                continue;
            }

            await prisma.movie.create({
                data: {
                    youtubeVideoId: video.id,
                    title: video.title,
                    thumbnail: video.thumbnail?.url || '',
                    sourceUrl: video.url,
                    sourceType: 'youtube',
                    isFullMovie: true,
                    availabilityStatus: 'AVAILABLE'
                }
            });
            console.log(`  Created movie record: ${video.title}`);
        }
    } catch (e) {
        console.error("Discovery error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

searchPlaylistFallback().catch(console.error);
