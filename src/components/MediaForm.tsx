"use client";

import { useState } from "react";
import { createMediaItem } from "@/lib/actions";
import Image from "next/image";

export default function MediaForm() {
    const [type, setType] = useState<'image' | 'video' | 'youtube'>('image');
    const [title, setTitle] = useState("");
    const [url, setUrl] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const INPUT = "w-full bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 p-3 outline-none focus:border-red-600 transition-colors text-sm disabled:bg-zinc-100 dark:disabled:bg-zinc-900 disabled:text-zinc-500";
    const LABEL = "block text-[10px] font-bold uppercase text-zinc-400 mb-1 tracking-widest";

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0] || null;
        setFile(selected);
        if (selected) {
            setPreviewUrl(URL.createObjectURL(selected));
        } else {
            setPreviewUrl(null);
        }
    };

    return (
        <form
            action={async (formData) => {
                setError(null);
                setIsUploading(true);
                
                try {
                    let finalUrl = url;

                    if (type === 'image' || type === 'video') {
                        if (!file) {
                            setError(`Please select a ${type} file.`);
                            setIsUploading(false);
                            return;
                        }

                        const uploadData = new FormData();
                        uploadData.append("file", file);

                        const res = await fetch("/api/upload", {
                            method: "POST",
                            body: uploadData,
                        });

                        if (res.ok) {
                            const data = await res.json() as { url: string };
                            finalUrl = data.url;
                        } else {
                            setError("Upload failed");
                            setIsUploading(false);
                            return;
                        }
                    } else if (type === 'youtube') {
                        if (!url) {
                            setError("Please enter a YouTube URL.");
                            setIsUploading(false);
                            return;
                        }
                        // Simple validation/normalization could happen here if needed
                    }

                    formData.set("type", type);
                    formData.set("url", finalUrl);
                    formData.set("title", title);

                    await createMediaItem(formData);
                    
                    // Reset form
                    setTitle("");
                    setUrl("");
                    setFile(null);
                    setPreviewUrl(null);
                } catch (e) {
                    console.error("Failed to create media item", e);
                    setError("An error occurred. Please try again.");
                } finally {
                    setIsUploading(false);
                }
            }}
            className="space-y-6"
        >
            {error && (
                <div className="px-4 py-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-bold uppercase tracking-wide">
                    ⚠️ {error}
                </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label className={LABEL}>Media Type</label>
                    <select
                        value={type}
                        onChange={(e) => {
                            setType(e.target.value as 'image' | 'video' | 'youtube');
                            setPreviewUrl(null);
                            setFile(null);
                            setUrl("");
                        }}
                        className={INPUT}
                    >
                        <option value="image">Image</option>
                        <option value="video">Video (Native)</option>
                        <option value="youtube">YouTube URL</option>
                    </select>
                </div>
                <div>
                    <label className={LABEL}>Title (Optional)</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className={INPUT}
                        placeholder="e.g. Summer Concert 2024"
                    />
                </div>
            </div>

            {type === 'youtube' ? (
                <div>
                    <label className={LABEL}>YouTube URL</label>
                    <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className={INPUT}
                        placeholder="https://www.youtube.com/watch?v=..."
                        required
                    />
                </div>
            ) : (
                <div className="space-y-4">
                    <label className={LABEL}>{type === 'image' ? 'Image' : 'Video'} File</label>
                    <div className="bg-zinc-50 dark:bg-zinc-900 p-4 border border-zinc-200 dark:border-zinc-800">
                        {previewUrl && (
                            <div className="mb-4">
                                <p className={LABEL}>Preview</p>
                                <div className="aspect-video relative max-w-sm border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
                                    {type === 'image' ? (
                                        <Image src={previewUrl} alt="Preview" fill className="object-cover" unoptimized />
                                    ) : (
                                        <video src={previewUrl} className="w-full h-full object-cover" controls />
                                    )}
                                </div>
                            </div>
                        )}
                        <input
                            type="file"
                            accept={type === 'image' ? "image/*" : "video/*"}
                            onChange={handleFileChange}
                            className={INPUT}
                        />
                    </div>
                </div>
            )}

            <button
                type="submit"
                className={`w-full font-bold uppercase py-4 transition-all tracking-widest text-sm ${
                    isUploading ? "bg-zinc-200 text-zinc-400 cursor-not-allowed" : "bg-red-600 text-white hover:bg-red-700 active:scale-[0.98]"
                }`}
                disabled={isUploading}
            >
                {isUploading ? "Uploading..." : "Add Media Item"}
            </button>
        </form>
    );
}
