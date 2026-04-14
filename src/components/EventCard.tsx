"use client";

import Image from "next/image";
import { Event } from "@/lib/db";
import { deleteEvent } from "@/lib/actions";
import EventForm from "@/components/EventForm";

const BUTTON_DANGER = "text-zinc-400 hover:text-red-600 font-bold uppercase text-[10px] tracking-widest transition-colors";

interface EventCardProps {
    event: Event;
}

export default function EventCard({ event }: EventCardProps) {
    return (
        <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-all group">
            <div className="px-2 py-6 sm:p-6 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-zinc-200 dark:bg-zinc-800 border-2 border-red-600/20 overflow-hidden relative shrink-0 grayscale-[0.5] group-hover:grayscale-0 transition-all duration-500">
                            {event.image && (
                                <Image
                                    src={event.image}
                                    alt={event.title}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />
                            )}
                        </div>
                        <div className="min-w-0">
                            <div className="text-red-600 font-bold uppercase text-[10px] tracking-widest leading-none mb-1">
                                {event.date} • {event.time}
                            </div>
                            <h3 className="text-xl font-black uppercase italic font-heading tracking-tighter leading-tight break-words">
                                {event.title}
                            </h3>
                            <p className="text-sm text-zinc-500 font-medium italic truncate">
                                {event.venue}{event.city ? `, ${event.city}` : ""}
                            </p>
                        </div>
                    </div>
                    <form action={deleteEvent.bind(null, event.id)} className="w-full sm:w-auto">
                        <button className={`${BUTTON_DANGER} w-full text-left sm:text-right`}>Delete Event</button>
                    </form>
                </div>
            </div>

            <div className="w-full">
                <details className="w-full group/edit">
                    <summary className="cursor-pointer bg-zinc-100 dark:bg-zinc-800/50 p-3 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-red-600 list-none border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center group-open/edit:bg-red-600 group-open/edit:text-white group-open/edit:hover:text-white transition-all">
                        <span>Edit Event</span>
                        <span className="group-open/edit:rotate-180 transition-transform text-lg">▾</span>
                    </summary>
                    <div className="px-2 py-8 sm:p-8 bg-white dark:bg-black border-t border-zinc-200 dark:border-zinc-800 animate-in fade-in slide-in-from-top-4 duration-300">
                        <EventForm event={event} />
                    </div>
                </details>
            </div>
        </div>
    );
}
