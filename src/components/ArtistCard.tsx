"use client";

import Image from "next/image";
import { Artist, UnifiedRequest, Chapter, User } from "@/lib/db";
import { deleteArtist, updateArtist } from "@/lib/actions";
import ArtistForm from "@/components/ArtistForm";

const BUTTON_SECONDARY = "bg-zinc-900 text-white dark:bg-white dark:text-black font-bold uppercase py-2 px-6 hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-all text-xs tracking-widest active:scale-[0.98]";
const SUMMARY = "cursor-pointer font-bold uppercase tracking-widest text-zinc-400 hover:text-red-600 transition-colors list-none flex items-center gap-2";

interface ArtistCardProps {
    a: Artist;
    requests: UnifiedRequest[];
    chapters: Chapter[];
    users: User[];
    isAdmin?: boolean;
    actions?: React.ReactNode;
}

export default function ArtistCard({ a, requests, chapters, users, isAdmin = false, actions }: ArtistCardProps) {
    const pendingAdd = requests.find(r => r.type === 'ARTIST_ADD' && r.target_id === a.id);
    const pendingEdit = requests.find(r => r.type === 'ARTIST_EDIT' && r.target_id === a.id);
    const isPending = !!pendingAdd || !!pendingEdit;

    const mergedArtist = { ...a };
    if (pendingEdit) {
        try {
            const data = JSON.parse(pendingEdit.data || '{}');
            Object.assign(mergedArtist, data);
            if (Array.isArray(data.chapters)) mergedArtist.chapters = JSON.stringify(data.chapters);
            if (Array.isArray(data.members)) mergedArtist.members = JSON.stringify(data.members);
        } catch { }
    } else if (pendingAdd) {
        try {
            const data = JSON.parse(pendingAdd.data || '{}');
            Object.assign(mergedArtist, data);
            if (Array.isArray(data.chapters)) mergedArtist.chapters = JSON.stringify(data.chapters);
            if (Array.isArray(data.members)) mergedArtist.members = JSON.stringify(data.members);
        } catch { }
    }

    // For users, show the original artist data if pending to avoid "determining the outcome"
    const displayArtist = (isAdmin || !isPending) ? mergedArtist : a;

    // Determine which image to show based on preference
    const owner = users.find(u => u.id === displayArtist.owner_id);
    const displayImage = displayArtist.image_preference === 'google' ? owner?.image : displayArtist.image;

    return (
        <div className={`bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 flex flex-col md:flex-row gap-8 items-start transition-all ${isPending && !isAdmin ? 'opacity-75 grayscale-[0.2]' : ''}`}>
            <div className="w-32 h-32 bg-zinc-200 dark:bg-zinc-800 border-2 border-red-600/20 overflow-hidden relative shrink-0 grayscale-[0.5] group-hover:grayscale-0 transition-all duration-500">
                {displayImage && <Image src={displayImage} alt={displayArtist.name} fill className="object-cover" unoptimized />}
            </div>
            <div className="flex-1 space-y-2 w-full">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-3">
                            <h3 className="text-3xl font-black uppercase italic font-heading tracking-tighter leading-none">{displayArtist.name}</h3>
                            {a.status === 'PENDING' && <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 text-[10px] font-bold uppercase px-2 py-0.5 tracking-tighter">New Profile</span>}
                            {pendingEdit && <span className="bg-red-100 dark:bg-red-900/30 text-red-600 text-[10px] font-bold uppercase px-2 py-0.5 tracking-tighter">Edit Pending</span>}
                        </div>
                        <p className="text-xs font-bold uppercase text-zinc-500 tracking-[0.2em] mt-1">{displayArtist.location}</p>
                    </div>
                    <div className="bg-zinc-200 dark:bg-zinc-800 px-3 py-1 text-[10px] font-black uppercase tracking-widest">
                        {a.status}
                    </div>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 italic line-clamp-2">{displayArtist.bio}</p>

                <div className="mt-4 space-y-2">
                    <div className="flex flex-wrap gap-2">
                        <span className="text-[10px] font-bold uppercase text-zinc-400 tracking-widest">Chapters:</span>
                        {(displayArtist.chapters ? JSON.parse(displayArtist.chapters) : []).map((id: string) => {
                            const chapter = chapters.find(c => c.id === id);
                            return chapter ? (
                                <span key={id} className="text-[10px] font-bold uppercase bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-zinc-600 dark:text-zinc-300">
                                    {chapter.location}
                                </span>
                            ) : null;
                        })}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <span className="text-[10px] font-bold uppercase text-zinc-400 tracking-widest">Members:</span>
                        {(displayArtist.members ? JSON.parse(displayArtist.members) : []).map((id: string) => {
                            const member = users.find(u => u.id === id);
                            return member ? (
                                <span key={id} className="text-[10px] font-bold uppercase bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-zinc-600 dark:text-zinc-300">
                                    {member.name}
                                </span>
                            ) : null;
                        })}
                    </div>
                </div>

                {(isAdmin || actions) && (
                    <div className="flex flex-wrap gap-4 mt-6">
                        {isAdmin && (!pendingAdd && !pendingEdit) && (
                            <form action={deleteArtist.bind(null, a.id)} className="self-end">
                                <button className={BUTTON_SECONDARY}>Remove</button>
                            </form>
                        )}
                        {actions}
                    </div>
                )}

                <div className="w-full mt-6">
                    {pendingEdit && (
                        <div className="mb-6 p-6 border-2 border-red-600 bg-red-50 dark:bg-red-900/10">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-red-600 mb-4 italic">Pending Artist Edit Request</h4>
                            <div className={!isAdmin ? "pointer-events-none" : ""}>
                                <ArtistForm
                                    artist={mergedArtist}
                                    chapters={chapters}
                                    availableMusicians={users}
                                    currentUserId={a.owner_id}
                                    isAdmin={isAdmin}
                                    action={updateArtist}
                                    reviewRequestId={pendingEdit.id}
                                />
                            </div>
                        </div>
                    )}
                    {pendingAdd && (
                        <div className="mb-6 p-6 border-2 border-red-600 bg-red-50 dark:bg-red-900/10">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-red-600 mb-4 italic">Pending New Artist Approval</h4>
                            <div className={!isAdmin ? "pointer-events-none" : ""}>
                                <ArtistForm
                                    artist={mergedArtist}
                                    chapters={chapters}
                                    availableMusicians={users}
                                    currentUserId={a.owner_id}
                                    isAdmin={isAdmin}
                                    action={updateArtist}
                                    reviewRequestId={pendingAdd.id}
                                />
                            </div>
                        </div>
                    )}
                    {!pendingEdit && !pendingAdd && (
                        <details className="w-full group">
                            <summary className={SUMMARY}>
                                Edit Artist
                                <span className="group-open:rotate-180 transition-transform text-lg">▾</span>
                            </summary>
                            <div className="mt-4 p-6 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black">
                                <ArtistForm
                                    artist={mergedArtist}
                                    chapters={chapters}
                                    availableMusicians={users}
                                    currentUserId={a.owner_id}
                                    isAdmin={isAdmin}
                                    action={updateArtist}
                                />
                            </div>
                        </details>
                    )}
                </div>
            </div>
        </div>
    );
}
