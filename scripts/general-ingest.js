require('dotenv').config();
const { google } = require('googleapis');
const { PrismaClient } = require('@prisma/client');
const { findExistingMovie, normalize } = require('../prisma/movie-matcher');

const prisma = new PrismaClient();
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const youtube = google.youtube({ version: 'v3', auth: YOUTUBE_API_KEY });

const PLAYLISTS = [
    'PL6B6fWgDA4lk0tR6-kwc2gYnLwm74feIV',
    'PLHVsa-lmqbkSOSwkNilaLYPz9gliMKhnI',
    'PL1l3k0YiJ-i_s14VY4lVIdtu4jwnLpR2B'
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
        if (!response.data.items || response.data.items.length === 0) return { status: 'unavailable' };
        const video = response.data.items[0];
        if (video.status.privacyStatus !== 'public') return { status: video.status.privacyStatus };
        return { status: 'public', video: video };
    } catch (e) {
        return { status: 'error' };
    }
}

function classifyContent(title, description) {
    const t = (title + ' ' + description).toLowerCase();
    const genres = [];
    if (t.includes('leela') || t.includes('shumang')) genres.push('Leela', 'Sumang Leela', 'Manipuri Drama');
    else if (t.includes('manipuri')) genres.push('Manipuri Movie');

    if (t.includes('short')) genres.push('Short Film');
    if (t.includes('documentary')) genres.push('Documentary');
    if (t.includes('music') || t.includes('song')) genres.push('Music');

    return [...new Set(genres)];
}

async function main() {
    console.log("Starting Additional Content Import...");
    const stats = { newMovies: 0, newSources: 0, duplicates: 0, errors: 0, excluded: 0 };

    for (const playlistId of PLAYLISTS) {
        console.log(`Processing Playlist: ${playlistId}`);
        const items = await fetchPlaylistItems(playlistId);

        for (const item of items) {
            const videoId = item.contentDetails.videoId;
            const verification = await verifyVideo(videoId);

            if (verification.status !== 'public') {
                stats.excluded++;
                continue;
            }

            const video = verification.video;

            // Check for exact video duplicate
            const existingVideo = await prisma.movie.findUnique({ where: { youtubeVideoId: videoId } });
            if (existingVideo) {
                stats.duplicates++;
                continue;
            }

            // check canonical duplicate
            const existingCanonical = await findExistingMovie(video.snippet.title);
            if (existingCanonical) {
                // Add part/source if not same video
                await prisma.moviePart.create({
                    data: {
                        movieId: existingCanonical.id,
                        partOrder: 1, // simplified
                        title: video.snippet.title,
                        sourceUrl: `https://www.youtube.com/watch?v=${videoId}`,
                        videoId: videoId
                    }
                });
                stats.newSources++;
                continue;
            }

            // Create new movie
            await prisma.movie.create({
                data: {
                    youtubeVideoId: videoId,
                    title: video.snippet.title,
                    description: video.snippet.description,
                    thumbnail: video.snippet.thumbnails.maxres?.url || video.snippet.thumbnails.high?.url || '',
                    sourceUrl: `https://www.youtube.com/watch?v=${videoId}`,
                    sourceType: 'youtube',
                    isFullMovie: true,
                    availabilityStatus: 'AVAILABLE',
                    genres: classifyContent(video.snippet.title, video.snippet.description)
                }
            });
            stats.newMovies++;
        }
    }
    console.log("Import Stats:", stats);
}

main().catch(console.error).finally(() => prisma.$disconnect());
