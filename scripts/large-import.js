require('dotenv').config();
const { google } = require('googleapis');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const youtube = google.youtube({ version: 'v3', auth: YOUTUBE_API_KEY });

async function getSources() {
  return [
    { type: 'playlist', id: 'PL0lYxTCYo56izsXOjygt_l9eSl9_6TI1j' },
    { type: 'playlist', id: 'PLh3NdtpBwrfRvhJsJCAvRbCdOWD0kynbJ' },
    { type: 'video', id: 'VbItscN36-A' },
    { type: 'video', id: '25pTjeh0cV8' },
    { type: 'video', id: '_iHP9ZUhj3w' }
  ];
}

async function verifyVideo(videoId) {
  try {
    const response = await youtube.videos.list({
      part: 'snippet,contentDetails,status',
      id: videoId,
    });

    if (!response.data.items || response.data.items.length === 0) {
      return { status: 'unavailable', reason: 'video-not-found' };
    }

    const video = response.data.items[0];
    const status = video.status;

    if (status.privacyStatus === 'private') return { status: 'private', reason: 'private' };
    if (status.uploadStatus !== 'uploaded') return { status: 'unavailable', reason: 'upload-status-' + status.uploadStatus };

    // Membership and restriction checks
    if (status.embeddable === false) return { status: 'embedding-disabled', reason: 'embedding-disabled' };

    // This is heuristic, YouTube API might put membership/restriction info elsewhere
    // If we get here and it seems okay, it's public
    return { status: 'public', video: video };
  } catch (e) {
    console.error(`Error verifying video ${videoId}:`, e);
    return { status: 'error', reason: e.message };
  }
}

async function fetchPlaylistItems(playlistId) {
    let items = [];
    let nextPageToken = '';
    do {
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

async function processSource(source) {
  console.log(`Processing ${source.type}: ${source.id}`);
  let videos = [];
  if (source.type === 'playlist') {
    const items = await fetchPlaylistItems(source.id);
    videos = items.map(item => ({ videoId: item.contentDetails.videoId, title: item.snippet.title }));
  } else {
    videos = [{ videoId: source.id }];
  }

  for (const videoInfo of videos) {
    const verification = await verifyVideo(videoInfo.videoId);

    if (verification.status !== 'public') {
      console.log(`  Skipping ${videoInfo.videoId}: ${verification.status} (${verification.reason})`);
      // Log as lightweight record for admin
      await prisma.movie.upsert({
         where: { youtubeVideoId: videoInfo.videoId },
         update: {
            availabilityStatus: verification.status.toUpperCase(),
            description: verification.reason
         },
         create: {
            youtubeVideoId: videoInfo.videoId,
            title: videoInfo.title || 'Unknown',
            thumbnail: '',
            availabilityStatus: verification.status.toUpperCase(),
            description: verification.reason
         }
      });
      continue;
    }

    // Process public movie
    const video = verification.video;
    const existing = await prisma.movie.findUnique({ where: { youtubeVideoId: video.id } });
    if (existing) {
        console.log(`  Movie ${video.snippet.title} already exists.`);
        continue;
    }

    await prisma.movie.create({
        data: {
            youtubeVideoId: video.id,
            title: video.snippet.title,
            description: video.snippet.description,
            thumbnail: video.snippet.thumbnails.maxres?.url || video.snippet.thumbnails.high?.url || video.snippet.thumbnails.default?.url || '',
            sourceUrl: `https://www.youtube.com/watch?v=${video.id}`,
            sourceType: 'youtube',
            isFullMovie: true,
            availabilityStatus: 'AVAILABLE'
        }
    });
    console.log(`  Imported ${video.snippet.title}`);
  }
}

async function main() {
  const sources = await getSources();
  for (const source of sources) await processSource(source);
  await prisma.$disconnect();
}
main().catch(console.error);
