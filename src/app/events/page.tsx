import Link from "next/link";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { BookingDate, Event } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const { env } = await getCloudflareContext();
  const db = env.DB;



  function formatDate(dateStr: string) {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  function formatTime(timeStr: string) {
    const [hours, minutes] = timeStr.split(":");
    const h = parseInt(hours);
    const ampm = h >= 12 ? "PM" : "AM";
    const displayH = h % 12 || 12;
    return `${displayH}:${minutes} ${ampm}`;
  }

  // Fetch dynamic booking dates from D1
  const bookingsRes = await db.prepare(`
    SELECT bd.*, b.name as program
    FROM booking_dates bd
    JOIN bookings b ON bd.booking_id = b.id
    WHERE b.status = 'APPROVED' AND bd.is_public = 1
  `).all();

  // Fetch admin-created events from D1
  const eventsRes = await db.prepare("SELECT * FROM events").all();
  const dbEvents = eventsRes.results as unknown as Event[] || [];

  const dynamicEvents = (bookingsRes.results as unknown as BookingDate[] || []).map((bd) => ({
    date: formatDate(bd.date),
    time: formatTime(bd.time),
    venue: bd.location,
    city: "",
    program: bd.event_type || 'Event',
    link: "#",
    dateObj: new Date(bd.date + "T00:00:00")
  }));

  const adminEvents = dbEvents.map(e => ({
    date: formatDate(e.date),
    time: formatTime(e.time),
    venue: e.venue,
    city: e.city || "",
    program: e.title,
    link: e.link || "#",
    dateObj: new Date(e.date + "T00:00:00")
  }));

  const allEvents = [
    ...adminEvents,
    ...dynamicEvents
  ];

  // Filter events: Keep only those where the event date is today or in the future
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const filteredEvents = allEvents
    .filter(event => event.dateObj >= now)
    .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());

  return (
    <div className="flex flex-col gap-10 py-10 px-2 sm:px-6 max-w-6xl mx-auto transition-colors">
      <section className="text-center space-y-4">
        <h1 className="text-4xl md:text-6xl font-black uppercase italic text-red-600">
          Events
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 italic">
          &ldquo;Chamber music in neighborhood hangouts.&rdquo;
        </p>
      </section>

      <div className="space-y-4">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event, i) => (
            <div
              key={i}
              className="group border border-zinc-200 dark:border-zinc-800 px-2 py-6 sm:p-6 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
              <div className="flex-1">
                <div>
                  <div className="text-red-600 font-bold tracking-widest uppercase text-sm mb-1">
                    {event.date} • {event.time}
                  </div>
                  <h2 className="text-2xl font-bold text-zinc-900 dark:text-white group-hover:text-red-600 transition-colors leading-tight">
                    {event.program}
                  </h2>
                  <p className="text-zinc-600 dark:text-zinc-500 font-medium">
                    {event.venue}{event.city ? `, ${event.city}` : ""}
                  </p>
                </div>
              </div>

              {event.link !== "#" && (
                <Link
                  href={event.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full md:w-auto text-center border border-zinc-900 dark:border-white px-2 sm:px-8 py-3 font-bold uppercase text-zinc-900 dark:text-white hover:bg-zinc-900 hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
                >
                  Get Tickets
                </Link>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-20 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white uppercase tracking-tight">
              No upcoming events
            </h3>
            <p className="text-zinc-500 mt-2">
              Check back soon for new dates and announcements.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}