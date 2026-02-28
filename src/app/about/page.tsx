import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="flex flex-col gap-10 md:gap-16 py-10 px-2 sm:px-6 max-w-6xl mx-auto overflow-x-hidden transition-colors">
      {/* Header Section */}
      <section className="text-center space-y-4">
        <h1 className="text-4xl md:text-6xl font-black uppercase italic underline decoration-red-600 underline-offset-8 text-zinc-900 dark:text-white">
          The Story
        </h1>
        <p className="text-xl md:text-2xl font-bold italic text-zinc-800 dark:text-zinc-100">
          &ldquo;Chamber music is meant to be a conversation between friends.&rdquo;
        </p>
      </section>

      {/* Main Content Section */}
      <section className="grid grid-cols-1 gap-10">
        <div className="prose dark:prose-invert max-w-none space-y-6">
          <p className="text-base md:text-lg text-zinc-600 dark:text-zinc-400">
            Founded in 2006 by{" "}
            <strong className="text-zinc-900 dark:text-white font-bold">
              Charith Premawardhana
            </strong>
            , Classical Revolution began as a weekly residency at the Revolution
            Caf&eacute; in San Francisco&rsquo;s Mission District. The goal was simple:
            provide a place where musicians could perform chamber music in a
            relaxed, social environment.
          </p>

          {/* About Image */}
          <div className="relative w-full overflow-hidden border border-zinc-200 dark:border-zinc-800">
            <Image
              src="/charith.jpg"
              alt="Charith and musicians performing at the original Revolution Café"
              width={1200}
              height={675}
              className="w-full h-auto object-cover"
              unoptimized
              priority
            />
          </div>

          <p className="text-base md:text-lg text-zinc-600 dark:text-zinc-400">
            What started as a local jam session quickly transformed into a
            global movement. By breaking the &ldquo;fourth wall&rdquo; of the concert stage,
            Classical Revolution has expanded to over 40 chapters worldwide,
            bringing high-caliber music to neighborhood hangouts from New York
            to Berlin.
          </p>
        </div>
      </section>

      {/* Global Impact Highlights */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-zinc-200 dark:border-zinc-800 pt-16 mb-10">
        <div className="px-2 py-6 sm:p-6 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
          <h3 className="text-xl font-bold uppercase tracking-tighter text-red-600 mb-2">
            Our Mission
          </h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            To enrich the neighborhood environment by presenting chamber music
            performances in accessible venues, and to provide support and
            performance opportunities to local musicians.
          </p>
        </div>
        <div className="px-2 py-6 sm:p-6 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
          <h3 className="text-xl font-bold uppercase tracking-tighter text-red-600 mb-2">
            The Community
          </h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            From highly skilled amateurs to seasoned professionals, our network
            thrives on the &ldquo;Chamber Jam&rdquo; format&mdash;spontaneous, high-energy
            collaborations that invite the audience into the process.
          </p>
        </div>
      </section>
    </div>
  );
}