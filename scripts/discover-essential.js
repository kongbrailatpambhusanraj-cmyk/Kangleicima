const { YouTube } = require('youtube-sr');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const { findExistingMovie } = require('../prisma/movie-matcher');

const prisma = new PrismaClient();
const ESSENTIAL_TITLES_PATH = 'data/essential_titles.json';

async function discoverEssential() {
    let titlesData;
    try {
        titlesData = JSON.parse(fs.readFileSync(ESSENTIAL_TITLES_PATH, 'utf8'));
    } catch (e) {
        console.error("Error reading essential_titles.json");
        return;
    }

    for (const titleEntry of titlesData) {
        if (titleEntry.discovered) continue;

        console.log(`Searching for essential title: ${titleEntry.canonicalTitle}`);
        let strongestSource = null;
        let highestScore = -1;

        // Try discovery queries
        for (const query of titleEntry.discoveryQueries) {
            console.log(`  Query: ${query}`);
            try {
                const results = await YouTube.search(query, { limit: 10, type: 'video' });

                for (const video of results) {
                    if (!video) continue;
                    // Scoring
                    let score = 0;
                    if (video.title.toLowerCase().includes(titleEntry.canonicalTitle.toLowerCase())) score += 50;
                    if (video.duration < 1000) score -= 100; // Likely a clip/trailer
                    if (video.title.toLowerCase().includes('full')) score += 30;

                    if (score > highestScore) {
                        highestScore = score;
                        strongestSource = video;
                    }
                }
            } catch (e) {
                console.error(`  Error searching ${query}: ${e.message}`);
                continue;
            }
        }

        if (strongestSource && highestScore > 40) {
            console.log(`  Found potential match: ${strongestSource.title} (Score: ${highestScore})`);

            const existing = await findExistingMovie(titleEntry.canonicalTitle);
            const existingSource = await prisma.movie.findUnique({
                where: { youtubeVideoId: strongestSource.id }
            });

            if (existing || existingSource) {
                console.log(`  Movie or source already exists.`);
                titleEntry.catalogueMatch = existing ? existing.id : existingSource.id;
                titleEntry.discovered = true;
                titleEntry.verificationStatus = 'verified';
            } else {
                const newMovie = await prisma.movie.create({
                    data: {
                        youtubeVideoId: strongestSource.id,
                        title: titleEntry.canonicalTitle,
                        thumbnail: strongestSource.thumbnail.url,
                        sourceUrl: strongestSource.url,
                        sourceType: 'youtube',
                        isFullMovie: true,
                        availabilityStatus: 'AVAILABLE'
                    }
                });
                console.log(`  Created movie record: ${newMovie.id}`);
                titleEntry.catalogueMatch = newMovie.id;
                titleEntry.discovered = true;
                titleEntry.playable = true;
                titleEntry.verificationStatus = 'verified';
            }
        } else {
            console.log(`  No playable source found for ${titleEntry.canonicalTitle}`);
            titleEntry.verificationStatus = 'needs-manual-review';
        }
        titleEntry.lastAuditedAt = new Date().toISOString();
    }

    fs.writeFileSync(ESSENTIAL_TITLES_PATH, JSON.stringify(titlesData, null, 2));
    await prisma.$disconnect();
    console.log("Discovery run completed.");
}

discoverEssential().catch(console.error);
