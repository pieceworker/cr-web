import { getCloudflareContext } from "@opennextjs/cloudflare";
import { User, Artist, Chapter, UnifiedRequest } from "@/lib/db";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@/auth";
import MyArtists from "@/components/MyArtists";

export const dynamic = "force-dynamic";

async function getData(userId?: string) {
    const { env } = await getCloudflareContext();
    const db = env.DB;

    const directors = await db.prepare("SELECT * FROM users WHERE role = 'Chapter Director'").all();
    const musicians = await db.prepare("SELECT * FROM users WHERE role = 'Musician'").all();
    const approvedArtists = await db.prepare("SELECT * FROM artists WHERE status = 'APPROVED' ORDER BY name ASC").all();
    const chapters = await db.prepare("SELECT * FROM chapters").all();

    let myArtists: Artist[] = [];
    let requests: UnifiedRequest[] = [];
    let userRole: string | null = null;

    if (userId) {
        // Fetch User for role check
        const user = await db.prepare("SELECT * FROM users WHERE id = ?").bind(userId).first() as User | null;
        userRole = user?.role || null;

        // Fetch ALL artists to filter for "My Artists" (including pending ones)
        const allArtistsRes = await db.prepare("SELECT * FROM artists").all();
        const allArtists = allArtistsRes.results as unknown as Artist[];
        myArtists = allArtists.filter(a => {
            try {
                const members = a.members ? JSON.parse(a.members) : [];
                return Array.isArray(members) && members.includes(userId);
            } catch { return false; }
        });

        // Fetch pending requests for the user
        const requestsRes = await db.prepare("SELECT * FROM requests WHERE user_id = ? AND status = 'PENDING'").bind(userId).all();
        requests = requestsRes.results as unknown as UnifiedRequest[];
    }

    return {
        availableMusicians: [...(directors.results as unknown as User[] || []), ...(musicians.results as unknown as User[] || [])],
        artists: (approvedArtists.results as unknown as Artist[] || []),
        chapters: (chapters.results as unknown as Chapter[] || []),
        myArtists,
        requests,
        userRole
    };
}

export default async function ArtistsPage() {
    const session = await auth();
    const userId = session?.user?.id;
    const { availableMusicians, artists, chapters, myArtists, requests, userRole } = await getData(userId);
    const isMusician = userRole === 'Musician' || userRole === 'Chapter Director';

    return (
        <div className="max-w-6xl mx-auto py-12 px-6 space-y-24">
            <section className="space-y-12">
                <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                    <div className="space-y-4">
                        <h1 className="text-5xl md:text-7xl font-black uppercase italic text-zinc-900 dark:text-white font-heading leading-none tracking-tighter">
                            Our<br /><span className="text-red-600">Artists</span>
                        </h1>
                        <p className="text-zinc-500 font-medium italic max-w-2xl">Ensembles and soloists bringing classical music to the people.</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {artists.length > 0 ? artists.map((a) => (
                        <Link href={`/artists/${a.id}`} key={a.id} className="group cursor-pointer block border border-zinc-200 dark:border-zinc-800 p-4 hover:border-red-600 transition-all">
                            <div className="aspect-square bg-zinc-100 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 mb-6 overflow-hidden relative">
                                {a.image && <Image src={a.image} alt={a.name} fill className="object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-500" unoptimized />}
                            </div>
                            <h3 className="font-black text-2xl uppercase tracking-tighter font-heading mb-1">{a.name}</h3>
                            <p className="text-red-600 text-xs font-black uppercase tracking-widest">{a.location}</p>
                            <p className="text-zinc-500 text-sm italic mt-4 line-clamp-2">{a.bio}</p>
                        </Link>
                    )) : <p className="col-span-full text-zinc-500 italic py-12 text-center border border-dashed border-zinc-200 dark:border-zinc-800">No artists found.</p>}
                </div>
            </section>

            {isMusician && userId && (
                <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <MyArtists
                        artists={myArtists}
                        chapters={chapters}
                        currentUserId={userId}
                        availableMusicians={availableMusicians}
                        pendingRequests={requests}
                    />
                </section>
            )}
        </div>
    );
}
