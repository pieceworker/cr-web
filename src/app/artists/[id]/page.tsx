import { getCloudflareContext } from "@opennextjs/cloudflare";
import { Artist, User } from "@/lib/db";
import Image from "next/image";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

async function getArtistData(id: string) {
    const { env } = await getCloudflareContext();
    const db = env.DB;
    const artist = await db.prepare("SELECT * FROM artists WHERE id = ? AND status = 'APPROVED'").bind(id).first() as Artist | null;

    if (!artist) return null;

    const memberIds: string[] = artist.members ? JSON.parse(artist.members) : [];
    let members: User[] = [];

    if (memberIds.length > 0) {
        const placeholders = memberIds.map(() => "?").join(",");
        const result = await db.prepare(`SELECT * FROM users WHERE id IN (${placeholders})`).bind(...memberIds).all();
        members = result.results as unknown as User[];
    }

    return { artist, members };
}

export default async function ArtistProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const data = await getArtistData(id);

    if (!data) notFound();
    const { artist, members } = data;

    return (
        <div className="max-w-6xl mx-auto py-20 px-2 sm:px-6 space-y-12">
            <div className="flex flex-col md:flex-row gap-12 items-center md:items-start text-center md:text-left">
                {/* Artist Image / Member Rings */}
                <div className="relative group">
                    <div className="w-64 h-64 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden shrink-0 relative shadow-2xl">
                        {(() => {
                            const owner = members.find(m => m.id === artist.owner_id);
                            const displayImage = artist.image_preference === 'google' ? owner?.image : artist.image;
                            return displayImage ? <Image src={displayImage} alt={artist.name} fill className="object-cover transition-all duration-500" unoptimized /> : null;
                        })()}
                    </div>
                    {/* Member Profile Rings Overlay */}
                    <div className="absolute -bottom-6 -right-6 flex -space-x-4">
                        {members.map((m) => (
                            <div key={m.id} className="w-16 h-16 rounded-full border-4 border-white dark:border-zinc-950 overflow-hidden bg-zinc-200 dark:bg-zinc-800 shadow-xl relative ring-1 ring-zinc-200 dark:ring-zinc-800">
                                {m.image && <Image src={m.image} alt={m.name || 'Member'} fill className="object-cover" unoptimized />}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-8 flex-1 pt-8 md:pt-0">
                    <div>
                        <span className="text-red-600 font-black uppercase tracking-widest text-xs italic border-b-2 border-red-600 mb-2 inline-block">
                            Artist Profile
                        </span>
                        <h1 className="text-6xl font-black uppercase italic tracking-tighter leading-none font-heading">
                            {artist.name}
                        </h1>
                        <p className="text-zinc-500 font-bold uppercase tracking-widest mt-2">{artist.location}</p>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-xl font-bold uppercase tracking-tight border-l-4 border-red-600 pl-4 font-heading">Biography</h2>
                        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed italic whitespace-pre-wrap">
                            {artist.bio}
                        </p>
                    </div>

                    {members.length > 0 && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold uppercase tracking-tight border-l-4 border-red-600 pl-4 font-heading">Members</h2>
                            <div className="flex flex-wrap gap-3">
                                {members.map((m) => (
                                    <div key={m.id} className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-900 pr-4 rounded-full border border-zinc-200 dark:border-zinc-800">
                                        <div className="w-8 h-8 rounded-full overflow-hidden relative border border-zinc-200 dark:border-zinc-800">
                                            {m.image && <Image src={m.image} alt={m.name || 'User'} fill className="object-cover" unoptimized />}
                                        </div>
                                        <span className="text-xs font-bold uppercase tracking-widest">
                                            {m.name}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
