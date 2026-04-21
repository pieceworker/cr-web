"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { MediaItem } from "@/lib/db";

interface MediaGalleryProps {
    items: MediaItem[];
}

export default function MediaGallery({ items }: MediaGalleryProps) {
    const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
    const touchStartX = useRef<number | null>(null);
    const touchEndX = useRef<number | null>(null);

    const showNext = useCallback(() => {
        setSelectedIdx((prev) => (prev !== null && prev < items.length - 1 ? prev + 1 : 0));
    }, [items.length]);

    const showPrev = useCallback(() => {
        setSelectedIdx((prev) => (prev !== null && prev > 0 ? prev - 1 : items.length - 1));
    }, [items.length]);

    // Swipe logic
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.targetTouches[0].clientX;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        touchEndX.current = e.targetTouches[0].clientX;
    };

    const handleTouchEnd = () => {
        if (!touchStartX.current || !touchEndX.current) return;
        const distance = touchStartX.current - touchEndX.current;
        const isLeftSwipe = distance > 50;
        const isRightSwipe = distance < -50;

        if (isLeftSwipe) showNext();
        if (isRightSwipe) showPrev();

        touchStartX.current = null;
        touchEndX.current = null;
    };

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (selectedIdx === null) return;
            if (e.key === "ArrowRight") showNext();
            if (e.key === "ArrowLeft") showPrev();
            if (e.key === "Escape") setSelectedIdx(null);
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [selectedIdx, showNext, showPrev]);

    const getYouTubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const renderGridItem = (item: MediaItem, i: number) => {
        if (item.type === 'image') {
            return <Image src={item.url} alt={item.title || `Gallery image ${i}`} fill className="object-cover group-hover:scale-105 transition-transform duration-300" unoptimized />;
        } else if (item.type === 'video') {
            return (
                <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                    <video src={item.url} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" muted playsInline />
                    <div className="relative z-10 w-12 h-12 rounded-full bg-black/50 flex items-center justify-center border border-white/20">
                        <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[12px] border-l-white border-b-[8px] border-b-transparent ml-1" />
                    </div>
                </div>
            );
        } else if (item.type === 'youtube') {
            const videoId = getYouTubeId(item.url);
            const thumbUrl = videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;
            return (
                <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                    {thumbUrl && <Image src={thumbUrl} alt="YouTube thumb" fill className="object-cover group-hover:scale-105 transition-transform duration-300" unoptimized />}
                    <div className="relative z-10 w-12 h-12 rounded-full bg-red-600 flex items-center justify-center shadow-lg">
                        <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[12px] border-l-white border-b-[8px] border-b-transparent ml-1" />
                    </div>
                </div>
            );
        }
    };

    const renderLightboxContent = () => {
        if (selectedIdx === null) return null;
        const item = items[selectedIdx];

        if (item.type === 'image') {
            return <Image src={item.url} alt="Full view" fill className="object-contain pointer-events-none select-none" unoptimized priority />;
        } else if (item.type === 'video') {
            return <video src={item.url} className="w-full h-full object-contain" controls autoPlay />;
        } else if (item.type === 'youtube') {
            const videoId = getYouTubeId(item.url);
            return (
                <iframe
                    className="w-full h-full aspect-video"
                    src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                ></iframe>
            );
        }
    };

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((item, i) => (
                    <div
                        key={item.id}
                        onClick={() => setSelectedIdx(i)}
                        className="relative bg-zinc-100 dark:bg-zinc-900 aspect-square border border-zinc-200 dark:border-zinc-800 overflow-hidden hover:border-red-600 transition-all cursor-pointer group"
                    >
                        {renderGridItem(item, i)}
                        {item.title && (
                            <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                <p className="text-white text-xs font-bold uppercase tracking-widest">{item.title}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {selectedIdx !== null && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm px-2 py-4 sm:p-4 touch-none"
                    onClick={() => setSelectedIdx(null)}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    <button
                        onClick={(e) => { e.stopPropagation(); setSelectedIdx(null); }}
                        className="absolute top-6 right-6 text-white text-4xl p-2 bg-black/40 hover:bg-red-600 rounded-full w-12 h-12 flex items-center justify-center z-[70] transition-all leading-none"
                        aria-label="Close lightbox"
                    >
                        &times;
                    </button>

                    <button 
                        onClick={(e) => { e.stopPropagation(); showPrev(); }} 
                        className="absolute left-2 md:left-6 text-white text-5xl md:text-6xl px-2 py-4 sm:p-4 z-[70] bg-black/20 hover:bg-black/40 hover:text-red-600 rounded-lg transition-all"
                        aria-label="Previous item"
                    >
                        &lsaquo;
                    </button>

                    <div 
                        className="relative w-full h-full max-w-5xl max-h-[85vh] z-60"
                        onClick={(e) => e.stopPropagation()} 
                    >
                        {renderLightboxContent()}
                    </div>

                    <button 
                        onClick={(e) => { e.stopPropagation(); showNext(); }} 
                        className="absolute right-2 md:right-6 text-white text-5xl md:text-6xl px-2 py-4 sm:p-4 z-[70] bg-black/20 hover:bg-black/40 hover:text-red-600 rounded-lg transition-all"
                        aria-label="Next item"
                    >
                        &rsaquo;
                    </button>
                </div>
            )}
        </>
    );
}
