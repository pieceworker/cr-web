import { auth } from "@/auth";
import Link from "next/link";
import { isAdmin, Chapter, Artist, Booking, User, BookingDate, UnifiedRequest, BlogPost, Event, MediaItem } from "@/lib/db";
import { redirect } from "next/navigation";
import { env } from "cloudflare:workers";
import { deleteBlogPost } from "@/lib/actions";
import Image from "next/image";
import UserCard from "@/components/UserCard";
import ArtistCard from "@/components/ArtistCard";
import BookingCard from "@/components/BookingCard";
import NewChapterForm from "@/components/NewChapterForm";
import EventForm from "@/components/EventForm";
import ChapterCard from "@/components/ChapterCard";
import EventCard from "@/components/EventCard";
import MediaCard from "@/components/MediaCard";
import MediaForm from "@/components/MediaForm";

export const dynamic = "force-dynamic";

async function getAdminData() {
    
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

    const blogPostsRes = await db.prepare("SELECT * FROM blog_posts ORDER BY created_at DESC").all();
    const blogPosts = blogPostsRes.results as unknown as BlogPost[];

    const eventsRes = await db.prepare("SELECT * FROM events ORDER BY date ASC").all();
    const events = eventsRes.results as unknown as Event[];

    const mediaRes = await db.prepare("SELECT * FROM media_items ORDER BY created_at DESC").all();
    const mediaItems = mediaRes.results as unknown as MediaItem[];

    // Fetch all artists, bookings, and chapters to match R2 images against
    const allArtists = artists.results as unknown as Artist[];
    const allChapters = chapters.results as unknown as Chapter[];

    // Use R2 binding as source of truth for images
    const r2List = await env.R2.list();
    const uploadedMedia = r2List.objects.map(obj => {
        const url = `/api/image/${obj.key}`;

        // Find matching artist, booking, chapter, blog post, event, or media item
        const artist = allArtists.find(a => a.image === url);
        const chapter = allChapters.find(c => c.image === url);
        const blogPost = blogPosts.find(p => p.image === url);
        const event = events.find(e => e.image === url);
        const mediaItem = mediaItems.find(m => m.url === url);

        const id = artist?.id || chapter?.id || blogPost?.id || event?.id || mediaItem?.id || obj.key;
        const name = artist?.name || chapter?.location || blogPost?.title || event?.title || mediaItem?.title || obj.key;
        const type = artist ? 'artist' : (chapter ? 'chapter' : (blogPost ? 'blog_post' : (event ? 'event' : (mediaItem ? 'media' : 'unlinked'))));

        return {
            id,
            name,
            url,
            type,
            contentType: obj.httpMetadata?.contentType || 'application/octet-stream'
        };
    });

    return {
        requests: (requestsRes.results as unknown as UnifiedRequest[] || []),
        chapters: (chapters.results as unknown as Chapter[] || []),
        artists: allArtists,
        bookings: bookingsWithDates,
        blogPosts,
        events,
        users,
        uploadedMedia,
        mediaItems
    };
}

const SECTION_HEADER = "text-2xl font-black uppercase italic tracking-tighter border-b-4 border-red-600 inline-block font-heading mb-6";
const BUTTON_DANGER = "text-red-600 font-bold hover:underline text-xs uppercase tracking-widest";




export default async function AdminPage() {
    const { requests, chapters, artists, bookings, users, blogPosts, events, uploadedMedia, mediaItems } = await getAdminData();
    const session = await auth();
    if (!isAdmin(session?.user?.email)) redirect("/");

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
                    <h2 className={SECTION_HEADER}>Pending ({requests.length})</h2>
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
                <div className="grid gap-4 mt-6">
                    {chapters.map(c => <ChapterCard key={c.id} chapter={c} />)}

                    <div className="bg-zinc-50 dark:bg-zinc-900 border-2 border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col justify-center items-center text-center">
                        <details className="group w-full">
                            <summary className="cursor-pointer list-none flex flex-col items-center gap-4 group-open:hidden py-12">
                                <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-3xl text-zinc-400 group-hover:bg-red-600 group-hover:text-white transition-colors">
                                    +
                                </div>
                                <span className="font-bold uppercase tracking-widest text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">Add New Chapter</span>
                            </summary>
                            <div className="text-left w-full animate-in fade-in slide-in-from-bottom-4 duration-300 px-2 py-8 sm:p-8">
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

            {/* Events */}
            <section>
                <h2 className={`${SECTION_HEADER} mb-8`}>Events ({events.length})</h2>
                <div className="grid gap-4 mt-6">
                    {events.map(e => <EventCard key={e.id} event={e} />)}

                    <div className="bg-zinc-50 dark:bg-zinc-900 border-2 border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col justify-center items-center text-center">
                        <details className="group w-full">
                            <summary className="cursor-pointer list-none flex flex-col items-center gap-4 group-open:hidden py-12">
                                <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-3xl text-zinc-400 group-hover:bg-red-600 group-hover:text-white transition-colors">
                                    +
                                </div>
                                <span className="font-bold uppercase tracking-widest text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">Add New Event</span>
                            </summary>
                            <div className="text-left w-full animate-in fade-in slide-in-from-bottom-4 duration-300 px-2 py-8 sm:p-8">
                                <h3 className="font-black text-xl uppercase italic font-heading tracking-tighter mb-4 text-center">New Event</h3>
                                <EventForm />
                            </div>
                        </details>
                    </div>
                </div>
            </section>

            {/* Media */}
            <section>
                <h2 className={`${SECTION_HEADER} mb-8`}>Media ({mediaItems.length})</h2>
                <div className="grid gap-4 mt-6">
                    <div className="bg-zinc-50 dark:bg-zinc-900 border-2 border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col justify-center items-center text-center">
                        <details className="group w-full">
                            <summary className="cursor-pointer list-none flex flex-col items-center gap-4 group-open:hidden py-12">
                                <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-3xl text-zinc-400 group-hover:bg-red-600 group-hover:text-white transition-colors">
                                    +
                                </div>
                                <span className="font-bold uppercase tracking-widest text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">Add New Media Item</span>
                            </summary>
                            <div className="text-left w-full animate-in fade-in slide-in-from-bottom-4 duration-300 px-2 py-8 sm:p-8">
                                <h3 className="font-black text-xl uppercase italic font-heading tracking-tighter mb-4 text-center">New Media</h3>
                                <MediaForm />
                            </div>
                        </details>
                    </div>

                    {mediaItems.map(item => <MediaCard key={item.id} item={item} />)}
                </div>
            </section>

            {/* Blog Posts */}
            <section>
                <div className="flex justify-between items-end mb-6">
                    <h2 className={SECTION_HEADER}>Blog Posts ({blogPosts.length})</h2>
                    <Link href="/blog/new" className="text-[10px] font-black uppercase tracking-[0.2em] bg-red-600 text-white px-4 py-2 hover:bg-black dark:hover:bg-white dark:hover:text-black transition-all">
                        Write New Post
                    </Link>
                </div>
                <div className="grid gap-4">
                    {blogPosts.map(post => {
                        const author = users.find(u => u.id === post.author_id);
                        return (
                            <div key={post.id} className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 flex justify-between items-center group hover:border-red-600 transition-colors">
                                <div className="flex items-center gap-4">
                                    {post.image && (
                                        <div className="w-12 h-12 relative overflow-hidden bg-zinc-200 dark:bg-zinc-800">
                                            <Image src={post.image} alt="Thumbnail" fill className="object-cover grayscale-[0.5] group-hover:grayscale-0" unoptimized />
                                        </div>
                                    )}
                                    <div>
                                        <Link href={`/blog/${post.id}`} className="hover:underline hover:text-red-600">
                                            <h3 className="font-bold text-lg leading-tight truncate max-w-[300px] sm:max-w-[500px]">{post.title}</h3>
                                        </Link>
                                        <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest">
                                            By {author?.name || 'Unknown'} • {new Date(post.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                
                                <form action={deleteBlogPost.bind(null, post.id)}>
                                    <button className={BUTTON_DANGER}>Delete</button>
                                </form>
                            </div>
                        );
                    })}
                    {blogPosts.length === 0 && <p className="text-zinc-500 italic py-12 text-center uppercase tracking-widest text-sm border-2 border-dashed border-zinc-200 dark:border-zinc-800">No blog posts found.</p>}
                </div>
            </section>

            {/* Uploaded Media */}
            <section>
                <h2 className={SECTION_HEADER}>Uploaded Media ({uploadedMedia.length})</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 mt-6">
                    {uploadedMedia.map((file) => (
                        <div
                            key={file.url}
                            className="group block bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 p-2 hover:border-red-600 transition-all shadow-sm"
                        >
                            <Link
                                href={file.type === 'unlinked' ? file.url : (file.type === 'artist' ? `/artists/${file.id}` : (file.type === 'chapter' ? `/chapters/${file.id}` : (file.type === 'blog_post' ? `/blog/${file.id}` : (file.type === 'media' ? '/media' : file.url))))}
                                target={file.type === 'unlinked' ? "_blank" : undefined}
                            >
                                <div className="aspect-square relative grayscale-[0.5] group-hover:grayscale-0 transition-grayscale duration-500 overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                                    {file.contentType.startsWith('video/') ? (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 group-hover:text-red-600 transition-colors">
                                            <div className="w-12 h-12 rounded-full border-2 border-current flex items-center justify-center">
                                                <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-current border-b-[6px] border-b-transparent ml-1" />
                                            </div>
                                            <span className="text-[8px] font-bold uppercase mt-2">Video</span>
                                        </div>
                                    ) : (
                                        <Image src={file.url} alt={file.name} fill className="object-cover" unoptimized />
                                    )}
                                </div>
                                <div className="mt-2 text-[8px] font-black uppercase tracking-tighter truncate text-zinc-500 group-hover:text-red-600">
                                    {file.type === 'unlinked' ? 'Unlinked File' : file.name}
                                </div>
                                <div className="text-[6px] font-bold text-zinc-400 truncate uppercase tracking-tighter">
                                    {file.type === 'unlinked' ? file.id : `${file.type}: ${file.id}`}
                                </div>
                            </Link>
                        </div>
                    ))}
                    {uploadedMedia.length === 0 && (
                        <div className="col-span-full py-12 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800">
                            <p className="text-zinc-500 italic uppercase tracking-widest text-sm">No R2-stored media files found.</p>
                        </div>
                    )}
                </div>
            </section >
        </div >
    );
}
