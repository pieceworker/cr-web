import Script from "next/script";

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
          <div className="w-full mt-4">
            <Script id="mcjs" strategy="lazyOnload">
              {`!function(c,h,i,m,p){m=c.createElement(h),p=c.getElementsByTagName(h)[0],m.async=1,m.src=i,p.parentNode.insertBefore(m,p)}(document,"script","https://chimpstatic.com/mcjs-connected/js/users/a3476f0ba3a89ad4a4df5c773/94a427965d347195db66a44ed.js");`}
            </Script>
          </div>
        </div>
      </div>
    </div>
  );
}