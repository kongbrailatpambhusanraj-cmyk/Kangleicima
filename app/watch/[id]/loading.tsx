export default function Loading() {
  return (
    <div className="min-h-screen bg-black pt-16 text-white">
      <div className="aspect-video w-full bg-zinc-800/60 animate-pulse rounded-none sm:rounded-lg" />
      <div className="p-4 sm:p-8 space-y-4">
        <div className="h-7 w-64 bg-zinc-800 rounded" />
        <div className="h-5 w-96 bg-zinc-800 rounded" />
        <div className="h-5 w-full bg-zinc-800 rounded" />
        <div className="h-4 w-3/4 bg-zinc-800 rounded" />
        <div className="flex gap-2 mt-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-9 w-32 bg-zinc-800 rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}
