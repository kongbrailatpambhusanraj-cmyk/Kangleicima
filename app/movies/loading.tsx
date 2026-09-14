export default function Loading() {
  return (
    <main className="min-h-screen bg-black px-4 sm:px-8 pt-24 pb-12 w-full animate-pulse">
      <div className="h-8 w-48 bg-zinc-800 rounded mb-8" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="aspect-[2/3] bg-zinc-800/60 rounded-md" />
        ))}
      </div>
    </main>
  );
}
