import { auth, signIn } from "@/auth";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { Booking, BookingDate, UnifiedRequest } from "@/lib/db";
import BookingForm from "@/components/BookingForm";
import BookingCard from "@/components/BookingCard";

export const dynamic = "force-dynamic";

async function getBookingsData(userId: string) {
    const { env } = await getCloudflareContext();
    const db = env.DB;

    // Get bookings with their dates and user info
    const bookingsRes = await db.prepare(`
        SELECT b.*, u.name as user_name, u.image as user_image
        FROM bookings b
        LEFT JOIN users u ON b.created_by = u.id
        WHERE b.created_by = ?
        ORDER BY b.id DESC
    `).bind(userId).all();

    const bookings = bookingsRes.results as unknown as (Booking & { user_name: string; user_image?: string })[];

    const requestsRes = await db.prepare(`
        SELECT * FROM requests 
        WHERE (type = 'BOOKING_EDIT' OR type = 'BOOKING_INQUIRY') 
        AND user_id = ? AND status = 'PENDING'
    `).bind(userId).all();
    const requests = requestsRes.results as unknown as UnifiedRequest[];

    const bookingsWithDates = await Promise.all(bookings.map(async (b) => {
        const datesRes = await db.prepare("SELECT * FROM booking_dates WHERE booking_id = ? ORDER BY date ASC").bind(b.id).all();
        return {
            ...b,
            dates: datesRes.results as unknown as BookingDate[]
        };
    }));

    return {
        bookings: bookingsWithDates,
        requests
    };
}

export default async function BookingsPage() {
    const session = await auth();
    const userId = session?.user?.id;
    const isAuthenticated = !!userId;
    const { bookings, requests } = userId
        ? await getBookingsData(userId)
        : { bookings: [], requests: [] };

    return (
        <div className="grid grid-cols-1 grid-rows-1 min-h-[calc(100vh-200px)]">
            {/* Unauthenticated Overlay */}
            {!isAuthenticated && (
                <div className="col-start-1 row-start-1 z-40 relative pointer-events-none">
                    {/* Full-height backdrop */}
                    <div className="absolute inset-0 bg-white/60 dark:bg-black/60 backdrop-blur-[2px] h-full pointer-events-auto" />

                    {/* Sticky viewport-centered modal */}
                    <div className="sticky top-0 h-[100dvh] flex items-center justify-center p-6">
                        <div className="relative bg-white dark:bg-zinc-900 border-4 border-red-600 p-12 text-center space-y-6 shadow-2xl max-w-lg w-full pointer-events-auto">
                            <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto">
                                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-red-600">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                </svg>
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-3xl font-black uppercase italic text-zinc-900 dark:text-white font-heading tracking-tighter">
                                    Login Required
                                </h2>
                                <p className="text-zinc-600 dark:text-zinc-400 font-medium italic">
                                    Please login to submit a booking inquiry.
                                </p>
                            </div>
                            <form
                                action={async () => {
                                    "use server";
                                    await signIn("google");
                                }}
                            >
                                <button
                                    type="submit"
                                    className="w-full bg-red-600 text-white font-bold uppercase py-4 px-8 hover:bg-red-700 transition-all tracking-[0.2em] text-sm active:scale-[0.98] shadow-lg shadow-red-600/20"
                                >
                                    Sign in with Google
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            <div className={`col-start-1 row-start-1 max-w-6xl mx-auto py-12 px-6 space-y-16 transition-all duration-700 ${!isAuthenticated ? 'blur-[1px] grayscale-[0.5]' : ''}`}>
                <section className="space-y-8">
                    <div className="space-y-2">
                        <h1 className="text-5xl md:text-7xl font-black uppercase italic text-zinc-900 dark:text-white font-heading leading-none tracking-tighter">
                            Bookings<br /><span className="text-red-600">Inquiry</span>
                        </h1>
                        <p className="text-zinc-500 font-medium italic">Ready to set the stage? Tell us about your event.</p>
                    </div>
                    <BookingForm
                        disabled={!isAuthenticated}
                        initialUserData={session?.user}
                    />
                </section>

                {isAuthenticated && (
                    <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <h2 className="text-2xl font-black uppercase italic tracking-tighter border-b-4 border-red-600 inline-block font-heading">
                            My Bookings
                        </h2>

                        <div className="grid gap-6">
                            {bookings.length > 0 ? bookings.map((b) => (
                                <BookingCard key={b.id} b={b} requests={requests} isAdmin={false} />
                            )) : (
                                <p className="text-zinc-500 italic py-12 border border-dashed border-zinc-200 dark:border-zinc-800 text-center uppercase tracking-widest text-sm">You haven&apos;t made any inquiries yet.</p>
                            )}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}
