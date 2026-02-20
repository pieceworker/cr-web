import { getCloudflareContext } from "@opennextjs/cloudflare";
import { Chapter, User } from "@/lib/db";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

async function getData(id: string) {
    const { env } = await getCloudflareContext();
    const db = env.DB;
    const chapter = await db.prepare("SELECT * FROM chapters WHERE id = ?").bind(id).first() as Chapter | null;

    // Fetch all users to filter in JS (safer for JSON parsing)
    // Optimization: In a real large app, we'd want a join table or a better query, 
    // but for now fetching all users is acceptable given the likely scale.
    const allUsersResult = await db.prepare("SELECT * FROM users").all();
    const allUsers = allUsersResult.results as unknown as User[];

    return { chapter, allUsers };
}

export default async function ChapterProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { chapter, allUsers } = await getData(id);

    if (!chapter) notFound();

    // Filter users by chapter
    const chapterUsers = allUsers.filter(u => {
        try {
            const userChapters = u.chapters ? JSON.parse(u.chapters) : [];
            return Array.isArray(userChapters) && userChapters.includes(id);
        } catch {
            return false;
        }
    });

    const musicians = chapterUsers.filter(u => u.role === 'Musician' || u.role === 'Chapter Director');
    const audience = chapterUsers.filter(u => u.role === 'Audience');

    const directors = allUsers.filter(u => {
        try {
            const dirChapters = u.director_chapters ? JSON.parse(u.director_chapters) : [];
            return Array.isArray(dirChapters) && dirChapters.includes(id);
        } catch {
            return false;
        }
    });

    return (
        <div className="max-w-6xl mx-auto py-20 px-6 space-y-16">
            <div className="grid md:grid-cols-2 gap-12 items-start">
                <div className="aspect-video bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden relative">
                    {chapter.image && <Image src={chapter.image} alt={chapter.location} fill className="object-cover" unoptimized />}
                </div>

                <div className="space-y-8">
                    <div>
                        <span className="text-red-600 font-black uppercase tracking-widest text-xs italic border-b-2 border-red-600 mb-2 inline-block">
                            Chapter Profile
                        </span>
                        <h1 className="text-6xl font-black uppercase italic tracking-tighter leading-none font-heading">
                            {chapter.location}
                        </h1>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-xl font-bold uppercase tracking-tight border-l-4 border-red-600 pl-4 font-heading">About this Chapter</h2>
                        <p className="text-zinc-600 dark:text-zinc-400 text-lg leading-relaxed italic whitespace-pre-wrap">
                            {chapter.bio}
                        </p>
                    </div>
                </div>
            </div>

            {/* Directors */}
            {directors.length > 0 && (
                <section className="space-y-8 bg-black dark:bg-zinc-900 text-white p-12 -mx-6 md:mx-0">
                    <h2 className="text-3xl font-black uppercase italic text-red-600 border-b-4 border-red-600 inline-block font-heading">
                        Chapter Directors
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                        {directors.map((d) => (
                            <Link href={`/profile/${d.id}`} key={d.id} className="text-center group cursor-pointer block">
                                <div className="aspect-square rounded-full bg-zinc-800 border border-zinc-700 mb-3 overflow-hidden relative mx-auto max-w-[150px]">
                                    {d.image && <Image src={d.image} alt={d.name ?? "Director"} fill className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500" unoptimized />}
                                </div>
                                <h3 className="font-bold text-sm uppercase tracking-tight leading-tight font-heading text-white">{d.name}</h3>
                                {d.location && <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1 truncate">{d.location}</p>}
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* Musicians */}
            <section className="space-y-8">
                <h2 className="text-3xl font-black uppercase italic text-red-600 border-b-4 border-red-600 inline-block font-heading">
                    Chapter Musicians
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {musicians.length > 0 ? musicians.map((m) => (
                        <Link href={`/profile/${m.id}`} key={m.id} className="text-center group cursor-pointer block">
                            <div className="aspect-square rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 mb-3 overflow-hidden relative mx-auto max-w-[150px]">
                                {m.image && <Image src={m.image} alt={m.name ?? "Member"} fill className="object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-500" unoptimized />}
                            </div>
                            <h3 className="font-bold text-sm uppercase tracking-tight leading-tight font-heading">{m.name}</h3>
                            {m.location && <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1 truncate">{m.location}</p>}
                        </Link>
                    )) : <p className="col-span-full text-zinc-500 italic">No musicians associated with this chapter yet.</p>}
                </div>
            </section>

            {/* Audience */}
            <section className="space-y-8">
                <h2 className="text-3xl font-black uppercase italic text-red-600 border-b-4 border-red-600 inline-block font-heading">
                    Chapter Audience
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {audience.length > 0 ? audience.map((a) => (
                        <Link href={`/profile/${a.id}`} key={a.id} className="text-center group cursor-pointer block">
                            <div className="aspect-square rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 mb-3 overflow-hidden relative mx-auto max-w-[150px]">
                                {a.image && <Image src={a.image} alt={a.name ?? "Member"} fill className="object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-500" unoptimized />}
                            </div>
                            <h3 className="font-bold text-sm uppercase tracking-tight leading-tight font-heading">{a.name}</h3>
                            {a.location && <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1 truncate">{a.location}</p>}
                        </Link>
                    )) : <p className="col-span-full text-zinc-500 italic font-medium">No audience members associated with this chapter yet.</p>}
                </div>
            </section>
        </div>
    );
}
