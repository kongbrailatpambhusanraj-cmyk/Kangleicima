const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function normalize(title) {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

async function findExistingMovie(title) {
    const normalizedTitle = normalize(title);
    const movies = await prisma.movie.findMany();

    // Use Levenshtein-like or high-confidence matching instead of just includes()
    return movies.find(m => {
        const normalizedExisting = normalize(m.title);

        // Require very high similarity
        if (normalizedExisting === normalizedTitle) return true;

        // Semantic check: are they genuinely the same?
        // Basic check: do they share significant tokens?
        const tokens1 = normalizedTitle.split(' ');
        const tokens2 = normalizedExisting.split(' ');

        const matchCount = tokens1.filter(t => tokens2.includes(t)).length;
        const confidence = matchCount / Math.max(tokens1.length, tokens2.length);

        return confidence > 0.8; // Require > 80% token overlap for auto-deduplication
    });
}

module.exports = { normalize, findExistingMovie };
