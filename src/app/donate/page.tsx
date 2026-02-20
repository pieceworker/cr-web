import Link from "next/link";

export default function DonatePage() {
  return (
    <div className="flex flex-col gap-10 py-10 px-6 max-w-6xl mx-auto text-center transition-colors">
      <section className="space-y-4">
        <h1 className="text-4xl md:text-6xl font-black uppercase italic text-zinc-900 dark:text-white">
          Support
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-lg">
          Help us keep chamber music accessible. Your donations help pay musicians for performing at our events.
        </p>
      </section>

      {/* Fiscal Sponsor Section */}
      <div className="bg-zinc-50 dark:bg-zinc-900 p-8 md:p-12 border border-zinc-200 dark:border-zinc-800 space-y-8">
        <div className="space-y-2">
          <p className="text-red-600 uppercase text-xs tracking-[0.2em] font-black">
            Secure Donation Portal
          </p>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
            Via InterMusic SF
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
            Classical Revolution is a San Francisco-based affiliate of InterMusic SF, our fiscal sponsor.
          </p>
        </div>

        <Link
          href="https://form-renderer-app.donorperfect.io/give/intermusic-sf/classical-revolution"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block w-full bg-zinc-900 text-white dark:bg-white dark:text-black py-5 px-8 font-black uppercase tracking-widest hover:bg-red-600 dark:hover:bg-red-600 dark:hover:text-white transition-all shadow-xl text-lg"
        >
          Donate Now
        </Link>
      </div>

      <div className="space-y-4">
        <p className="text-xs text-zinc-400 leading-relaxed uppercase tracking-tighter">
          Classical Revolution is a non-profit organization. <br />
          All donations are tax-deductible to the extent permitted by law.
        </p>
      </div>
    </div>
  );
}