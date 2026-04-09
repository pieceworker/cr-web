import Link from "next/link";

export default async function BeInvolvedPage() {
  return (
    <div className="flex flex-col gap-16 py-10 px-2 sm:px-6 max-w-6xl mx-auto transition-colors">
      <section className="text-center space-y-4">
        <h1 className="text-4xl md:text-6xl font-black uppercase italic text-zinc-900 dark:text-white">
          Join The Revolution
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Whether you are a performer or a listener, there is a place for you.
        </p>
      </section>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Musicians Section */}
        <div className="border border-zinc-200 dark:border-zinc-800 px-2 py-10 sm:p-10 space-y-6 bg-zinc-50 dark:bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-950 transition-all">
          <h2 className="text-3xl font-bold uppercase text-red-600 italic">For Musicians</h2>
          <ul className="text-zinc-600 dark:text-zinc-400 space-y-2 list-disc list-inside">
            <li>Sign up for our Musician Portal</li>
            <li>Propose a new venue or event</li>
            <li>Join local &ldquo;Chamber Jams&rdquo;</li>
          </ul>
          <button className="block w-full bg-zinc-900 text-white dark:bg-white dark:text-black font-black py-4 text-center uppercase tracking-tighter hover:bg-red-600 dark:hover:bg-red-600 dark:hover:text-white transition-colors">
            Coming Soon
          </button>
        </div>

        {/* Audience Section */}
        <div className="border border-zinc-200 dark:border-zinc-800 px-2 py-10 sm:p-10 space-y-6 bg-zinc-50 dark:bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-950 transition-all">
          <h2 className="text-3xl font-bold uppercase italic text-zinc-900 dark:text-white">For Audience</h2>
          <ul className="text-zinc-600 dark:text-zinc-400 space-y-2 list-disc list-inside">
            <li>Join our mailing list</li>
            <li>Volunteer for local chapters</li>
            <li>Host a house concert</li>
          </ul>
          <Link
            href="https://classicalrevolution.us9.list-manage.com/subscribe?u=3e5353da963c5e496f214dfb3&id=dc8a03f7ba"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center w-full border-2 border-zinc-900 dark:border-white text-zinc-900 dark:text-white font-black py-4 uppercase tracking-tighter hover:bg-zinc-900 hover:text-white dark:hover:bg-white dark:hover:text-black transition-all">
            Get Updates
          </Link>
        </div>
      </div>
    </div>
  );
}