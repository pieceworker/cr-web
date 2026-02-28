import { auth } from "@/auth";
import Link from "next/link";
import { isAdmin, Chapter, Artist, Booking, User, BookingDate, UnifiedRequest } from "@/lib/db";
import { redirect } from "next/navigation";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { deleteChapter } from "@/lib/actions";
import Image from "next/image";
import ChapterEditForm from "@/components/ChapterEditForm";
import UserCard from "@/components/UserCard";
import ArtistCard from "@/components/ArtistCard";
import BookingCard from "@/components/BookingCard";
import NewChapterForm from "@/components/NewChapterForm";

export const dynamic = "force-dynamic";

async function getAdminData() {
    const { env } = await getCloudflareContext();
    const db = env.DB;

    const requestsRes = await db.prepare(`
        SELECT r.*, u.name as user_name, u.email as user_email 
        FROM requests r 
        JOIN users u ON r.user_id = u.id 
        WHERE r.status = 'PENDING'
        ORDER BY r.created_at DESC
    `).all();

    const chapters = await db.prepare("SELECT * FROM chapters").all();
    const artists = await db.prepare("SELECT * FROM artists").all();

    const bookingsRes = await db.prepare(`
        SELECT b.*, u.name as user_name, u.image as user_image
        FROM bookings b
        LEFT JOIN users u ON b.created_by = u.id
        ORDER BY b.id DESC
    `).all();

    const bookings = bookingsRes.results as unknown as (Booking & { user_name: string; user_image?: string })[];

    const bookingsWithDates = await Promise.all(bookings.map(async (b) => {
        const datesRes = await db.prepare("SELECT * FROM booking_dates WHERE booking_id = ? ORDER BY date ASC").bind(b.id).all();
        return {
            ...b,
            dates: datesRes.results as unknown as BookingDate[]
        };
    }));

    const usersResult = await db.prepare("SELECT * FROM users").all();
    const users = usersResult.results as unknown as User[];

    // Fetch all artists, bookings, and chapters to match R2 images against
    const allArtists = artists.results as unknown as Artist[];
    const allBookings = bookingsRes.results as unknown as Booking[];
    const allChapters = chapters.results as unknown as Chapter[];

    // Use R2 binding as source of truth for images
    const r2List = await env.R2.list();
    const uploadedImages = r2List.objects.map(obj => {
        const url = `/api/image/${obj.key}`;

        // Find matching artist, booking, or chapter
        const artist = allArtists.find(a => a.image === url);
        const booking = allBookings.find(b => b.image === url);
        const chapter = allChapters.find(c => c.image === url);

        return {
            id: artist?.id || booking?.id || chapter?.id || obj.key,
            name: artist?.name || booking?.name || chapter?.location || obj.key,
            image: url,
            type: artist ? 'artist' : (booking ? 'booking' : (chapter ? 'chapter' : 'unlinked'))
        };
    });

    return {
        requests: (requestsRes.results as unknown as UnifiedRequest[] || []),
        chapters: (chapters.results as unknown as Chapter[] || []),
        artists: allArtists,
        bookings: bookingsWithDates,
        users,
        uploadedImages
    };
}

const SECTION_HEADER = "text-2xl font-black uppercase italic tracking-tighter border-b-4 border-red-600 inline-block font-heading mb-6";
const BUTTON_DANGER = "text-red-600 font-bold hover:underline text-xs uppercase tracking-widest";




export default async function AdminPage() {
    const session = await auth();
    if (!isAdmin(session?.user?.email)) redirect("/");

    const { requests, chapters, artists, bookings, users, uploadedImages } = await getAdminData();

    return (
        <div className="max-w-6xl mx-auto py-12 px-2 sm:px-6 space-y-24">
            <header className="space-y-2">
                <h1 className="text-5xl md:text-7xl font-black uppercase italic text-zinc-900 dark:text-white font-heading leading-none">
                    Admin<br /><span className="text-red-600">Dashboard</span>
                </h1>
                <p className="text-zinc-500 font-medium italic">Control center for the collective.</p>
            </header>

            {/* Unified Requests */}
            <section>
                <div className="flex justify-between items-end mb-6">
                    <h2 className={SECTION_HEADER}>Requests ({requests.length})</h2>
                </div>
                <div className="grid gap-8">
                    {requests.map((req) => {
                        // Find the target object to render its card
                        if (req.type === 'USER_EDIT' || req.type === 'ROLE_CHANGE') {
                            const u = users.find(user => user.id === (req.type === 'USER_EDIT' ? req.target_id : req.user_id));
                            if (u) return <UserCard key={req.id} u={u} requests={[req]} chapters={chapters} isAdmin={true} />;
                        }
                        if (req.type === 'ARTIST_ADD' || req.type === 'ARTIST_EDIT') {
                            const a = artists.find(artist => artist.id === req.target_id);
                            if (a) return <ArtistCard key={req.id} a={a} requests={[req]} chapters={chapters} users={users} isAdmin={true} />;
                        }
                        if (req.type === 'BOOKING_INQUIRY') {
                            const b = bookings.find(booking => booking.id === req.target_id);
                            if (b) return <BookingCard key={req.id} b={b} requests={[req]} isAdmin={true} />;
                        }
                        return null;
                    })}
                    {requests.length === 0 && <p className="text-zinc-500 italic py-12 border border-dashed border-zinc-200 dark:border-zinc-800 text-center uppercase tracking-widest text-sm">No pending requests.</p>}
                </div>
            </section>

            {/* Users */}
            <section>
                <h2 className={SECTION_HEADER}>Users ({users.length})</h2>
                <div className="grid gap-4 mt-6">
                    {users.map((u) => <UserCard key={u.id} u={u} requests={requests} chapters={chapters} isAdmin={true} />)}
                </div>
            </section>

            {/* Chapters */}
            <section>
                <h2 className={`${SECTION_HEADER} mb-8`}>Chapters ({chapters.length})</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {chapters.map(c => (
                        <div key={c.id} className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col transition-all hover:bg-zinc-100 dark:hover:bg-zinc-800/50">
                            <div className="aspect-video relative grayscale-[0.5] hover:grayscale-0 transition-all duration-700">
                                {c.image && <Image src={c.image} alt={c.location} fill className="object-cover" unoptimized />}
                            </div>
                            <div className="px-2 py-6 sm:p-6 space-y-4 flex-1 flex flex-col">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-black text-xl uppercase italic font-heading tracking-tighter">{c.location}</h3>
                                    <form action={deleteChapter.bind(null, c.id)}>
                                        <button className={BUTTON_DANGER}>Delete</button>
                                    </form>
                                </div>
                            </div>
                            <div className="w-full mt-auto">
                                <details className="w-full group">
                                    <summary className="cursor-pointer bg-zinc-100 dark:bg-zinc-800/50 p-3 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-red-600 list-none border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center group-open:bg-red-600 group-open:text-white group-open:hover:text-white transition-all">
                                        <span>Edit Chapter</span>
                                        <span className="group-open:rotate-180 transition-transform text-lg">▾</span>
                                    </summary>
                                    <div className="px-2 py-6 sm:p-6 bg-white dark:bg-black border-t border-zinc-200 dark:border-zinc-800 animate-in fade-in slide-in-from-top-4 duration-300">
                                        <ChapterEditForm chapter={c} />
                                    </div>
                                </details>
                            </div>
                        </div>
                    ))}

                    <div className="bg-zinc-50 dark:bg-zinc-900 border-2 border-dashed border-zinc-200 dark:border-zinc-800 px-2 py-8 sm:p-8 flex flex-col justify-center items-center text-center min-h-[300px]">
                        <details className="group we-full w-full">
                            <summary className="cursor-pointer list-none flex flex-col items-center gap-4 group-open:hidden">
                                <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-3xl text-zinc-400 group-hover:bg-red-600 group-hover:text-white transition-colors">
                                    +
                                </div>
                                <span className="font-bold uppercase tracking-widest text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">Add New Chapter</span>
                            </summary>
                            <div className="text-left w-full animate-in fade-in slide-in-from-bottom-4 duration-300">
                                <h3 className="font-black text-xl uppercase italic font-heading tracking-tighter mb-4 text-center">New Chapter</h3>
                                <NewChapterForm />
                            </div>
                        </details>
                    </div>
                </div>
            </section >

            {/* Artists */}
            < section >
                <h2 className={SECTION_HEADER}>Artists ({artists.length})</h2>
                <div className="grid gap-6 mt-6">
                    {artists.map((a) => <ArtistCard key={a.id} a={a} requests={requests} chapters={chapters} users={users} isAdmin={true} />)}
                    {artists.length === 0 && <p className="text-zinc-500 italic py-12 text-center uppercase tracking-widest text-sm border-2 border-dashed border-zinc-200 dark:border-zinc-800">No artists registered.</p>}
                </div>
            </section >

            {/* Bookings */}
            < section >
                <h2 className={SECTION_HEADER}>Bookings ({bookings.length})</h2>
                <div className="grid gap-8 mt-6">
                    {bookings.map((b) => <BookingCard key={b.id} b={b} requests={requests} isAdmin={true} />)}
                    {bookings.length === 0 && <p className="text-zinc-500 italic py-12 text-center uppercase tracking-widest text-sm border-2 border-dashed border-zinc-200 dark:border-zinc-800">No booking inquiries found.</p>}
                </div>
            </section >

            {/* Uploaded Images */}
            < section >
                <h2 className={SECTION_HEADER}>Uploaded Images ({uploadedImages.length})</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 mt-6">
                    {uploadedImages.map((img) => (
                        <div
                            key={img.image}
                            className="group block bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 p-2 hover:border-red-600 transition-all shadow-sm"
                        >
                            <Link
                                href={img.type === 'unlinked' ? img.image : (img.type === 'artist' ? `/artists/${img.id}` : (img.type === 'chapter' ? `/chapters/${img.id}` : `/bookings/${img.id}`))}
                                target={img.type === 'unlinked' ? "_blank" : undefined}
                            >
                                <div className="aspect-square relative grayscale-[0.5] group-hover:grayscale-0 transition-grayscale duration-500 overflow-hidden">
                                    <Image src={img.image} alt={img.name} fill className="object-cover" unoptimized />
                                </div>
                                <div className="mt-2 text-[8px] font-black uppercase tracking-tighter truncate text-zinc-500 group-hover:text-red-600">
                                    {img.type === 'unlinked' ? 'Unlinked File' : img.name}
                                </div>
                                <div className="text-[6px] font-bold text-zinc-400 truncate uppercase tracking-tighter">
                                    {img.type === 'unlinked' ? img.id : `${img.type}: ${img.id}`}
                                </div>
                            </Link>
                        </div>
                    ))}
                    {uploadedImages.length === 0 && (
                        <div className="col-span-full py-12 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800">
                            <p className="text-zinc-500 italic uppercase tracking-widest text-sm">No R2-stored images found.</p>
                        </div>
                    )}
                </div>
            </section >
        </div >
    );
}
