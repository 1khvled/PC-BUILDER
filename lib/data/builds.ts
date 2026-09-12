export interface CommunityBuild {
  id: string;
  title: string;
  author: string;
  wilaya: string;
  useCase: string;
  description: string;
  picks: Record<string, string>;
  likes: number;
  createdAt: string;
}

export const BUILDS: CommunityBuild[] = [
  {
    id: "r5-5600-3060-roi-1080p",
    title: "R5 5600 + RTX 3060 : le roi du 1080p",
    author: "Amine_K",
    wilaya: "Alger",
    useCase: "gaming-1080p",
    description: "Monté à Draria, pièces prises chez LICB+ et une 3060 négociée sur Ouedkniss. Warzone 130-144fps en compétitif, zéro crash depuis 4 mois. Le 650W ne bronche pas.",
    picks: { cpu: "cpu-r5-5600", cooler: "cooler-h212-v3", motherboard: "mobo-b550m-a-pro", ram: "ram-vengeance-16-d4", ssd: "ssd-970evo-1tb", gpu: "gpu-rtx3060-12gb", case: "case-v217", psu: "psu-mwe650-b" },
    likes: 47,
    createdAt: "2026-08-14",
  },
  {
    id: "9800x3d-5080-dream",
    title: "9800X3D + 5080 : le rêve, chiffré",
    author: "YacineDZ",
    wilaya: "Oran",
    useCase: "gaming-1440p",
    description: "Projet 2026 : 4K-ready, X3D pour les 1% low, 5080 pour le DLSS4. Budget saignant mais chaque DA est justifié sur la fiche. L'upgrade se fera en deux fois (plateforme d'abord).",
    picks: { cpu: "cpu-r7-9800x3d", motherboard: "mobo-b650m", ram: "ram-delta-32-d5", ssd: "ssd-970evo-1tb", gpu: "gpu-rtx5080-16gb", case: "case-v217", psu: "psu-mwe650-b" },
    likes: 31,
    createdAt: "2026-08-30",
  },
  {
    id: "12400f-bureautique-setif",
    title: "i5-12400F bureautique Sétif",
    author: "Rania_B",
    wilaya: "Sétif",
    useCase: "office",
    description: "PC du cabinet : rapide, silencieux, SSD 1To pour les dossiers. La RX 580 d'occasion ne sert qu'à afficher — achetée 28 000 DA testée sur place.",
    picks: { cpu: "cpu-i5-12400f", motherboard: "mobo-b660m-e", ram: "ram-vengeance-16-d4", ssd: "ssd-970evo-1tb", gpu: "gpu-rx580-8gb", case: "case-v217", psu: "psu-mwe650-b" },
    likes: 19,
    createdAt: "2026-07-22",
  },
  {
    id: "chasseur-occasion-3060",
    title: "Chasseur d'occasion : 3060 à 80k",
    author: "Mehdi_Okkaz",
    wilaya: "Alger",
    useCase: "gaming-1080p",
    description: "Base neuve (5600 + B550 + 16Go) + 3060 12GB chassée 3 semaines sur Ouedkniss : vidéo FurMark exigée, test à Bab Ezzouar, facture d'origine. 80 000 DA au lieu de 95 000+.",
    picks: { cpu: "cpu-r5-5600", motherboard: "mobo-b550m-a-pro", ram: "ram-vengeance-16-d4", ssd: "ssd-970evo-1tb", gpu: "gpu-rtx3060-12gb", case: "case-v217", psu: "psu-mwe650-b" },
    likes: 52,
    createdAt: "2026-09-02",
  },
  {
    id: "etudiant-90k-premier-pc",
    title: "Premier PC étudiant ~90k",
    author: "Lina_19",
    wilaya: "Constantine",
    useCase: "office",
    description: "Cours, montage léger, Valorant le soir. Tout en DDR4 d'occasion sauf SSD neuf. Livraison Yalidine depuis Alger, paiement à la réception.",
    picks: { cpu: "cpu-i5-12400f", motherboard: "mobo-b660m-e", ram: "ram-vengeance-16-d4", ssd: "ssd-970evo-1tb", gpu: "gpu-rx580-8gb", case: "case-v217", psu: "psu-mwe650-b" },
    likes: 23,
    createdAt: "2026-06-18",
  },
  {
    id: "am5-ddr5-1440p-oran",
    title: "AM5 DDR5 1440p — Oran",
    author: "GigaFan_Oran",
    wilaya: "Oran",
    useCase: "gaming-1440p",
    description: "9600X + 4070, 32Go DDR5-6000. Pris chez GigaStore (Bir El Djir), monté sur place. 1440p ultra 100fps+ sur la plupart des titres.",
    picks: { cpu: "cpu-r5-9600x", motherboard: "mobo-b650m", ram: "ram-delta-32-d5", ssd: "ssd-970evo-1tb", gpu: "gpu-rtx4070-12gb", case: "case-v217", psu: "psu-mwe650-b" },
    likes: 28,
    createdAt: "2026-08-05",
  },
  {
    id: "upgrade-tray-9600x",
    title: "Upgrade tray 9600X malin",
    author: "Sofiane_UP",
    wilaya: "Blida",
    useCase: "gaming-1440p",
    description: "Version tray du 9600X (même puce, sans boîte, moins cher) + ventirad correct. Reste du build recyclé de l'ancien AM4 sauf CM/RAM. Le tray, c'est le secret des petits budgets AM5.",
    picks: { cpu: "cpu-r5-9600x", cooler: "cooler-h212-v3", motherboard: "mobo-b650m", ram: "ram-delta-32-d5", ssd: "ssd-970evo-1tb", gpu: "gpu-rtx4060-8gb", case: "case-v217", psu: "psu-mwe650-b" },
    likes: 15,
    createdAt: "2026-09-08",
  },
];
