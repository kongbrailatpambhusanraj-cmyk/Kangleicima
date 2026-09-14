const { PrismaClient } = require('@prisma/client');
const YouTube = require('youtube-sr').default;

const prisma = new PrismaClient();

const QUERIES = {
  'Trending': ["Manipuri film full movie", "Kumhei Manipuri film"],
  'Shumang Leela': ["Manipuri Shumang Leela full"],
  'Action': ["Tantha Manipuri movie action", "Manipuri thriller film"],
};

async function main() {
  console.log("Starting production seed...");

  for (const [genre, queries] of Object.entries(QUERIES)) {
    for (const query of queries) {
      console.log(`Searching: ${query}`);
      const videos = await YouTube.search(query, { type: 'video', limit: 5 });

      for (const v of videos) {
        if (!v.id || !v.thumbnail?.url) continue;

        try {
          await prisma.movie.upsert({
            where: { id: v.id },
            update: {},
            create: {
              id: v.id,
              title: v.title,
              description: v.description?.substring(0, 255) || '',
              thumbnail: `https://img.youtube.com/vi/${v.id}/maxresdefault.jpg`,
              sourceUrl: v.url,
              sourceType: 'youtube',
              genres: [genre],
            },
          });
          console.log(`Seeded: ${v.title} (${genre})`);
        } catch (e) {
          console.error(`Failed: ${v.title}`, e.message);
        }
      }
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
