import { prisma } from '@/lib/prisma';

export default async function AdminMoviesPage() {
  const movies = await prisma.movie.findMany({
    take: 20,
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Manage Movies</h1>
      <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-4 text-left">Title</th>
            <th className="p-4 text-left">Status</th>
            <th className="p-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {movies.map((movie) => (
            <tr key={movie.id} className="border-b">
              <td className="p-4">{movie.title}</td>
              <td className="p-4">{movie.availabilityStatus}</td>
              <td className="p-4 text-right">
                <button className="text-blue-600 hover:text-blue-900">Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
