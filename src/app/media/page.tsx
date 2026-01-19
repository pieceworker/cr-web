"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";

export default function MediaPage() {
  const images = [
    "/468297507_10161831188542510_4936577226538562967_n.jpg",
    "/468307368_10161887988007510_7295195754936524748_n.jpg",
    "/468614855_10161954336562510_9032316291581169086_n.jpg",
    "/471667967_10162127274997510_1052602846742946073_n.jpg",
    "/484799628_1032717528903380_9046720476354497832_n.jpg",
    "/496211548_10162545753612510_1884589422817192953_n.jpg",
    "/508862705_10162711577752510_142478979332433148_n.jpg",
    "/509331660_10162717484012510_8064526036027516502_n.jpg",
    "/555302210_10234525188104605_7934826604113683392_n.jpg",
    "/555623548_10234624697192270_7982405379479070146_n.jpg",
    "/78624140_10157679144137510_6567361190106759168_n.jpg",
    "/80408826_10157719720262510_4681613115412971520_n.jpg",
    "/83289297_10157844836927510_7965988904610299904_n.jpg",
    "/83909846_10157870982492510_3247950321883807744_n.jpg",
    "/guyhill.jpg",
    "/revcafe.jpg",
  ];

  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const showNext = useCallback(() => {
    setSelectedIdx((prev) => (prev !== null && prev < images.length - 1 ? prev + 1 : 0));
  }, [images.length]);

  const showPrev = useCallback(() => {
    setSelectedIdx((prev) => (prev !== null && prev > 0 ? prev - 1 : images.length - 1));
  }, [images.length]);

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

  return (
    <div className="flex flex-col gap-10 py-10 px-6 max-w-6xl mx-auto transition-colors">
      <section className="text-center space-y-4">
        <h1 className="text-4xl md:text-6xl font-black uppercase italic text-zinc-900 dark:text-white">
          Media
        </h1>
      </section>

      {/* Media Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {images.map((src, i) => (
          <div
            key={i}
            onClick={() => setSelectedIdx(i)}
            className="relative bg-zinc-100 dark:bg-zinc-900 aspect-square border border-zinc-200 dark:border-zinc-800 overflow-hidden hover:border-red-600 transition-all cursor-pointer group"
          >
            <Image
              src={`${src}`}
              alt={`Gallery image ${i}`}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              unoptimized
            />
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedIdx !== null && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 touch-none"
          onClick={() => setSelectedIdx(null)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Close Button - Added backdrop circle for visibility */}
          <button
            onClick={(e) => { e.stopPropagation(); setSelectedIdx(null); }}
            className="absolute top-6 right-6 text-white text-4xl p-2 bg-black/40 hover:bg-red-600 rounded-full w-12 h-12 flex items-center justify-center z-[70] transition-all leading-none"
            aria-label="Close lightbox"
          >
            &times;
          </button>

          {/* Navigation - Added bg-black/20 and rounded corners for contrast */}
          <button 
            onClick={(e) => { e.stopPropagation(); showPrev(); }} 
            className="absolute left-2 md:left-6 text-white text-5xl md:text-6xl p-4 z-[70] bg-black/20 hover:bg-black/40 hover:text-red-600 rounded-lg transition-all"
            aria-label="Previous image"
          >
            &lsaquo;
          </button>

          {/* Image Container */}
          <div 
            className="relative w-full h-full max-w-5xl max-h-[85vh] z-60"
            onClick={(e) => e.stopPropagation()} 
          >
            <Image
              src={`${images[selectedIdx]}`}
              alt="Full view"
              fill
              className="object-contain pointer-events-none select-none"
              unoptimized
              priority
            />
          </div>

          <button 
            onClick={(e) => { e.stopPropagation(); showNext(); }} 
            className="absolute right-2 md:right-6 text-white text-5xl md:text-6xl p-4 z-[70] bg-black/20 hover:bg-black/40 hover:text-red-600 rounded-lg transition-all"
            aria-label="Next image"
          >
            &rsaquo;
          </button>
        </div>
      )}

      {/* Press Section */}
      <div className="mt-10 p-10 bg-zinc-50 dark:bg-zinc-950 border-l-4 border-red-600 shadow-sm">
        <h3 className="text-xl font-bold uppercase italic mb-2 text-zinc-900 dark:text-white">
          Featured Press
        </h3>
        <p className="text-zinc-600 dark:text-zinc-500 italic">
          &ldquo;Classical Revolution is bringing chamber music back to its roots...&rdquo;
          <span className="block mt-2 font-bold text-zinc-900 dark:text-zinc-400">&mdash; The New York Times</span>
        </p>
      </div>
    </div>
  );
}