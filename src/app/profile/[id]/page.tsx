import { getCloudflareContext } from "@opennextjs/cloudflare";
import { User, Chapter } from "@/lib/db";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

async function getData(id: string) {
    const { env } = await getCloudflareContext();
    const db = env.DB;
    const user = await db.prepare("SELECT * FROM users WHERE id = ?").bind(id).first() as User | null;
    const chaptersResult = await db.prepare("SELECT * FROM chapters").all();
    const chapters = chaptersResult.results as unknown as Chapter[];
    return { user, chapters };
}

export default async function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { user, chapters } = await getData(id);

    if (!user) notFound();

    // Parse user chapters
    let userChapterIds: string[] = [];
    try {
        userChapterIds = user.chapters ? JSON.parse(user.chapters) : [];
    } catch {
        userChapterIds = [];
    }

    const memberChapters = chapters.filter(c => userChapterIds.includes(c.id));

    let directorChapterIds: string[] = [];
    try {
        directorChapterIds = user.director_chapters ? JSON.parse(user.director_chapters) : [];
    } catch {
        directorChapterIds = [];
    }
    const directorChapters = chapters.filter(c => directorChapterIds.includes(c.id));

    return (
        <div className="max-w-6xl mx-auto py-20 px-2 sm:px-6">
            <div className="flex flex-col md:flex-row gap-12 items-center md:items-start text-center md:text-left">
                <div className="w-48 h-48 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-900 border-4 border-red-600 shrink-0 relative">
                    {user.image && <Image src={user.image} alt={user.name ?? "Member"} fill className="object-cover" unoptimized />}
                </div>

                <div className="space-y-6 flex-1">
                    <div>
                        <span className="text-red-600 font-black uppercase tracking-widest text-xs italic border-b-2 border-red-600 mb-2 inline-block">
                            Member Profile
                        </span>
                        <h1 className="text-5xl font-black uppercase italic tracking-tighter leading-none font-heading">
                            {user.name}
                        </h1>
                        <div className="flex flex-wrap items-center gap-2 mt-2 justify-center md:justify-start">
                            <p className="text-zinc-500 font-bold uppercase tracking-widest">{user.role}</p>
                            {user.role === 'Chapter Director' && directorChapters.length > 0 && (
                                <span className="bg-red-600 text-white text-[9px] px-2 py-0.5 font-black uppercase tracking-tighter italic">DIRECTOR</span>
                            )}
                        </div>
                        {user.location && (
                            <p className="text-sm font-bold uppercase tracking-widest text-zinc-400 mt-1">
                                📍 {user.location}
                            </p>
                        )}
                    </div>

                    {user.role === 'Chapter Director' && directorChapters.length > 0 && (
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Directorship Chapters</h3>
                            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                                {directorChapters.map(c => (
                                    <Link href={`/chapters/${c.id}`} key={c.id} className="bg-black text-white px-3 py-1 text-xs font-bold uppercase tracking-wide border border-zinc-800 hover:bg-red-600 transition-colors">
                                        {c.location}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {memberChapters.length > 0 && (
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Member Chapters</h3>
                            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                                {memberChapters.map(c => (
                                    <Link href={`/chapters/${c.id}`} key={c.id} className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 px-3 py-1 text-xs font-bold uppercase tracking-wide border border-zinc-200 dark:border-zinc-700 hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors">
                                        {c.location}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="bg-zinc-50 dark:bg-zinc-900 px-2 py-8 sm:p-8 border border-zinc-200 dark:border-zinc-800 text-left">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3 block">About</h3>
                        {user.bio ? (
                            <p className="text-zinc-600 dark:text-zinc-400 italic leading-relaxed whitespace-pre-wrap">
                                {user.bio}
                            </p>
                        ) : (
                            <p className="text-zinc-400 italic text-sm">No bio available.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
