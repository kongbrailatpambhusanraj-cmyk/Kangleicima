require('dotenv').config();
const { google } = require('googleapis');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const youtube = google.youtube({ version: 'v3', auth: YOUTUBE_API_KEY });

async function auditVideos() {
  const movies = await prisma.movie.findMany({ where: { NOT: { youtubeVideoId: null } } });
  console.log(`Auditing ${movies.length} movies.`);

  for (const movie of movies) {
    try {
      const response = await youtube.videos.list({
        part: 'status',
        id: movie.youtubeVideoId,
      });

      if (!response.data.items || response.data.items.length === 0) {
        console.log(`Marking ${movie.title} as UNAVAILABLE (not found)`);
        await prisma.movie.update({ where: { id: movie.id }, data: { availabilityStatus: 'UNAVAILABLE' } });
        continue;
      }

      const status = response.data.items[0].status;
      if (status.privacyStatus !== 'public' || status.embeddable === false) {
        console.log(`Marking ${movie.title} as UNAVAILABLE (${status.privacyStatus})`);
        await prisma.movie.update({ where: { id: movie.id }, data: { availabilityStatus: 'UNAVAILABLE' } });
      } else {
        // Ensure it's marked available if it's public
        if (movie.availabilityStatus !== 'AVAILABLE') {
            await prisma.movie.update({ where: { id: movie.id }, data: { availabilityStatus: 'AVAILABLE' } });
        }
      }
    } catch (e) {
      console.error(`Error auditing ${movie.youtubeVideoId}:`, e.message);
    }
  }

  await prisma.$disconnect();
}

auditVideos();
