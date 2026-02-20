"use client";

import { useState, useMemo } from "react";
import { Chapter } from "@/lib/db";
import { updateChapter } from "@/lib/actions";

interface ChapterEditFormProps {
    chapter: Chapter;
}

export default function ChapterEditForm({ chapter }: ChapterEditFormProps) {
    const [location, setLocation] = useState(chapter.location);
    const [bio, setBio] = useState(chapter.bio || "");
    const [image, setImage] = useState(chapter.image || "");

    const isDirty = useMemo(() => {
        return location !== chapter.location ||
            bio !== (chapter.bio || "") ||
            image !== (chapter.image || "");
    }, [location, bio, image, chapter]);

    const INPUT = "w-full bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 p-3 outline-none focus:border-red-600 transition-colors text-sm";
    const BUTTON_PRIMARY = "bg-zinc-900 text-white dark:bg-white dark:text-black font-bold uppercase py-2 px-6 hover:bg-red-600 dark:hover:bg-red-600 dark:hover:text-white transition-all text-xs tracking-widest disabled:opacity-50 disabled:cursor-not-allowed";

    return (
        <form action={updateChapter} className="mt-4 space-y-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <input type="hidden" name="id" value={chapter.id} />
            <input
                name="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className={INPUT}
                required
            />
            <textarea
                name="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className={`${INPUT} h-20`}
            />
            <input
                name="image"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className={INPUT}
            />
            <button
                className={`${BUTTON_PRIMARY} w-full`}
                disabled={!isDirty}
            >
                Save
            </button>
        </form>
    );
}
