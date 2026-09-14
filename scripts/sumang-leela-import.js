require('dotenv').config();
const { google } = require('googleapis');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const youtube = google.youtube({ version: 'v3', auth: YOUTUBE_API_KEY });

const PLAYLISTS = [
    'PLDpBWumS7ZxKouuS_c45WEFV327ac761O',
    'PLt10aPf-7DPwU9lHwumkKeYUqGW-hjJel',
    'PLnfI_JxqFTTvu8vW7NQbhYw8Jwd2VhayD',
    'PLdXmhziprNPVUiUG9tkEhghLOCICqfp4y',
    'PLh3NdtpBwrfQrOGg4KS4UQNliI3HpQx45',
    'PLZtEZ3P9CGKn8qEEhIMS_AuLbCVrB4uOj'
];

async function fetchPlaylistItems(playlistId) {
    let items = [];
    let nextPageToken = '';
    do {
        console.log(`  Fetching page for ${playlistId}`);
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

async function verifyVideo(videoId) {
    try {
        const response = await youtube.videos.list({
            part: 'snippet,contentDetails,status',
            id: videoId,
        });
        if (!response.data.items || response.data.items.length === 0) return { status: 'unavailable', reason: 'not-found' };
        const video = response.data.items[0];
        if (video.status.privacyStatus !== 'public') return { status: video.status.privacyStatus, reason: video.status.privacyStatus };
        return { status: 'public', video: video };
    } catch (e) {
        return { status: 'error', reason: e.message };
    }
}

function cleanTitle(title) {
    return title.replace(/Part \d+/gi, '')
                .replace(/Full Movie/gi, '')
                .replace(/Full Video/gi, '')
                .replace(/\[.*?\]/g, '')
                .replace(/\(.*?\)/g, '')
                .replace(/[|#]/g, '')
                .trim();
}

async function main() {
    console.log("Starting Sumang Leela Import...");
    const stats = { newMovies: 0, newSources: 0, duplicates: 0, errors: 0, excluded: 0 };

    for (const playlistId of PLAYLISTS) {
        console.log(`Processing Playlist: ${playlistId}`);
        const items = await fetchPlaylistItems(playlistId);
        console.log(`  Discovered ${items.length} items.`);

        for (const item of items) {
            const videoId = item.contentDetails.videoId;
            const verification = await verifyVideo(videoId);

            if (verification.status !== 'public') {
                stats.excluded++;
                continue;
            }

            const video = verification.video;
            const existing = await prisma.movie.findUnique({ where: { youtubeVideoId: videoId } });

            if (existing) {
                stats.duplicates++;
                continue;
            }

            await prisma.movie.create({
                data: {
                    youtubeVideoId: videoId,
                    title: cleanTitle(video.snippet.title),
                    description: video.snippet.description,
                    thumbnail: video.snippet.thumbnails.maxres?.url || video.snippet.thumbnails.high?.url || video.snippet.thumbnails.default?.url || '',
                    sourceUrl: `https://www.youtube.com/watch?v=${videoId}`,
                    sourceType: 'youtube',
                    isFullMovie: true,
                    availabilityStatus: 'AVAILABLE',
                    genres: ['Leela', 'Sumang Leela', 'Manipuri Drama']
                }
            });
            stats.newMovies++;
            console.log(`  Imported: ${video.snippet.title}`);
        }
    }
    console.log("Import Stats:", stats);
}

main().catch(console.error).finally(() => prisma.$disconnect());
