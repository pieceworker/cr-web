"use client";

import { useState, useMemo } from "react";
import { Artist, Chapter, User, UnifiedRequest } from "@/lib/db";
import { createArtist, updateArtist } from "@/lib/actions";

interface ArtistFormProps {
    artist?: Artist; // Optional for creation
    chapters: Chapter[];
    availableMusicians: User[];
    currentUserId: string;
    onClose?: () => void; // Optional for modal use
    pendingEdit?: UnifiedRequest;
    isAdmin?: boolean;
    action?: (formData: FormData) => Promise<void>;
    reviewRequestId?: string; // Add this
}

export default function ArtistForm({
    artist,
    chapters,
    availableMusicians,
    currentUserId,
    onClose,
    pendingEdit,
    isAdmin = false,
    action: customAction,
    reviewRequestId // Add this
}: ArtistFormProps) {
    const isEdit = !!artist;
    const isPending = !!pendingEdit;

    // Parse pending data if available
    const pendingData = pendingEdit?.data ? JSON.parse(pendingEdit.data) : null;

    const [selectedChapters, setSelectedChapters] = useState<string[]>(() => {
        if (pendingData?.chapters) return pendingData.chapters;
        try {
            return artist?.chapters ? JSON.parse(artist.chapters) : [];
        } catch { return []; }
    });

    const [selectedMembers, setSelectedMembers] = useState<string[]>(() => {
        if (pendingData?.members) return pendingData.members;
        try {
            return artist?.members ? JSON.parse(artist.members) : [currentUserId];
        } catch { return [currentUserId]; }
    });

    const [name, setName] = useState(pendingData?.name ?? artist?.name ?? "");
    const [location, setLocation] = useState(pendingData?.location ?? artist?.location ?? "");
    const [bio, setBio] = useState(pendingData?.bio ?? artist?.bio ?? "");
    const [error, setError] = useState<string | null>(null);

    const isDirty = useMemo(() => {
        const initialChapters = (() => {
            if (pendingData?.chapters) return pendingData.chapters;
            try { return artist?.chapters ? JSON.parse(artist.chapters) : []; }
            catch { return []; }
        })();
        const initialMembers = (() => {
            if (pendingData?.members) return pendingData.members;
            try { return artist?.members ? JSON.parse(artist.members) : [currentUserId]; }
            catch { return [currentUserId]; }
        })();

        const chaptersChanged = JSON.stringify([...selectedChapters].sort()) !== JSON.stringify([...initialChapters].sort());
        const membersChanged = JSON.stringify([...selectedMembers].sort()) !== JSON.stringify([...initialMembers].sort());

        return name !== (pendingData?.name ?? artist?.name ?? "") ||
            location !== (pendingData?.location ?? artist?.location ?? "") ||
            bio !== (pendingData?.bio ?? artist?.bio ?? "") ||
            chaptersChanged ||
            membersChanged;
    }, [name, location, bio, selectedChapters, selectedMembers, artist, pendingData, currentUserId]);

    const INPUT = "w-full bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 p-3 outline-none focus:border-red-600 transition-colors text-sm disabled:bg-zinc-100 dark:disabled:bg-zinc-900 disabled:text-zinc-500";
    const LABEL = "block text-[10px] font-bold uppercase text-zinc-400 mb-1 tracking-widest";
    const CHECKBOX_LABEL = "flex items-center gap-2 p-3 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black cursor-pointer hover:border-red-600 transition-colors text-[10px] font-bold uppercase tracking-widest";

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        setError(null);
        if (selectedChapters.length === 0) {
            e.preventDefault();
            setError("Please select at least one chapter.");
        }
    };

    const musiciansToShow = isAdmin ? availableMusicians : availableMusicians.filter(u => u.id !== currentUserId);

    return (
        <form
            onSubmit={handleSubmit}
            action={async (formData) => {
                if (customAction) {
                    await customAction(formData);
                } else if (isEdit) {
                    await updateArtist(formData);
                } else {
                    await createArtist(formData);
                }
                if (onClose) onClose();
            }}
            className="space-y-6"
        >
            {artist && <input type="hidden" name="id" value={artist.id} />}
            {reviewRequestId && <input type="hidden" name="reviewRequestId" value={reviewRequestId} />}
            {artist?.image && <input type="hidden" name="image" value={artist.image} />}
            {isAdmin && <input type="hidden" name="isAdminAction" value="true" />}

            {error && (
                <div className="p-4 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-bold uppercase tracking-wide">
                    ⚠️ {error}
                </div>
            )}

            {isPending && !isAdmin && !reviewRequestId && (
                <div className="bg-red-50 dark:bg-red-900/10 border-l-4 border-red-600 p-4 mb-6">
                    <p className="text-sm font-medium italic text-zinc-800 dark:text-zinc-200">
                        An edit for this artist is currently pending approval.
                        The form shows the proposed changes.
                    </p>
                </div>
            )}

            <fieldset disabled={isPending && !isAdmin && !reviewRequestId} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className={LABEL}>Artist/Group Name</label>
                        <input
                            name="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={INPUT}
                            required
                        />
                    </div>
                    <div>
                        <label className={LABEL}>Home Location</label>
                        <input
                            name="location"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className={INPUT}
                            required
                        />
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <label className={LABEL}>Chapters</label>
                        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-black">
                            {chapters.map(c => (
                                <label key={c.id} className={CHECKBOX_LABEL}>
                                    <input
                                        type="checkbox"
                                        name="chapters"
                                        value={c.id}
                                        checked={selectedChapters.includes(c.id)}
                                        onChange={(e) => {
                                            if (e.target.checked) setSelectedChapters([...selectedChapters, c.id]);
                                            else setSelectedChapters(selectedChapters.filter(id => id !== c.id));
                                        }}
                                        className="accent-red-600"
                                    />
                                    <span>{c.location}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-4">
                        <label className={LABEL}>Members (Optional)</label>
                        <div className="grid gap-2 max-h-48 overflow-y-auto p-2 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-black">
                            {!isAdmin && (
                                <div className="flex items-center gap-3 p-2 bg-zinc-100 dark:bg-zinc-900/50 opacity-60">
                                    <input type="checkbox" checked readOnly className="accent-red-600 w-4 h-4 cursor-not-allowed" />
                                    <span className="text-[10px] font-bold uppercase tracking-wide">You (Owner)</span>
                                    <input type="hidden" name="members" value={currentUserId} />
                                </div>
                            )}
                            {musiciansToShow.map(m => (
                                <label key={m.id} className={CHECKBOX_LABEL}>
                                    <input
                                        type="checkbox"
                                        name="members"
                                        value={m.id}
                                        checked={selectedMembers.includes(m.id)}
                                        onChange={(e) => {
                                            if (e.target.checked) setSelectedMembers([...selectedMembers, m.id]);
                                            else setSelectedMembers(selectedMembers.filter(id => id !== m.id));
                                        }}
                                        className="accent-red-600"
                                    />
                                    <span>{m.name}</span>
                                </label>
                            ))}
                            {musiciansToShow.length === 0 && isAdmin && (
                                <p className="text-[10px] text-zinc-500 italic p-2 font-bold uppercase tracking-widest leading-relaxed">No musicians found.</p>
                            )}
                        </div>
                    </div>
                </div>

                <div>
                    <label className={LABEL}>Biography</label>
                    <textarea
                        name="bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className={`${INPUT} h-32`}
                        required
                    />
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <button
                        type="submit"
                        className={`flex-1 font-bold uppercase py-4 transition-all tracking-widest text-sm ${isPending && !isAdmin && !reviewRequestId
                            ? "bg-zinc-200 text-zinc-400 cursor-not-allowed"
                            : (!isDirty && !reviewRequestId)
                                ? "bg-zinc-200 text-zinc-400 cursor-not-allowed"
                                : "bg-red-600 text-white hover:bg-red-700 active:scale-[0.98]"
                            }`}
                        disabled={(!isDirty && !reviewRequestId) || (isPending && !isAdmin && !reviewRequestId)}
                    >
                        {reviewRequestId ? "Approve & Save Changes" : (isAdmin ? (isEdit ? "Save Artist Changes" : "Create Artist") : (isPending ? "Request Pending" : (isEdit ? "Request Profile Update" : "Create Artist")))}
                    </button>
                    {reviewRequestId && (
                        <button
                            type="button"
                            onClick={() => {
                                import("@/lib/actions").then(m => m.rejectUnifiedRequest(reviewRequestId));
                            }}
                            className="bg-zinc-900 text-white dark:bg-white dark:text-black font-bold uppercase py-4 px-8 hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-all text-sm tracking-widest active:scale-[0.98]"
                        >
                            Reject Request
                        </button>
                    )}
                </div>
            </fieldset>
        </form >
    );
}
