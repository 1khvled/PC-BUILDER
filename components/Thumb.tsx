"use client";
import { useState } from "react";

// Product thumbnail with graceful fallback (merchant hotlinks die often)
export default function Thumb({ src, alt, size = 56 }: { src?: string; alt: string; size?: number }) {
  const [err, setErr] = useState(false);
  const initial = (alt?.trim()?.charAt(0) || "D").toUpperCase();
  if (!src || err) {
    return (
      <div
        role="img"
        aria-label={alt}
        title={alt}
        className="rounded-xl flex items-center justify-center shrink-0 border border-slate-200 bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50 relative overflow-hidden"
        style={{ width: size, height: size }}
      >
        <span aria-hidden="true" className="absolute font-extrabold text-slate-300 select-none" style={{ fontSize: size * 0.42 }}>
          {initial}
        </span>
        <svg width={size * 0.32} height={size * 0.32} viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.8" className="relative" aria-hidden="true">
          <rect x="3" y="7" width="18" height="12" rx="2" />
          <path d="M8 7V5h8v2M8 12h.01M12 12h.01M16 12h.01" />
        </svg>
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setErr(true)}
      className="rounded-xl object-contain shrink-0 bg-white p-1 ring-1 ring-black/10"
      style={{ width: size, height: size }}
    />
  );
}
