"use client";

import { useState, useMemo } from "react";
import { createEvent, updateEvent } from "@/lib/actions";
import Image from "next/image";
import { Event } from "@/lib/db";

const INPUT = "w-full bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 p-3 outline-none focus:border-red-600 transition-colors text-sm";
const BUTTON_PRIMARY = "bg-zinc-900 text-white dark:bg-white dark:text-black font-bold uppercase py-2 px-2 sm:px-6 hover:bg-red-600 dark:hover:bg-red-600 dark:hover:text-white transition-all text-xs tracking-widest disabled:opacity-50 disabled:cursor-not-allowed";

interface EventFormProps {
    event?: Event;
    onSuccess?: () => void;
}

export default function EventForm({ event, onSuccess }: EventFormProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(event?.image || null);
    const [title, setTitle] = useState(event?.title || "");
    const [description, setDescription] = useState(event?.description || "");
    const [venue, setVenue] = useState(event?.venue || "");
    const [city, setCity] = useState(event?.city || "");
    const [date, setDate] = useState(event?.date || "");
    const [time, setTime] = useState(event?.time || "");
    const [link, setLink] = useState(event?.link || "");

    const isDirty = useMemo(() => {
        if (!event) return true;
        return title !== (event.title || "") ||
            description !== (event.description || "") ||
            venue !== (event.venue || "") ||
            city !== (event.city || "") ||
            date !== (event.date || "") ||
            time !== (event.time || "") ||
            link !== (event.link || "") ||
            file !== null;
    }, [title, description, venue, city, date, time, link, file, event]);

    const handleSubmit = async (formData: FormData) => {
        let imageUrl = event?.image || "";

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
        
        if (event) {
            formData.set("id", event.id);
            await updateEvent(formData);
        } else {
            await createEvent(formData);
        }

        if (onSuccess) {
            onSuccess();
        }

        // Reset form if creating new
        if (!event) {
            setFile(null);
            setPreviewUrl(null);
            setTitle("");
            setDescription("");
            setVenue("");
            setCity("");
            setDate("");
            setTime("");
            setLink("");
        }
    };

    return (
        <form id="event-form" action={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                    <input name="title" required placeholder="Event Title" value={title} onChange={e => setTitle(e.target.value)} className={INPUT} />
                    <div className="space-y-1">
                        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                            <span>Description (Markdown)</span>
                            <a href="https://www.markdownguide.org/cheat-sheet/" target="_blank" rel="noreferrer" className="text-red-600 hover:underline">Guide ↗</a>
                        </div>
                        <textarea 
                            name="description" 
                            placeholder="Write event description using markdown..." 
                            value={description} onChange={e => setDescription(e.target.value)}
                            className={`${INPUT} h-28 font-mono text-xs resize-y`} 
                        />
                    </div>
                    <input name="venue" required placeholder="Venue" value={venue} onChange={e => setVenue(e.target.value)} className={INPUT} />
                    <input name="city" placeholder="City" value={city} onChange={e => setCity(e.target.value)} className={INPUT} />
                </div>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <input name="date" type="date" required value={date} onChange={e => setDate(e.target.value)} className={INPUT} />
                        <input name="time" type="time" required value={time} onChange={e => setTime(e.target.value)} className={INPUT} />
                    </div>
                    <input name="link" placeholder="Event Link (Eventbrite, etc.)" value={link} onChange={e => setLink(e.target.value)} className={INPUT} />
                    
                    {previewUrl && (
                        <div className="space-y-1">
                            <p className="block text-[10px] font-bold uppercase text-zinc-400 mb-1 tracking-widest text-green-600">Image Preview</p>
                            <div className="aspect-video relative border-2 border-green-500 bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
                                <Image src={previewUrl} alt="Preview" fill className="object-cover" unoptimized />
                            </div>
                        </div>
                    )}
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                            const selected = e.target.files?.[0] || null;
                            setFile(selected);
                            if (selected) {
                                setPreviewUrl(URL.createObjectURL(selected));
                            } else {
                                setPreviewUrl(event?.image || null);
                            }
                        }}
                        className={INPUT}
                    />
                </div>
            </div>
            <button className={`${BUTTON_PRIMARY} w-full`} disabled={isUploading || (event && !isDirty)}>
                {isUploading ? "Uploading..." : (event ? "Save Changes" : "Create Event")}
            </button>
        </form>
    );
}
