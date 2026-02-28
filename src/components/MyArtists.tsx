"use client";

import { useState } from "react";
import { Artist, Chapter, User, UnifiedRequest } from "@/lib/db";
import { leaveArtist } from "@/lib/actions";
import ArtistCard from "./ArtistCard";
import ArtistModal from "./ArtistModal";

interface MyArtistsProps {
    artists: Artist[];
    chapters: Chapter[];
    currentUserId: string;
    availableMusicians: User[];
    pendingRequests?: UnifiedRequest[];
}

export default function MyArtists({ artists, chapters, currentUserId, availableMusicians, pendingRequests = [] }: MyArtistsProps) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    return (
        <section className="space-y-6">
            <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800 pb-4">
                <h2 className="text-2xl font-bold uppercase text-red-600 font-heading italic">My Artists</h2>
                <button
                    onClick={() => setIsCreateOpen(true)}
                    className="bg-zinc-900 text-white dark:bg-white dark:text-black font-bold uppercase py-2 px-2 sm:px-4 text-xs hover:bg-red-600 dark:hover:bg-red-600 dark:hover:text-white transition-colors tracking-widest"
                >
                    + Create New
                </button>
            </div>

            <div className="space-y-4">
                {artists.length === 0 ? (
                    <p className="text-zinc-500 italic">You are not a member of any artists yet.</p>
                ) : (
                    artists.map(artist => (
                        <ArtistCard
                            key={artist.id}
                            a={artist}
                            requests={pendingRequests}
                            chapters={chapters}
                            users={availableMusicians}
                            isAdmin={false}
                            actions={
                                <form action={leaveArtist.bind(null, artist.id)}>
                                    <button className="bg-transparent border border-zinc-300 dark:border-zinc-700 font-bold uppercase py-2 px-2 sm:px-6 hover:border-zinc-900 dark:hover:border-white transition-all text-xs tracking-widest">
                                        Leave
                                    </button>
                                </form>
                            }
                        />
                    ))
                )}
            </div>

            {isCreateOpen && (
                <ArtistModal
                    chapters={chapters}
                    availableMusicians={availableMusicians}
                    currentUserId={currentUserId}
                    onClose={() => setIsCreateOpen(false)}
                />
            )}
        </section>
    );
}
