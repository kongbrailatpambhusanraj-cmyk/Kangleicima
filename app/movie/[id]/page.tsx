import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import MovieInteractionTracker from '@/components/MovieInteractionTracker';

export default async function MoviePage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const movie = await prisma.movie.findUnique({
    where: { id },
    include: { parts: { orderBy: { partOrder: 'asc' } } }
  });

  if (!movie) notFound();

  return (
    <div className='pt-20 text-white p-8 min-h-screen bg-black'>
      <MovieInteractionTracker movieId={movie.id} />
      <div className="flex flex-col md:flex-row gap-8">
        {movie.thumbnail ? (
          <img
            src={movie.thumbnail}
            alt={movie.title}
            className="w-full md:w-1/3 rounded-lg shadow-lg"
          />
        ) : (
          <div className="w-full md:w-1/3 h-64 bg-gray-800 flex items-center justify-center text-gray-400 rounded-lg shadow-lg">
            No Thumbnail
          </div>
        )}
        <div className="flex flex-col gap-4">
          <h1 className='text-4xl font-bold'>{movie.title}</h1>
          <p className='text-gray-300'>{movie.description}</p>
          <div className='flex gap-2'>
            {movie.genres.map(genre => (
              <span key={genre} className="bg-gray-800 px-3 py-1 rounded text-sm">{genre}</span>
            ))}
          </div>
          <div className='mt-4 flex gap-4'>
            <Link href={`/watch/${movie.id}`} className='bg-red-600 px-8 py-3 rounded font-bold hover:bg-red-700 transition'>
              Play
            </Link>
          </div>
          {movie.parts.length > 0 && (
            <div className='mt-6'>
              <h2 className='text-xl font-bold mb-2'>Available Parts</h2>
              <div className='flex gap-2 flex-wrap'>
                {movie.parts.map((part, index) => (
                  <Link key={part.id} href={`/watch/${movie.id}?part=${part.partOrder}`} className='bg-gray-800 px-4 py-2 rounded hover:bg-gray-700'>
                    Part {part.partOrder}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
