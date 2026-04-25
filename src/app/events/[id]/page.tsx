import { getCloudflareContext } from "@opennextjs/cloudflare";
import { Event, BookingDate } from "@/lib/db";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { env } = await getCloudflareContext();
    const db = env.DB;
    const { id } = await params;

    // Try fetching from events table first
    const eventRes = await db.prepare("SELECT * FROM events WHERE id = ?").bind(id).first();
    let eventData = eventRes as unknown as Event;

    if (!eventData) {
        // Try fetching from booking_dates table
        const bookingDateRes = await db.prepare(`
            SELECT bd.*, b.name as program, b.image as booking_image, b.description as booking_description
            FROM booking_dates bd
            JOIN bookings b ON bd.booking_id = b.id
            WHERE bd.id = ? AND b.status = 'APPROVED' AND bd.is_public = 1
        `).bind(id).first();

        if (!bookingDateRes) {
            notFound();
        }

        const bd = bookingDateRes as unknown as (BookingDate & { 
            program: string; 
            booking_image: string | null; 
            booking_description: string | null; 
        });
        eventData = {
            id: bd.id,
            title: bd.event_type || 'Event',
            description: bd.description || bd.booking_description || "",
            venue: bd.location,
            city: "",
            date: bd.date,
            time: bd.time,
            link: null,
            image: bd.booking_image,
            created_at: ""
        };
    }

    // Format date and time (consistent with listing page but more detailed)
    function formatDate(dateStr: string) {
        const date = new Date(dateStr + "T00:00:00");
        return date.toLocaleDateString("en-US", { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    }

    function formatTime(timeStr: string) {
        const [hours, minutes] = timeStr.split(":");
        const h = parseInt(hours);
        const ampm = h >= 12 ? "PM" : "AM";
        const displayH = h % 12 || 12;
        return `${displayH}:${minutes} ${ampm}`;
    }

    return (
        <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 space-y-12 animate-in fade-in duration-700">
             <Link href="/events" className="inline-flex items-center gap-2 text-zinc-500 hover:text-red-600 font-bold uppercase text-[10px] tracking-[0.2em] transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Events
            </Link>

            <div className="grid lg:grid-cols-[1fr_400px] gap-12 items-start">
                <div className="space-y-12">
                    <header className="space-y-6">
                        <div className="space-y-2">
                            <div className="text-red-600 font-black uppercase text-sm tracking-[0.3em]">
                                {formatDate(eventData.date)} • {formatTime(eventData.time)}
                            </div>
                            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black uppercase italic font-heading tracking-tighter text-zinc-900 dark:text-white leading-[0.85]">
                                {eventData.title}
                            </h1>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-zinc-500 font-medium italic text-xl">
                            <span>{eventData.venue}{eventData.city ? `, ${eventData.city}` : ""}</span>
                        </div>
                    </header>

                    {eventData.image && (
                        <div className="border-4 border-zinc-900 dark:border-white shadow-[20px_20px_0_0_rgba(220,38,38,0.1)] bg-zinc-100 dark:bg-zinc-800 inline-block overflow-hidden">
                            <Image 
                                src={eventData.image} 
                                alt={eventData.title} 
                                width={1200}
                                height={800}
                                className="w-full h-auto block" 
                                priority
                                unoptimized
                            />
                        </div>
                    )}

                    <div className="prose prose-zinc dark:prose-invert max-w-none">
                        <p className="text-xl md:text-2xl leading-relaxed text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap font-medium">
                            {eventData.description}
                        </p>
                    </div>
                </div>

                <aside className="lg:sticky lg:top-8 space-y-8">
                    <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 shadow-sm">
                        <h3 className="font-black uppercase italic tracking-tighter text-2xl mb-6 border-b-4 border-red-600 pb-2 inline-block">Tickets & Info</h3>
                        <div className="space-y-8">
                            {eventData.link ? (
                                <Link 
                                    href={eventData.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full text-center bg-red-600 text-white font-black uppercase py-5 tracking-widest hover:bg-zinc-900 dark:hover:bg-white dark:hover:text-black transition-all shadow-lg hover:shadow-xl active:scale-[0.98] text-sm"
                                >
                                    Get Tickets
                                </Link>
                            ) : (
                                <div className="p-4 border-2 border-dashed border-zinc-200 dark:border-zinc-800 text-center">
                                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest italic">Ticket link not available for this event.</p>
                                </div>
                            )}
                            
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-red-600/10 flex items-center justify-center shrink-0">
                                        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Venue</div>
                                        <div className="font-bold uppercase text-zinc-900 dark:text-white">
                                            {eventData.venue}<br/>
                                            <span className="text-zinc-500 italic font-medium lowercase first-letter:uppercase">{eventData.city}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-red-600/10 flex items-center justify-center shrink-0">
                                        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Date & Time</div>
                                        <div className="font-bold uppercase text-zinc-900 dark:text-white">
                                            {formatDate(eventData.date)}<br/>
                                            <span className="text-red-600">{formatTime(eventData.time)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-zinc-200 dark:border-zinc-800">
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] leading-relaxed">
                                    All events are subject to change. Please check back for updates or contact us with any questions.
                                </p>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
