"use client";

import { Chapter, User, Artist, UnifiedRequest } from "@/lib/db";
import ArtistForm from "./ArtistForm";

interface ArtistModalProps {
    artist?: Artist;
    chapters: Chapter[];
    availableMusicians: User[];
    currentUserId: string;
    onClose: () => void;
    pendingEdit?: UnifiedRequest;
}

export default function ArtistModal({ artist, chapters, availableMusicians, currentUserId, onClose, pendingEdit }: ArtistModalProps) {
    const isEdit = !!artist;

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center px-2 py-4 sm:p-4">
            <div className="bg-white dark:bg-zinc-900 w-full max-w-lg px-2 py-8 sm:p-8 border border-zinc-200 dark:border-zinc-800 shadow-2xl relative overflow-y-auto max-h-[90vh]">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-black uppercase italic text-red-600 font-heading">
                        {isEdit ? "Edit" : "Create New"} Artist
                    </h2>
                    <button onClick={onClose} className="text-zinc-500 hover:text-red-600 transition-colors font-bold text-xl">
                        &times;
                    </button>
                </div>

                <ArtistForm
                    artist={artist}
                    chapters={chapters}
                    availableMusicians={availableMusicians}
                    currentUserId={currentUserId}
                    onClose={onClose}
                    pendingEdit={pendingEdit}
                />
            </div>
        </div>
    );
}
