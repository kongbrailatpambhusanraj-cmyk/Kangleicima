const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function audit() {
    const totalMovies = await prisma.movie.count();

    // Grouping by availability/types
    const allMovies = await prisma.movie.findMany();

    const stats = {
        totalRecords: totalMovies,
        uniqueVideos: new Set(allMovies.map(m => m.youtubeVideoId)).size,
        fullMovies: allMovies.filter(m => m.isFullMovie).length,
        shortFilms: allMovies.filter(m => m.title.toLowerCase().includes('short')).length,
        trailers: allMovies.filter(m => m.title.toLowerCase().includes('trailer') || m.title.toLowerCase().includes('teaser')).length,
        songs: allMovies.filter(m => m.title.toLowerCase().includes('song') || m.title.toLowerCase().includes('music')).length,
        unavailable: allMovies.filter(m => m.availabilityStatus === 'PRIVATE' || m.availabilityStatus === 'REMOVED').length
    };

    console.log("Database Audit Statistics:");
    console.log(JSON.stringify(stats, null, 2));

    console.log("\nScore Distribution:");
    const scores = allMovies.map(m => m.relevanceScore || 0);
    const distribution = scores.reduce((acc, score) => {
        acc[score] = (acc[score] || 0) + 1;
        return acc;
    }, {});
    console.log(distribution);

    await prisma.$disconnect();
}

audit().catch(console.error);
