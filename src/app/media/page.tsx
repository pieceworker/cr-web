"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

export default function MediaPage() {
  const images = [
    "/172179383_10159098289872510_2798972059275309395_n.jpg",
    "/468297507_10161831188542510_4936577226538562967_n.jpg",
    "/468307368_10161887988007510_7295195754936524748_n.jpg",
    "/468614855_10161954336562510_9032316291581169086_n.jpg",
    "/471667967_10162127274997510_1052602846742946073_n.jpg",
    "/481254418_1022558349919298_8938265722586974490_n.jpg",
    "/484799628_1032717528903380_9046720476354497832_n.jpg",
    "/492184223_10162447792017510_1369349693568231841_n.jpg",
    "/496211548_10162545753612510_1884589422817192953_n.jpg",
    "/505376591_1096450755863390_984751570682171329_n.jpg",
    "/505656661_1096450789196720_5980562172691094869_n.jpg",
    "/508862705_10162711577752510_142478979332433148_n.jpg",
    "/509331660_10162717484012510_8064526036027516502_n.jpg",
    "/555302210_10234525188104605_7934826604113683392_n.jpg",
    "/555623548_10234624697192270_7982405379479070146_n.jpg",
    "/78624140_10157679144137510_6567361190106759168_n.jpg",
    "/80408826_10157719720262510_4681613115412971520_n.jpg",
    "/83289297_10157844836927510_7965988904610299904_n.jpg",
    "/83909846_10157870982492510_3247950321883807744_n.jpg",
    "/charith.jpg",
    "/guyhill.jpg",
    "/revcafe.jpg",
  ];

  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const showNext = useCallback(() => {
    setSelectedIdx((prev) => (prev !== null && prev < images.length - 1 ? prev + 1 : 0));
  }, [images.length]);

  const showPrev = useCallback(() => {
    setSelectedIdx((prev) => (prev !== null && prev > 0 ? prev - 1 : images.length - 1));
  }, [images.length]);

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
          {/* Close Button */}
          <button
            onClick={() => setSelectedIdx(null)}
            className="absolute top-5 right-5 text-white text-4xl hover:text-red-600 z-[60]"
          >
            &times;
          </button>

          {/* Navigation */}
          <button onClick={showPrev} className="absolute left-4 text-white text-4xl p-4 hover:bg-white/10 rounded-full transition-colors">
            &lsaquo;
          </button>

          <div className="relative w-full h-full max-w-5xl max-h-[80vh]">
            <Image
              src={`${images[selectedIdx]}`}
              alt="Full view"
              fill
              className="object-contain"
              unoptimized
            />
          </div>

          <button onClick={showNext} className="absolute right-4 text-white text-4xl p-4 hover:bg-white/10 rounded-full transition-colors">
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