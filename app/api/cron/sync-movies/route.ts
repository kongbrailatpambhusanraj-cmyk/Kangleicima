import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const CRON_SECRET = process.env.CRON_SECRET || 'manipuri_sync_secret_2026';

// Targeted search queries focused on movies and Shumang Leela
const SEARCH_QUERIES = [
  'Manipuri movie',
  'Manipuri Shumang Leela',
  'Manipuri Sumang Lila',
  'Manipuri film',
  'Manipuri Shumang Khumhei',
  'Manipuri cinema',
];

// Comprehensive filter against news, music, explainers, recaps, and interviews
const EXCLUDED_KEYWORDS = [
  // 1. Music & Audio Content (including Manipuri terms like ishei/eshei)
  'song',
  'songs',
  'music video',
  'official music',
  'official audio',
  'audio song',
  'video song',
  'lyric',
  'lyrics',
  'lyrical',
  'jukebox',
  'audio jukebox',
  'all songs',
  'song collection',
  'album',
  'remix',
  'dance cover',
  'dance performance',
  'eshei',
  'ishei',

  // 2. News, Live Reporting & Media Bulletins
  'news',
  'bulletin',
  'live news',
  'news live',
  'breaking news',
  'press meet',
  'press conference',
  'interview',
  'reporting',
  'report',
  'headline',
  'headlines',
  'tomtv',
  'istv',
  'impact tv',
  'air imphal',
  'dd manipur',
  'update news',
  'vlog',
  'daily vlog',

  // 3. Explanations, Recaps, Teasers & Reviews
  'explain',
  'explains',
  'explanation',
  'explained',
  'recap',
  'breakdown',
  'summary',
  'reaction',
  'review',
  'trailer',
  'teaser',
  'promo',
  'behind the scenes',
  'making of',
  'bloopers',
];

// Helper: Parse ISO 8601 YouTube duration (e.g. PT1H45M12S) to total minutes
function parseDurationMinutes(durationStr: string): number {
  const match = durationStr.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  return hours * 60 + minutes;
}

async function handleSync(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');
  const authHeader = request.headers.get('authorization');

  if (key !== CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Missing YOUTUBE_API_KEY' }, { status: 500 });
  }

  const addedMovies: { id: string; title: string; duration: number }[] = [];
  const errors: { query: string; message: string }[] = [];

  for (const query of SEARCH_QUERIES) {
    try {
      // 1. Fetch newly uploaded embeddable videos
      const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search');
      searchUrl.searchParams.set('part', 'snippet');
      searchUrl.searchParams.set('q', query);
      searchUrl.searchParams.set('type', 'video');
      searchUrl.searchParams.set('order', 'date');
      searchUrl.searchParams.set('videoEmbeddable', 'true');
      searchUrl.searchParams.set('maxResults', '20');
      searchUrl.searchParams.set('key', apiKey);

      const searchRes = await fetch(searchUrl.toString());
      if (!searchRes.ok) {
        throw new Error(`YouTube Search API error: ${searchRes.status}`);
      }

      const searchData = await searchRes.json();
      const videoItems = searchData.items || [];
      const videoIds = videoItems
        .map((item: any) => item.id?.videoId)
        .filter(Boolean);

      if (videoIds.length === 0) continue;

      // 2. Fetch video details
      const detailsUrl = new URL('https://www.googleapis.com/youtube/v3/videos');
      detailsUrl.searchParams.set('part', 'snippet,contentDetails');
      detailsUrl.searchParams.set('id', videoIds.join(','));
      detailsUrl.searchParams.set('key', apiKey);

      const detailsRes = await fetch(detailsUrl.toString());
      if (!detailsRes.ok) continue;

      const detailsData = await detailsRes.json();
      const detailedVideos = detailsData.items || [];

      for (const item of detailedVideos) {
        const videoId = item.id;
        const snippet = item.snippet;
        const titleLower = (snippet.title || '').toLowerCase();
        const descLower = (snippet.description || '').toLowerCase();
        const combinedText = `${titleLower} ${descLower}`;

        // 3. Strict negative filter: Skip news, songs, music, recaps, and explanations
        const hasExcludedKeyword = EXCLUDED_KEYWORDS.some((kw) => titleLower.includes(kw));
        if (hasExcludedKeyword) {
          continue;
        }

        // 4. Duplicate prevention
        const existing = await prisma.movie.findFirst({
          where: { youtubeVideoId: videoId },
          select: { id: true },
        });

        if (existing) continue;

        // 5. Categorization: Shumang Leela vs Film
        const isLeela =
          combinedText.includes('shumang') ||
          combinedText.includes('sumang') ||
          combinedText.includes('leela') ||
          combinedText.includes('lila') ||
          combinedText.includes('khumhei');

        const genres = isLeela
          ? ['Shumang Leela', 'Manipuri Drama', 'Cultural']
          : ['Manipuri Cinema', 'Feature Film'];

        const durationStr = item.contentDetails?.duration || '';
        const durationMinutes = parseDurationMinutes(durationStr);

        // Classify full movie flag based on length or phrasing
        const isFullMovie =
          durationMinutes >= 40 ||
          combinedText.includes('full movie') ||
          combinedText.includes('full play') ||
          combinedText.includes('complete');

        const thumbnail =
          snippet.thumbnails?.maxres?.url ||
          snippet.thumbnails?.high?.url ||
          snippet.thumbnails?.medium?.url;

        // 6. Ingest movie record
        const created = await prisma.movie.create({
          data: {
            title: snippet.title,
            description:
              snippet.description?.trim() ||
              (isLeela ? 'Manipuri Shumang Leela theatrical play.' : 'Manipuri digital feature film.'),
            thumbnail: thumbnail,
            youtubeVideoId: videoId,
            sourceUrl: `https://www.youtube.com/watch?v=${videoId}`,
            genres: genres,
            isFullMovie: isFullMovie,
            availabilityStatus: 'AVAILABLE',
            relevanceScore: 100,
          },
        });

        addedMovies.push({
          id: created.id,
          title: created.title,
          duration: durationMinutes,
        });
      }
    } catch (err: any) {
      errors.push({ query, message: err.message });
    }
  }

  return NextResponse.json({
    success: true,
    addedCount: addedMovies.length,
    newTitles: addedMovies,
    errors,
  });
}

export async function GET(request: Request) {
  return handleSync(request);
}

export async function POST(request: Request) {
  return handleSync(request);
}