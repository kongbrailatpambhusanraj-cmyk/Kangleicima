import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import MovieCard from "@/components/MovieCard";
import Link from "next/link";
import UserAuth from "@/components/UserAuth";

export const dynamic = "force-dynamic";

export default async function MyListPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If no user session exists on the server, prompt sign-in
  if (!user || !user.email) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-8 text-center space-y-6 shadow-2xl">
          <h1 className="text-2xl font-bold tracking-tight">
            KANGLEI<span className="text-red-600">CIMA</span>
          </h1>
          <p className="text-neutral-400 text-sm">
            Sign in to access your Watchlist and synced history.
          </p>
          <div className="flex justify-center">
            <UserAuth />
          </div>
          <p className="text-xs text-neutral-500">
            By continuing, you agree to KangleiCima Terms of Service and Privacy Policy.
          </p>
        </div>
      </main>
    );
  }

  // 1. Resolve internal user record by unique email
  const dbUser = await prisma.user.upsert({
    where: { email: user.email },
    update: {},
    create: {
      id: user.id,
      email: user.email,
    },
  });

  // 2. Ensure Profile exists
  let userProfile = await prisma.profile.findFirst({
    where: { userId: dbUser.id },
  });

  if (!userProfile) {
    userProfile = await prisma.profile.create({
      data: {
        userId: dbUser.id,
        name:
          user.user_metadata?.full_name ||
          user.email.split("@")[0] ||
          "Default Profile",
      },
    });
  }

  // 3. Fetch all watch list items ordered by most recently added
  const watchListEntries = await prisma.watchListItem.findMany({
    where: {
      profileId: userProfile.id,
    },
    orderBy: {
      addedAt: "desc",
    },
  });

  console.log(`[MyList Page] Found ${watchListEntries.length} items in WatchListItem for profile: ${userProfile.id}`);

  const movieIds = watchListEntries.map((item) => item.movieId);

  // 4. Retrieve matching Movie records from the database
  const movies =
    movieIds.length > 0
      ? await prisma.movie.findMany({
          where: {
            id: { in: movieIds },
          },
        })
      : [];

  console.log(`[MyList Page] Successfully fetched ${movies.length} Movie records from database`);

  // Maintain the exact chronological order of addedAt
  const orderedMovies = movieIds
    .map((id) => movies.find((m) => m.id === id))
    .filter((m): m is NonNullable<typeof m> => Boolean(m));

  return (
    <main className="min-h-screen bg-black text-white px-4 sm:px-8 md:px-12 pt-28 pb-20">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <h1 className="text-2xl sm:text-3xl font-bold">My List</h1>
          <span className="text-sm text-neutral-400">
            {orderedMovies.length} {orderedMovies.length === 1 ? "title" : "titles"}
          </span>
        </div>

        {orderedMovies.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <p className="text-neutral-400 text-lg">Your watchlist is empty.</p>
            <p className="text-neutral-500 text-sm max-w-sm mx-auto">
              Explore movies or Shumang Leela and click the + button on any title to add it here.
            </p>
            <Link
              href="/"
              className="inline-block px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition"
            >
              Browse Films
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {orderedMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}