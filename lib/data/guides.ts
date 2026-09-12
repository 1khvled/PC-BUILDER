export interface GuideBlock {
  h?: string;
  p?: string[];
  list?: string[];
}

export interface Guide {
  slug: string;
  title: string;
  hook: string;
  readMin: number;
  parts: string[];
  blocks: GuideBlock[];
  pitfalls: string[];
}

export const GUIDES: Guide[] = [
  {
    slug: "gaming-1080p-algerie",
    title: "PC Gaming 1080p en Algérie : le build qui a du sens",
    hook: "Ryzen 5 5600 + RTX 3060 12GB : 144Hz en 1080p sans jeter l'argent. Prix relevés en direct des magasins d'Alger, Sétif et Oran.",
    readMin: 6,
    parts: ["cpu-r5-5600", "cooler-h212-v3", "mobo-b550m-a-pro", "ram-vengeance-16-d4", "ssd-970evo-1tb", "gpu-rtx3060-12gb", "case-v217", "psu-mwe650-b"],
    blocks: [
      {
        h: "Pourquoi ce combo",
        p: [
          "Le Ryzen 5 5600 reste le roi du rapport perf/prix à Alger : 6 cœurs qui ne brident pas une RTX 3060 en 1080p, socket AM4 donc cartes mères B550 pas chères et DDR4 à prix plancher.",
          "La RTX 3060 12GB (pas la 8GB) : les 12Go de VRAM encaissent les textures 2025-2026 là où les 8Go saturent. En occasion Ouedkniss elle tourne sous les 90 000 DA — vérifiez toujours qu'elle n'a pas miné (voir notre guide occasion).",
        ],
      },
      {
        h: "Alimentation : ne bricolez pas",
        p: [
          "5600 (65W) + 3060 (170W) + 150W de base = ~385W en pointe. Une 650W Bronze de marque (Cooler Master, MSI, DeepCool) laisse ~260W de marge : silencieuse, froide, durable.",
          "Avec les coupures et micro-coupures du réseau, ajoutez un onduleur 1000VA si vous êtes en zone instable — une PSU correcte + onduleur coûte moins cher qu'une carte mère grillée.",
        ],
      },
      {
        h: "Neuf vs occasion, en DA",
        p: [
          "Neuf magasin : comptez le prix fort mais garantie 12 mois et paiement à la livraison partout (58 wilayas via Yalidine/Maystro).",
          "Occasion Ouedkniss : une 3060 12GB se négocie 75 000–90 000 DA. Exigez une vidéo de benchmark (FurMark 10 min + température), la facture d'origine, et testez sur place si le vendeur est à Alger, Sétif ou Oran.",
        ],
      },
    ],
    pitfalls: [
      "B550 + Ryzen 5600 : aucun souci BIOS (natif). Méfiez-vous des vieilles B450 d'occasion qui exigent une mise à jour.",
      "Boîtier : vérifiez la longueur GPU (la Ventus fait 235mm, ça passe partout — une Gaming Trio 330mm, non).",
      "DDR4 3200 CL16 suffit ; la 3600 n'apporte presque rien sur AM4 pour son surcoût en DA.",
    ],
  },
  {
    slug: "bureautique-etudes-90k",
    title: "PC bureautique / études à moins de 95 000 DA",
    hook: "i5-12400F + RX 580 d'occasion : bureautique, études, montage léger et même du jeu 1080p. Le budget étudiant malin.",
    readMin: 4,
    parts: ["cpu-i5-12400f", "mobo-b660m-e", "ram-vengeance-16-d4", "ssd-970evo-1tb", "gpu-rx580-8gb", "case-v217", "psu-mwe650-b"],
    blocks: [
      {
        h: "La logique",
        p: [
          "Le i5-12400F (6P, pas de iGPU — le F veut dire sans graphique intégré) se trouve à bon prix et écrase tout en bureautique. Il faut donc une carte graphique, même petite.",
          "La RX 580 8GB d'occasion (25 000–35 000 DA sur Ouedkniss) suffit pour Windows, Office, montage 1080p et des jeux esport en 1080p. C'est la carte des petits budgets depuis des années — énorme stock d'occasion à Alger.",
        ],
      },
      {
        h: "Évolutivité",
        p: [
          "Plateforme LGA1700 + B660 + 650W : dans 2 ans vous posez une RTX 4060 d'occasion sans rien changer d'autre. C'est ça, un bon budget build : un chemin d'upgrade, pas une impasse.",
        ],
      },
    ],
    pitfalls: [
      "12400F = pas d'image sans carte graphique. Si la RX 580 tombe en panne, écran noir — prévoyez le coup.",
      "RX 580 d'occasion : 90% ont miné. Test FurMark + vérifiez que les ventilateurs ne hurlent pas.",
      "SSD NVMe 1To direct : les 256Go sont un faux économie, Windows + 2 jeux et c'est plein.",
    ],
  },
  {
    slug: "gaming-1440p-300k",
    title: "Gaming 1440p : AM5 + RTX 4070/5070",
    hook: "Quand le 1080p ne suffit plus : Ryzen 9600X, DDR5, et une 70-class. Le palier enthusiast, chiffré en DA.",
    readMin: 6,
    parts: ["cpu-r5-9600x", "mobo-b650m", "ram-delta-32-d5", "ssd-970evo-1tb", "gpu-rtx4070-12gb", "case-v217", "psu-mwe650-b"],
    blocks: [
      {
        h: "Pourquoi AM5 maintenant",
        p: [
          "AM4 est une impasse neuve en 2026 : les prix DDR4 stagnent et les CPU neufs se raréfient. AM5 (9600X + B650 + DDR5) coûte plus cher aujourd'hui mais vivra jusqu'en ~2028 côté CPU.",
          "32Go DDR5-6000 : le sweet spot Ryzen (ratio 1:1 avec le contrôleur mémoire). En dessous de 5600 MT/s vous perdez du FPS gratuit.",
        ],
      },
      {
        h: "4070 vs 5070",
        p: [
          "Comparez les deux fiches du site : la 5070 apporte ~15-20% et le DLSS4, la 4070 se trouve moins chère en occasion. À prix proche, prenez la 5070 neuve avec garantie ; à -25% ou plus, la 4070 d'occasion gagne.",
        ],
      },
    ],
    pitfalls: [
      "Boîtier 350mm max (V217) : les 70-class dual-fan (~240mm) passent, les gros triple-fan 330mm non.",
      "650W suffit pour 9600X (65W) + 4070 (200W) ≈ 480W estimés — mais si vous visez une 5080 un jour, prenez 750W direct.",
      "Mettez le BIOS à jour avant d'installer Windows : les B650 early ont des bugs DDR5 corrigés depuis.",
    ],
  },
  {
    slug: "ouedkniss-occasion-survie",
    title: "Ouedkniss : acheter de l'occasion sans se faire avoir",
    hook: "60% des bonnes affaires GPU du pays passent par Ouedkniss. Règles de survie, arnaques classiques et check-list test.",
    readMin: 7,
    parts: ["gpu-rtx3060-12gb", "gpu-rx580-8gb", "cpu-r5-5600"],
    blocks: [
      {
        h: "Les prix repères (relevés du site)",
        p: [
          "Une RTX 3060 12GB d'occasion saine se vend 75 000–95 000 DA. En dessous de 65 000 DA, méfiance : carte minée fatiguée, panne de ventilateur, ou arnaque pure (photos volées, prix d'appel).",
          "Comparez toujours avec le prix neuf le plus bas affiché sur nos fiches produit avant de négocier — votre marge de négociation, c'est exactement cet écart.",
        ],
      },
      {
        h: "Check-list avant de payer",
        list: [
          "Exigez une vidéo : FurMark ou un jeu 10 minutes, avec la température visible (HWInfo). +85°C = pâte thermique morte ou radiateur encrassé.",
          "Photos de la carte hors boîtier, recto-verso : traces de rouille, scotch, vis manquantes = minage intensif.",
          "Facture d'origine + blister idéalement. Sans facture, divisez votre prix max par deux.",
          "Testez sur place si possible (Alger, Sétif, Oran : les vendeurs sérieux acceptent). Jamais d'avance par CCP/BaridiMob à un inconnu.",
          "Annonces 1 DA ou prix barrés absurdes : appâts. Passez.",
        ],
      },
    ],
    pitfalls: [
      "\"Jamais minée, garantie\" sans preuve = minée. Les mineurs revendent par lots : même photos, plusieurs annonces.",
      "Les configs complètes d'occasion cachent souvent une alim no-name : demandez la marque exacte de la PSU.",
      "Comptez le déplacement : une \"affaire\" à 300km n'en est plus une une fois le transport payé.",
    ],
  },
  {
    slug: "alim-onduleur-algerie",
    title: "Alimentation et onduleur : le guide anti-coupure",
    hook: "Le courant algérien tue plus de PC que la chaleur. Dimensionner sa PSU et choisir son onduleur, avec les chiffres.",
    readMin: 5,
    parts: ["psu-mwe650-b", "cpu-r5-5600", "gpu-rtx3060-12gb"],
    blocks: [
      {
        h: "Dimensionner : la règle x1,3",
        p: [
          "Additionnez CPU + GPU + 150W (carte mère, RAM, SSD, ventilos), multipliez par 1,3. Exemple du site : 65 + 170 + 150 = 385W → 500W théoriques → on prend 650W (palier standard, silence et rendement).",
          "Le 80+ Bronze minimum n'est pas un luxe : à charge égale, une alim bas de gamme chauffe plus, fait plus de bruit et protège moins (sur-tension = carte mère morte).",
        ],
      },
      {
        h: "Onduleur : lequel",
        p: [
          "Pour un PC gaming 400-500W + écran : onduleur line-interactive 1000-1500VA. Il encaisse les micro-coupures et vous laisse 5-10 minutes pour sauvegarder et éteindre.",
          "Branchez dessus : tour + écran uniquement. Pas l'imprimante laser (pic de consommation qui tue l'onduleur), pas le chauffage.",
          "Changez la batterie tous les 2-3 ans : un onduleur à batterie morte ne protège de rien et donne une fausse confiance.",
        ],
      },
    ],
    pitfalls: [
      "Une 650W no-name à 6 000 DA n'est pas une 650W : regardez la puissance réelle sur le rail 12V (étiquette).",
      "Multiprise parafoudre ≠ onduleur : elle ne fait rien contre les coupures.",
      "En été, dépoussiérez : 45°C ambiants + poussière = la PSU ventile à fond et vieillit deux fois plus vite.",
    ],
  },
];
