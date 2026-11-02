"use client";

import { useState, useMemo } from "react";
import { User, Chapter, UnifiedRequest } from "@/lib/db";
import { updateProfile } from "@/lib/actions";

interface ProfileFormProps {
    user: User;
    chapters: Chapter[];
    pendingUserEdit?: UnifiedRequest;
    pendingRoleRequest?: UnifiedRequest;
    action?: (formData: FormData) => Promise<void>; // Accept custom action for admin use
    isAdmin?: boolean;
    reviewRequestId?: string; // Add this
}

export default function ProfileForm({
    user,
    chapters,
    pendingUserEdit,
    pendingRoleRequest,
    action: customAction,
    isAdmin = false,
    reviewRequestId // Add this
}: ProfileFormProps) {
    const [selectedChapters, setSelectedChapters] = useState<string[]>(() => {
        try {
            return user.chapters ? JSON.parse(user.chapters) : [];
        } catch { return []; }
    });
    const [directorChapters, setDirectorChapters] = useState<string[]>(() => {
        try {
            return user.director_chapters ? JSON.parse(user.director_chapters) : [];
        } catch { return []; }
    });
    const [name, setName] = useState(user.name || "");
    const [location, setLocation] = useState(user.location || "");
    const [bio, setBio] = useState(user.bio || "");
    const [error, setError] = useState<string | null>(null);

    const isDirty = useMemo(() => {
        const initialChapters = (() => {
            try { return user.chapters ? JSON.parse(user.chapters) : []; }
            catch { return []; }
        })();
        const initialDirectorChapters = (() => {
            try { return user.director_chapters ? JSON.parse(user.director_chapters) : []; }
            catch { return []; }
        })();

        const chaptersChanged = JSON.stringify([...selectedChapters].sort()) !== JSON.stringify([...initialChapters].sort());
        const directorChaptersChanged = JSON.stringify([...directorChapters].sort()) !== JSON.stringify([...initialDirectorChapters].sort());

        return name !== (user.name || "") ||
            location !== (user.location || "") ||
            bio !== (user.bio || "") ||
            chaptersChanged ||
            directorChaptersChanged;
    }, [name, location, bio, selectedChapters, directorChapters, user]);

    const INPUT = "w-full bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 p-3 outline-none focus:border-red-600 transition-colors text-sm disabled:bg-zinc-100 dark:disabled:bg-zinc-900 disabled:text-zinc-500";
    const LABEL = "block text-[10px] font-bold uppercase text-zinc-400 mb-1 tracking-widest";
    const CHECKBOX_LABEL = "flex items-center gap-2 p-3 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black cursor-pointer hover:border-red-600 transition-colors text-[10px] font-bold uppercase tracking-widest";

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        setError(null);
        if (user.role === 'Chapter Director' && directorChapters.length === 0) {
            e.preventDefault();
            setError("Chapter Directors must select at least one chapter as director.");
        }
        if (selectedChapters.length === 0) {
            e.preventDefault();
            setError("Please select at least one chapter you follow.");
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            action={customAction || updateProfile}
            className={`space-y-6`}
        >
            <input type="hidden" name="id" value={user.id} />
            {reviewRequestId && <input type="hidden" name="reviewRequestId" value={reviewRequestId} />}
            {error && (
                <div className="px-2 py-4 sm:p-4 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-bold uppercase tracking-wide">
                    ⚠️ {error}
                </div>
            )}

            <fieldset className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className={LABEL}>Display Name</label>
                        <input
                            name="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={INPUT}
                            required
                        />
                    </div>
                </div>
                {user.role === 'Chapter Director' && (
                    <div className="px-2 py-6 sm:p-6 bg-red-50 dark:bg-red-900/10 border-2 border-red-600/20 space-y-4">
                        <label className={`${LABEL} text-red-600`}>Directorship Chapters (Min 1)</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {chapters.map(c => (
                                <label key={c.id} className={CHECKBOX_LABEL}>
                                    <input
                                        type="checkbox"
                                        name="director_chapters"
                                        value={c.id}
                                        checked={directorChapters.includes(c.id)}
                                        onChange={(e) => {
                                            if (e.target.checked) setDirectorChapters([...directorChapters, c.id]);
                                            else setDirectorChapters(directorChapters.filter((id: string) => id !== c.id));
                                        }}
                                        className="accent-red-600"
                                    />
                                    <span>{c.location}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className={LABEL}>Location</label>
                        <input
                            name="location"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className={INPUT}
                            required
                        />
                    </div>
                    <div className="space-y-4">
                        <label className={LABEL}>Chapters You Follow</label>
                        <div className="grid grid-cols-1 gap-2 p-2 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-black">
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
                        className={`flex-1 font-bold uppercase py-4 transition-all tracking-widest text-sm disabled:opacity-50 disabled:cursor-not-allowed ${!isDirty ? "bg-zinc-200 text-zinc-400" : "bg-red-600 text-white hover:bg-red-700 active:scale-[0.98]"}`}
                        disabled={!isDirty}
                    >
                        {isAdmin && reviewRequestId ? "Approve & Save Changes" : (isAdmin ? "Save Changes" : ("Save Changes"))}
                    </button>
                    {isAdmin && reviewRequestId && (
                        <button
                            type="button"
                            onClick={() => {
                                const formData = new FormData();
                                formData.append("requestId", reviewRequestId);
                                import("../lib/actions").then(m => m.rejectUnifiedRequest(reviewRequestId));
                            }}
                            className="bg-zinc-900 text-white dark:bg-white dark:text-black font-bold uppercase py-4 px-2 sm:px-8 hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-all text-sm tracking-widest active:scale-[0.98]"
                        >
                            Reject Request
                        </button>
                    )}
                </div>
            </fieldset>
        </form>
    );
}
