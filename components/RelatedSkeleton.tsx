export default function RelatedSkeleton() {
  return (
    <section className="mt-10 animate-pulse" aria-label="Loading related films">
      <div className="h-6 w-40 bg-zinc-800 rounded mb-4" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="aspect-[2/3] bg-zinc-800/60 rounded-md" />
        ))}
      </div>
    </section>
  );
}
