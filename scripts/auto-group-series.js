const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Helper to normalize title & match parts
function getBaseSeriesKey(title) {
  if (!title) return null;
  let clean = title
    .replace(/(\[|\()?(4k|ultra hd|hd|full movie|full film|full leela|full play|official)(\]|\))?/gi, '')
    .replace(/&quot;/g, '')
    .replace(/\|.*$/g, '')
    .trim();

  const partRegex = /\b(?:part|pt|episode|ep|vol|volume|scene|last\s+part)[\s.:#_-]*([0-9]+|[ivx]+)?\b/i;
  const match = clean.match(partRegex);

  if (!match) return null;

  return clean
    .replace(match[0], '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function groupSeries() {
  console.log('Fetching movies to identify multi-part series...');
  const movies = await prisma.movie.findMany({
    select: { id: true, title: true, groupId: true },
  });

  const clusters = {};

  for (const m of movies) {
    const baseKey = getBaseSeriesKey(m.title);
    if (!baseKey || baseKey.length < 3) continue;

    if (!clusters[baseKey]) {
      clusters[baseKey] = [];
    }
    clusters[baseKey].push(m);
  }

  let updatedGroups = 0;

  for (const [baseKey, items] of Object.entries(clusters)) {
    if (items.length < 2) continue; // Only group if at least 2 parts exist

    const assignedGroupId = items[0].groupId || `series_${baseKey.replace(/\s+/g, '_').slice(0, 24)}`;
    console.log(`\n Linking series: "${baseKey.toUpperCase()}" (${items.length} parts) -> Group ID: ${assignedGroupId}`);

    for (const item of items) {
      if (item.groupId !== assignedGroupId) {
        await prisma.movie.update({
          where: { id: item.id },
          data: { groupId: assignedGroupId },
        });
        console.log(`   ✓ Linked: ${item.title}`);
        updatedGroups++;
      }
    }
  }

  console.log(`\n Completed! Linked ${updatedGroups} movie entries into organized series.`);
}

groupSeries()
  .catch((err) => console.error('Error grouping series:', err))
  .finally(async () => await prisma.$disconnect());