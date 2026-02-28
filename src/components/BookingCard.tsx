"use client";

import Image from "next/image";
import Link from "next/link";
import { Booking, BookingDate, UnifiedRequest } from "@/lib/db";
import { deleteBooking, toggleBookingDatePublic } from "@/lib/actions";
import BookingForm from "@/components/BookingForm";

const BUTTON_SECONDARY = "bg-zinc-900 text-white dark:bg-white dark:text-black font-bold uppercase py-2 px-6 hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-all text-xs tracking-widest active:scale-[0.98]";

interface BookingCardProps {
    b: Booking & { user_name: string; user_image?: string, image?: string | null, dates: BookingDate[] };
    requests: UnifiedRequest[];
    isAdmin?: boolean;
}

export default function BookingCard({ b, requests, isAdmin = false }: BookingCardProps) {
    const pendingInquiry = requests.find(r => r.type === 'BOOKING_INQUIRY' && r.target_id === b.id);
    const pendingEdit = requests.find(r => r.type === 'BOOKING_EDIT' && r.target_id === b.id);
    const isPending = !!pendingInquiry || !!pendingEdit;

    return (
        <div className={`bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 space-y-8 relative group overflow-hidden transition-all ${isPending && !isAdmin ? 'opacity-75 grayscale-[0.2]' : ''}`}>
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-600"></div>

            {/* Inquiry Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
                <div className="flex gap-6 items-start">
                    <div className="w-16 h-16 rounded-full border-2 border-red-600 overflow-hidden relative grayscale-[0.5] group-hover:grayscale-0 transition-all duration-500 shrink-0">
                        {(b.image_preference === 'google' ? b.user_image : (b.image || b.user_image)) && (
                            <Image
                                src={b.image_preference === 'google' ? b.user_image! : (b.image || b.user_image!)}
                                alt={b.user_name || 'User'}
                                fill
                                className="object-cover"
                                unoptimized
                            />
                        )}
                    </div>
                    <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-3">
                            <div className={`text-[10px] font-black uppercase px-2 py-0.5 tracking-widest ${b.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                {b.status}
                            </div>
                            <h3 className="text-2xl font-black uppercase italic font-heading tracking-tighter break-words">{b.name}</h3>
                            {pendingEdit && <span className="text-[8px] font-black bg-red-600 text-white px-2 py-0.5 tracking-tighter uppercase italic">Edit Pending</span>}
                        </div>
                        <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest break-all">{b.email} {b.phone ? `• ${b.phone}` : ''}</p>
                        <p className="text-[10px] text-red-600 font-black uppercase tracking-widest">
                            Requested by <Link href={`/profile/${b.created_by}`} className="hover:underline">{b.user_name}</Link>
                        </p>
                    </div>
                </div>

                {isAdmin && (
                    <div className="flex gap-3">
                        <form action={deleteBooking.bind(null, b.id)}>
                            <button className={BUTTON_SECONDARY}>Remove</button>
                        </form>
                    </div>
                )}
            </div>

            {/* Date Cards */}
            <div className="grid md:grid-cols-2 gap-6">
                {b.dates.map((date) => (
                    <div key={date.id} className="bg-white dark:bg-black p-6 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-sm relative">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <p className="font-black text-lg uppercase italic text-red-600">{date.date}</p>
                                <p className="text-xs font-bold uppercase tracking-widest">{date.time} ({date.duration || 'N/A'})</p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 tracking-widest border ${date.is_public ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-transparent text-zinc-400 border-zinc-200'}`}>
                                    {date.is_public ? 'Public on Events' : 'Private'}
                                </span>
                                {isAdmin && (
                                    <form action={async () => {
                                        await toggleBookingDatePublic(date.id, !date.is_public);
                                    }}>
                                        <button className="text-[10px] font-bold uppercase text-red-600 hover:underline">
                                            {date.is_public ? 'Make Private' : 'Make Public'}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-bold uppercase tracking-tight break-words">{date.event_type} @ {date.location}</p>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400 italic">&ldquo;{date.description}&rdquo;</p>
                            <p className="text-xs font-bold text-zinc-500">Budget: {date.budget || 'Not specified'}</p>
                        </div>
                    </div>
                ))}
            </div>

            {b.questions && (
                <div className="bg-zinc-100 dark:bg-zinc-800/50 p-6 border-l-4 border-zinc-300 dark:border-zinc-700">
                    <p className="text-[10px] font-bold uppercase text-zinc-400 mb-2 tracking-widest">Client Questions/Comments</p>
                    <p className="text-sm text-zinc-700 dark:text-zinc-300 font-medium italic">&ldquo;{b.questions}&rdquo;</p>
                </div>
            )}

            <div className={`w-full ${(pendingInquiry || pendingEdit) && !isAdmin ? 'pointer-events-none' : ''}`}>
                {pendingInquiry && (
                    <div className="p-6 border-2 border-red-600 bg-red-50 dark:bg-red-900/10">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-red-600 mb-4 italic">Pending Booking Inquiry Approval</h4>
                        <BookingForm booking={b} isAdmin={isAdmin} reviewRequestId={isAdmin ? pendingInquiry.id : undefined} />
                    </div>
                )}
                {pendingEdit && (
                    <div className="p-6 border-2 border-red-600 bg-red-50 dark:bg-red-900/10">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-red-600 mb-4 italic">Pending Booking Edit Request</h4>
                        <BookingForm booking={b} pendingEdit={pendingEdit} isAdmin={isAdmin} reviewRequestId={isAdmin ? pendingEdit.id : undefined} />
                    </div>
                )}
                {!pendingInquiry && !pendingEdit && (
                    <details className="group">
                        <summary className="cursor-pointer bg-zinc-100 dark:bg-zinc-800/50 p-3 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-red-600 list-none border border-zinc-200 dark:border-zinc-800 flex justify-between items-center group-open:bg-red-600 group-open:text-white group-open:hover:text-white transition-all">
                            Edit Booking
                            <span className="group-open:rotate-180 transition-transform text-lg">▾</span>
                        </summary>
                        <div className="mt-8 p-8 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 animate-in fade-in slide-in-from-top-4 duration-300">
                            <BookingForm booking={b} isAdmin={isAdmin} />
                        </div>
                    </details>
                )}
            </div>
        </div>
    );
}
