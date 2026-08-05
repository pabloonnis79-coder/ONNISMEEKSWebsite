/** Esqueleto con la forma real de la página, no un spinner genérico. */
export default function Loading() {
  return (
    <div className="mx-auto max-w-[1600px] animate-pulse px-5 pb-24 pt-32 md:px-10 md:pt-40">
      <div className="h-[11vw] w-2/3 bg-ink-700" />
      <div className="mt-6 h-4 w-full max-w-md bg-ink-700" />
      <div className="mt-16 grid grid-cols-1 gap-x-6 gap-y-16 md:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i}>
            <div className="aspect-[3/2] w-full bg-ink-700" />
            <div className="mt-5 h-6 w-1/2 bg-ink-700" />
            <div className="mt-3 h-3 w-1/3 bg-ink-800" />
          </div>
        ))}
      </div>
    </div>
  );
}
