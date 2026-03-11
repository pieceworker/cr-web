"use client";

import { useTransition, useState } from "react";
import { BlogPost } from "@/lib/db";
import { createBlogPost, updateBlogPost } from "@/lib/actions";

interface BlogFormProps {
    post?: BlogPost;
}

const INPUT_STYLE = "w-full bg-zinc-100 dark:bg-zinc-800 border-2 border-transparent focus:border-red-600 focus:bg-white dark:focus:bg-zinc-900 px-4 py-3 text-sm font-medium transition-all outline-none rounded-none";
const BUTTON_PRIMARY = "bg-red-600 text-white font-bold uppercase py-4 px-8 hover:bg-black dark:hover:bg-white dark:hover:text-black transition-all text-sm tracking-widest active:scale-[0.98]";

export default function BlogForm({ post }: BlogFormProps) {
    const [isPending, startTransition] = useTransition();
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        
        const formData = new FormData(e.currentTarget);
        let finalImageUrl = post?.image || "";
        
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
                    setError("Image upload failed");
                    setIsUploading(false);
                    return;
                }
            } catch (err) {
                console.error("Upload failed", err);
                setError("Image upload failed");
                setIsUploading(false);
                return;
            } finally {
                setIsUploading(false);
            }
        }
        
        if (finalImageUrl) {
            formData.set("image", finalImageUrl);
        } else {
            formData.delete("image");
        }
        
        startTransition(() => {
            if (post) {
                updateBlogPost(formData);
            } else {
                createBlogPost(formData);
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {post && <input type="hidden" name="id" value={post.id} />}
            
            {error && (
                <div className="px-2 py-4 sm:p-4 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-bold uppercase tracking-wide">
                    ⚠️ {error}
                </div>
            )}

            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Title</label>
                <input
                    type="text"
                    name="title"
                    defaultValue={post?.title}
                    required
                    className={INPUT_STYLE}
                    placeholder="ENTER POST TITLE"
                />
            </div>

            <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Blog Featured Image (Optional)</label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {post?.image && (
                        <div className="space-y-1">
                            <p className="block text-[10px] font-bold uppercase text-zinc-400 mb-1 tracking-widest">Current Image</p>
                            <div className="aspect-video w-full relative border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 overflow-hidden grayscale-[0.5]">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={post.image} alt="Current" className="object-cover w-full h-full" />
                            </div>
                        </div>
                    )}
                    {previewUrl && (
                        <div className="space-y-1">
                            <p className="block text-[10px] font-bold uppercase text-green-600 mb-1 tracking-widest">New Preview</p>
                            <div className="aspect-video w-full relative border-2 border-green-500 bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={previewUrl} alt="Preview" className="object-cover w-full h-full" />
                            </div>
                        </div>
                    )}
                </div>

                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                        const selected = e.target.files?.[0] || null;
                        setFile(selected);
                        if (selected) {
                            setPreviewUrl(URL.createObjectURL(selected));
                        } else {
                            setPreviewUrl(null);
                        }
                    }}
                    className={INPUT_STYLE}
                />
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex justify-between">
                    <span>Content (Markdown)</span>
                    <a href="https://www.markdownguide.org/cheat-sheet/" target="_blank" rel="noreferrer" className="text-red-600 hover:underline">Markdown Guide ↗</a>
                </label>
                <textarea
                    name="body"
                    required
                    defaultValue={post?.body}
                    rows={15}
                    className={`${INPUT_STYLE} resize-y font-mono text-xs`}
                    placeholder="# Main Header&#10;Write your post body here using markdown..."
                />
            </div>

            <div className="pt-4 flex justify-end">
                <button type="submit" disabled={isPending || isUploading} className={`${BUTTON_PRIMARY} ${isPending || isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    {isUploading ? 'Uploading Image...' : isPending ? 'Saving...' : (post ? 'Update Post' : 'Publish Post')}
                </button>
            </div>
        </form>
    );
}
