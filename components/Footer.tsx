import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#26293b] text-slate-300 text-xs mt-12 no-print">
      {/* Trust & Guarantees Strip */}
      <div className="border-b border-white/10 py-6">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="flex items-center gap-3 p-3 rounded bg-white/5 border border-white/10">
            <div className="w-10 h-10 rounded bg-white text-[#26293b] flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <line x1="2" y1="10" x2="22" y2="10" />
              </svg>
            </div>
            <div>
              <div className="text-white font-bold text-xs">Paiement à la livraison</div>
              <div className="text-[11px] text-slate-400">Proposé par nos marchands — vous payez à réception, pas ici</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded bg-white/5 border border-white/10">
            <div className="w-10 h-10 rounded bg-white text-[#26293b] flex items-center justify-center shrink-0" aria-hidden="true">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 3h15v13H1z" />
                <path d="M16 8h4l3 3v5h-7V8z" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
            </div>
            <div>
              <div className="text-white font-bold text-xs">Boutiques d'Alger, Sétif, Oran…</div>
              <div className="text-[11px] text-slate-400">Elles expédient vers 58 wilayas (Yalidine, Maystro…)</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded bg-white/5 border border-white/10">
            <div className="w-10 h-10 rounded bg-white text-[#26293b] flex items-center justify-center shrink-0" aria-hidden="true">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div>
              <div className="text-white font-bold text-xs">12 boutiques + Ouedkniss</div>
              <div className="text-[11px] text-slate-400">Vitrines en ligne suivies chaque jour</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded bg-white/5 border border-white/10">
            <div className="w-10 h-10 rounded bg-white text-[#26293b] flex items-center justify-center shrink-0" aria-hidden="true">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
            </div>
            <div>
              <div className="text-white font-bold text-xs">Prix en Dinars (DA)</div>
              <div className="text-[11px] text-slate-400">Relevés quotidiens, tri 100% organique, zéro commission</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded overflow-hidden shrink-0 bg-white p-0.5">
                <img src="/brand/logo.svg" alt="DZ PartPicker" className="w-full h-full object-contain" />
              </div>
              <span className="text-white font-extrabold text-base tracking-tight">DZ PartPicker</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              Le comparateur indépendant de composants PC en Algérie. Comparez les prix du neuf et de l&apos;occasion parmi les boutiques d&apos;informatique dont les vitrines livrent 58 wilayas.
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="px-2 py-0.5 rounded bg-white/10 text-slate-200 font-medium text-[10px]">
                100% Indépendant
              </span>
              <span className="px-2 py-0.5 rounded bg-white/10 text-emerald-300 font-medium text-[10px]">
                Prix live en DA
              </span>
              <span className="px-2 py-0.5 rounded bg-white/10 text-slate-200 font-medium text-[10px]">
                12 boutiques + Ouedkniss
              </span>
              <span className="px-2 py-0.5 rounded bg-white/10 text-blue-300 font-medium text-[10px]">
                Neuf / Occasion séparés
              </span>
            </div>
          </div>

          {/* Outils Col */}
          <div className="space-y-2.5">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">Outils & Config</h4>
            <ul className="space-y-1.5">
              <li>
                <Link href="/builder" className="hover:text-white hover:underline underline-offset-4">
                  System Builder (Configurateur)
                </Link>
              </li>
              <li>
                <Link href="/guides" className="hover:text-white hover:underline underline-offset-4">
                  Guides d&apos;achat gaming
                </Link>
              </li>
              <li>
                <Link href="/builds" className="hover:text-white hover:underline underline-offset-4">
                  Builds de la communauté
                </Link>
              </li>
              <li>
                <Link href="/deals" className="hover:text-white hover:underline underline-offset-4">
                  Bons plans du moment
                </Link>
              </li>
              <li>
                <Link href="/category/cpu" className="hover:text-white hover:underline underline-offset-4">
                  Catalogue des composants
                </Link>
              </li>
            </ul>
          </div>

          {/* Composants Col */}
          <div className="space-y-2.5">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">Composants PC</h4>
            <ul className="space-y-1.5">
              <li><Link href="/category/cpu" className="hover:text-white hover:underline underline-offset-4">Processeurs (CPU)</Link></li>
              <li><Link href="/category/gpu" className="hover:text-white hover:underline underline-offset-4">Cartes Graphiques (GPU)</Link></li>
              <li><Link href="/category/motherboard" className="hover:text-white hover:underline underline-offset-4">Cartes Mères</Link></li>
              <li><Link href="/category/ram" className="hover:text-white hover:underline underline-offset-4">Mémoire Vive (RAM)</Link></li>
              <li><Link href="/category/ssd" className="hover:text-white hover:underline underline-offset-4">Stockage SSD / NVMe</Link></li>
              <li><Link href="/category/psu" className="hover:text-white hover:underline underline-offset-4">Alimentations (PSU)</Link></li>
              <li><Link href="/category/case" className="hover:text-white hover:underline underline-offset-4">Boîtiers PC</Link></li>
              <li><Link href="/category/cooler" className="hover:text-white hover:underline underline-offset-4">Refroidisseurs CPU</Link></li>
              <li><Link href="/category/monitor" className="hover:text-white hover:underline underline-offset-4">Écrans Gaming</Link></li>
            </ul>
          </div>

          {/* Transparence Col */}
          <div className="space-y-2.5">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">Transparence</h4>
            <p className="text-[11px] leading-relaxed text-slate-400">
              Boutiques indexées : LICB+, Digitec, Click-DZ, WifiDjelfa, GamingDZ, KOTEK, Ouedkniss, GigaStore, Informatics, Lahlou, HardSoft, Campus.
            </p>
            <p className="text-[11px] leading-relaxed text-slate-400">
              Prix indicatifs en Dinars Algériens (DA), toujours vérifiés sur le site marchand avant commande. Occasion et neuf strictement différenciés. Tri 100% organique par prix croissant.
            </p>
          </div>
        </div>

        {/* Bottom Bar — Legal line untouched as required by prompt */}
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <div>
            © 2026 DZ PartPicker. Tous droits réservés. Clone fidèle inspiré du format PCPartPicker.
          </div>
          <div className="flex items-center gap-2">
            <span>Fait pour la communauté gaming d&apos;Algérie</span>
            <span>🇩🇿</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
