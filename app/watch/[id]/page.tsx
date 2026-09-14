import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface WatchPageProps {
  params: Promise<{ id?: string }> | { id?: string };
  searchParams?: Promise<{ id?: string; v?: string }> | { id?: string; v?: string };
}

export const revalidate = 60;

export default async function WatchPage(props: WatchPageProps) {
  const resolvedParams = await Promise.resolve(props.params);
  const resolvedSearchParams = await Promise.resolve(props.searchParams);

  const rawId = resolvedParams?.id || resolvedSearchParams?.id || resolvedSearchParams?.v;
  const id = rawId && rawId !== "undefined" && rawId !== "null" ? decodeURIComponent(rawId) : null;

  if (!id) {
    redirect("/");
  }

  const movie = await prisma.movie.findFirst({
    where: {
      OR: [
        { id: id },
        { youtubeVideoId: id }
      ]
    },
  });

  if (!movie) {
    return (
      <main className="fixed inset-0 z-[99999] w-screen h-screen bg-black text-white flex flex-col items-center justify-center gap-4 p-4 text-center">
        <h1 className="text-xl font-black text-red-600 uppercase tracking-wider">Film Not Found</h1>
        <p className="text-zinc-400 text-xs max-w-sm">
          Could not find a movie record for ID: <span className="text-zinc-200 font-mono">{id}</span>.
        </p>
        <Link 
          href="/" 
          className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-5 py-2.5 rounded-lg text-xs font-bold transition shadow-lg shadow-red-950 mt-2"
        >
          <ArrowLeft size={14} /> Back to Catalog
        </Link>
      </main>
    );
  }

  const getEmbedUrl = (mov: typeof movie) => {
    if (mov.youtubeVideoId) {
      return `https://www.youtube-nocookie.com/embed/${mov.youtubeVideoId}?autoplay=1&modestbranding=1&rel=0&iv_load_policy=3`;
    }
    if (mov.sourceUrl) {
      if (mov.sourceUrl.includes("youtube.com/watch?v=")) {
        const vid = mov.sourceUrl.split("v=")[1]?.split("&")[0];
        return `https://www.youtube-nocookie.com/embed/${vid}?autoplay=1&modestbranding=1&rel=0&iv_load_policy=3`;
      }
      if (mov.sourceUrl.includes("youtu.be/")) {
        const vid = mov.sourceUrl.split("youtu.be/")[1]?.split("?")[0];
        return `https://www.youtube-nocookie.com/embed/${vid}?autoplay=1&modestbranding=1&rel=0&iv_load_policy=3`;
      }
      return mov.sourceUrl;
    }
    return null;
  };

  const embedUrl = getEmbedUrl(movie);

  return (
    <main className="fixed inset-0 w-screen h-screen bg-black z-[99999] overflow-hidden flex flex-col">
      <div className="absolute top-0 left-0 w-full z-50 p-4 sm:p-6 flex items-center justify-between bg-gradient-to-b from-black/90 via-black/40 to-transparent pointer-events-auto">
        <Link
          href="/"
          className="flex items-center gap-2 text-white bg-black/60 hover:bg-black/90 border border-zinc-800 px-3.5 py-2 rounded-full backdrop-blur-md transition text-xs font-semibold shadow-2xl"
        >
          <ArrowLeft size={15} />
          <span>Back to Home</span>
        </Link>
        <div className="text-white font-black text-xs sm:text-sm tracking-wider uppercase drop-shadow-md bg-black/50 px-3.5 py-1.5 rounded-lg border border-zinc-800">
          {movie.title}
        </div>
      </div>

      <div className="w-full h-full flex-1 bg-black flex items-center justify-center relative">
        {embedUrl ? (
          <iframe
            src={embedUrl}
            title={movie.title}
            className="w-full h-full border-0 outline-none"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <div className="text-zinc-500 text-xs">
            Media stream source missing for this entry.
          </div>
        )}
      </div>
    </main>
  );
}