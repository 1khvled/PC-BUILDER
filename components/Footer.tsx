import Link from "next/link";

const TRUST_ITEMS = [
  {
    title: "Paiement à la livraison",
    text: "Proposé par nos marchands — vous payez à réception, pas ici",
    icon: (
      <>
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
      </>
    ),
  },
  {
    title: "Boutiques d'Alger, Sétif, Oran…",
    text: "Elles expédient vers 58 wilayas (Yalidine, Maystro…)",
    icon: (
      <>
        <path d="M1 3h15v13H1z" />
        <path d="M16 8h4l3 3v5h-7V8z" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </>
    ),
  },
  {
    title: "15 sites web + Ouedkniss (60+ stores)",
    text: "Vitrines en ligne suivies chaque jour",
    icon: (
      <>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </>
    ),
  },
  {
    title: "Prix en Dinars (DA)",
    text: "Relevés quotidiens, tri 100% organique, zéro commission",
    icon: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </>
    ),
  },
];

export default function Footer() {
  return (
    <footer className="relative bg-[#11111c] text-slate-300 text-xs mt-12 no-print overflow-hidden">
      {/* Top accent line */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#2c87c3]/50 to-transparent" aria-hidden="true" />

      {/* Trust & Guarantees Strip */}
      <div className="border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {TRUST_ITEMS.map((item) => (
            <div
              key={item.title}
              className="flex items-center gap-3.5 p-4 rounded-xl bg-white/[0.05] border border-white/10 hover:bg-white/[0.08] transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-b from-[#3a94d2] to-[#2c87c3] text-white flex items-center justify-center shrink-0 shadow-[0_4px_12px_-4px_rgba(44,135,195,0.5)]">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {item.icon}
                </svg>
              </div>
              <div>
                <div className="text-white font-bold text-xs leading-snug">{item.title}</div>
                <div className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{item.text}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0 bg-white ring-1 ring-white/20">
                <img src="/brand/logo.svg" alt="DZ PartPicker" className="w-full h-full object-contain" />
              </div>
              <span className="text-white font-extrabold text-base tracking-tight">DZ PartPicker</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              Le comparateur indépendant de composants PC en Algérie. Comparez les prix du neuf et de l'occasion parmi les boutiques d'informatique dont les vitrines livrent 58 wilayas.
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="px-2.5 py-1 rounded-full bg-white/[0.08] border border-white/10 text-slate-200 font-semibold text-[10px]">
                100% Indépendant
              </span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/20 text-emerald-300 font-semibold text-[10px]">
                Prix live en DA
              </span>
              <span className="px-2.5 py-1 rounded-full bg-white/[0.08] border border-white/10 text-slate-200 font-semibold text-[10px]">
                15 sites web + 60 stores Ouedkniss
              </span>
              <span className="px-2.5 py-1 rounded-full bg-[#2c87c3]/15 border border-[#2c87c3]/30 text-[#7cc0ea] font-semibold text-[10px]">
                Neuf / Occasion séparés
              </span>
            </div>
          </div>

          {/* Outils Col */}
          <div className="space-y-2.5">
            <h4 className="text-white font-bold text-xs uppercase tracking-widest flex items-center gap-2">
              <span className="w-1 h-3.5 rounded-full bg-[#2c87c3]" aria-hidden="true" />
              Outils & Config
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/builder" className="text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1.5 group">
                  <span className="text-[#2c87c3] opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true">→</span>
                  System Builder (Configurateur)
                </Link>
              </li>
              <li>
                <Link href="/guides" className="text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1.5 group">
                  <span className="text-[#2c87c3] opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true">→</span>
                  Guides d'achat gaming
                </Link>
              </li>
              <li>
                <Link href="/deals" className="text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1.5 group">
                  <span className="text-[#2c87c3] opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true">→</span>
                  Bons plans du moment
                </Link>
              </li>
              <li>
                <Link href="/category/cpu" className="text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1.5 group">
                  <span className="text-[#2c87c3] opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true">→</span>
                  Catalogue des composants
                </Link>
              </li>
            </ul>
          </div>

          {/* Composants Col */}
          <div className="space-y-2.5">
            <h4 className="text-white font-bold text-xs uppercase tracking-widest flex items-center gap-2">
              <span className="w-1 h-3.5 rounded-full bg-[#2c87c3]" aria-hidden="true" />
              Composants PC
            </h4>
            <ul className="space-y-1.5">
              <li><Link href="/category/cpu" className="text-slate-400 hover:text-white transition-colors">Processeurs (CPU)</Link></li>
              <li><Link href="/category/gpu" className="text-slate-400 hover:text-white transition-colors">Cartes Graphiques (GPU)</Link></li>
              <li><Link href="/category/motherboard" className="text-slate-400 hover:text-white transition-colors">Cartes Mères</Link></li>
              <li><Link href="/category/ram" className="text-slate-400 hover:text-white transition-colors">Mémoire Vive (RAM)</Link></li>
              <li><Link href="/category/ssd" className="text-slate-400 hover:text-white transition-colors">Stockage SSD / NVMe</Link></li>
              <li><Link href="/category/psu" className="text-slate-400 hover:text-white transition-colors">Alimentations (PSU)</Link></li>
              <li><Link href="/category/case" className="text-slate-400 hover:text-white transition-colors">Boîtiers PC</Link></li>
              <li><Link href="/category/cooler" className="text-slate-400 hover:text-white transition-colors">Refroidisseurs CPU</Link></li>
              <li><Link href="/category/monitor" className="text-slate-400 hover:text-white transition-colors">Écrans Gaming</Link></li>
            </ul>
          </div>

          {/* Transparence Col */}
          <div className="space-y-2.5">
            <h4 className="text-white font-bold text-xs uppercase tracking-widest flex items-center gap-2">
              <span className="w-1 h-3.5 rounded-full bg-[#2c87c3]" aria-hidden="true" />
              Transparence
            </h4>
            <p className="text-[11px] leading-relaxed text-slate-400">
              Boutiques indexées : LICB+, Digitec, Click-DZ, WifiDjelfa, GamingDZ, KOTEK, Blida Computer, NextGen, KhabirTech, DeskCom, GigaStore, Informatics, Lahlou, HardSoft, Campus + 60 boutiques vérifiées sur Ouedkniss couvrant 23 wilayas.
            </p>
            <p className="text-[11px] leading-relaxed text-slate-400">
              Prix indicatifs en Dinars Algériens (DA), toujours vérifiés sur le site marchand avant commande. Occasion et neuf strictement différenciés. Tri 100% organique par prix croissant.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <div className="flex flex-wrap items-center gap-2">
            <span>© 2026 DZ PartPicker. Tous droits réservés. Clone fidèle inspiré du format PCPartPicker.</span>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <a
              href="https://bytekstore.shop/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 font-bold transition-colors"
            >
              <span>Powered by bytekstore.shop</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 border border-indigo-500/30 text-indigo-300">
                Partenaire Esport DZ
              </span>
            </a>
          </div>
          <div className="flex items-center gap-2">
            <span>Fait pour la communauté gaming d'Algérie</span>
            <span>🇩🇿</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
