const { PrismaClient } = require("@prisma/client");
const { google } = require("googleapis");
require("dotenv").config();

const prisma = new PrismaClient();

const youtube = google.youtube({
  version: "v3",
  auth: process.env.YOUTUBE_API_KEY,
});

// Expanded search queries covering the entire Manipuri entertainment catalog
const SEARCH_QUERIES = [
  "Manipuri full movie",
  "Manipuri cinema full movie",
  "Manipuri feature film",
  "Manipuri classic full movie",
  "Sumang Leela full",
  "Shumang Leela full drama",
  "Manipuri leela drama full",
  "Tantha full movie",
  "Kumhei Manipuri movie",
  "Mami Samiti full movie",
  "Manipuri digital film full",
  "Manipuri old classic movie",
];

const BLACKLIST_KEYWORDS = [
  "trailer",
  "teaser",
  "promo",
  "making",
  "song",
  "audio track",
  "jukebox",
  "interview",
  "reaction",
  "scene cut",
  "behind the scene",
  "whatsapp status",
  "short clip",
  "preview",
];

function cleanTitle(rawTitle) {
  return rawTitle
    .replace(/\[.*?\]|\(.*?\)/g, "")
    .replace(/(full movie|manipuri film|hd 1080p|4k|official release)/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getGroupBaseTitle(title) {
  return title
    .replace(/part\s*\d+/gi, "")
    .replace(/episode\s*\d+/gi, "")
    .replace(/ep\s*\d+/gi, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function parseDuration(durationStr) {
  if (!durationStr) return 0;
  const match = durationStr.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || 0, 10);
  const minutes = parseInt(match[2] || 0, 10);
  const seconds = parseInt(match[3] || 0, 10);
  return hours * 3600 + minutes * 60 + seconds;
}

async function discoverMovies() {
  console.log("🎬 Starting Deep Multi-Page YouTube Discovery Pipeline...");

  if (!process.env.YOUTUBE_API_KEY) {
    console.error("❌ YOUTUBE_API_KEY is missing in your .env file.");
    return;
  }

  let totalSaved = 0;

  for (const query of SEARCH_QUERIES) {
    console.log(`\n🔍 Crawling query: "${query}"...`);
    let pageToken = undefined;
    let pagesCrawled = 0;
    const MAX_PAGES_PER_QUERY = 3; // 3 pages * 50 = up to 150 results per query

    while (pagesCrawled < MAX_PAGES_PER_QUERY) {
      try {
        const searchRes = await youtube.search.list({
          part: ["snippet"],
          q: query,
          type: ["video"],
          maxResults: 50,
          videoDuration: "long",
          pageToken: pageToken,
        });

        const videoItems = searchRes.data.items || [];
        const videoIds = videoItems.map((item) => item.id.videoId).filter(Boolean);

        if (videoIds.length === 0) break;

        const detailRes = await youtube.videos.list({
          part: ["snippet", "contentDetails", "statistics"],
          id: videoIds,
        });

        const fullVideos = detailRes.data.items || [];

        for (const vid of fullVideos) {
          const rawTitle = vid.snippet.title || "";
          const lowerTitle = rawTitle.toLowerCase();

          // Blacklist check
          if (BLACKLIST_KEYWORDS.some((word) => lowerTitle.includes(word))) {
            continue;
          }

          const durationSeconds = parseDuration(vid.contentDetails.duration);

          // Only keep long-form content (> 18 minutes)
          if (durationSeconds < 1080) {
            continue;
          }

          const youtubeId = vid.id;
          const cleanedTitle = cleanTitle(rawTitle);
          const groupBase = getGroupBaseTitle(cleanedTitle);
          const viewCount = BigInt(vid.statistics.viewCount || 0);

          const isLeela =
            lowerTitle.includes("leela") ||
            lowerTitle.includes("sumang") ||
            lowerTitle.includes("shumang") ||
            query.includes("leela");

          const genres = isLeela
            ? ["Sumang Leela", "Manipuri Drama"]
            : ["Manipuri Cinema", "Drama"];

          const groupId = groupBase.length > 3 ? `group_${groupBase}` : null;

          await prisma.movie.upsert({
            where: { youtubeVideoId: youtubeId },
            update: {
              title: cleanedTitle,
              thumbnail:
                vid.snippet.thumbnails?.maxres?.url ||
                vid.snippet.thumbnails?.high?.url ||
                vid.snippet.thumbnails?.default?.url,
              viewCount: viewCount,
              duration: durationSeconds,
              availabilityStatus: "AVAILABLE",
            },
            create: {
              title: cleanedTitle,
              description:
                vid.snippet.description?.slice(0, 1000) ||
                "Manipuri cinema performance entry.",
              thumbnail:
                vid.snippet.thumbnails?.maxres?.url ||
                vid.snippet.thumbnails?.high?.url ||
                vid.snippet.thumbnails?.default?.url,
              youtubeVideoId: youtubeId,
              sourceUrl: `https://www.youtube.com/watch?v=${youtubeId}`,
              sourceType: "YOUTUBE",
              genres: genres,
              channelId: vid.snippet.channelId,
              channelTitle: vid.snippet.channelTitle,
              publishedAt: vid.snippet.publishedAt
                ? new Date(vid.snippet.publishedAt)
                : new Date(),
              duration: durationSeconds,
              viewCount: viewCount,
              isFullMovie: true,
              isDiscovered: true,
              groupId: groupId,
              availabilityStatus: "AVAILABLE",
            },
          });

          totalSaved++;
          console.log(`   Saved: ${cleanedTitle}`);
        }

        pageToken = searchRes.data.nextPageToken;
        pagesCrawled++;
        if (!pageToken) break;
      } catch (err) {
        console.error(`   Error fetching page for "${query}":`, err.message);
        break;
      }
    }
  }

  const finalCount = await prisma.movie.count();
  console.log(`\n Ingestion Complete! Total movies in database: ${finalCount}`);
}

discoverMovies()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });