"use client";

import { useState, useMemo } from "react";
import { User, Chapter, UnifiedRequest, Role } from "@/lib/db";
import { updateProfile, completeUserSetup } from "@/lib/actions";

interface ProfileFormProps {
    user: User;
    chapters: Chapter[];
    isModal?: boolean;
    pendingUserEdit?: UnifiedRequest;
    pendingRoleRequest?: UnifiedRequest;
    action?: (formData: FormData) => Promise<void>; // Accept custom action for admin use
    isAdmin?: boolean;
    reviewRequestId?: string; // Add this
}

export default function ProfileForm({
    user,
    chapters,
    isModal = false,
    pendingUserEdit,
    pendingRoleRequest,
    action: customAction,
    isAdmin = false,
    reviewRequestId // Add this
}: ProfileFormProps) {
    const [role, setRole] = useState(user.role);
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
            role !== user.role ||
            location !== (user.location || "") ||
            bio !== (user.bio || "") ||
            chaptersChanged ||
            directorChaptersChanged;
    }, [name, role, location, bio, selectedChapters, directorChapters, user]);

    const isPending = !!pendingUserEdit || !!pendingRoleRequest;

    const INPUT = "w-full bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 p-3 outline-none focus:border-red-600 transition-colors text-sm disabled:bg-zinc-100 dark:disabled:bg-zinc-900 disabled:text-zinc-500";
    const LABEL = "block text-[10px] font-bold uppercase text-zinc-400 mb-1 tracking-widest";
    const CHECKBOX_LABEL = "flex items-center gap-2 p-3 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black cursor-pointer hover:border-red-600 transition-colors text-[10px] font-bold uppercase tracking-widest";

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        setError(null);
        if (role === 'Chapter Director' && directorChapters.length === 0) {
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
            action={customAction || (isModal ? completeUserSetup : updateProfile)}
            className={`space-y-6 ${isModal ? "" : "mt-6"}`}
        >
            <input type="hidden" name="id" value={user.id} />
            {reviewRequestId && <input type="hidden" name="reviewRequestId" value={reviewRequestId} />}
            {error && (
                <div className="p-4 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-bold uppercase tracking-wide">
                    ⚠️ {error}
                </div>
            )}

            {isPending && !isModal && !reviewRequestId && (
                <div className="bg-red-50 dark:bg-red-900/10 border-l-4 border-red-600 p-4 mb-6">
                    <p className="text-sm font-medium italic text-zinc-800 dark:text-zinc-200">
                        A profile update or role change is currently pending approval.
                        The form is disabled until the request is processed.
                    </p>
                </div>
            )}

            <fieldset disabled={isPending && !reviewRequestId} className="space-y-6">
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
                    <div>
                        <label className={LABEL}>Account Role</label>
                        <select
                            name="role"
                            value={role}
                            onChange={(e) => setRole(e.target.value as Role)}
                            className={INPUT}
                        >
                            <option value="Audience">Audience</option>
                            <option value="Musician">Musician</option>
                            <option value="Chapter Director">Chapter Director</option>
                            {user.role === "Admin" && <option value="Admin" disabled>Admin</option>}
                        </select>
                    </div>
                </div>

                {role === 'Chapter Director' && (
                    <div className="p-6 bg-red-50 dark:bg-red-900/10 border-2 border-red-600/20 space-y-4">
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
                        className={`flex-1 font-bold uppercase py-4 transition-all tracking-widest text-sm ${isPending && !reviewRequestId
                            ? "bg-zinc-200 text-zinc-400 cursor-not-allowed"
                            : (!isDirty && !reviewRequestId && !isModal)
                                ? "bg-zinc-200 text-zinc-400 cursor-not-allowed"
                                : "bg-red-600 text-white hover:bg-red-700 active:scale-[0.98]"
                            }`}
                        disabled={(!isDirty && !reviewRequestId && !isModal) || (isPending && !reviewRequestId)}
                    >
                        {reviewRequestId ? "Approve & Save Changes" : (isAdmin ? "Save User Changes" : (isPending ? "Request Pending" : (isModal ? "Complete Setup" : "Request Changes")))}
                    </button>
                    {reviewRequestId && (
                        <button
                            type="button"
                            onClick={() => {
                                const formData = new FormData();
                                formData.append("requestId", reviewRequestId);
                                import("@/lib/actions").then(m => m.rejectUnifiedRequest(reviewRequestId));
                            }}
                            className="bg-zinc-900 text-white dark:bg-white dark:text-black font-bold uppercase py-4 px-8 hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-all text-sm tracking-widest active:scale-[0.98]"
                        >
                            Reject Request
                        </button>
                    )}
                </div>
            </fieldset>
        </form>
    );
}
