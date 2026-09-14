require('dotenv').config();
const { google } = require('googleapis');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const youtube = google.youtube({ version: 'v3', auth: YOUTUBE_API_KEY });

async function fixUnknownTitles() {
  const movies = await prisma.movie.findMany({ where: { title: 'Unknown' } });
  console.log(`Found ${movies.length} movies to fix.`);

  for (const movie of movies) {
    if (!movie.youtubeVideoId) continue;

    try {
      const response = await youtube.videos.list({
        part: 'snippet',
        id: movie.youtubeVideoId,
      });

      if (response.data.items && response.data.items.length > 0) {
        const title = response.data.items[0].snippet.title;
        console.log(`Updating ${movie.id}: '${movie.title}' -> '${title}'`);
        await prisma.movie.update({
          where: { id: movie.id },
          data: { title: title }
        });
      }
    } catch (e) {
      console.error(`Error fetching title for ${movie.youtubeVideoId}:`, e.message);
    }
  }

  await prisma.$disconnect();
}

fixUnknownTitles();
