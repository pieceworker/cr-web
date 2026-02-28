import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col gap-10 md:gap-16 py-10 px-2 sm:px-6 max-w-6xl mx-auto overflow-x-hidden transition-colors">
      {/* Hero Section */}
      <section className="flex flex-col lg:flex-row items-center gap-10">
        <div className="flex-1 space-y-6">
          <h1 className="text-4xl md:text-6xl font-black uppercase italic text-zinc-900 dark:text-white">
            Chamber Music <br />
            <span className="text-red-600">For The People.</span>
          </h1>
          <p className="text-base md:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-xl">
            Breaking the barriers between the stage and the audience. We take classical music
            out of the concert hall and into the cafes, bars, and neighborhoods where
            community happens.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/events"
              className="inline-flex items-center justify-center bg-zinc-900 text-white dark:bg-white dark:text-black px-2 sm:px-8 h-14 font-bold hover:bg-red-600 dark:hover:bg-red-600 dark:hover:text-white transition-all text-center uppercase"
            >
              Find an Event
            </Link>
            <Link
              href="/be-involved"
              className="inline-flex items-center justify-center border-2 border-zinc-900 dark:border-white px-2 sm:px-8 h-14 font-bold text-zinc-900 dark:text-white hover:bg-zinc-900 hover:text-white dark:hover:bg-white dark:hover:text-black transition-all text-center uppercase"
            >
              Join the Revolution
            </Link>
          </div>
        </div>

        {/* Actual Image from Charith */}
        <div className="w-full lg:flex-1 relative aspect-video overflow-hidden border-2 border-zinc-900 dark:border-zinc-800 shadow-xl">
          <Image
            src="/revcafe.jpg"
            alt="A live chamber jam session at Revolution Café"
            fill
            className="object-cover"
            priority // This ensures the hero image loads immediately
            unoptimized
          />
        </div>
      </section>

      {/* Mission Highlights */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center border-t border-zinc-200 dark:border-zinc-800 pt-16 mb-10">
        <div className="space-y-2">
          <h3 className="text-xl font-bold uppercase tracking-tighter text-zinc-900 dark:text-white">40+ Chapters</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-500">A global network of musicians dedicated to accessibility.</p>
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold uppercase tracking-tighter text-zinc-900 dark:text-white">Unstuffy</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-500">No dress codes. No silence between movements. Just music.</p>
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold uppercase tracking-tighter text-zinc-900 dark:text-white">Artist Driven</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-500">Providing platforms for world-class musicians to play freely.</p>
        </div>
      </section>
    </div>
  );
}