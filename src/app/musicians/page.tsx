import { getCloudflareContext } from "@opennextjs/cloudflare";
import { User } from "@/lib/db";
import Image from "next/image";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getMusicians() {
    const { env } = await getCloudflareContext();
    const db = env.DB;
    const musicians = await db.prepare("SELECT * FROM users WHERE role = 'Musician' ORDER BY name ASC").all();
    return (musicians.results as unknown as User[] || []);
}

export default async function MusiciansPage() {
    const musicians = await getMusicians();

    return (
        <div className="max-w-6xl mx-auto py-12 px-6">
            <section className="space-y-12">
                <div className="space-y-4">
                    <h1 className="text-5xl md:text-7xl font-black uppercase italic text-zinc-900 dark:text-white font-heading leading-none tracking-tighter">
                        Our<br /><span className="text-red-600">Musicians</span>
                    </h1>
                    <p className="text-zinc-500 font-medium italic max-w-2xl">The talented individuals making the music happen.</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
                    {musicians.length > 0 ? musicians.map((m) => (
                        <Link href={`/profile/${m.id}`} key={m.id} className="text-center group cursor-pointer block">
                            <div className="aspect-square rounded-full bg-zinc-100 dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 mb-4 overflow-hidden relative mx-auto group-hover:border-red-600 transition-all duration-500">
                                {m.image && <Image src={m.image} alt={m.name ?? "Member"} fill className="object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-500" unoptimized />}
                            </div>
                            <h3 className="font-black text-sm uppercase tracking-tight leading-tight font-heading group-hover:text-red-600 transition-colors">{m.name}</h3>
                            {m.location && <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1 truncate">{m.location}</p>}
                        </Link>
                    )) : (
                        <p className="col-span-full text-zinc-500 italic py-12 text-center uppercase tracking-widest border border-dashed border-zinc-200 dark:border-zinc-800">No musicians listed.</p>
                    )}
                </div>
            </section>
        </div>
    );
}
