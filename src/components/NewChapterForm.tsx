"use client";

import { useState } from "react";
import { createChapter } from "@/lib/actions";

const INPUT = "w-full bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 p-3 outline-none focus:border-red-600 transition-colors text-sm";
const BUTTON_PRIMARY = "bg-zinc-900 text-white dark:bg-white dark:text-black font-bold uppercase py-2 px-6 hover:bg-red-600 dark:hover:bg-red-600 dark:hover:text-white transition-all text-xs tracking-widest disabled:opacity-50 disabled:cursor-not-allowed";

export default function NewChapterForm() {
    const [isUploading, setIsUploading] = useState(false);
    const [file, setFile] = useState<File | null>(null);

    const handleSubmit = async (formData: FormData) => {
        let imageUrl = "";

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
                    imageUrl = data.url;
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

        formData.set("image", imageUrl);
        await createChapter(formData);

        // Reset form
        setFile(null);
        const form = document.getElementById("new-chapter-form") as HTMLFormElement;
        if (form) form.reset();
    };

    return (
        <form id="new-chapter-form" action={handleSubmit} className="space-y-4">
            <input name="location" required placeholder="Location" className={INPUT} />
            <textarea name="bio" required placeholder="Description..." className={`${INPUT} h-24`} />
            <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                required
                className={INPUT}
            />
            <button className={`${BUTTON_PRIMARY} w-full`} disabled={isUploading}>
                {isUploading ? "Uploading..." : "Create Chapter"}
            </button>
        </form>
    );
}
