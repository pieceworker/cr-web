import { getCloudflareContext } from "@opennextjs/cloudflare";
import { Booking, BookingDate, User } from "@/lib/db";
import Image from "next/image";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

async function getBookingData(id: string) {
    const { env } = await getCloudflareContext();
    const db = env.DB;

    // For public profile, we only show APPROVED bookings
    const booking = await db.prepare("SELECT * FROM bookings WHERE id = ? AND status = 'APPROVED'").bind(id).first() as Booking | null;

    if (!booking) return null;

    const creator = await db.prepare("SELECT name, image FROM users WHERE id = ?").bind(booking.created_by).first() as User | null;

    const datesRes = await db.prepare("SELECT * FROM booking_dates WHERE booking_id = ? ORDER BY date ASC").bind(id).all();
    const dates = datesRes.results as unknown as BookingDate[];

    return { booking, creator, dates };
}

export default async function BookingProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const data = await getBookingData(id);

    if (!data) notFound();
    const { booking, creator, dates } = data;

    const displayImage = booking.image_preference === 'google' ? creator?.image : booking.image;

    return (
        <div className="max-w-6xl mx-auto py-20 px-6 space-y-12">
            <div className="flex flex-col md:flex-row gap-12 items-center md:items-start text-center md:text-left">
                {/* Booking Image */}
                <div className="relative group">
                    <div className="w-64 h-64 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden shrink-0 relative shadow-2xl">
                        {displayImage ? (
                            <Image src={displayImage} alt={booking.name} fill className="object-cover transition-all duration-500" unoptimized />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-zinc-200 dark:bg-zinc-800 text-zinc-400 font-black uppercase tracking-widest text-xs italic">
                                No Image
                            </div>
                        )}
                    </div>
                    {creator && (
                        <div className="absolute -bottom-6 -right-6 flex">
                            <div className="w-16 h-16 rounded-full border-4 border-white dark:border-zinc-950 overflow-hidden bg-zinc-200 dark:bg-zinc-800 shadow-xl relative ring-1 ring-zinc-200 dark:ring-zinc-800">
                                {creator.image && <Image src={creator.image} alt={creator.name || 'Creator'} fill className="object-cover" unoptimized />}
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-8 flex-1 pt-8 md:pt-0">
                    <div>
                        <span className="text-red-600 font-black uppercase tracking-widest text-xs italic border-b-2 border-red-600 mb-2 inline-block">
                            Booking Profile
                        </span>
                        <h1 className="text-6xl font-black uppercase italic tracking-tighter leading-none font-heading">
                            {booking.name}
                        </h1>
                        <p className="text-zinc-500 font-bold uppercase tracking-widest mt-2">Requested by {creator?.name || 'Anonymous'}</p>
                    </div>

                    {booking.questions && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold uppercase tracking-tight border-l-4 border-red-600 pl-4 font-heading">Details / Comments</h2>
                            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed italic whitespace-pre-wrap">
                                &ldquo;{booking.questions}&rdquo;
                            </p>
                        </div>
                    )}

                    {dates.length > 0 && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold uppercase tracking-tight border-l-4 border-red-600 pl-4 font-heading">Events ({dates.length})</h2>
                            <div className="grid sm:grid-cols-2 gap-4">
                                {dates.map((date) => (
                                    <div key={date.id} className="bg-zinc-50 dark:bg-zinc-900 p-6 border border-zinc-200 dark:border-zinc-800 space-y-4">
                                        <div className="space-y-1">
                                            <p className="font-black text-xl uppercase italic text-red-600 leading-none">{date.date}</p>
                                            <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">{date.time} {date.duration ? `(${date.duration})` : ''}</p>
                                        </div>
                                        <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                                            <p className="font-black uppercase text-sm tracking-tight">{date.event_type} @ {date.location}</p>
                                            {date.description && (
                                                <p className="text-sm text-zinc-600 dark:text-zinc-400 italic">&ldquo;{date.description}&rdquo;</p>
                                            )}
                                        </div>
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
