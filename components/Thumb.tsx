"use client";
import { useState } from "react";

// Product thumbnail with graceful fallback (merchant hotlinks die often)
export default function Thumb({ src, alt, size = 56 }: { src?: string; alt: string; size?: number }) {
  const [err, setErr] = useState(false);
  if (!src || err) {
    return (
      <div
        className="rounded-xl flex items-center justify-center shrink-0 border border-slate-200"
        style={{ width: size, height: size, background: "linear-gradient(135deg,#e8eef7,#f7f9fc)" }}
      >
        <svg width={size * 0.42} height={size * 0.42} viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.8">
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
      onError={() => setErr(true)}
      className="rounded-xl object-cover shrink-0 border border-slate-200 bg-white"
      style={{ width: size, height: size }}
    />
  );
}
