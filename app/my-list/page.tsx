import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import MovieCard from "@/components/MovieCard";
import Link from "next/link";
import { Bookmark, ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";

export const revalidate = 0;

export default async function MyListPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  let savedMovies: any[] = [];

  try {
    const listRecords = await (prisma as any).myList?.findMany({
      where: { userId: user.id },
      include: { movie: true },
      orderBy: { createdAt: "desc" },
    });

    if (listRecords && listRecords.length > 0) {
      savedMovies = listRecords
        .map((r: any) => r.movie)
        .filter((m: any) => m && m.availabilityStatus !== "UNAVAILABLE");
    }
  } catch {
    savedMovies = [];
  }

  return (
    <main className="min-h-screen bg-black text-white pt-24 pb-20 px-4 sm:px-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-zinc-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 text-red-600 mb-1">
            <Bookmark size={18} />
            <span className="text-xs font-bold uppercase tracking-widest">Library</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wide">
            My <span className="text-red-600">List</span>
          </h1>
          <p className="text-zinc-400 text-xs mt-1">
            {savedMovies.length} {savedMovies.length === 1 ? "title" : "titles"} saved to your personal queue.
          </p>
        </div>

        <Link
          href="/"
          className="self-start sm:self-auto flex items-center gap-1.5 text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-3.5 py-2 rounded-lg text-zinc-300 hover:text-white transition"
        >
          <ArrowLeft size={14} />
          <span>Back to Catalog</span>
        </Link>
      </div>

      {/* Grid or Empty State */}
      {savedMovies.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {savedMovies.map((movie) => (
            <div key={movie.id} className="flex justify-center">
              <MovieCard movie={{ ...movie, inMyList: true }} />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600 mb-4">
            <Bookmark size={24} />
          </div>
          <h2 className="text-base font-bold text-zinc-300">Your list is currently empty</h2>
          <p className="text-zinc-500 text-xs max-w-sm mt-1 mb-6">
            Explore Manipuri cinema, Leela performances, or theatrical releases and click the plus button to save them here.
          </p>
          <Link
            href="/browse"
            className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-red-950 transition active:scale-95"
          >
            Browse Movies
          </Link>
        </div>
      )}
    </main>
  );
}