"use client";

import { MediaItem } from "@/lib/db";
import { deleteMediaItem } from "@/lib/actions";
import Image from "next/image";

interface MediaCardProps {
    item: MediaItem;
}

export default function MediaCard({ item }: MediaCardProps) {
    const BUTTON_DANGER = "text-red-600 font-bold hover:underline text-[10px] uppercase tracking-widest";

    const getYouTubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const renderThumbnail = () => {
        if (item.type === 'image') {
            return <Image src={item.url} alt={item.title || "Image"} fill className="object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-300" unoptimized />;
        } else if (item.type === 'video') {
            return (
                <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                    <span className="text-white text-xs font-bold uppercase tracking-widest">Video</span>
                    <video src={item.url} className="absolute inset-0 w-full h-full object-cover opacity-30" />
                </div>
            );
        } else if (item.type === 'youtube') {
            const videoId = getYouTubeId(item.url);
            const thumbUrl = videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null;
            return thumbUrl ? (
                <Image src={thumbUrl} alt="YouTube Thumbnail" fill className="object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-300" unoptimized />
            ) : (
                <div className="w-full h-full bg-red-900 flex items-center justify-center text-white text-[10px] font-bold uppercase">YouTube</div>
            );
        }
        return null;
    };

    return (
        <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 flex justify-between items-center group hover:border-red-600 transition-colors">
            <div className="flex items-center gap-4 truncate">
                <div className="w-16 h-16 relative overflow-hidden bg-zinc-200 dark:bg-zinc-800 flex-shrink-0">
                    {renderThumbnail()}
                </div>
                <div className="truncate">
                    <h3 className="font-bold text-sm leading-tight truncate">{item.title || "Untitled Media"}</h3>
                    <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest mt-1">
                        {item.type} • {new Date(item.created_at).toLocaleDateString()}
                    </p>
                    {item.type === 'youtube' && (
                        <p className="text-[8px] text-zinc-400 truncate max-w-[200px] sm:max-w-[400px] mt-0.5">{item.url}</p>
                    )}
                </div>
            </div>
            
            <form action={async () => {
                if (confirm("Are you sure you want to delete this media item?")) {
                    await deleteMediaItem(item.id);
                }
            }}>
                <button className={BUTTON_DANGER}>Delete</button>
            </form>
        </div>
    );
}
