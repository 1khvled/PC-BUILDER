export interface GuideBlock {
  h?: string;
  p?: string[];
  list?: string[];
}

/**
 * `build` guides describe one complete, balanced machine, so summing the live
 * prices of `parts` produces a meaningful total. `guide` guides compare a family
 * of parts (nine PSUs, five SSDs, ...), where a "total" would be meaningless, so
 * the UI must not pretend otherwise.
 */
export type GuideKind = "build" | "guide";

/** Short, already-localised topic label rendered as a chip on the index. */
export type GuideTopic =
  | "build"
  | "gpu"
  | "platform"
  | "psu"
  | "cooling"
  | "storage"
  | "ram"
  | "monitor"
  | "used"
  | "advice";

export interface Guide {
  slug: string;
  title: string;
  hook: string;
  kind: GuideKind;
  topic: { fr: string; en: string };
  readMin: number;
  parts: string[];
  blocks: GuideBlock[];
  pitfalls: string[];
}

export const GUIDE_TOPIC_LABEL: Record<GuideTopic, { fr: string; en: string }> = {
  build: { fr: "Build complet", en: "Full build" },
  gpu: { fr: "Carte graphique", en: "Graphics card" },
  platform: { fr: "Plateforme", en: "Platform" },
  psu: { fr: "Alimentation", en: "Power supply" },
  cooling: { fr: "Refroidissement", en: "Cooling" },
  storage: { fr: "Stockage", en: "Storage" },
  ram: { fr: "Mémoire", en: "Memory" },
  monitor: { fr: "Écran", en: "Display" },
  used: { fr: "Occasion", en: "Used market" },
  advice: { fr: "Conseil", en: "Advice" },
};

/**
 * Interface strings the guides surface needs that do not exist yet in
 * lib/i18n/dictionaries (those files are owned elsewhere). They live here so the
 * two languages can never drift, and they should be promoted to real dictionary
 * keys (guide.toc, guide.related, guide.priceNote, ...) in a follow-up.
 */
export const GUIDE_UI = {
  fr: {
    toc: "Sommaire",
    related: "Autres guides pour aller plus loin",
    priceNote:
      "Les prix viennent du relevé du {date} et changent chaque jour. Le total affiché en haut de cette page se recalcule automatiquement : c'est lui qu'il faut budgéter, pas un chiffre figé dans un article.",
    totalIsLive: "Total live",
    partsCompared: "{count} produits comparés",
    notABuild: "Comparatif, pas une config",
    topic: "Thème",
    builds: "Configs complètes",
    buildsNote: "Une machine équilibrée de bout en bout, avec le total live affiché sur chaque fiche.",
    topics: "Choisir un composant",
    topicsNote: "Un poste à la fois, comparé sur les prix réels du relevé courant.",
  },
  en: {
    toc: "Contents",
    related: "More guides to go further",
    priceNote:
      "Prices come from the snapshot taken on {date} and change daily. The total at the top of this page recalculates automatically: that is the number to budget from, not a figure frozen in an article.",
    totalIsLive: "Live total",
    partsCompared: "{count} products compared",
    notABuild: "A comparison, not a build",
    topic: "Topic",
    builds: "Complete builds",
    buildsNote: "One balanced machine end to end, with the live total shown on every page.",
    topics: "Picking a component",
    topicsNote: "One part at a time, compared against the real prices in the current snapshot.",
  },
} as const;

export const GUIDES: Guide[] = [
  {
    slug: "gaming-1080p-algerie",
    title: "PC gaming 1080p : la config qui fait le travail sans gaspiller",
    hook: "Ryzen 5 5600, 8 Go de VRAM et un écran 180 Hz : la combinaison 1080p qui tient encore en 2026. Le total affiché en haut de page se recalcule à chaque relevé, c'est lui qu'il faut budgéter.",
    kind: "build",
    topic: { fr: "Build complet", en: "Full build" },
    readMin: 5,
    parts: [
      "cpu-r5-5600",
      "cooler-ak400",
      "mobo-b550m-a-pro",
      "ram-vengeance-16-d4",
      "ssd-nvme-1tb-g4",
      "gpu-rx6650xt-8gb",
      "case-4000d",
      "psu-650-b",
      "mon-24-180",
    ],
    blocks: [
      {
        h: "Pourquoi 6 cœurs et pas 8",
        p: [
          "En 1080p, c'est votre carte graphique qui limite, pas le processeur. Passer d'un Ryzen 5 5600 à un Ryzen 7 5700X3D ne se voit presque pas en FPS moyen : cela se voit sur les 1% low, donc sur les micro-saccades quand plusieurs unités dessinent la même scène. Sur un budget 1080p, ces dinars sont mieux dépensés en VRAM ou dans l'écran.",
          "Le 5600 a un autre avantage qui compte autant : il est en AM4, donc les cartes mères B450/B550 et la DDR4 restent les moins chères du catalogue. Toute la plateforme est réapprovisionnable en pièces détachées pendant des années.",
        ],
      },
      {
        h: "La carte : 8 Go est un plancher, pas un choix",
        p: [
          "Un 8 Go de VRAM en 2026, c'est le strict minimum pour jouer en 1080p sans que le moteur de jeu fasse des allers-retours en mémoire. Les textures 2025-2026, le ray tracing et surtout la génération d'images mangent bien plus qu'avant. Une carte 8 Go vous fera du 60 images par seconde stables en esport, et des micro-à-coups dès qu'un jeu triple AAA sort en 1440p.",
          "Deux options se valent ici : la RX 6650 XT 8 Go, la plus rapide en raster pur pour le budget 1080p, ou une RTX 4060 8 Go si vous voulez le ray tracing, l'encodage NVENC et un DLSS qui fait une partie du travail à votre place. Comparez les deux au prix du jour dans le tableau.",
        ],
      },
      {
        h: "L'écran est le poste le plus sous-budgeté",
        p: [
          "Le piège absolu en Algérie, ce n'est ni le CPU ni la carte : c'est l'écran. Beaucoup de tours montées à 200 000 DA sont reliées à un écran TN 24 pouces 75 Hz de bureau, acheté séparément. Toute la puissance de calcul est alors gaspillée : le GPU attend le rafraîchissement de l'écran.",
          "Un 24 pouces 180 Hz en dalle IPS est le meilleur dinar par image de cette build. L'IPS n'est pas un luxe : c'est ce qui évite les bandes verticales et les couleurs délavées d'un TN d'entrée de gamme. Si vous voulez plus de fréquence, un 24 pouces 200 Hz figure aussi au catalogue pour presque le même prix.",
        ],
      },
      {
        h: "L'alimentation : 650 W, et pourquoi pas 750",
        p: [
          "Le 5600 tire 65 W, une RX 6650 XT autour de 180 W, et tout le reste (carte mère, RAM, SSD, ventilateurs) environ 150 W. Vous êtes à un peu moins de 400 W en pointe. La règle classique est de rester à 30-40 % de charge, ce qui mène ici à une 650 W : exactement le palier le plus vendu et le moins cher au watt.",
          "Prendre 750 W « au cas où » coûte de l'argent et ne sert à rien tant que la carte ne change pas. Si vous voulez vraiment ajouter une carte 250 W plus tard, la 750 W se justifie, et c'est le moment de l'acheter, pas celui de la prévoir.",
        ],
      },
      {
        h: "Ce qui reste après cette config",
        p: [
          "Il reste de la place pour deux améliorations sans toucher à la carte mère : passer à 32 Go de DDR4, et ajouter un SSD secondaire. Les deux se font sur des emplacements qui existent déjà sur la B550M-A Pro, qui a deux ports M.2. C'est la définition d'un bon premier PC : une base qui accepte de vieillir, pas un assemblage figé.",
        ],
      },
    ],
    pitfalls: [
      "B550 + Ryzen 5 5600 : aucun souci de BIOS, le support est natif. En revanche les B450 d'occasion demandent souvent une mise à jour du BIOS.",
      "Longueur de la carte graphique : comparez-la dans la fiche produit avec la limite de votre boîtier. Une 330 mm type RTX 5080 ne passe pas partout, une 235-240 mm passe partout.",
      "DDR4 3200 CL16 suffit. Passer en 3600 coûte plus cher en DA pour 1 à 2 % de gain sur AM4 : ça ne vaut pas l'écart.",
      "Deux barrettes identiques (2 x 8 Go) valent mieux qu'un mélange 2 x 8 Go + 4 Go, qui perd le dual channel.",
    ],
  },
  {
    slug: "carte-graphique-prix-2026",
    title: "Cartes graphiques en Algérie : ce que 8 Go coûtent vraiment en 2026",
    hook: "Les paliers de VRAM sont réels, mais le point d'entrée a remonté dans les prix. Avec les prix en direct dans le tableau ci-dessous, voici quel palier votre budget achète réellement et où se situe la falaise des 8 Go.",
    kind: "guide",
    topic: { fr: "Carte graphique", en: "Graphics card" },
    readMin: 5,
    parts: [
      "gpu-rx580-8gb",
      "gpu-rx6600-8gb",
      "gpu-rx6650xt-8gb",
      "gpu-rtx4060-8gb",
      "gpu-rx7600xt-16gb",
      "gpu-rx9060xt-16gb",
      "gpu-rx9070xt-16gb",
      "gpu-rtx5070ti-16gb",
      "gpu-rx7900xtx-24gb",
    ],
    blocks: [
      {
        h: "La falaise des 8 Go est réelle, et plus haute qu'on ne le suppose",
        p: [
          "Huit gigaoctets étaient confortables il y a trois ans. Ce n'est plus le cas, et la raison est mécanique plutôt que marketing. Textures plus détaillées, ray tracing avec reflets, et surtout le frame generation - qui maintient en mémoire une image interne, les données de mouvement et une image finale agrandie - se disputent le même bassin. Quand celui-ci déborde, vous n'obtenez pas un ralentissement régulier mais des à-coups, et une fluidité qui ne s'améliore pas en moyenne.",
          "C'est le prix qui décide de l'importance réelle du problème. Seule la RX 580, tout en bas de ce tableau, se trouve dans la fourchette où 8 Go est vraiment correct vu son âge. La RX 6600 et la RX 6650 XT se situent nettement au-dessus - et ce sont les cartes que la plupart des gens appellent un achat 1080p. La 6650 XT a coûté près de trois fois la 6600 pour les mêmes 8 Go, une manière dure d'apprendre que le point d'entrée avait bougé.",
        ],
      },
      {
        h: "Où chaque palier se situe",
        p: [
          "La porte d'entrée de cette page est la RX 580, et à ce prix son âge n'a aucune importance. C'est une carte 1080p complète pour le bureautique, le montage vidéo et les jeux anciens.",
          "Les cartes 8 Go qui sont réellement actuelles, la RX 6600 et la RTX 4060, occupent deux marchés totalement différents, séparés par des dizaines de milliers de dinars pour une carte globalement plus rapide. Il vaut la peine de se demander laquelle correspond à votre usage avant de les traiter comme des alternatives.",
          "La première carte 16 Go de cette page est la RX 7600 XT, et c'est la comparaison la plus intéressante : 16 Go pour moins qu'une RTX 4060 en 8 Go. Si la VRAM est votre critère plutôt que la performance raster, cette comparaison tranche à elle seule.",
        ],
      },
      {
        h: "Pourquoi AMD gagne sur ce marché précisément",
        p: [
          "En raster pur, les cartes AMD donnent davantage d'images par dinar en Algérie, et l'écart de VRAM est devenu leur argument principal. La RX 7600 XT associe 16 Go à un prix que les équivalents NVIDIA n'approchent pas à ce palier.",
          "NVIDIA garde l'avantage sur le ray tracing, l'encodage vidéo et un écosystème d'upscaling plus large. La RTX 4060 est une carte cohérente pour un créateur qui joue aussi ; c'est un mauvais rapport qualité-prix pour un joueur qui n'encode pas.",
          "Pour un joueur pur la règle est simple : prenez le meilleur prix par image avec au moins 12 Go. Le tableau est trié pour permettre exactement cette comparaison plutôt que de vous fier à un classement.",
        ],
      },
      {
        h: "Le piège des annonces",
        p: [
          "Sur Ouedkniss, la première annonce d'une catégorie est presque toujours un piège : un prix d'appel qui n'est pas le vrai prix, une carte défectueuse sans mention, ou un clavier, un boîtier et une carte graphique dans la même annonce. Les pages produit de ce site montrent les offres de magasins vérifiés triées par prix. Lisez celles-là, pas le premier résultat de recherche.",
          "Le second piège est de comparer une offre d'occasion à une offre neuve sans vérifier qui vend. Une RX 580 à la moitié du prix neuf n'est pas une affaire quand le vendeur n'a ni facture ni garantie : votre risque est le prix complet et votre couverture est nulle.",
        ],
      },
    ],
    pitfalls: [
      "Ne comparez jamais deux annonces d'occasion sans vérifier le nombre d'offres. Une annonce unique sans photos nettes est rarement une bonne affaire.",
      "La longueur d'une carte est une contrainte physique, pas une préférence. Vérifiez les millimètres contre votre boîtier avant de vous engager au-delà de 240 mm.",
      "Une carte qui demande un connecteur 16 broches exige une alimentation qui le fournit, et seul le câble livré d'origine doit être utilisé.",
      "Les cartes à deux ventilateurs chauffent plus que celles à trois. À prix égal en 1080p deux ventilateurs restent un bon compromis ; en 1440p privilégiez le refroidissement.",
      "Ne lisez pas les chiffres d'indice de ce site comme des benchmarks mesurés. C'est notre estimation arrondie, étiquetée comme telle, et les sources sont liées sous chaque pièce.",
    ],
  },
  {
  slug: "config-pc-230k-da",
  title: "Un PC de jeu à 230 000 DA qui est réellement équilibré",
  hook: "Huit pièces choisies pour atterrir près de 230 000 DA, avec le raisonnement derrière chacune. Le total en direct est en haut de cette page et bouge chaque jour : ce qui suit est le raisonnement, pas le calcul.",
  kind: "build",
  topic: { fr: "Build complet", en: "Full build" },
  readMin: 5,
  parts: [
    "cpu-r5-7500f",
    "cooler-ak400",
    "mobo-b650m",
    "ram-16gb-d5-5600",
    "ssd-nm620-1tb",
    "gpu-rx6600xt-8gb",
    "case-budget",
    "psu-650-gold",
  ],
  blocks: [
    {
      h: "Ce que cette machine est vraiment",
      p: [
        "Une plateforme AM5 avec un Ryzen 5 7500F, 16 Go de DDR5-5600 et une RX 6600 XT. En 1080p cette carte tient des cadences élevées sur presque tout, et le 7500F a assez de vitesse mono-thread pour que le processeur ne soit jamais la raison d'une image manquante.",
        "Ce n'est pas une machine 4K, ni une machine 1440p confortable. C'est une machine 1080p avec la possibilité d'ajouter une deuxième barrette de mémoire plus tard, ce qui est de loin l'évolution la plus probable dans sa vie.",
      ],
    },
    {
      h: "La répartition, ligne par ligne",
      p: [
        "La carte graphique représente environ un tiers de cette configuration. Le processeur et la carte mère ensemble valent un peu moins d'un autre tiers. Tout le reste - mémoire, stockage, refroidissement, boîtier, alimentation - occupe le solde.",
        "Ce ratio est tout l'argument. Une configuration 1080p équilibrée met environ un tiers de son budget dans la carte graphique et un quart dans la plateforme, car ce sont les deux pièces qui décident si la machine paraît rapide. Le tiers restant est là où les gens paient trop sans s'en rendre compte.",
      ],
    },
    {
      h: "Où l'on peut réellement économiser",
      p: [
        "Le dissipateur. L'AK400 refroidit un processeur de 65 W sans discussion et coûte moins de la moitié d'un AIO de 240 mm. Un watercooling ne se justifie qu'au-dessus de 105 W, et ici nous sommes à 65 W.",
        "Le boîtier. La RX 6600 XT mesure 242 mm de long ; presque toutes les tours ATX du marché l'accumulent. Rien dans le boîtier d'entrée de gamme à fenêtre ne change le nombre d'images par seconde.",
        "Le chipset. Une carte B650 est le minimum pour AM5, il n'y a donc rien en dessous à sauter. Vous êtes déjà sur la plateforme la moins chère qui accepte ce processeur.",
      ],
    },
    {
      h: "Où économiser coûte la machine",
      p: [
        "L'alimentation. C'est la seule ligne qui n'a pas de plancher acceptable. Le 7500F et la RX 6600 XT tirent environ 300 W ensemble, et les cartes récentes demandent de brèves pointes de tension au démarrage qu'une alimentation sans marque ne fournit pas. Un 650W Gold est le bon format, et aucune unité moins chère ne vaut le risque d'emballer la carte mère avec.",
        "Le stockage. Le NVMe de 1 To est la ligne la moins spectaculaire et celle qui provoque le plus de regrets. Les jeux récents occupent de 80 à 150 Go chacun. Un disque de 512 Go est plein en un an d'usage normal, et vous supprimez alors des jeux pour faire de la place.",
      ],
    },
    {
      h: "Ce qu'elle ne fera pas",
      p: [
        "En 1440p la RX 6600 XT est jouable mais pas confortable : vous tiendrez une fréquence fixe en réglages compétitifs et perdrez en natif sur les réglages élevés. Si vous comptez jouer au-dessus de 1080p, l'évolution honnête est la carte graphique, pas le processeur.",
        "La mémoire est de 16 Go sur une carte qui en accepte davantage. Si vous savez que vous monterez des vidéos ou lancerez beaucoup d'onglets en même temps qu'un jeu, ajoutez une deuxième barrette de 16 Go maintenant pendant que le slot est libre.",
      ],
    },
  ],
  pitfalls: [
    "Ne remplacez pas le 650W par une unité sans marque de 450W pour économiser quelques milliers de dinars. L'économie est faible et le risque est la carte mère.",
    "La RX 6600 XT mesure 242 mm. Vérifiez la longueur maximale acceptée par le boîtier avant de commander : c'est la raison la plus fréquente pour laquelle un PC par ailleurs terminé ne se ferme pas.",
    "Un disque de 512 Go est le mauvais endroit pour économiser sur un PC que vous comptez garder. Les jeux le remplissent plus vite qu'on ne le croit.",
    "N'achetez pas d'AIO pour un processeur de 65 W. L'argent n'achète rien de mesurable et ajoute une pompe qui peut tomber en panne.",
    "Les cartes AM5 demandent de la DDR5. Une barrette DDR4 ne s'enfoncera pas, et une DDR5 ne passe pas sur une B450.",
  ],
},
  {
    slug: "config-pc-250k-da",
    title: "Le palier 250 000 DA : le 1080p qui ne fait aucun compromis",
    hook: "Une carte 12 Go, 32 Go de mémoire et un écran 180 Hz. À ce budget, la question n'est plus « comment tenir 60 images par seconde » mais « quelle marge je garde pour les jeux de 2027 ».",
    kind: "build",
    topic: { fr: "Build complet", en: "Full build" },
    readMin: 4,
    parts: [
      "cpu-r5-5600",
      "cooler-ak620",
      "mobo-b550m-a-pro",
      "ram-vengeance-32-d4",
      "ssd-nvme-1tb-g4",
      "gpu-rx6700xt-12gb",
      "case-4000d",
      "psu-650-b",
      "mon-24-180",
    ],
    blocks: [
      {
        h: "Où va l'écart par rapport au palier d'entrée",
        p: [
          "Trois postes changent par rapport à une configuration d'entrée : la carte graphique passe à 12 Go de VRAM, la mémoire passe à 32 Go, et l'écran passe à 180 Hz. Ce sont exactement les trois postes qui limitent le plus une machine en 1080p.",
          "Le reste est délibérément identique. Une B550 plutôt qu'une B450 pour le PCIe 4.0 du SSD, un vrai ventirail en tour plutôt que le modèle d'entrée, et un boîtier correct. C'est un budget qui se voit dans les pièces, pas dans le marketing.",
        ],
      },
      {
        h: "Pourquoi 12 Go de VRAM change la donne",
        p: [
          "En 1080p, la carte limite avant tout quand la VRAM manque. Les textures de fond des jeux récents, le ray tracing et la génération d'images consomment beaucoup plus qu'il y a deux ans, et une carte 8 Go commence à montrer des à-coups même en 1080p.",
          "Une RX 6700 XT 12 Go ou une RTX 5070 12 Go vous offrent une marge confortable. Le surcoût par rapport à une carte 8 Go de la génération précédente est le poste le plus rentable de tout ce palier.",
        ],
      },
      {
        h: "32 Go de mémoire, pas 16",
        p: [
          "16 Go restent suffisants pour jouer. Mais à 32 Go, vous pouvez laisser tourner un jeu, un navigateur avec beaucoup d'onglets, Discord et un logiciel de capture en même temps sans rien voir ralentir. Sur une machine qui doit durer cinq ans, c'est un investissement qui évite une frustration en 2029.",
          "Le kit 32 Go du tableau est en DDR4-3200, ce qui est le maximum raisonnable pour AM4. Ne payez pas plus cher un kit plus rapide : le gain sur AM4 est de 1 à 2 %.",
        ],
      },
      {
        h: "L'alimentation et la place pour durer",
        p: [
          "Le 5600 (65 W) plus une 6700 XT (230 W) plus 150 W de base font environ 445 W en pointe. Une 650 W est le bon palier : elle reste à un taux de charge confortable, donc silencieuse, et elle laisse de la place pour une carte plus grosse dans deux ans.",
          "Le boîtier 4000D a un vrai airflow, deux baies de 2,5 pouces et de la place pour un second dissipateur en tour. Ce n'est pas un détail : une tour d'entrée qui limite la taille du dissipateur vous limitera aussi dans cinq ans.",
        ],
      },
    ],
    pitfalls: [
      "Ne prenez pas un kit DDR4 plus cher et plus rapide que celui du tableau : sur AM4, le gain est négligeable.",
      "Un boîtier premier prix limite la hauteur du dissipateur et la longueur de la carte graphique. Vérifiez ces deux cotes avant de commander.",
      "L'écran 180 Hz du tableau est la moitié du budget d'affichage. Ne le remplacez pas par un écran de bureau 75 Hz pour économiser.",
      "Une 650 W suffit pour cette configuration. Une 750 W ne sert que si vous savez que vous changerez de carte plus tard.",
      "Si le budget est serré, coupez sur le boîtier avant de couper sur la mémoire ou l'alimentation.",
    ],
  },
  {
    slug: "bureautique-etudes-90k",
    title: "PC bureautique et études : ce que 90 000 DA achètent vraiment",
    hook: "Un PC pour bureautique, rédaction et révisions tient toujours dans les 90 000 DA, à une condition : un processeur avec graphique intégré, et aucune carte graphique. Voici la config exacte, et où vont les quelques milliers de dinars si vous en avez plus.",
    kind: "build",
    topic: { fr: "Build complet", en: "Full build" },
    readMin: 5,
    parts: [
      "cpu-r3-3200g",
      "cooler-am1204",
      "mobo-a520m",
      "ram-vengeance-16-d4",
      "ssd-nvme-512gb",
      "case-nx400",
      "psu-450-b",
    ],
    blocks: [
      {
        h: "Les 90 000 DA tiennent, à condition de ne pas acheter de carte graphique",
        p: [
          "Faites l'addition poste par poste avec les prix du tableau ci-dessus et la situation apparaît : le processeur, la mémoire et le SSD coûtent à eux trois plus cher que ce que couvrent la plupart des annonces « 90 000 DA ». Ces annonces sont souvent une tour SANS carte graphique, ou avec une carte d'occasion dont plus personne ne garantira rien dans six mois.",
          "Le vrai problème du budget bureautique reste l'écran. Si vous en avez déjà un, cette config est honnête. Si vous devez tout acheter, ajoutez un 24 pouces et le budget double.",
        ],
      },
      {
        h: "Pourquoi un processeur AVEC graphique intégré",
        p: [
          "La plupart des processeurs récents existent en deux variantes, et la lettre F signifie « sans graphique intégré ». Une telle puce ne sort rien du tout sans carte : écran noir, pas même le BIOS. C'est exactement pour cela qu'on choisit ici un APU comme le Ryzen 3 3200G : son GPU Vega intégré sort le signal vidéo et suffit largement à un poste de travail.",
          "Un i5-12400F à 33 900 DA aurait exigé une carte graphique à 32 900 DA de plus pour seulement fonctionner. Ce raccourci coûte 66 800 DA de plus que le 3200G seul, pour un gain de performance qui n'existe pas en bureautique. C'est de loin le premier poste où il faut économiser.",
        ],
      },
      {
        h: "Où faire les économies, et où ne pas les faire",
        p: [
          "Deux postes absorbent une économie légitime. Le boîtier : un Antec NX400 coûte nettement moins cher qu'un Corsair 4000D et fait le même travail pour cette taille de carte. Et la mémoire : 16 Go est le minimum acceptable, mais un seul kit suffit, pas 2 x 16 Go.",
          "Un poste ne doit pas être économisé, c'est le SSD. Un 512 Go NVMe à 14 500 DA coûte 5 600 DA de plus qu'un 240 Go SATA à 8 900 DA, et c'est la différence la plus visible de toute la machine : démarrage, ouverture d'un navigateur, mise à jour de Windows. Sur un poste bureautique, le SSD est roi, la mémoire vient ensuite, et le CPU est largement suffisant.",
        ],
      },
      {
        h: "Études : ce qui compte vraiment",
        p: [
          "Pour des études (Word, Excel, PDF, navigateur avec quarante onglets, visio, code), le classement des postes par importance est inversé par rapport au gaming : le SSD est roi, la mémoire vient ensuite, le CPU est large, la carte graphique ne sert presque à rien. Un 512 Go NVMe est le minimum, et un disque dur mécanique en complément, si vous archivez, est très bien.",
          "Le seul vrai piège spécifique aux étudiants : acheter une tour sans carte graphique en se disant qu'on ajoutera une plus tard. Le jour où vous voulez jouer, il faut en plus acheter la carte, l'alimentation, et parfois un boîtier qui ne passe plus. Une tour complète à ce niveau vous fait jouer ce soir.",
        ],
      },
    ],
    pitfalls: [
      "La lettre F signifie « sans iGPU ». Une puce F sans carte graphique ne donne aucune image, pas même au BIOS : choisissez un APU.",
      "Ne surdimensionnez pas l'alimentation : 450 W suffit ici, précisément parce qu'il n'y a pas de carte graphique. Le jour où vous en ajoutez une, il faut 550 W.",
      "8 Go de RAM en 2026, c'est fini : un navigateur à quelques onglets suffit à ramer la machine. 16 Go, c'est le plancher.",
      "Un 256 Go de SSD est une fausse économie : Windows et ses mises à jour consomment déjà une centaine de gigaoctets, et la capacité est pleine avant la fin de l'année.",
      "Si votre filière exige une carte graphique, vérifiez alors la longueur acceptée par le boîtier : c'est standard, mais pas universel.",
    ],
  },
  {
    slug: "carte-mere-am4-ou-am5",
    title: "Carte mère : B450, B550 ou AM5, ce que vous payez vraiment",
    hook: "Le chipset ne fait pas la machine. Ce que chaque chipset apporte réellement, quand AM4 est encore le bon choix, et les trois pièges qui font acheter la carte mère trop chère.",
    kind: "guide",
    topic: { fr: "Plateforme", en: "Platform" },
    readMin: 4,
    parts: [
      "mobo-h610m",
      "mobo-a520m",
      "mobo-b450m",
      "mobo-b550m-a-pro",
      "mobo-b560m",
      "mobo-b760m",
      "mobo-a620m",
      "mobo-b650m",
      "mobo-b650e",
      "mobo-x870e",
    ],
    blocks: [
      {
        h: "Le chipset ne fait pas la machine",
        p: [
          "Ce qui fait la machine, c'est le processeur, la mémoire et la carte graphique. Le chipset, c'est de l'équipement autour : nombre de ports, slots M.2, version du PCIe, connectivité. Aucun de ces éléments ne change une image par seconde.",
          "Concrètement, une B450 et une B550 donnent exactement les mêmes performances avec le même CPU et la même carte. La B550 ajoute le PCIe 4.0 pour le SSD et l'overclocking. C'est utile, ce n'est pas decisive.",
        ],
      },
      {
        h: "AM4 : la plateforme qui a encore de l'avenir",
        p: [
          "AM4 est sortie en 2019 et elle n'est pas finie. Le catalogue montre encore des B450 et des B550 à des prix qui n'ont rien à voir avec les AM5, et le 5600 y est très bien en 1080p. Pour un PC qui doit durer trois ans, c'est le choix rationnel.",
          "Le piège est ailleurs : une B450 d'occasionees peut être trop ancienne pour démarrer un 5600 sans mise à jour du BIOS. Une carte qui ne s'allume pas est un ticket de retour. Achetez une B450 qui supporte explicitement votre CPU, ou prenez la B550, l'écart de prix est faible.",
        ],
      },
      {
        h: "AM5 : payer pour quoi",
        p: [
          "Sur AM5, le vrai argument est la durée de vie du socket, pas la vitesse. Les processeurs AM5 se succèdent jusqu'à la fin de la décennie, donc une carte mère AM5 achetée en 2026 vous donnera encore des upgrades pendant des années.",
          "Entre B650, B850 et X870, regardez ce que vous utilisez vraiment : deux ports M.2, du Wi-Fi, un VRM correct. Le X870E du tableau est une carte prévue pour l'overclocking et le PCIe 5.0, deux choses dont la majorité des joueurs n'a pas besoin.",
        ],
      },
      {
        h: "mATX suffit presque toujours",
        p: [
          "Une carte mATX couvre la quasi-totalité des builds : deux à quatre slots DIMM, un ou deux M.2, quatre SATA. Le format ATX n'apporte que deux choses, plus de slots d'extension et des connecteurs derrière.",
          "N'achetez donc du format ATX que si vous savez pourquoi : trois cartes graphiques (inutile), quatre disques en plus (rare), ou une grande dissipation sur le dessus.",
        ],
      },
    ],
    pitfalls: [
      "Une B450 trop ancienne ne démarre pas un Ryzen 5 5600 sans mise à jour du BIOS, et la mise à jour peut être impossible avant même d'avoir un écran.",
      "Vérifiez le type de mémoire avant d'acheter : une carte DDR5 ne prend pas de DDR4, et l'inverse est vrai aussi. C'est l'erreur la plus fréquente et la plus irrécupérable.",
      "Le M.2 n'est pas toujours un vrai M.2. Sur certaines cartes, le deuxième port partage les lignes PCIe avec des ports SATA : l'un des deux se désactive.",
      "Les entrées SATA et le nombre de ports M.2 dépendent du modèle exact, pas du chipset. Lisez la fiche du produit, pas la liste du chipset.",
      "Une carte mère d'occasion avec un seul port M.2 et pas de Wi-Fi vous oblige à tout racheter en PCIe, c'est souvent moins cher de prendre une carte neuve.",
    ],
  },
  {
    slug: "memoire-ddr4-ou-ddr5",
    title: "DDR4 ou DDR5 : l'écart qui décide de votre plateforme",
    hook: "Un kit 32 Go DDR4 coûte une fraction du kit 32 Go DDR5 placé dans le même tableau. Cet écart décide de la plateforme avant le moindre chiffre de fréquence — voici comment le dépenser.",
    kind: "guide",
    topic: { fr: "Mémoire", en: "Memory" },
    readMin: 5,
    parts: [
      "ram-value-8-d4",
      "ram-vengeance-16-d4",
      "ram-32gb-d4-3600",
      "ram-16gb-d5-5600",
      "ram-delta-32-d5",
      "ram-32gb-d5-6400",
      "ram-48gb-d5-6000",
    ],
    blocks: [
      {
        h: "Les chiffres qui tranchent",
        p: [
          "Il n'existe aucune carte mère AM5 qui accepte de la DDR4, et aucune carte AM4 ou LGA1700 qui accepte de la DDR5. La question de la mémoire n'a pas de réponse indépendante : elle découle du processeur que vous avez déjà choisi.",
          "Sur le tableau de cette page, 32 Go de DDR4-3600 et 32 Go de DDR5-6000 sont séparés par un écart assez large pour acheter la carte graphique plusieurs fois. Ce n'est pas un arrondi.",
          "En jeu, les deux générations se situent à quelques pour cent l'une de l'autre, et seulement quand le processeur est le facteur limitant, ce qui est rare en 1080p et 1440p. Le calcul n'est donc pas « laquelle est plus rapide ». C'est : avez-vous besoin de la nouvelle plateforme au point de payer cet écart pour une mémoire que vous ne ressentirez pas ?",
        ],
      },
      {
        h: "Le seul résultat DDR4 à connaître",
        p: [
          "Le kit 32 Go DDR4-3600 est le meilleur rapport qualité-prix du catalogue mémoire, et pas de peu : un kit 16 Go DDR4-3200 coûte à peine plus de la moitié pour la moitié de la capacité.",
          "Si vous construisez en AM4 et avez décidé de rester dessus, ce kit est le bon achat et rien du côté DDR5 de ce tableau ne le bat sur ce critère. La capacité compte davantage que la génération à tous les prix où les deux sont disponibles.",
        ],
      },
      {
        h: "16 Go ou 32 Go",
        p: [
          "16 Go en 2026 est la norme, pas le minimum. 8 Go est terminé : un navigateur avec quelques onglets et Discord en arrière-plan suffisent à l'épuiser avant même le lancement d'un jeu. Le kit 8 Go DDR4 figure dans ce tableau pour montrer où est le plancher, pas pour être recommandé.",
          "32 Go se justifie quand vous faites autre chose en jouant : diffuser avec le encodeur, monter des vidéos, faire tourner des machines virtuelles, ou simplement laisser un jeu tourner pendant que vous travaillez. En AM4, cette capacité coûte presque rien au regard de ce qu'elle coûte en AM5, ce qui est un autre débat.",
          "Le seul cas où 32 Go est obligatoire pour le jeu pur : si vous comptez garder cette machine après 2030. Prenez-la d'un bloc plutôt que d'ajouter plus tard une barrette dépareillée, car mélanger les capacités perd le double canal.",
        ],
      },
      {
        h: "DDR5-6000, et pas plus",
        p: [
          "Sur Ryzen, la fréquence mémoire doit rester liée à celle du contrôleur mémoire. Au-delà, le transfert de données demande plus de cycles qu'il n'en économise. La DDR5-6000 avec des timings raisonnables est le point d'équilibre, et c'est ce qu'AMD recommande elle-même.",
          "Au-dessus de 6000, vous payez deux fois pour trois choses : une stabilité moindre avec quatre barrettes, l'obligation de régler les timings à la main, et dans notre catalogue un prix plus élevé pour la même capacité. Le kit 6400 vous achète 400 MT/s et aucune image.",
        ],
      },
      {
        h: "La question RGB, honnêtement",
        p: [
          "Un kit éclairé coûte régulièrement plus cher qu'un kit sans éclairage à fréquence et timings identiques. Côté DDR5 le palier de prix est net, et un kit 32 Go DDR5-6000 face à un kit 6400 de capacité équivalente n'est pas une prime pour l'éclairage : c'est une prime de fréquence qui inclut l'éclairage.",
          "La seule vraie réserve est physique. Certains kits sans LED utilisent un PCB plus grossier et des dissipateurs plus hauts qui gênent un grand dissipateur à tour. Si vous associez la mémoire à un double tour comme ceux de notre guide refroidissement, vérifiez la hauteur des barrettes contre le dégagement du dissipateur.",
        ],
      },
    ],
    pitfalls: [
      "Le type de mémoire est lié à la carte mère. La DDR5 ne démarre pas sur une B450 ou B550, et la DDR4 ne passe pas sur une B650.",
      "Deux barrettes valent mieux qu'une. Un kit 2x16 Go fonctionne en double canal ; une seule barrette de 32 Go non.",
      "Mélanger un kit 16 Go et un kit 8 Go perd le double canal et ne bénéficie d'aucune garantie constructeur.",
      "Le XMP ou l'EXPO est désactivé par défaut dans le BIOS. Sans lui, votre mémoire tourne à sa fréquence de base, bien en dessous de ce que vous avez payé.",
      "Ne descendez pas sous 16 Go pour économiser quelques milliers de dinars. C'est la pire économie possible dans tout le catalogue.",
    ],
  },
  {
    slug: "stockage-nvme-vs-sata",
    title: "NVMe ou SATA : le piège du stockage pas cher",
    hook: "Un SSD SATA à 256 Go coûte trois fois moins cher qu'un NVMe de même capacité, et tout le PC le ressent. Où est la vraie frontière, et combien de capacité il vous faut vraiment.",
    kind: "guide",
    topic: { fr: "Stockage", en: "Storage" },
    readMin: 4,
    parts: [
      "ssd-sata-256gb",
      "ssd-sata-512gb",
      "ssd-sata-1tb",
      "ssd-nvme-256gb",
      "ssd-nvme-512gb",
      "ssd-nvme-1tb-g4",
      "ssd-nvme-2tb",
      "ssd-980pro-1tb",
      "ssd-gen5-1tb",
    ],
    blocks: [
      {
        h: "Le SATA n'est pas faux, il est mal placé",
        p: [
          "Un SSD SATA est environ deux à trois fois plus lent qu'un NVMe en lecture séquentielle, et la différence se voit sur tout ce qui charge beaucoup de fichiers : le démarrage de Windows, l'ouverture d'un jeu, le chargement d'un projet de montage. Sur un disque dur mécanique, le saut vers le SATA est énorme ; entre SATA et NVMe, le saut est réel mais il ne justifie pas de payer le NVMe en double pour un disque secondaire.",
          "La règle : le disque système en NVMe, les jeux en SATA si vous voulez étendre, les archives où vous voulez. Un NVMe en 512 Go pour Windows et les deux jeux du moment, plus un SATA 1 To pour le reste, est une répartition plus intelligente qu'un seul disque de 1 To.",
        ],
      },
      {
        h: "La capacité compte plus que la marque",
        p: [
          "Un jeu triple AAA occupe entre 80 et 150 Go. Windows et ses mises à jour consomment une centaine de gigaoctets à elles seules, sans rien installer de votre part. Sur un 256 Go, vous êtes pleins avant la fin de l'année et vous commencez à désinstaller.",
          "En 2026, 512 Go est le minimum raisonnable et 1 To est le point de confort. L'écart de prix entre 512 Go et 1 To est plus faible que l'écart entre le neuf et l'occasion d'un même modèle : c'est souvent le meilleur rapport valeur/prix de toute une config.",
        ],
      },
      {
        h: "Gen 3, Gen 4, Gen 5 : ce qui compte vraiment",
        p: [
          "L'interface PCIe, c'est le nombre maximal de voies, pas la vitesse du disque. Un NVMe Gen 4 à 7000 Mo/s sera toujours plus rapide qu'un Gen 3 à 3500 Mo/s, mais pour un disque système, la différence devient faible une fois le seuil où le système de fichiers n'attend plus passé.",
          "Le Gen 5 du tableau ne se justifie que si votre carte mère a un slot M.2 Gen 5 et un dissipateur pour le SSD. Sur une B650 ou une X870E, ce n'est pas le cas de la plupart des modèles. C'est de l'argent jeté par la fenêtre.",
        ],
      },
      {
        h: "Le piège du M.2 qui n'est pas un M.2",
        p: [
          "Sur certaines cartes mères, le deuxième port M.2 partage ses lignes PCIe avec deux ports SATA. Si vous branchez un SSD sur le M.2 secondaire, deux SATA se désactivent silencieusement. Le manuel de la carte le dit, la fiche produit souvent non.",
          "Avant d'acheter plusieurs disques, comptez vos emplacements : M.2 réels, SATA disponibles, ports USB pour un disque externe de secours. Un disque externe en USB 3.2 pour les archives vaut mieux qu'un disque interne qui désactive vos SATA.",
        ],
      },
    ],
    pitfalls: [
      "Un disque système en SATA se sent, surtout au démarrage et au chargement des jeux. C'est le premier upgrade à faire sur un PC ancien.",
      "Le 256 Go est une fausse économie : le disque est plein avant que la garantie ne soit finie.",
      "La forme doit correspondre à l'emplacement : un M.2 2242, plus court, ne rentre pas dans tous les logements M.2 2280.",
      "Ne supprimez pas la partition de restauration pour gagner de la place : vous n'aurez plus de solution rapide si Windows casse.",
      "Un SSD sans garantie, c'est un disque sans garantie. Le prix affiché sur une annonce d'occasion n'inclut souvent aucune protection.",
    ],
  },
  {
    slug: "choisir-alimentation-pc",
    title: "Alimentation : pourquoi la puissance n'est pas ce qu'il faut optimiser",
    hook: "Une fois la puissance calculée, il ne reste qu'une seule vraie variable : la qualité. Ce que le 80+ change réellement, ce qu'est un câble modulaire, et ce qu'ATX 3.x apporte avec les nouvelles cartes.",
    kind: "guide",
    topic: { fr: "Alimentation", en: "Power supply" },
    readMin: 4,
    parts: [
      "psu-400-b",
      "psu-450-b",
      "psu-550-b",
      "psu-650-b",
      "psu-650-gold",
      "psu-800-gold",
      "psu-750-gold",
      "psu-mwe650-b",
      "psu-1000-gold",
    ],
    blocks: [
      {
        h: "La puissance n'est pas une variable d'optimisation",
        p: [
          "La puissance se calcule, elle ne s'optimise pas : additionnez la consommation de votre processeur et de votre carte graphique, ajoutez environ 150 W pour le reste, et prenez le palier standard au-dessus. Une fois ce chiffre choisi, tout le reste de la décision porte sur autre chose.",
          "Précision importante : regardez la puissance réellement disponible sur le rail 12 V, pas le nombre sur l'étiquette. Une alimentation ancienne à plusieurs rails peut annoncer 600 W alors que le 12 V ne fournit que 400 W quand tous les rails de cards graphiques sont chargés. Sur les modèles modernes à rail unique, ce problème a disparu.",
        ],
      },
      {
        h: "Le 80+ : ce que ça change vraiment",
        p: [
          "Le label 80+ mesure le rendement à charge. Ce n'est pas un score de qualité, c'est un score d'économie d'énergie, et il a trois effets concrets : moins de chaleur dissipée, moins de courant tiré de la prise, et un ventilateur qui tourne moins vite parce que le boîtier est plus frais.",
          "Le Bronze n'est pas un luxe et n'est pas une arnaque. Il est suffisant. Le Gold devient intéressant quand la machine tourne longtemps à charge élevée, et l'Or au-delà est rarement justifié pour un PC de jeu. Comparez le prix au watt réel entre les modèles du tableau plutôt que le label.",
        ],
      },
      {
        h: "Modulaire, semi-modulaire, non modulaire",
        p: [
          "Une alimentation non modulaire a tous les câbles fixés, même ceux dont vous ne vous servez pas. Le semi-modulaire détache les câbles périphériques (disques, USB), le modulaire les détache tous. Le bénéfice est esthétique et lié à l'airflow, pas électrique : les câbles inutilisés encombrent et bouchent les entrées d'air.",
          "Le point de sécurité : n'utilisez jamais un câble modulaire provenant d'une autre alimentation. Les connecteurs ont la même forme et pas le même câblage. C'est la cause numéro un des COURT-circuits sur une machine neuve.",
        ],
      },
      {
        h: "ATX 3.x et le connecteur 16 broches",
        p: [
          "Les cartes graphiques récentes utilisent un connecteur 16 broches unique, plus compact et capable de faire passer davantage de courant. Les alimentations ATX 3.0 et 3.1 sont conçues pour ce connecteur, avec des tolérances de pic de tension que les anciennes n'ont pas.",
          "Si votre carte a un connecteur 16 broches, utilisez une alimentation ATX 3.x ou le câble 12V-2x6 fourni avec la carte. Un adaptateur sur une alimentation plus ancienne est la cause la plus fréquente de câbles qui fondent.",
        ],
      },
    ],
    pitfalls: [
      "Ne prenez jamais le premier prix du catalogue pour une alimentation. Le poste est peu cher, et c'est celui qui enregistre tous les autres en cas de panne.",
      "Mauvais label n'est pas mauvais chiffre : une Bronze 650 W de marque connue est un meilleur achat qu'une Gold sans marque.",
      "Un câble modulaire d'une autre marque peut fondre. Ne le faites jamais, même si les connecteurs semblent identiques.",
      "Une alimentation soumise à une sous-tension prolongée grille en quelques mois. Sur un réseau instable, l'onduleur est une protection réelle.",
      "Les adaptateurs 8 broches vers 16 broches tiers sont la première cause de fondu du connecteur. Utilisez celui de la carte ou une vraie ATX 3.x.",
    ],
  },
  {
    slug: "refroidissement-pc-algerie",
    title: "Refroidir en été algérien : ce que disent vraiment les chiffres",
    hook: "Oui, il throttle — quelques pour cent, pas la moitié de vos performances. Et le classement des dissipateurs de notre catalogue s'inverse dès qu'on le calcule au watt. Voici la version corrigée.",
    kind: "guide",
    topic: { fr: "Refroidissement", en: "Cooling" },
    readMin: 4,
    parts: [
      "cooler-h212-v3",
      "cooler-ak400",
      "cooler-ak620",
      "cooler-assassin4",
      "cooler-ma621c",
      "cooler-gl120",
      "cooler-lt240",
      "cooler-wl240ft",
    ],
    blocks: [
      {
        h: "Oui il throttle, mais moins que ne le disent les forums",
        p: [
          "Un PC de jeu dans une pièce non climatisée à 45°C ambiant perd quelques pour cent de fréquence de boost. Quelques pour cent sur le processeur, quelques pour cent sur la carte. Ce n'est pas la catastrophe vendue en commentaire, mais ce n'est pas gratuit non plus, et cela se combine avec un dissipateur encrassé.",
          "Le risque qui mérite attention est l'usure, pas la fréquence d'images. Une puce maintenue à 95°C pendant des mois vieillit plus vite qu'une autre maintenue à 70°C. C'est un argument de marge, et c'est pourquoi les valeurs ci-dessous comptent davantage à 40°C ambiant qu'en vitrine.",
        ],
      },
      {
        h: "Le prix au watt inverse le classement",
        p: [
          "Triez les dissipateurs ci-dessus par coût par watt de capacité nominale et l'ordre n'est pas celui qu'on attend. L'AIO GL120 est annoncé 150 W pour un prix inférieur à celui de la double tour MA621C, annoncée 260 W. Par watt de capacité, le petit AIO l'emporte, et ce n'est pas serré.",
          "C'est une conséquence de la façon dont ces pièces sont tarifées sur ce marché plutôt qu'une affirmation que le liquide bat le métal. À prix égal, une tour reste le choix le plus durable : pas de pompe, pas de circuit, et une garantie qui dépasse généralement celle des concurrentes du dissipateur. Le point est que payer plus cher un dissipateur n'apporte pas régulièrement plus de capacité ici : achetez la capacité dont vous avez besoin et arrêtez-vous là.",
          "Pour référence, l'Assassin IV 260 W coûte plus cher que le MA621C pour la même valeur annoncée. Le moins cher est le meilleur rapport qualité-prix, et personne ne vous le dit.",
        ],
      },
      {
        h: "Air ou AIO : l'argument honnête de chacun",
        p: [
          "Un dissipateur à tour est le choix par défaut. Il gère un processeur de 65 à 105 W sans liquide en mouvement, rien qui ne fuie, et aucun point de défaillance au-delà du ventilateur. L'AK400 est annoncé 155 W, ce qui couvre un 7500F ou un 5600 avec une marge confortable.",
          "Un watercooling a deux cas légitimes : un processeur à 120 W ou plus où vous voulez la marge, ou un boîtier compact où une tour de 158 mm ne rentrera pas. Les unités 240 mm ci-dessus sont annoncées 250 W.",
          "Nous ne publions pas de différence de température entre eux, parce que nous n'en avons mesuré aucune et que personne d'autre qui pourrait montrer son travail ne l'a fait. Quiconque vous cite un chiffre précis sur un dissipateur qu'il n'a pas testé répète un nombre, il ne mesure rien.",
        ],
      },
      {
        h: "La pâte thermique : ne touchez à rien",
        p: [
          "La pâte appliquée en usine est suffisante et ne demande pas d'être remplacée selon un calendrier. Elle ne sèche pas en deux ans et ne brûle pas. Un PC qui refroidit bien à la sortie de la boîte refroidira encore correctement trois ans plus tard.",
          "Deux situations justifient d'ouvrir le boîtier : une machine de plus de trois ans, ou une machine montée avec une quantité absurde de pâte. Le dentifrice et l'huile de cuisine ne sont pas des options, et ajouter une seconde couche par-dessus une couche existante non plus : deux couches isolent.",
        ],
      },
      {
        h: "La poussière est le vrai problème algérien",
        p: [
          "Un été algérien est autant un problème de poussière qu'un problème de chaleur, et c'est la poussière qui dégrade les performances année après année. Un dissipateur rempli de fibres perd de sa surface effective, et la température monte régulièrement alors que toutes les autres variables restent identiques.",
          "Un nettoyage tous les douze à dix-huit mois est le seul entretien dont un PC a réellement besoin. Le boîtier compte autant que le dissipateur : entrées filtrées, dégagement à l'arrière et un ventilateur d'extraction font plus pour les températures d'été que passer d'un bon dissipateur à un AIO.",
          "Et ne couvrez jamais les entrées avec un tissu ou un rideau. Le flux d'air avant est ce qui refroidit le processeur.",
        ],
      },
    ],
    pitfalls: [
      "Un watercooling n'est pas plus durable qu'un bon dissipateur. La pompe est le point de défaillance et elle est souvent moins bien garantie.",
      "Vérifiez la hauteur maximale de dissipateur du boîtier avant de commander. Un dissipateur trop haut ne rentre simplement pas, et c'est l'erreur d'assemblage la plus fréquente.",
      "Le dissipateur d'origine d'un Ryzen 7 ou 9 suffit rarement en été. Une tour 120 mm d'entrée de gamme change beaucoup pour très peu.",
      "Ne bouchez jamais les entrées du boîtier. Si la machine est dans une armoire fermée, c'est le problème — pas le dissipateur.",
      "Ne prenez pas une différence de température citée pour une mesure. Nous n'avons pas mesuré les nôtres et nous le disons plutôt que de répéter un chiffre.",
    ],
  },
  {
    slug: "choisir-son-ecran",
    title: "Écran : 1080p ou 1440p, dalle et fréquence, ce qui compte",
    hook: "C'est le poste où l'argent est le plus mal dépensé et le plus visible. Résolution, dalle IPS, fréquence, taille : l'ordre dans lequel décider, et le piège du moniteur de bureau à 75 Hz.",
    kind: "guide",
    topic: { fr: "Écran", en: "Display" },
    readMin: 5,
    parts: [
      "mon-office-24",
      "mon-22-100",
      "mon-24-120",
      "mon-24-144",
      "mon-24-180",
      "mon-mag255f",
      "mon-27-qhd165",
      "mon-32-qhd180",
      "mon-27-4k",
    ],
    blocks: [
      {
        h: "Le piège du moniteur de bureau",
        p: [
          "Le premier réflexe de beaucoup d'acheteurs est de prendre un écran 24 pouces 75 Hz TN de bureau, parce qu'il coûte deux fois moins cher qu'un vrai écran de jeu. Le résultat est une machine à 200 000 DA qui reste bloquée à 75 images par seconde sur des jeux où elle en ferait 150, avec des couleurs délavées et des angles de vision étroits.",
          "Un écran de jeu correct commence par une dalle IPS et 144 Hz au minimum. Le surcoût par rapport à un écran de bureau est faible, et c'est la différence entre une machine qui sert à jouer et une machine qui sert à calculer des images sans les afficher.",
        ],
      },
      {
        h: "La résolution d'abord",
        p: [
          "24 pouces en 1080p et 27 pouces en 1440p sont les deux formats natifs du marché. Ce sont ceux qui donnent la meilleure netteté pour leur taille, et ils sont aussi les moins chers en écrans de taille comparable.",
          "Monter en 1440p demande une carte qui alimente réellement cette résolution en haute fréquence. Une carte d'entrée de gamme qui fait 60 images par seconde en 1080p peut n'en faire que 40 en 1440p : la résolution double la charge. Vérifiez que votre carte listed au tableau tient la fréquence de l'écran que vous choisissez.",
        ],
      },
      {
        h: "TN, VA, IPS : le seul critère qui compte vraiment",
        p: [
          "TN est rapide mais les angles de vision sont mauvais et les couleurs sont ternes : c'est le panneau des écrans de bureau bon marché et des modèles d'il y a dix ans. VA donne des noirs parfaits mais un voile visible sur les écrans clairs, ce qui est pénible sur un fond blanc. IPS est le compromis sûr : angles corrects, couleurs justes, léger voile sur le noir que vous ne remarquerez pas.",
          "Sur les écrans du tableau, privilégiez IPS sans hésiter. Les modèles 100 à 144 Hz peuvent être en VA ou en TN : lisez la fiche technique, le prix seul ne dit rien.",
        ],
      },
      {
        h: "Fréquence : ne payez pas une fréquence que votre carte ne peut pas alimenter",
        p: [
          "Un écran 240 Hz sur une machine qui fait 90 images par seconde ne montre rien de plus. La fréquence maximale utile est celle que votre configuration peut alimenter de façon stable, plus une petite marge pour le 1% low.",
          "En pratique : en 1080p sur une carte milieu de gamme, visez 144 à 180 Hz. En 1440p, visez 165 Hz. Le 240 Hz et au-delà se réserve aux cartes haut de gamme, ou à l'esport où chaque image compte.",
        ],
      },
      {
        h: "La taille",
        p: [
          "Ne rachetez pas un 32 pouces en 1080p : les pixels sont trop gros et l'image est visiblement étirée. Si vous voulez du 32 pouces, c'est du 1440p minimum, et le prix double presque.",
          "Le format 24 pouces 1080p est le plus confortable sur un bureau de 1,40 m ou moins. Le 27 pouces 1440p est le meilleur compromis pour un bureau normal. Un ultrawide 34 pouces est agréable pour jouer et inconfortable pour tout le reste.",
        ],
      },
    ],
    pitfalls: [
      "Un écran de bureau 75 Hz est le premier poste à remplacer sur un PC de jeu. Le gain est immédiat et il n'y a aucun réglage à faire.",
      "Vérifiez la présence du FreeSync ou du G-Sync Compatible : sans ça, le tearing est visible et le confort de jeu en souffre.",
      "La luminosité annoncée ne dit rien du contraste en plein jour. Un écran trop sombre dans un bureau lumineux est inutilisable.",
      "Un écran sans boutons de réglage physique ni menu OSD est un bon signe de modèle d'entrée de gamme : vérifiez la garantie et la politique de pixels morts avant.",
      "Un écran 1440p 165 Hz qui coûte à peine plus cher qu'un 1080p 180 Hz est presque toujours le meilleur achat : la différence de prix est faible et le gain est durable.",
    ],
  },
  {
    slug: "config-pc-300k-da",
    title: "1440p en restant sur AM4 : pourquoi c'est souvent le bon calcul",
    hook: "La même somme en DDR5 et en AM5 achète moins de jeu qu'en AM4. Voici l'argumentaire complet, chiffres du relevé à l'appui, et le moment précis où l'investissement devient justifié.",
    kind: "build",
    topic: { fr: "Build complet", en: "Full build" },
    readMin: 4,
    parts: [
      "cpu-r7-5700x",
      "cooler-ak620",
      "mobo-b550m-a-pro",
      "ram-vengeance-32-d4",
      "ssd-nvme-1tb-g4",
      "gpu-rx7800xt-16gb",
      "case-4000d",
      "psu-650-gold",
    ],
    blocks: [
      {
        h: "L'argument, en une phrase",
        p: [
          "Un kit DDR5 32 Go coûte plusieurs dizaines de milliers de dinars de plus qu'un kit DDR4 32 Go de mêmes performances-perdinars, et le gain en jeu se compte en points de pourcentage, pas en palier de résolution. Sur une machine qui fera de la 1440p, la carte graphique est le poste qui compte, pas la génération de mémoire.",
          "Autrement dit : à budget égal, AM4 vous achète une meilleure carte. C'est le seul critère qui devrait arbitrer.",
        ],
      },
      {
        h: "Ce que AM4 donne et ce qu'AM5 donne",
        p: [
          "AM4 donne : le prix. Cartes B450 et B550 peu chers, DDR4 au plancher, et un Ryzen 7 5700X qui suffit largement à alimenter une carte 16 Go en 1440p. Aucune carte graphique 1440p ne demande un processeur plus costaud.",
          "AM5 donne : la durée. Le socket AM5 recevra encore des processeurs pendant des années, donc une carte mère AM5 achetée aujourd'hui est un investissement. Mais cette durée se paie au moment de l'achat, et elle ne se voit pas à l'écran.",
        ],
      },
      {
        h: "Le seuil de décision",
        p: [
          "La question n'est pas « AM4 ou AM5 », c'est « combien de temps cette machine doit durer ». Si la réponse est trois ans, AM4 gagne sans discussion. Si la réponse est cinq ans ou plus, et que vous comptez monter un X3D ou un 9800X3D plus tard, AM5 commence à se défendre.",
          "Le piège, c'est d'acheter AM4 en 2026 en se racontant qu'on fera un upgrade processeur plus tard. Le jour où vous voudrez le faire, le prix des processeurs AM4 sera plus élevé qu'il n'est aujourd'hui, parce que la production s'arrêtera. Une B550 ne recevra jamais de CPU 3D.",
        ],
      },
      {
        h: "La configuration",
        p: [
          "Le Ryzen 7 5700X est le dernier CPU qui a du sens en AM4 pour du jeu : huit cœurs, 65 W, et il ne bride pas une RX 7800 XT. Le ventirail en tour AK620 du tableau suffit largement, la B550 donne deux M.2, et la 650 W Gold laisse de la marge pour une carte plus puissante.",
          "Le résultat est une machine qui fait du 1440p à haute fréquence aujourd'hui, avec une carte 16 Go qui tiendra cinq ans, et qui ne vous oblige pas à payer le surcoût DDR5. C'est un arbitrage, pas un compromis.",
        ],
      },
    ],
    pitfalls: [
      "N'achetez pas AM4 en pensant monter un X3D plus tard : les processeurs AM4 se font rares et chers, et aucune carte mère B550 ne les supporte.",
      "Un kit DDR4 plus rapide que 3600 ne sert à rien sur AM4 : la limite est physique, au-delà le contrôleur mémoire ne suit pas.",
      "Si vous choisissez cette voie, choisissez une B550 plutôt qu'une B450 : elle supporte nativement tous les CPU AM4, y compris les 5700X, sans mise à jour de BIOS.",
      "Ne coupez pas sur l'alimentation pour financer la carte graphique : c'est l'erreur qui tue le plus de machines dans ce budget.",
      "Le ventirail en tour du tableau prend plus de place qu'un modèle bas : vérifiez la hauteur max du boîtier.",
    ],
  },
  {
    slug: "gaming-1440p-165hz",
    title: "1440p : la config qui reste valable plusieurs années",
    hook: "7600X, B650, DDR5 et une carte 16 Go de VRAM : 1440p 165 Hz sans mettre le reste du budget dans la carte mère. Le raisonnement derrière chaque poste.",
    kind: "build",
    topic: { fr: "Build complet", en: "Full build" },
    readMin: 4,
    parts: [
      "cpu-r5-7600x",
      "cooler-ak620",
      "mobo-b650m",
      "ram-delta-32-d5",
      "ssd-nvme-1tb-g4",
      "gpu-rx7800xt-16gb",
      "case-4000d",
      "psu-750-gold",
      "mon-27-qhd165",
    ],
    blocks: [
      {
        h: "Pourquoi AM5 ici, et pas sur les paliers inférieurs",
        p: [
          "Un PC 1440p se garde cinq ans ou plus : la carte graphique se change, le processeur beaucoup moins. AM5 est le seul socket du catalogue qui vous garantit encore des processeurs dans quatre ans, contre deux pour AM4 et un pour LGA1700. Le surcoût de la plateforme se rentabilise précisément parce que la machine dure.",
          "Le corollaire est important : si votre PC doit durer trois ans, la même somme en AM4 vous fera jouer exactement pareil aujourd'hui. La plateforme ne se voit pas à l'écran, elle se paie en âge.",
        ],
      },
      {
        h: "Le GPU : 16 Go est le seuil en 1440p",
        p: [
          "En 1440p, un 8 Go est déjà court : c'est la résolution où les textures 4K de fond et le ray tracing commencent à faire sentir la limite. Le 16 Go n'est pas un supplément de luxe, c'est la durée de vie de la carte.",
          "Comparez dans le tableau une RX 7600 XT 16 Go et une RX 7800 XT 16 Go. L'écart de prix est visible, et il se traduit par une carte qui ne sera pas à remplacer dans trois ans.",
        ],
      },
      {
        h: "DDR5-6000, pas 6400",
        p: [
          "Sur Ryzen, la fréquence mémoire doit rester liée à l'horloge du contrôleur pour éviter une pénalité de latence. DDR5-6000 avec des latences correctes est le point d'équilibre : au-dessus, vous payez plus pour perdre en stabilité, et il faut ajuster les timings à la main.",
          "Regardez les deux kits DDR5 du tableau côte à côte. Si l'écart de prix est faible, prenez le plus lent. Le 6400 n'apporte rien dans un jeu en 1440p.",
        ],
      },
      {
        h: "Alimentation et boîtier : ne trichez pas ici",
        p: [
          "Un 7600X (105 W) plus une 7800 XT (250 W) plus 150 W de base, cela fait un peu plus de 500 W. Une 750 W Gold laisse une vraie marge, dissipate bien et reste silencieuse à charge partielle, ce qui est le cas le plus fréquent.",
          "Sur le boîtier, la seule contrainte sérieuse est la longueur de la carte. Une 7800 XT fait 287 mm ; les plus grosses cartes du catalogue atteignent 330 mm. Comparez la longueur dans la fiche produit avec la limite du boîtier avant de commander, c'est le seul piège qui casse une commande.",
        ],
      },
    ],
    pitfalls: [
      "Les kits DDR5-6400 CL32 coûtent plus cher que les 6000 CL30 pour moins de stabilité sur quatre barrettes. Ne payez pas la montée en fréquence.",
      "Mettez le BIOS à jour avant d'installer Windows : les premières B650 avaient des problèmes de compatibilité mémoire corrigés depuis.",
      "Un boîtier limité à 300 mm fait passer une 7800 XT (287 mm) mais pas une 5070 Ti (305 mm). Vérifiez avant de payer.",
      "Le 7600X est un CPU à 105 W : le ventirail d'origine le fait à peine tenir. Un vrai dissipateur, même d'entrée de gamme, change la température et le bruit.",
    ],
  },
  {
    slug: "config-pc-550k-da",
    title: "Passer au 4K : la config AM5, écran compris",
    hook: "7800X3D, 16 Go de VRAM et un écran 4K. À ce niveau on n'optimise plus : on construit une machine qui reste valable jusqu'à la fin de la décennie.",
    kind: "build",
    topic: { fr: "Build complet", en: "Full build" },
    readMin: 4,
    parts: [
      "cpu-r7-7800x3d",
      "cooler-assassin4",
      "mobo-b650m",
      "ram-delta-32-d5",
      "ssd-nvme-2tb",
      "gpu-rx9070xt-16gb",
      "case-velox",
      "psu-750-gold",
      "mon-27-4k",
    ],
    blocks: [
      {
        h: "Pourquoi un X3D ici",
        p: [
          "En 4K, le goulot d'étranglement est la carte graphique, pas le CPU. Un X3D ne change presque rien en FPS moyen à cette résolution. Il change en revanche beaucoup de choses si vous voulez aussi jouer en 1080p sur un moniteur rapide, où le CPU redevient limitant.",
          "Si vous comptez jouer exclusivement en 4K, un Ryzen 5 ou 7 classique suffit et coûte moins cher. Le X3D est un achat de polyvalence, pas une obligation de performance en 4K.",
        ],
      },
      {
        h: "La carte : 16 Go de VRAM minimum",
        p: [
          "En 4K, la VRAM est le critère. Les textures sont chargées en pleine résolution, le ray tracing ajoute ses propres données, et les surcouches supersampling occupant encore plus. Une carte 16 Go est le minimum absolu en 4K avec les titres récents.",
          "Comparez les cartes 16 Go du tableau. Le choix se fait sur le prix par image et sur la longueur de la carte, pas sur la référence : un modèle trois ventilateurs de 305 mm ne rentre pas dans tous les boîtiers.",
        ],
      },
      {
        h: "Le stockage et la mémoire à cette échelle",
        p: [
          "Le 2 To n'est pas un luxe à ce niveau : un seul jeu 4K avec les textures haute qualité occupe 150 Go et plus. Un 1 To est plein en quatre gros titres. Le kit 32 Go DDR5-6000 est le point d'équilibre, et le 6000 se combine bien avec un X3D.",
          "N'achetez pas de 64 Go DDR5 pour jouer. Ce prix-là n'a de sens que si vous montez de la vidéo ou si vous utilisez des machines virtuelles, et même là, 48 Go suffisent.",
        ],
      },
      {
        h: "Alimentation : le seul poste à ne pas négocier",
        p: [
          "Un 7800X3D plus une carte 16 Go de cette génération plus le reste, c'est 500 à 600 W selon la carte. Une 750 W Gold est le minimum raisonnable et laisse de la marge pour une carte plus grosse plus tard. Ne prenez pas une 850 W par principe : au-delà de 750 W, le gain est nul et le prix grimpe.",
          "L'écran 4K du tableau est le dernier poste à vérifier : une dalle 27 pouces 4K est la taille sweetspot pour cette résolution. Un 32 pouces 4K est magnifique mais coûte bien plus cher pour le même confort de bureau.",
        ],
      },
    ],
    pitfalls: [
      "Longueur de la carte graphique : les modèles trois ventilateurs les plus longs du catalogue atteignent 330 mm. Le boîtier du tableau est compatible, vérifiez la fiche si vous changez de carte.",
      "Le connecteur 16 broches des cartes récentes demande une alimentation ATX 3.x. Un adaptateur sur une alimentation plus ancienne peut fondre.",
      "Ne surdimensionnez pas la mémoire : 64 Go DDR5 coûte plus cher qu'une carte graphique milieu de gamme et ne sert à rien en jeu.",
      "Un écran 4K à 60 Hz gâche la moitié de la machine. Cherchez bien la fréquence dans la fiche avant de commander.",
      "Le 2 To de SSD est un vrai besoin à ce niveau, pas un gadget. Un 1 To est plein très vite en 4K.",
    ],
  },
  {
    slug: "pc-monte-vs-montage",
    title: "PC monté en boutique ou assemblé chez soi : le vrai calcul",
    hook: "La garantie, la disponibilité et le risque de montage contre la freedom de choix. Ce que coûte réellement un PC monté, et comment vérifier sa fiche technique en soixante secondes.",
    kind: "guide",
    topic: { fr: "Conseil", en: "Advice" },
    readMin: 4,
    parts: [
      "cpu-i5-12400f",
      "cooler-h212-v3",
      "mobo-b560m",
      "ram-vengeance-16-d4",
      "ssd-nvme-512gb",
      "gpu-rx6600-8gb",
      "psu-450-b",
    ],
    blocks: [
      {
        h: "Ce que le PC monté apporte réellement",
        p: [
          "Trois choses, et elles comptent : la garantie sur l'ensemble assemblé, la disponibilité immédiate, et le fait que vous pouvez essayer la machine avant de partir. Ce dernier point est le plus sous-estimé : en boutique, vous allumez la machine, vous lancez un jeu, et vous voyez de vos yeux si elle tient 60 images par seconde ou si le ventilateur hurle.",
          "Pour quelqu'un qui n'a jamais monté un PC et qui ne veut pas risquer de griller un CPU en le logeant mal, c'est un service qui vaut son prix. Le montage en boutique n'est pas une arnaque, c'est du temps de travail.",
        ],
      },
      {
        h: "Où le PC monté perd de l'argent",
        p: [
          "Un PC monté en boutique a souvent une configuration déséquilibrée : une alimentation de 450 W sous-dimensionnée, une carte mère d'entrée de gamme, 8 Go de RAM, ou un 256 Go de disque dur. Ces quatre postes sont invisibles sur une photo et visibles sur une fiche technique.",
          "La parade est simple : avant de signer, demandez la liste exacte des composants (processeur, carte mère, référence de la carte graphique, quantité et fréquence de la RAM, type de stockage, référence de l'alimentation). Un vendeur qui refuse de donner la référence de l'alimentation est un vendeur qui a quelque chose à cacher.",
        ],
      },
      {
        h: "Le calcul économique",
        p: [
          "Sur ce site, la page des PC montés affiche automatiquement le prix des pièces séparées équivalentes et l'écart avec le prix du PC monté. C'est le calcul le plus honnête possible : si l'écart est faible, le montage est bien fait et vous payez le service. Si l'écart est de 30 %, vous payez une configuration déséquilibrée.",
          "Le tableau de cette page montre la configuration type que les boutiques assemblent le plus souvent. Comparez-la poste par poste avec le PC monté qu'on vous propose, et vous saurez immédiatement d'où vient la différence.",
        ],
      },
      {
        h: "Le point à ne pas oublier",
        p: [
          "La garantie d'un PC monté en boutique est presque toujours limitée au PC complet. Si votre carte graphique tombe en panne dans six mois, vous retournez chez le vendeur, pas chez le fabricant de la carte. C'est un défaut, mais c'est aussi une protection : quelqu'unassume le résultat.",
          "Si vous montez vous-même, la garantie de chaque pièce reste entière et vous savez exactement ce que vous avez acheté. Le corollaire est que la garantie ne couvre ni le montage, ni les erreurs de compatibilité, ni le BIOS. Assumez la différence : c'est un arbitrage de risque, pas de prix.",
        ],
      },
    ],
    pitfalls: [
      "Demandez systématiquement la référence exacte de l'alimentation. C'est le poste qu'on ne regarde jamais et qui décide de la durée de vie de la machine.",
      "Un PC monté avec 8 Go de RAM et 256 Go de stockage à un prix correct est un PC qui sera obsolète en deux ans.",
      "Un PC monté avec un processeur « débridé » ou « boosté » signifie qu'il a été overclocké, et souvent refroidi insuffisamment. Demandez si la garantie couvre l'overclocking.",
      "Un vendeur qui refuse de détailler la configuration n'est pas un vendeur fiable, c'est un vendeur qui a une pièce à cacher.",
      "Ne payez jamais le surcoût « premium » d'un PC monté par une marque sans vérifier la configuration réelle : la marque ne garantit pas l'équilibre.",
    ],
  },
  {
    slug: "ouedkniss-occasion-survie",
    title: "Ouedkniss : acheter de l'occasion sans se faire avoir",
    hook: "Le marché de l'occasion pèse lourd sur le prix du GPU neuf en Algérie. Prix repères, arnaques classiques et la check-list de test à faire avant de payer, en sept minutes.",
    kind: "guide",
    topic: { fr: "Occasion", en: "Used market" },
    readMin: 4,
    parts: [
      "gpu-rx580-8gb",
      "gpu-rx6600-8gb",
      "gpu-rtx3060-12gb",
      "gpu-rtx4060-8gb",
      "gpu-rx6700xt-12gb",
      "cpu-r5-5600",
      "ram-vengeance-16-d4",
      "ssd-sata-1tb",
    ],
    blocks: [
      {
        h: "Comment lire une annonce avant de négocier",
        p: [
          "Le prix annoncé n'est pas le prix réel, et l'écart entre les deux est souvent la seule information disponible sur l'état de la machine. Une annonce sérieuse donne un prix ferme, des photos récentes de la carte hors boîtier, et un lieu de retrait possible.",
          "Une annonce floue donne un prix barré, des photos de catalogue, aucun lieu, et un vendeur qui répond par message privé uniquement. Ce n'est pas une occasion, c'est une enchère déguisée.",
        ],
      },
      {
        h: "La check-list avant de payer",
        list: [
          "Exigez une vidéo : dix minutes de jeu ou de FurMark, avec la température visible. Une carte qui monte à 85 °C et plus a une pâte thermique morte ou un radiateur encrassé.",
          "Photos recto-verso de la carte sortie du boîtier : rouille, traces de démontage, autocollant décollé, vis manquantes = carte qui a été ouverte.",
          "La facture d'origine, ou à défaut le numéro de série vérifiable. Sans facture, divisez votre prix maximum par deux.",
          "Test sur place si c'est possible. À Alger, Oran, Sétif, Blida, la plupart des vendeurs sérieux acceptent. Le refus est un signal.",
          "Aucune avance par virement ou BaridiMob à quelqu'un que vous n'avez pas vu. Jamais.",
        ],
      },
      {
        h: "Les tests qui comptent vraiment",
        p: [
          "Un test de dix minutes en jeu à fond révèle ce qu'un test de trente secondes dans un menu ne montre pas : la stabilité en charge prolongée, le bruit des ventilateurs, et les artefacts visuels. Une carte qui bourdonne ou qui fait scintiller l'image est une carte qui s'effondre.",
          "Un PC complet d'occasion a une autre arnaque classique : une alimentation sans marque et un boîtier qui ne ventile pas. Ces deux postes ne se voient pas sur les photos de face, et c'est pourtant là que se trouve la panne qui coûte le plus cher.",
        ],
      },
      {
        h: "Utiliser le comparateur dans la négociation",
        p: [
          "Le levier le plus simple : avant de négocier, ouvrez la fiche produit du composant sur ce site et notez le prix du neuf le plus bas, magasin vérifié, livraison 58 wilayas. Cet écart est votre marge. Si la carte d'occasion est à 15 % du prix du neuf avec garantie, elle ne vaut pas le risque.",
          "Règle simple : en dessous de 50 % du prix du neuf, l'occasion devient intéressante. Au-dessus, vous payez le risque de vos propres mains pour un gain qui ne le justifie pas.",        ],
      },
    ],
    pitfalls: [
      "\"Jamais minée, garantie 3 mois\" sans vidéo ni facture : c'est une carte minée. Les mineurs revendent par lots, avec les mêmes photos sur plusieurs annonces.",
      "Une configuration complète d'occasion cache souvent une alimentation sans marque. Demandez la référence exacte de la PSU avant de conclure.",
      "Le déplacement a un coût. Une « affaire » à 300 km, plus le transport, plus le temps, ce n'est plus une affaire.",
      "Une carte RX 580 annoncée « comme neuve » à un prix de carte neuve est une carte qui a été minée. Le prix est l'indice.",
      "Ne payez jamais la totalité avant d'avoir testé. Un acompte raisonnable et un rendez-vous pour tester, c'est la norme.",
    ],
  },
  {
    slug: "erreurs-premier-pc",
    title: "Les erreurs du premier PC assemblé, poste par poste",
    hook: "La plupart des machines qui dé disappointent ne le sont pas à cause d'un composant mauvais, mais à cause d'un poste sous-dimensionné. Les erreurs les plus courantes, et leur coût réel.",
    kind: "guide",
    topic: { fr: "Conseil", en: "Advice" },
    readMin: 5,
    parts: [
      "gpu-gtx1650-4gb",
      "ram-value-8-d4",
      "ssd-sata-256gb",
      "psu-450-b",
      "mobo-a520m",
      "gpu-rx6600-8gb",
      "ram-vengeance-16-d4",
      "ssd-nvme-512gb",
      "psu-650-b",
      "mobo-b550m-a-pro",
    ],
    blocks: [
      {
        h: "Les cinq erreurs qui coûtent cher",
        list: [
          "Une alimentation trop petite. Une 450 W avec une carte de 185 W fonctionne, mais à 90 % de charge permanente, avec des pics de tension au démarrage. La carte mère ou la carte graphique paieront l'erreur. Le poste est à 5 % du budget et il protège 95 % de la machine.",
          "8 Go de RAM. Un navigateur à quelques onglets suffit à le remplir. Le PC ralentit avant que vous ne compreniez pourquoi, et le seul remède est de tout remplacer.",
          "Une carte graphique à 4 Go de VRAM. C'est la pire dépense du catalogue : moins puissante qu'une carte 8 Go, plus lente qu'une carte 8 Go, et obsolète avant la fin de l'année. Ne prenez jamais une carte 4 Go, quel que soit le prix.",
          "Un SSD de 256 Go. Windows et ses mises à jour consomment une centaine de gigaoctets. Vous serez en train de désinstaller avant la fin de l'année.",
          "Un chipset d'entrée de gamme avec un boîtier qui ne ventile pas. La machine ne sera jamais stable en charge, et vous ne saurez pas pourquoi.",
        ],
      },
      {
        h: "Les cinq erreurs qui coûtent du temps",
        list: [
          "Un BIOS pas à jour. Si votre carte mère ne supporte pas nativement votre processeur, elle ne démarre pas. C'est le premier réflexe quand un PC neuf ne s'allume pas.",
          "XMP ou EXPO pas activé. La mémoire tourne à sa fréquence de base, vous payez 3200 et vous avez 2133. Le gain est réel et gratuit une fois activé.",
          "Pas de clé Windows. Un PC sans licence activée fonctionne, mais avec un watermark et des limitations sur certaines fonctionnalités. Prévoyez la licence dans le budget.",
          "Pas de support de démarrage USB. Préparez une clé d'installation avant le premier allumage : sans elle, vous êtes bloqué si le disque est vide ou cassé.",
          "Pâte thermique mal appliquée ou en quantité absurdement généreuse. Si la machine est chaude au premier jour, ouvrez-la et recommencez proprement.",
        ],
      },
      {
        h: "Les erreurs de raisonnement",
        p: [
          "La plus courante : acheter un PC puissant en se disant qu'on ajoutera une carte graphique plus tard. Le jour où vous voulez jouer, il faut acheter la carte, l'alimentation, et peut-être le boîtier. C'est trois postes au lieu d'un.",
          "La deuxième : surinvestir dans le processeur. Sur un budget donné, tout dinar mis dans un processeur haut de gamme au lieu d'une carte graphique est un dinar perdu. En 1080p, la carte limite.",
          "La troisième : payer le premium RGB, le boîtier en verre trempé et le watercooling pour une machine qui joue en 1080p. Aucun de ces postes ne change une image par seconde.",
        ],
      },
      {
        h: "La check-list avant le premier allumage",
        list: [
          "Le CPU est dans le bon socket : le triangle de la puce du processeur et le triangle de la carte mère doivent être alignés. Vérifiez avant de clipser le dissipateur.",
          "La mémoire est dans les deux slots alternés (A2 et B2) pour le dual channel.",
          "L'alimentation est branchée, y compris le connecteur CPU 4 ou 8 broches, qui est le plus souvent oublié.",
          "Le câble SATA du disque est branché, et le câble SATA d'alimentation aussi.",
          "Le dissipateur est fixé et le ventilateur tourne quand vous ouvrez le boîtier.",
        ],
      },
    ],
    pitfalls: [
      "L'erreur la plus coûteuse de la liste, c'est l'alimentation. Elle est invisible jusqu'au jour où la carte mère ne démarre plus.",
      "Ne rognez pas le boîtier : un boîtier premier prix limite la taille du dissipateur, le nombre de disques et la longueur de la carte. C'est le poste qui vous contraint pendant cinq ans.",
      "Une carte à 4 Go de VRAM n'est pas un bon rapport qualité-prix, c'est un piège. Le prix bas ne compense pas.",
      "Ne partez pas du principe qu'un PC qui ne démarre pas est défectueux. Le premier réflexe est de vérifier le CPU et la version du BIOS.",
      "Un PC qui fait du bruit au démarrage et se tait ensuite est normal. Un PC qui fait du bruit en permanence est un boîtier qui ne ventile pas.",
    ],
  },
  {
    slug: "alim-onduleur-algerie",
    title: "Alimentation et onduleur : le guide anti-coupure",
    hook: "Sur le réseau algérien, ce n'est pas la chaleur qui tue les PC, c'est la sous-tension. Comment dimensionner une alimentation, ce qu'un onduleur protège réellement, et ce qu'il ne protège pas du tout.",
    kind: "guide",
    topic: { fr: "Alimentation", en: "Power supply" },
    readMin: 4,
    parts: [
      "psu-400-b",
      "psu-450-b",
      "psu-550-b",
      "psu-650-b",
      "psu-650-gold",
      "psu-750-gold",
      "psu-1000-gold",
      "psu-mwe650-b",
      "cpu-r5-5600",
      "gpu-rx6600-8gb",
    ],
    blocks: [
      {
        h: "La puissance affichée n'est pas la puissance livrée",
        p: [
          "Regardez l'étiquette de l'alimentation, pas le nom du produit. Ce qui compte, c'est la puissance disponible sur le rail 12 V, parce que c'est là que presque toute la consommation se fait : une carte graphique tire 200 à 350 W en 12 V. Sur les modèles anciens à plusieurs rails, ce nombre est souvent inférieur à la puissance totale annoncée.",
          "Un second point : le nombre de connecteurs. Une alimentation 750 W avec deux connecteurs 8 broches ne peut pas alimenter une carte qui en demande trois. Vérifiez la fiche de la carte avant l'alimentation, pas l'inverse.",
        ],
      },
      {
        h: "La règle de dimensionnement",
        p: [
          "Additionnez la consommation annoncée du processeur et de la carte graphique, ajoutez environ 150 W pour le reste de la machine, et vous avez votre consommation crête. Une fois ce chiffre obtenu, prenez le palier commercial immédiatement au-dessus : il existe toujours un écart de 50 à 100 W entre deux paliers, et il est presque toujours gratuit en terms de prix au watt.",
          "Ne surdimensionnez pas. Au-delà de ce palier, vous payez plus cher pour rien, le ventilateur souffle en permanence à faible charge (c'est là que les alimentations font le plus de bruit), et vous payez un point de rendement médiocre dans la zone de charge que vous n'utiliserez jamais.",
        ],
      },
      {
        h: "L'onduleur : ce qu'il fait",
        p: [
          "Un onduleur line-interactive fait trois choses : il détecte la coupure, il prend le relais sur sa batterie pendant quelques minutes, il stabilise la tension quand elle varie. Sur le réseau algérien, c'est la deuxième fonction qui compte le plus : la sous-tension prolongée fait griller les alimentations sans qu'aucune coupure visible ne soit remarquée.",
          "La dimension se fait en VA, pas en W. Pour une tour de 450 W plus un écran de 30 W, comptez 800 à 1000 VA minimum. L'autonomie réelle dépend de la charge : à pleine charge, un onduleur 1000 VA tient cinq minutes, ce qui est juste le temps de sauvegarder et d'éteindre proprement.",
        ],
      },
      {
        h: "L'onduleur : ce qu'il ne fait pas",
        p: [
          "Une multiprise parafoudre ne fait rien contre une coupure. Elle protège contre les surtensions brèves, ce qui est une autre menace, et qui est réelle en Algérie en cas de coupure de voisinage. Les deux protections sont complémentaires : parafoudre pour la surtension, onduleur pour la coupure et la sous-tension.",
          "Surveillez l'âge de la batterie. Une batterie d'onduleur a une durée de vie de trois à quatre ans, et un onduleur à batterie morte protège de rien tout en donnant l'impression que tout va bien. Testez-le une fois par an.",
        ],
      },
    ],
    pitfalls: [
      "Ne branchez pas d'imprimante laser sur l'onduleur : son pic de consommation à l'allumage déclenche une protection et coupe tout.",
      "Un onduleur 600 VA sur un PC de 450 W plus écran ne tiendra pas : il sautera en protection dès la mise sous tension.",
      "Branchez la tour et l'écran sur l'onduleur, le reste sur une multiprise parafoudre avec l'onduleur en amont. L'ordre compte.",
      "Une multiprise à 6 prises pour PC et écran est le strict minimum, à 8 le confortable. Les ports USB d'un onduleur ne chargent pas au débit annoncé.",
      "Le câble d'alimentation d'un PC est spécifique à la machine. Un autre PC avec le même connecteur ne fonctionne pas forcément, et l'inverse non plus.",
    ],
  },
  {
    slug: "upgrader-ou-remplacer",
    title: "Upgrader ou remplacer : quand changer de carte mère",
    hook: "La mémoire et le disque se remplacent toujours. Le processeur, jamais sans changer de carte mère. Voici le seuil chiffré qui décide, et les upgrades qui paient à coup sûr.",
    kind: "guide",
    topic: { fr: "Conseil", en: "Advice" },
    readMin: 4,
    parts: [
      "cpu-r5-3600",
      "mobo-b450m",
      "ram-8gb-d4-3600",
      "gpu-gtx1050ti-4gb",
      "ssd-sata-256gb",
      "cpu-r5-5600",
      "mobo-b550m-a-pro",
      "ram-vengeance-16-d4",
      "gpu-rx6600-8gb",
      "ssd-nvme-1tb-g4",
    ],
    blocks: [
      {
        h: "Les upgrades qui paient à tous les coups",
        list: [
          "La mémoire. Passer de 8 à 16 Go est l'upgrade le plus rentable de l'histoire du PC, et sur une ancienne machine, c'est souvent le seul qui change réellement la donne.",
          "Le stockage. Un disque dur ou un SSD SATA remplacés par un NVMe, c'est un démarrage et un chargement de jeu nettement plus rapides, pour le prix d'un repas.",
          "L'alimentation. Si la machine a plus de cinq ans, remplacer une alimentation douteuse par une unité correcte coûte peu et supprime une cause de panne.",
          "La carte graphique. C'est l'upgrade le plus visible, et dans la plupart des cas, c'est aussi le seul qui vaille le coup sur une machine de plus de cinq ans.",
        ],
      },
      {
        h: "Ce qui ne se change pas seul",
        p: [
          "Le processeur exige un socket compatible. Passer d'un Ryzen 5 3600 à un Ryzen 7 5700X est gratuit, parce que c'est le même socket AM4. Passer à un 7600X exige une carte mère AM5, de la DDR5, et souvent un nouveau dissipateur : trois postes, pas un.",
          "C'est là que se trouve le vrai seuil. Si l'upgrade processeur que vous envisagez vous oblige à changer la carte mère et la mémoire, vous n'êtes plus en train de mettre à niveau, vous êtes en train de changer la moitié de votre machine.",
        ],
      },
      {
        h: "Le seuil chiffré",
        p: [
          "Règle simple : si le coût total de l'upgrade (processeur plus carte mère plus mémoire, plus le prix de votre temps) dépasse environ 40 % du prix d'une machine neuve équivalente, achetez la machine neuve. En dessous, l'upgrade est rationnel.",
          "Un exemple : sur une machine AM4 avec un 3600 et une B450, passer à un 5700X coûte le prix du processeur seul, et c'est logique. Sur cette même machine, viser un 7600X coûterait processeur plus carte mère plus mémoire, ce qui dépasse le seuil.",
        ],
      },
      {
        h: "Ne pas oublier la revente",
        p: [
          "Une machine qui a reçu une carte graphique neuve et un SSD NVMe se revend mieux, même si le reste est ancien. Le marché de l'occasion local valorise fortement la carte graphique et peu le reste.",
          "Avant de décider, regardez le prix du neuf de la configuration actuelle sur ce site : c'est votre référence. Si votre machine actuelle vaut 60 000 DA en occasion et que l'upgrade vous coûte 80 000 DA pour gagner 10 % de performance, l'upgrade est une perte sèche.",
        ],
      },
    ],
    pitfalls: [
      "Changer de carte mère, c'est changer de mémoire, de dissipation et souvent de connecteurs. Prévoyez le coût complet, pas le prix du processeur seul.",
      "Un upgrade processeur sur une carte mère dont le BIOS est ancien peut ne pas démarrer du tout. Vérifiez la compatibilité avant d'acheter.",
      "Vendre l'ancienne carte graphique avant d'avoir la nouvelle, c'est prendre le risque de rester sans machine si la nouvelle est défectueuse.",
      "L'upgrade qui ne change rien : passer d'un 3600 à un 4600 sur une machine qui joue en 1080p avec une carte milieu de gamme. Le goulot d'étranglement est ailleurs.",
      "Un PC qui a plus de dix ans ne se répare pas pièce par pièce, il se remplace. Le coût des pièces dépasse celui de la machine.",
    ],
  },
  // __GUIDES_END__
];