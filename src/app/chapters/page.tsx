import { getCloudflareContext } from "@opennextjs/cloudflare";
import { Chapter } from "@/lib/db";
import Image from "next/image";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getChapters() {
    const { env } = await getCloudflareContext();
    const db = env.DB;
    const chapters = await db.prepare("SELECT * FROM chapters").all();
    return (chapters.results as unknown as Chapter[] || []);
}

export default async function ChaptersPage() {
    const chapters = await getChapters();

    return (
        <div className="max-w-6xl mx-auto py-12 px-6">
            <section className="space-y-12">
                <div className="space-y-4">
                    <h1 className="text-5xl md:text-7xl font-black uppercase italic text-zinc-900 dark:text-white font-heading leading-none tracking-tighter">
                        Our<br /><span className="text-red-600">Chapters</span>
                    </h1>
                    <p className="text-zinc-500 font-medium italic max-w-2xl">Exploring the global reach of Classical Revolution. Find a chapter near you.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {chapters.length > 0 ? chapters.map((c) => (
                        <Link href={`/chapters/${c.id}`} key={c.id} className="group cursor-pointer block border border-zinc-200 dark:border-zinc-800 p-4 hover:border-red-600 transition-all">
                            <div className="aspect-video bg-zinc-100 dark:bg-zinc-900 overflow-hidden mb-6 border border-zinc-100 dark:border-zinc-800 relative">
                                {c.image && <Image src={c.image} alt={c.location} fill className="object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-500" unoptimized />}
                            </div>
                            <h3 className="font-black text-2xl uppercase tracking-tighter font-heading mb-2">{c.location}</h3>
                            <p className="text-zinc-600 dark:text-zinc-400 text-sm italic line-clamp-3">{c.bio}</p>
                            <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                                <span className="text-[10px] font-black uppercase tracking-widest text-red-600 group-hover:translate-x-1 transition-transform inline-block">View Chapter Details →</span>
                            </div>
                        </Link>
                    )) : (
                        <p className="col-span-full text-zinc-500 italic py-12 text-center uppercase tracking-widest border border-dashed border-zinc-200 dark:border-zinc-800">No chapters found.</p>
                    )}
                </div>
            </section>
        </div>
    );
}
