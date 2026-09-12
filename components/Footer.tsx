import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-xs mt-12 no-print">
      {/* Trust & Guarantees Strip */}
      <div className="border-b border-slate-800/80 bg-slate-950/40 py-6">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <line x1="2" y1="10" x2="22" y2="10" />
              </svg>
            </div>
            <div>
              <div className="text-white font-bold text-xs">Paiement à la Livraison (COD)</div>
              <div className="text-[11px] text-slate-400">Réglez en espèces à réception chez vous</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 3h15v13H1z" />
                <path d="M16 8h4l3 3v5h-7V8z" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
            </div>
            <div>
              <div className="text-white font-bold text-xs">Livraison 58 Wilayas</div>
              <div className="text-[11px] text-slate-400">Yalidine, Kazi Tour, ZR Express, Procolis</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div>
              <div className="text-white font-bold text-xs">100% Boutiques Réelles</div>
              <div className="text-[11px] text-slate-400">Marchands vérifiés avec adresses physiques</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
            </div>
            <div>
              <div className="text-white font-bold text-xs">Prix Live en Dinars (DA)</div>
              <div className="text-[11px] text-slate-400">Relevés quotidiens sans commission</div>
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
              <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 bg-white p-0.5 border border-slate-700">
                <img src="/brand/logo.svg" alt="DZ PartPicker" className="w-full h-full object-contain" />
              </div>
              <span className="text-white font-extrabold text-base tracking-tight">DZ PartPicker</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              Le premier comparateur indépendant de composants PC en Algérie. Comparez en temps réel les prix du neuf et de l&apos;occasion parmi les meilleures boutiques d&apos;informatique à travers les 58 wilayas.
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium text-[10px] border border-slate-700">
                100% Indépendant
              </span>
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-emerald-400 font-medium text-[10px] border border-slate-700">
                Prix live en DA
              </span>
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium text-[10px] border border-slate-700">
                58 Wilayas
              </span>
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-blue-400 font-medium text-[10px] border border-slate-700">
                Paiement Cash / COD
              </span>
            </div>
          </div>

          {/* Outils Col */}
          <div className="space-y-2.5">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">Outils & Config</h4>
            <ul className="space-y-1.5">
              <li>
                <Link href="/builder" className="hover:text-white transition-colors">
                  System Builder (Configurateur)
                </Link>
              </li>
              <li>
                <Link href="/guides" className="hover:text-white transition-colors">
                  Guides d&apos;achat gaming
                </Link>
              </li>
              <li>
                <Link href="/builds" className="hover:text-white transition-colors">
                  Builds de la communauté
                </Link>
              </li>
              <li>
                <Link href="/category/cpu" className="hover:text-white transition-colors">
                  Catalogue des composants
                </Link>
              </li>
            </ul>
          </div>

          {/* Composants Col */}
          <div className="space-y-2.5">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">Composants PC</h4>
            <ul className="space-y-1.5">
              <li><Link href="/category/cpu" className="hover:text-white transition-colors">Processeurs (CPU)</Link></li>
              <li><Link href="/category/gpu" className="hover:text-white transition-colors">Cartes Graphiques (GPU)</Link></li>
              <li><Link href="/category/motherboard" className="hover:text-white transition-colors">Cartes Mères</Link></li>
              <li><Link href="/category/ram" className="hover:text-white transition-colors">Mémoire Vive (RAM)</Link></li>
              <li><Link href="/category/ssd" className="hover:text-white transition-colors">Stockage SSD / NVMe</Link></li>
              <li><Link href="/category/psu" className="hover:text-white transition-colors">Alimentations (PSU)</Link></li>
              <li><Link href="/category/case" className="hover:text-white transition-colors">Boîtiers PC</Link></li>
              <li><Link href="/category/cooler" className="hover:text-white transition-colors">Refroidisseurs CPU</Link></li>
              <li><Link href="/category/monitor" className="hover:text-white transition-colors">Écrans Gaming</Link></li>
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
        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
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
