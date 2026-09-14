require('dotenv').config();
const { google } = require('googleapis');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const youtube = google.youtube({ version: 'v3', auth: YOUTUBE_API_KEY });

const PLAYLIST_ID = 'PLCHP10F0t3kjEdSJIjD9z0cGSJn1cTKWP';

async function fetchPlaylistItems(playlistId) {
    let items = [];
    let nextPageToken = '';

    do {
        console.log(`Fetching playlist page ${nextPageToken || 'first'}`);
        const response = await youtube.playlistItems.list({
            part: 'snippet,contentDetails',
            playlistId: playlistId,
            maxResults: 50,
            pageToken: nextPageToken,
        });

        items = [...items, ...response.data.items];
        nextPageToken = response.data.nextPageToken;
    } while (nextPageToken);

    return items;
}

async function scrapePlaylist() {
    console.log(`Starting official API scrape for playlist: ${PLAYLIST_ID}`);

    try {
        const items = await fetchPlaylistItems(PLAYLIST_ID);

        console.log(`Found ${items.length} items in playlist.`);

        for (const item of items) {
            const video = item.snippet;
            const videoId = item.contentDetails.videoId;
            console.log(`Processing: ${video.title} (${videoId})`);

            // Check if exists
            const existing = await prisma.movie.findUnique({
                where: { youtubeVideoId: videoId }
            });

            if (existing) {
                console.log(`  Movie ${video.title} exists. Skipping.`);
                continue;
            }

            await prisma.movie.create({
                data: {
                    youtubeVideoId: videoId,
                    title: video.title,
                    thumbnail: video.thumbnails.maxres?.url || video.thumbnails.high?.url || video.thumbnails.default?.url || '',
                    sourceUrl: `https://www.youtube.com/watch?v=${videoId}`,
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
