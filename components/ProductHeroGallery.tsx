"use client";

import { useState } from "react";
import Image from "next/image";

interface ProductHeroGalleryProps {
  src?: string;
  alt: string;
  brand: string;
  categoryLabel: string;
  isRuptured?: boolean;
  locale?: "fr" | "en";
}

export default function ProductHeroGallery({
  src,
  alt,
  brand,
  categoryLabel,
  isRuptured = false,
  locale = "fr",
}: ProductHeroGalleryProps) {
  const [hasError, setHasError] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const isFr = locale === "fr";

  const initial = (brand?.trim()?.charAt(0) || alt?.trim()?.charAt(0) || "D").toUpperCase();

  return (
    <>
      <div className="relative group rounded-2xl border border-slate-200/90 bg-gradient-to-b from-slate-50/80 via-white to-slate-50/40 p-6 sm:p-8 flex items-center justify-center min-h-[260px] sm:min-h-[320px] shadow-xs overflow-hidden">
        {/* Subtle decorative grid/glow behind hardware */}
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />
        
        {/* Top Badges overlay */}
        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between gap-2 z-10 pointer-events-none">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase bg-white/90 backdrop-blur-xs text-slate-700 border border-slate-200/80 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2c87c3]" />
            <span>{categoryLabel}</span>
          </span>

          {isRuptured ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide bg-rose-50/95 backdrop-blur-xs text-rose-700 border border-rose-200/80 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span>{isFr ? "Rupture générale" : "Out of stock"}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide bg-emerald-50/95 backdrop-blur-xs text-emerald-800 border border-emerald-200/80 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{isFr ? "En stock vérifié" : "Verified In Stock"}</span>
            </span>
          )}
        </div>

        {/* Product Image Stage */}
        <div className="relative z-0 flex items-center justify-center w-full h-full max-w-[280px] max-h-[280px]">
          {!src || hasError ? (
            <div className="flex flex-col items-center justify-center p-8 text-center text-slate-300">
              <span className="text-5xl font-black mb-2 opacity-50">{initial}</span>
              <svg className="w-12 h-12 stroke-slate-300" viewBox="0 0 24 24" fill="none" strokeWidth="1.5">
                <rect x="2" y="2" width="20" height="20" rx="3" />
                <path d="M7 16l3-4 3 4 4-5 3 5" />
              </svg>
              <span className="text-xs text-slate-400 font-semibold mt-2">{brand}</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsZoomed(true)}
              title={isFr ? "Agrandir l'image" : "Zoom image"}
              className="relative w-[220px] h-[220px] sm:w-[260px] sm:h-[260px] transition-transform duration-300 ease-out group-hover:scale-105 cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2c87c3]"
            >
              <img
                src={src}
                alt={alt}
                loading="eager"
                decoding="async"
                referrerPolicy="no-referrer"
                onError={() => setHasError(true)}
                className="w-full h-full object-contain filter drop-shadow-md select-none"
              />
            </button>
          )}
        </div>

        {/* Bottom Bar: Brand Watermark & Zoom trigger */}
        <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between z-10">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            {brand}
          </span>
          {src && !hasError && (
            <button
              type="button"
              onClick={() => setIsZoomed(true)}
              className="text-[11px] font-semibold text-slate-500 hover:text-slate-900 bg-white/80 hover:bg-white backdrop-blur-xs px-2 py-1 rounded-md border border-slate-200/80 transition-colors shadow-2xs flex items-center gap-1"
            >
              <svg className="w-3 h-3 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line x1="11" y1="8" x2="11" y2="14" />
                <line x1="8" y1="11" x2="14" y2="11" />
              </svg>
              <span>{isFr ? "Agrandir" : "Zoom"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Lightbox Modal on Zoom */}
      {isZoomed && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setIsZoomed(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out animate-fadeIn"
        >
          <div className="relative max-w-2xl max-h-[85vh] bg-white rounded-2xl p-6 shadow-2xl overflow-hidden flex flex-col items-center">
            <button
              type="button"
              onClick={() => setIsZoomed(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-800 rounded-full hover:bg-slate-100 transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <div className="w-full flex-1 flex items-center justify-center min-h-[300px]">
              <img
                src={src}
                alt={alt}
                className="max-w-full max-h-[70vh] object-contain drop-shadow-xl"
              />
            </div>
            <div className="mt-4 text-center">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{brand}</div>
              <div className="text-sm font-extrabold text-slate-900 mt-0.5">{alt}</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
