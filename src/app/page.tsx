import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { BlogPost } from "@/lib/db";
import ReactMarkdown from 'react-markdown';


export const dynamic = "force-dynamic";

export default async function Home() {
  const { env } = await getCloudflareContext();
  const db = env.DB;
  
  const latestPostRes = await db.prepare("SELECT * FROM blog_posts ORDER BY created_at DESC LIMIT 1").first();
  const latestPost = latestPostRes as unknown as BlogPost | null;

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

      {/* The Latest Revolution Diary */}
      {latestPost && (
        <section className="border-t border-zinc-200 dark:border-zinc-800 pt-16 mb-10">
          <div className="flex justify-between items-end mb-8">
            <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter font-heading text-zinc-900 dark:text-white">
              The <span className="text-red-600">Revolution</span><br/>Diaries
            </h2>
            <Link href="/blog" className="text-xs font-bold uppercase tracking-widest hover:text-red-600 transition-colors border-b-2 border-transparent hover:border-red-600">
              Read All Entries ↗
            </Link>
          </div>
          
          <div className="group relative border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex flex-col md:flex-row shadow-sm hover:border-red-600 transition-all duration-300">
            {latestPost.image && (
                <div className="w-full md:w-1/2 lg:w-1/3 aspect-video relative grayscale-[0.5] group-hover:grayscale-0 transition-all duration-700 border-b md:border-b-0 md:border-r border-zinc-200 dark:border-zinc-800">
                    <Image src={latestPost.image} alt={latestPost.title} fill className="object-cover" unoptimized />
                </div>
            )}
            <div className="flex-1 p-6 sm:p-10 flex flex-col">
              <div className="flex gap-4 items-center mb-6">
                <span className="text-[10px] font-black uppercase tracking-widest bg-red-600 text-white px-3 py-1">LATEST POST</span>
                <span className="text-[10px] uppercase font-bold text-zinc-400">{new Date(latestPost.created_at).toLocaleDateString()}</span>
              </div>
              <Link href={`/blog/${latestPost.id}`} className="group-hover:text-red-600 transition-colors">
                  <h3 className="text-3xl sm:text-4xl font-black uppercase italic tracking-tighter mb-4 leading-none">{latestPost.title}</h3>
              </Link>
              <div className="prose prose-zinc dark:prose-invert prose-sm line-clamp-3 italic mb-8 prose-headings:text-base prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tighter prose-headings:italic prose-headings:font-heading prose-a:hidden prose-img:hidden">
                  <ReactMarkdown>{latestPost.body}</ReactMarkdown>
              </div>
              <Link 
                  href={`/blog/${latestPost.id}`} 
                  className="inline-block text-xs font-black uppercase tracking-[0.2em] text-zinc-900 dark:text-white border-b-2 border-transparent hover:border-red-600 mt-auto transition-all w-fit"
              >
                  Read The Entry ↗
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Audience Section / Newsletter */}
      <section className="border-t border-zinc-200 dark:border-zinc-800 pt-16 mb-10">
        <div className="border border-zinc-200 dark:border-zinc-800 px-2 py-10 sm:p-10 space-y-6 bg-zinc-50 dark:bg-transparent max-w-2xl mx-auto text-center hover:bg-zinc-100 dark:hover:bg-zinc-950 transition-all flex flex-col items-center justify-center">
          <h2 className="text-3xl lg:text-5xl font-black uppercase italic text-zinc-900 dark:text-white">For <span className="text-red-600">Audience</span></h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            Join our mailing list to receive updates on upcoming events, volunteer opportunities, and house concerts.
          </p>
          <div className="w-full mt-4">
            <Script id="mcjs-home" strategy="lazyOnload">
              {`!function(c,h,i,m,p){m=c.createElement(h),p=c.getElementsByTagName(h)[0],m.async=1,m.src=i,p.parentNode.insertBefore(m,p)}(document,"script","https://chimpstatic.com/mcjs-connected/js/users/a3476f0ba3a89ad4a4df5c773/94a427965d347195db66a44ed.js");`}
            </Script>
          </div>
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