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
    const image = chapter.image || "";
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const isDirty = useMemo(() => {
        return location !== chapter.location ||
            bio !== (chapter.bio || "") ||
            image !== (chapter.image || "") ||
            file !== null;
    }, [location, bio, image, file, chapter]);

    const INPUT = "w-full bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 p-3 outline-none focus:border-red-600 transition-colors text-sm";
    const BUTTON_PRIMARY = "bg-zinc-900 text-white dark:bg-white dark:text-black font-bold uppercase py-2 px-6 hover:bg-red-600 dark:hover:bg-red-600 dark:hover:text-white transition-all text-xs tracking-widest disabled:opacity-50 disabled:cursor-not-allowed";

    const handleSubmit = async (formData: FormData) => {
        let finalImageUrl = image;

        if (file) {
            setIsUploading(true);
            const uploadData = new FormData();
            uploadData.append("file", file);

            try {
                const res = await fetch("/api/upload", {
                    method: "POST",
                    body: uploadData,
                });

                if (res.ok) {
                    const data = await res.json() as { url: string };
                    finalImageUrl = data.url;
                } else {
                    alert("Image upload failed");
                    setIsUploading(false);
                    return;
                }
            } catch (e) {
                console.error("Upload failed", e);
                alert("Image upload failed");
                setIsUploading(false);
                return;
            } finally {
                setIsUploading(false);
            }
        }

        formData.set("image", finalImageUrl);
        await updateChapter(formData);
    };

    return (
        <form action={handleSubmit} className="mt-4 space-y-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
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
                type="file"
                accept="image/*"
                onChange={(e) => {
                    const selected = e.target.files?.[0];
                    if (selected) {
                        setFile(selected);
                    }
                }}
                className={INPUT}
            />
            {image && !file && <p className="text-[10px] text-zinc-500 italic">Current image: {image}</p>}
            {file && <p className="text-[10px] text-green-600 italic">New image selected: {file.name}</p>}
            <button
                className={`${BUTTON_PRIMARY} w-full`}
                disabled={!isDirty || isUploading}
            >
                {isUploading ? "Uploading..." : "Save"}
            </button>
        </form>
    );
}
