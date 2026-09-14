const { YouTube } = require('youtube-sr');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const PLAYLIST_ID = 'PLCHP10F0t3kjEdSJIjD9z0cGSJn1cTKWP';

async function scrapePlaylist() {
    console.log(`Starting thorough scrape for playlist: ${PLAYLIST_ID}`);

    try {
        // Fetch playlist directly, which is generally more reliable for IDs
        const playlist = await YouTube.getPlaylist(`https://www.youtube.com/playlist?list=${PLAYLIST_ID}`, {
            limit: 500, // Increase limit
        });

        console.log(`Found ${playlist.videos.length} items in playlist.`);

        for (const video of playlist.videos) {
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

scrapePlaylist().catch(console.error);
