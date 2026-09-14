import MovieCard from "@/components/MovieCard";
import { prisma } from "@/lib/prisma";

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const where: any = {};
  if (slug === 'leela') {
    where.OR = [
      { title: { contains: 'Leela', mode: 'insensitive' } },
      { title: { contains: 'Shumang', mode: 'insensitive' } },
      { description: { contains: 'Leela', mode: 'insensitive' } },
      { description: { contains: 'Shumang', mode: 'insensitive' } }
    ];
  } else {
    where.OR = [
      { title: { contains: slug, mode: 'insensitive' } },
      { description: { contains: slug, mode: 'insensitive' } },
      { genres: { has: slug } }
    ];
  }
  const movies = await prisma.movie.findMany({ where });

  return (
    <div className="pt-20 text-white min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8 capitalize">{slug}</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie as any} />
        ))}
      </div>
    </div>
  );
}
