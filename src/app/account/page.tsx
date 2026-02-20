import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { User, Chapter, Artist, UnifiedRequest } from "@/lib/db";
import Image from "next/image";
import MyArtists from "@/components/MyArtists";
import ProfileForm from "@/components/ProfileForm";
import BookingCard from "@/components/BookingCard";
import { Booking, BookingDate } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
    const session = await auth();
    if (!session || !session.user?.id) redirect("/");

    const { env } = await getCloudflareContext();
    const db = env.DB;

    const user = await db.prepare("SELECT * FROM users WHERE id = ?").bind(session.user.id).first() as User | null;
    const requestsRes = await db.prepare("SELECT * FROM requests WHERE user_id = ? AND status = 'PENDING'").bind(session.user.id).all();
    const requests = requestsRes.results as unknown as UnifiedRequest[];

    const pendingRoleRequest = requests.find(r => r.type === 'ROLE_CHANGE');
    const pendingUserEdit = requests.find(r => r.type === 'USER_EDIT');

    const chaptersResult = await db.prepare("SELECT * FROM chapters").all();
    const chapters = chaptersResult.results as unknown as Chapter[];

    // Fetch My Artists
    const allArtistsResult = await db.prepare("SELECT * FROM artists").all();
    const allArtists = allArtistsResult.results as unknown as Artist[]; // Explicit cast
    const myArtists = allArtists.filter(a => {
        try {
            const members = a.members ? JSON.parse(a.members) : [];
            return Array.isArray(members) && session.user?.id && members.includes(session.user.id);
        } catch {
            return false;
        }
    });

    const allMusiciansResult = await db.prepare("SELECT * FROM users WHERE role = 'Musician' OR role = 'Chapter Director'").all();
    const allMusicians = allMusiciansResult.results as unknown as User[];

    // Fetch My Bookings
    const myBookingsRes = await db.prepare(`
        SELECT b.*, u.name as user_name, u.image as user_image
        FROM bookings b
        LEFT JOIN users u ON b.created_by = u.id
        WHERE b.created_by = ?
        ORDER BY b.id DESC
    `).bind(session.user.id).all();

    const myBookingsRaw = myBookingsRes.results as unknown as (Booking & { user_name: string; user_image?: string })[];
    const myBookings = await Promise.all(myBookingsRaw.map(async (b) => {
        const datesRes = await db.prepare("SELECT * FROM booking_dates WHERE booking_id = ? ORDER BY date ASC").bind(b.id).all();
        return {
            ...b,
            dates: datesRes.results as unknown as BookingDate[]
        };
    }));

    return (
        <div className="max-w-6xl mx-auto py-12 px-6">
            <header className="mb-12">
                <h1 className="text-5xl font-black uppercase italic text-zinc-900 dark:text-white font-heading leading-none">
                    Account<br /><span className="text-red-600">Overview</span>
                </h1>
                <p className="text-zinc-500 font-medium italic mt-2">Manage your presence within the collective.</p>
            </header>

            <div className="space-y-12">
                {/* Identity Card */}
                <div className="bg-zinc-50 dark:bg-zinc-900 p-8 border border-zinc-200 dark:border-zinc-800 space-y-6">
                    <div className="flex items-center gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6 mb-6">
                        <div className="w-16 h-16 rounded-full border-2 border-red-600/20 overflow-hidden relative">
                            {user?.image && <Image src={user.image} alt={user.name || "User"} fill className="object-cover" unoptimized />}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold uppercase italic font-heading tracking-tighter">{user?.name}</h2>
                            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{user?.email}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`inline-block w-2 h-2 rounded-full ${user?.role === 'Musician' || user?.role === 'Chapter Director' ? 'bg-green-500' : 'bg-zinc-400'}`}></span>
                                <p className="font-black uppercase tracking-widest text-[10px] text-red-600">{user?.role}</p>
                            </div>
                        </div>
                    </div>

                    <details className="group">
                        <summary className="cursor-pointer font-black uppercase tracking-[0.2em] text-[10px] text-zinc-500 hover:text-red-600 transition-colors list-none flex items-center justify-between">
                            <span>Manage Profile & Role</span>
                            <span className="group-open:rotate-180 transition-transform text-lg">▾</span>
                        </summary>

                        <div className="mt-8 pt-8 border-t border-zinc-200 dark:border-zinc-800">
                            {user && (
                                <ProfileForm
                                    user={user}
                                    chapters={chapters}
                                    pendingUserEdit={pendingUserEdit}
                                    pendingRoleRequest={pendingRoleRequest}
                                />
                            )}
                        </div>
                    </details>
                </div>

                {(user?.role === "Musician" || user?.role === "Chapter Director") && (
                    <MyArtists
                        artists={myArtists}
                        chapters={chapters}
                        currentUserId={session.user.id}
                        availableMusicians={allMusicians}
                        pendingRequests={requests}
                    />
                )}

                <section className="space-y-6">
                    <div className="border-b border-zinc-200 dark:border-zinc-800 pb-4">
                        <h2 className="text-2xl font-bold uppercase text-red-600 font-heading italic">My Bookings</h2>
                    </div>
                    <div className="grid gap-8">
                        {myBookings.map((b) => (
                            <BookingCard key={b.id} b={b} requests={requests} isAdmin={false} />
                        ))}
                        {myBookings.length === 0 && (
                            <p className="text-zinc-500 italic py-12 text-center uppercase tracking-widest text-sm border-2 border-dashed border-zinc-200 dark:border-zinc-800">
                                No bookings found.
                            </p>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
