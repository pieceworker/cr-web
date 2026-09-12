import Link from "next/link";
import Image from "next/image";
import { env } from "cloudflare:workers";
import { Event } from "@/lib/db";

export const dynamic = "force-dynamic";

interface EventItem {
  id: string;
  date: string;
  time: string;
  venue: string;
  city: string;
  program: string;
  link: string;
  image: string | null;
  dateObj: Date;
  type: 'admin';
}

function EventCardItem({ event, isPast }: { event: EventItem; isPast: boolean }) {
  return (
    <div
      className={`group border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 relative overflow-hidden ${
        isPast ? "opacity-90 hover:opacity-100" : ""
      }`}
    >
      {/* Main Card Link */}
      <Link 
        href={`/events/${event.id}`} 
        className="absolute inset-0 z-0"
        aria-label={`View details for ${event.program}`}
      />

      <div className="flex-1 flex flex-col md:flex-row items-start md:items-center gap-4 p-4 sm:p-6 relative z-10 pointer-events-none">
        {/* Thumbnail */}
        <div className="w-24 h-24 sm:w-32 sm:h-32 bg-zinc-100 dark:bg-zinc-800 border-2 border-red-600/10 overflow-hidden relative shrink-0 grayscale-[0.5] group-hover:grayscale-0 transition-all duration-500 shadow-sm">
          {event.image ? (
            <Image
              src={event.image}
              alt={event.program}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-300 dark:text-zinc-700">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {isPast && (
              <span className="bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[9px] px-2 py-0.5 font-black uppercase tracking-widest">
                PAST
              </span>
            )}
            <span className={`font-bold tracking-widest uppercase text-xs ${isPast ? "text-zinc-400" : "text-red-600"}`}>
              {event.date} • {event.time}
            </span>
          </div>
          <h2 className="text-2xl font-black uppercase italic font-heading tracking-tighter text-zinc-900 dark:text-white group-hover:text-red-600 transition-colors leading-tight">
            {event.program}
          </h2>
          <p className="text-zinc-600 dark:text-zinc-500 font-medium italic">
            {event.venue}{event.city ? `, ${event.city}` : ""}
          </p>
        </div>
      </div>

      {!isPast && event.link && event.link !== "#" ? (
        <div className="relative z-20 px-4 pb-4 md:p-6 md:pl-0">
          <Link
            href={event.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full md:w-auto text-center border border-zinc-900 dark:border-white px-8 py-3 font-bold uppercase text-xs tracking-widest text-zinc-900 dark:text-white hover:bg-zinc-900 hover:text-white dark:hover:bg-white dark:hover:text-black transition-all whitespace-nowrap"
          >
            Get Tickets
          </Link>
        </div>
      ) : isPast ? (
        <div className="relative z-20 px-4 pb-4 md:p-6 md:pl-0 self-end md:self-center">
          <span className="inline-block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 group-hover:text-red-600 transition-colors">
            View Details ↗
          </span>
        </div>
      ) : null}
    </div>
  );
}

export default async function EventsPage() {
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

  // Fetch admin-created events from D1
  const eventsRes = await db.prepare("SELECT * FROM events").all();
  const dbEvents = eventsRes.results as unknown as Event[] || [];

  const allEvents: EventItem[] = dbEvents.map(e => ({
    id: e.id,
    date: formatDate(e.date),
    time: formatTime(e.time),
    venue: e.venue,
    city: e.city || "",
    program: e.title,
    link: e.link || "#",
    image: e.image || null,
    dateObj: new Date(e.date + "T00:00:00"),
    type: 'admin' as const
  }));

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const upcomingEvents = allEvents
    .filter(event => event.dateObj >= now)
    .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());

  const pastEvents = allEvents
    .filter(event => event.dateObj < now)
    .sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());

  return (
    <div className="flex flex-col gap-12 py-10 px-2 sm:px-6 max-w-6xl mx-auto transition-colors">
      <section className="text-center space-y-4">
        <h1 className="text-4xl md:text-6xl font-black uppercase italic text-red-600">
          Events
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 italic">
          &ldquo;Chamber music in neighborhood hangouts.&rdquo;
        </p>
      </section>

      {/* Upcoming Events */}
      <section className="space-y-6">
        <div className="border-b-2 border-black dark:border-white pb-2 flex justify-between items-end">
          <h2 className="text-2xl sm:text-3xl font-black uppercase italic font-heading tracking-tighter text-zinc-900 dark:text-white">
            Upcoming <span className="text-red-600">Events</span>
          </h2>
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">
            {upcomingEvents.length} {upcomingEvents.length === 1 ? 'event' : 'events'}
          </span>
        </div>

        <div className="space-y-4">
          {upcomingEvents.length > 0 ? (
            upcomingEvents.map(event => (
              <EventCardItem key={event.id} event={event} isPast={false} />
            ))
          ) : (
            <div className="text-center py-16 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white uppercase tracking-tight">
                No upcoming events
              </h3>
              <p className="text-zinc-500 mt-1 text-sm">
                Check back soon for new dates and announcements.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Past Events */}
      {pastEvents.length > 0 && (
        <section className="space-y-6">
          <div className="border-b-2 border-zinc-200 dark:border-zinc-800 pb-2 flex justify-between items-end">
            <h2 className="text-2xl sm:text-3xl font-black uppercase italic font-heading tracking-tighter text-zinc-500">
              Past <span className="text-zinc-900 dark:text-white">Events</span>
            </h2>
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">
              {pastEvents.length} {pastEvents.length === 1 ? 'event' : 'events'}
            </span>
          </div>

          <div className="space-y-4">
            {pastEvents.map(event => (
              <EventCardItem key={event.id} event={event} isPast={true} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}