"use client";

import React from "react";

interface StoreLogoProps {
  store: string;
  size?: number;
  className?: string;
}

// Brand profiles with curated gradients, initials and styling for top Algerian computer stores
const STORE_PROFILES: Record<
  string,
  { initials: string; bg: string; text: string; border: string }
> = {
  Matos: { initials: "MAT", bg: "from-red-600 to-rose-700", text: "text-white", border: "border-red-400/30" },
  "Click-DZ": { initials: "CDZ", bg: "from-sky-500 to-blue-700", text: "text-white", border: "border-blue-400/30" },
  Campus: { initials: "CMP", bg: "from-emerald-500 to-teal-700", text: "text-white", border: "border-emerald-400/30" },
  Digitec: { initials: "DGT", bg: "from-indigo-600 to-slate-800", text: "text-white", border: "border-indigo-400/30" },
  GamingDZ: { initials: "GDZ", bg: "from-purple-600 to-indigo-800", text: "text-white", border: "border-purple-400/30" },
  GigaStore: { initials: "GIG", bg: "from-cyan-500 to-blue-600", text: "text-white", border: "border-cyan-400/30" },
  Informatics: { initials: "INF", bg: "from-amber-500 to-orange-600", text: "text-white", border: "border-amber-400/30" },
  WifiDjelfa: { initials: "WJF", bg: "from-teal-500 to-emerald-700", text: "text-white", border: "border-teal-400/30" },
  "Blida Computer": { initials: "BLI", bg: "from-blue-600 to-indigo-800", text: "text-white", border: "border-blue-400/30" },
  BlidaComputer: { initials: "BLI", bg: "from-blue-600 to-indigo-800", text: "text-white", border: "border-blue-400/30" },
  Lahlou: { initials: "LHL", bg: "from-violet-500 to-purple-700", text: "text-white", border: "border-violet-400/30" },
  NextGen: { initials: "NXT", bg: "from-rose-500 to-pink-700", text: "text-white", border: "border-rose-400/30" },
  KhabirTech: { initials: "KHB", bg: "from-emerald-600 to-green-800", text: "text-white", border: "border-emerald-400/30" },
  DeskCom: { initials: "DSK", bg: "from-slate-700 to-slate-900", text: "text-white", border: "border-slate-500/30" },
  KOTEK: { initials: "KTK", bg: "from-teal-600 to-cyan-800", text: "text-white", border: "border-teal-400/30" },
  HardSoft: { initials: "HDS", bg: "from-blue-700 to-slate-900", text: "text-white", border: "border-blue-400/30" },
  "LICB+": { initials: "LIC", bg: "from-sky-600 to-blue-800", text: "text-white", border: "border-sky-400/30" },
  "FUTURE CITY INFORMATIQUE": { initials: "FCI", bg: "from-amber-600 to-orange-700", text: "text-white", border: "border-amber-400/30" },
  "TECHMATE DZ": { initials: "TMD", bg: "from-cyan-600 to-teal-800", text: "text-white", border: "border-cyan-400/30" },
  "PC PRO DZ": { initials: "PRO", bg: "from-red-500 to-red-800", text: "text-white", border: "border-red-400/30" },
  "ADMIN Informatique": { initials: "ADM", bg: "from-indigo-500 to-blue-700", text: "text-white", border: "border-indigo-400/30" },
  "AN-TECH": { initials: "ANT", bg: "from-emerald-500 to-emerald-800", text: "text-white", border: "border-emerald-400/30" },
  "IT DEVICE": { initials: "ITD", bg: "from-blue-500 to-slate-800", text: "text-white", border: "border-blue-400/30" },
  "Technal Computer": { initials: "TNL", bg: "from-slate-600 to-slate-900", text: "text-white", border: "border-slate-400/30" },
  "MBA INFO": { initials: "MBA", bg: "from-purple-500 to-indigo-700", text: "text-white", border: "border-purple-400/30" },
  "KPC SOLUTIONS": { initials: "KPC", bg: "from-cyan-600 to-blue-700", text: "text-white", border: "border-cyan-400/30" },
  "Bytek Store": { initials: "BYT", bg: "from-indigo-600 to-purple-700", text: "text-white", border: "border-indigo-400/30" },
};

// Deterministic generator for unknown Ouedkniss store names
function getFallbackProfile(store: string) {
  const clean = store.trim();
  const words = clean.split(/[\s-_]+/).filter(Boolean);
  let initials = "DZ";
  if (words.length >= 2) {
    initials = (words[0][0] + words[1][0]).toUpperCase();
  } else if (words.length === 1 && words[0].length >= 2) {
    initials = words[0].slice(0, 2).toUpperCase();
  }

  // Pick a distinct gradient based on string hash
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = (hash << 5) - hash + clean.charCodeAt(i);
    hash |= 0;
  }
  const gradients = [
    "from-blue-600 to-indigo-700",
    "from-emerald-600 to-teal-700",
    "from-purple-600 to-pink-700",
    "from-amber-600 to-orange-700",
    "from-rose-600 to-red-700",
    "from-cyan-600 to-blue-700",
    "from-indigo-600 to-violet-800",
    "from-slate-700 to-slate-900",
  ];
  const bg = gradients[Math.abs(hash) % gradients.length];
  return { initials, bg, text: "text-white", border: "border-white/20" };
}

export default function StoreLogo({ store, size = 36, className = "" }: StoreLogoProps) {
  const profile = STORE_PROFILES[store] || getFallbackProfile(store);

  const fontSize = size <= 24 ? "text-[9px]" : size <= 32 ? "text-[10px]" : "text-[11px]";

  return (
    <div
      style={{ width: size, height: size }}
      className={`rounded-lg bg-gradient-to-br ${profile.bg} ${profile.text} border ${profile.border} shadow-xs flex items-center justify-center font-black tracking-tight shrink-0 select-none ${fontSize} ${className}`}
      title={store}
      aria-hidden="true"
    >
      {profile.initials}
    </div>
  );
}
