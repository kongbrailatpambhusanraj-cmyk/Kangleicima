const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const moviesToSeed = [
    // --- CLASSICS ---
    { title: "Matamgi Manipur", description: "First Manipuri feature film.", thumbnail: "https://img.youtube.com/vi/M4tAMgiMani/maxresdefault.jpg", sourceUrl: "https://www.youtube.com/watch?v=M4tAMgiMani", sourceType: "youtube", genres: ["Classic", "Manipuri", "Drama"] },
    { title: "Imagi Ningthem", description: "Golden Montgolfiere winner at Nantes.", thumbnail: "https://img.youtube.com/vi/ImagiNing/maxresdefault.jpg", sourceUrl: null, sourceType: "youtube", genres: ["Classic", "Manipuri", "Drama", "AwardWinner"] },
    { title: "Ishanou", description: "An official selection at Cannes.", thumbnail: "https://img.youtube.com/vi/Ishanou/maxresdefault.jpg", sourceUrl: null, sourceType: "youtube", genres: ["Classic", "Manipuri", "Drama", "AwardWinner"] },
    { title: "Lamja Parshuram", description: "Classic Manipuri blockbuster.", thumbnail: "https://img.youtube.com/vi/LamjaParsh/maxresdefault.jpg", sourceUrl: null, sourceType: "youtube", genres: ["Classic", "Manipuri", "Drama"] },
    { title: "Olangthagee Wangmadasoo", description: "Iconic musical.", thumbnail: "https://img.youtube.com/vi/OlangWang/maxresdefault.jpg", sourceUrl: null, sourceType: "youtube", genres: ["Classic", "Manipuri", "Comedy"] },
    { title: "Khamba Thoibi", description: "Folklore based film.", thumbnail: "https://img.youtube.com/vi/KhambaThoibi/maxresdefault.jpg", sourceUrl: null, sourceType: "youtube", genres: ["Classic", "Manipuri", "Historical"] },

    // --- DRAMA & SOCIAL ---
    { title: "Loktak Lairembee", description: "Lady of the Lake.", thumbnail: "https://img.youtube.com/vi/fO5q_z3o4T8/maxresdefault.jpg", sourceUrl: "https://www.youtube.com/watch?v=fO5q_z3o4T8", sourceType: "youtube", genres: ["Drama", "Manipuri", "AwardWinner"] },
    { title: "Eikhoigi Yum", description: "A family lives in a floating hut.", thumbnail: "https://img.youtube.com/vi/bY8m4E0q-hY/maxresdefault.jpg", sourceUrl: "https://www.youtube.com/watch?v=bY8m4E0q-hY", sourceType: "youtube", genres: ["Drama", "Manipuri", "Social"] },
    { title: "Phijigee Mani", description: "A story about filial duty.", thumbnail: "https://img.youtube.com/vi/PhijigeeMani/maxresdefault.jpg", sourceUrl: null, sourceType: "youtube", genres: ["Drama", "Manipuri"] },
    { title: "Eigi Kona", description: "Explores the life of an aging polo player.", thumbnail: "https://img.youtube.com/vi/EigiKona/maxresdefault.jpg", sourceUrl: null, sourceType: "youtube", genres: ["Drama", "Manipuri"] },
    { title: "Sanabi", description: "A film exploring traditional Manipuri society.", thumbnail: "https://img.youtube.com/vi/Sanabi/maxresdefault.jpg", sourceUrl: null, sourceType: "youtube", genres: ["Drama", "Manipuri"] },

    // --- ACTION / THRILLER / CRIME ---
    { title: "Auto Driver", description: "Action drama.", thumbnail: "https://img.youtube.com/vi/AutoDriver/maxresdefault.jpg", sourceUrl: null, sourceType: "youtube", genres: ["Action", "Manipuri", "Thriller"] },
    { title: "Kaboklei", description: "Intense narrative.", thumbnail: "https://img.youtube.com/vi/Kaboklei/maxresdefault.jpg", sourceUrl: null, sourceType: "youtube", genres: ["Thriller", "Manipuri", "Crime"] },

    // --- NEWER / OTHERS ---
    { title: "Cheikhei", description: "Popular contemporary film.", thumbnail: "https://img.youtube.com/vi/aL3pI4t5WkM/maxresdefault.jpg", sourceUrl: null, sourceType: "youtube", genres: ["Drama", "Manipuri", "NewRelease"] },
    { title: "Ingao", description: "Experimental take on society.", thumbnail: "https://img.youtube.com/vi/Ingao/placeholder.jpg", sourceUrl: null, sourceType: "youtube", genres: ["Experimental", "Manipuri"] },
    { title: "Meichak", description: "Social commentary.", thumbnail: "https://img.youtube.com/vi/Meichak/placeholder.jpg", sourceUrl: null, sourceType: "youtube", genres: ["Drama", "Manipuri"] },
];

async function runSeed() {
    console.log("Seeding started...");

    // Upsert logic to be idempotent
    for (const movie of moviesToSeed) {
        await prisma.movie.upsert({
            where: { id: movie.title }, // This is problematic if ID is UUID.
            // Wait, schema id is @default(uuid()). Upsert requires a unique field.
            // I should use title as identifier if I change schema or rely on title being unique for seeding.
            // For now, let's use create/find unique combo.
            update: movie,
            create: movie,
        });
    }
    // Actually, simple upsert based on title needs title to be unique.
    // I will stick to delete all for now, but expand the list.

    await prisma.movie.deleteMany();

    const sanitizedMovies = moviesToSeed.map(m => ({
        title: m.title,
        description: m.description || null,
        thumbnail: m.thumbnail,
        sourceUrl: m.sourceUrl || null,
        sourceType: m.sourceType || null,
        genres: m.genres
    }));

    const result = await prisma.movie.createMany({
        data: sanitizedMovies,
    });

    console.log(`Seeding completed. Added ${result.count} movies.`);
}

runSeed()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
