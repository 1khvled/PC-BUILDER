import * as cheerio from "cheerio";
import { UA, delay } from "./base";
import { quickCheck } from "./validate";
import { fetchProducts } from "./woo-store-api";

export interface ScrapedOffer {
  store: string;
  category: string;
  title: string;
  priceDa: number;
  url: string;
  stock: string;
  image: string;
}

interface StoreCfg {
  wilaya: string;
  item: string[];
  title: string[];
  price: string[];
  /** preferred link selectors (else auto-detect) */
  link?: string[];
  /** when true, product links are child URLs of the category page (GigaStore) */
  child?: boolean;
  /** prefer same-origin non-category links, longest first (pretty permalinks) */
  sameOrigin?: boolean;
  /** sitemap mode: crawl product pages (JS-rendered archives, e.g. KOTEK) */
  mode?: "sitemap" | "shopify" | "nextgen";
  sitemaps?: string[];
  shopifyBase?: string;
  /** shopify-all: one full-catalog crawl, categorized by title (Lahlou, tags useless) */
  shopifyAll?: boolean;
  wooApi?: {
    base: string;
    cats: Record<string, number | string>;
  };
  cats: Record<string, string[]>;
}

const BADGE_PREFIX = /^(new|in stock|promo|used|pre[\s-]?order|soon|out of stock|limited stock|summer offers|hot)\s+/i;

export function cleanTitle(raw: string): string {
  let t = raw.replace(/\s+/g, " ").trim();
  // strip stock badges LICB+/GamingDZ inject inside the anchor ("New GPU CARTE...")
  for (let i = 0; i < 3; i++) {
    const next = t.replace(BADGE_PREFIX, "");
    if (next === t) break;
    t = next;
  }
  return t;
}

export function parsePrice(txt: string): number | null {
  // Handles "108 000 DA", "102,500 DA", "2,000.00 DA", "د.ج 79.900,00",
  // sale `ins` preferred by selectors. First price group wins (ignores trailing junk).
  const t = (txt || "").replace(/\s+/g, " ").trim();
  let m = t.match(/(\d[\d\s.,]*\d|\d)\s*(DA|DZD|دج)/i);
  if (!m) m = t.match(/(\d[\d\s.,]*\d|\d)/); // currency-before-number locales
  if (!m) return null;
  const raw = m[1].replace(/[^0-9.,]/g, "");
  if (!/[0-9]/.test(raw)) return null;
  let n: number;
  const dec = raw.match(/([.,])(\d{2})$/);
  if (dec) {
    n = Math.round(parseFloat(raw.slice(0, -3).replace(/[.,]/g, "") + "." + dec[2]));
  } else {
    n = parseInt(raw.replace(/[.,]/g, ""), 10);
  }
  if (!Number.isFinite(n)) return null;
  return n >= 500 && n <= 5_000_000 ? n : null;
}

const WOO_PRICE = [".price ins", ".price"];
const WOO_TITLE = [".woocommerce-loop-product__title", "h2", "h3"];

const STORES: Record<string, StoreCfg> = {
  "LICB+": {
    wilaya: "Alger",
    item: [".product-cart-wrap"],
    title: ["h2 a.designation-truncate"],
    price: [".product-price"],
    cats: {
      cpu: ["https://mail.licbplus.com/pc-components/processor"],
      cooler: ["https://mail.licbplus.com/pc-components/cooling"],
      motherboard: ["https://mail.licbplus.com/pc-components/motherboard"],
      ram: ["https://mail.licbplus.com/pc-components/memory"],
      ssd: ["https://mail.licbplus.com/pc-components/ssd"],
      gpu: ["https://mail.licbplus.com/pc-components/graphics-card"],
      psu: ["https://mail.licbplus.com/pc-components/power-supply"],
      case: ["https://mail.licbplus.com/pc-components/case"],
      monitor: ["https://mail.licbplus.com/monitor/pc-monitor"],
    },
  },
  "Click-DZ": {
    wilaya: "Alger",
    item: [".product"],
    title: [".product-title", "h2.woocommerce-loop-product__title", "h3", "h2"],
    price: WOO_PRICE,
    wooApi: {
      base: "https://click-dz.com",
      cats: {
        cpu: 133,
        cooler: 111,
        motherboard: 78,
        ram: 82,
        ssd: 243,
        gpu: 100,
        psu: 102,
        case: 77,
        monitor: 73,
      },
    },
    cats: {
      cpu: ["https://click-dz.com/categorie-produit/composants/processeur/"],
      cooler: [
        "https://click-dz.com/categorie-produit/composants/refroidisseur-cpu/",
        "https://click-dz.com/categorie-produit/composants/refroidisseur-cpu/Air-cooling",
      ],
      motherboard: ["https://click-dz.com/categorie-produit/composants/carte-mere/"],
      ram: ["https://click-dz.com/categorie-produit/composants/memoires/"],
      ssd: [
        "https://click-dz.com/categorie-produit/composants/stockage-interne/nvme-pcie",
        "https://click-dz.com/categorie-produit/composants/stockage-interne/ssd-sata/",
      ],
      gpu: ["https://click-dz.com/categorie-produit/composants/carte-graphique/"],
      psu: [
        "https://click-dz.com/categorie-produit/composants/alimentation/",
        "https://click-dz.com/categorie-produit/composants/alimentations/",
      ],
      case: [
        "https://click-dz.com/categorie-produit/composants/boitier/",
        "https://click-dz.com/categorie-produit/composants/boitiers/",
      ],
      monitor: [
        "https://click-dz.com/categorie-produit/composants/moniteurs-ecrans/",
        "https://click-dz.com/categorie-produit/composants/moniteurs-ecrans/gamer-moniteur",
      ],
    },
  },
  Digitec: {
    wilaya: "Alger",
    item: ["ul.products li.product", "li.product"],
    title: WOO_TITLE,
    price: WOO_PRICE,
    wooApi: {
      base: "https://www.digitecdz.com",
      cats: {
        cpu: 247,
        cooler: "256,257",
        motherboard: 261,
        ram: 251,
        ssd: 230,
        gpu: 255,
        psu: 254,
        case: 249,
        monitor: 232,
      },
    },
    cats: {
      cpu: ["https://www.digitecdz.com/product-category/composants-pc/processeurs/"],
      cooler: [
        "https://www.digitecdz.com/product-category/composants-pc/radiateurs-refroidissement/",
        "https://www.digitecdz.com/product-category/composants-pc/watercooling/",
      ],
      motherboard: ["https://www.digitecdz.com/product-category/composants-pc/cartes-meres/"],
      ram: ["https://www.digitecdz.com/product-category/composants-pc/barrettes-memoire/"],
      ssd: ["https://www.digitecdz.com/product-category/composants-pc/disques-durs-et-ssd/"],
      gpu: ["https://www.digitecdz.com/product-category/composants-pc/cartes-graphiques/"],
      psu: ["https://www.digitecdz.com/product-category/composants-pc/alimentations-pc/"],
      case: ["https://www.digitecdz.com/product-category/composants-pc/boitiers-pc/"],
      monitor: [
        "https://www.digitecdz.com/product-category/peripheriques-pc/ecrans-pc/",
        "https://www.digitecdz.com/product-category/ecrans/",
      ],
    },
  },
  WifiDjelfa: {
    wilaya: "Djelfa",
    item: [".product-grid-item"],
    title: ["h3.wd-entities-title a", ".product-title a", "h3 a"],
    price: WOO_PRICE,
    wooApi: {
      base: "https://wifidjelfa.com",
      cats: {
        cpu: 115,
        cooler: 116,
        motherboard: 119,
        ram: 120,
        ssd: 124,
        gpu: 118,
        psu: 121,
        case: 117,
        monitor: 128,
      },
    },
    cats: {
      cpu: ["https://wifidjelfa.com/product-category/99236150627014130/99236150627008520/"],
      cooler: ["https://wifidjelfa.com/product-category/99236150627014130/99236150627008521/"],
      motherboard: ["https://wifidjelfa.com/product-category/99236150627014130/99236150627008524/"],
      ram: ["https://wifidjelfa.com/product-category/99236150627014130/99236150627008525/"],
      ssd: ["https://wifidjelfa.com/product-category/99236150627014131/99236150627008540/"],
      gpu: ["https://wifidjelfa.com/product-category/99236150627014130/99236150627008523/"],
      psu: ["https://wifidjelfa.com/product-category/99236150627014130/99236150627008526/"],
      case: ["https://wifidjelfa.com/product-category/99236150627014130/99236150627008522/"],
      monitor: ["https://wifidjelfa.com/product-category/99236150627014132/99236150627008514/"],
    },
  },
  KOTEK: {
    wilaya: "Alger",
    item: [],
    title: [],
    price: [],
    mode: "sitemap",
    sitemaps: [
      "https://kotekdz.com/product-sitemap1.xml",
      "https://kotekdz.com/product-sitemap2.xml",
      "https://kotekdz.com/product-sitemap3.xml",
      "https://kotekdz.com/product-sitemap4.xml",
    ],
    wooApi: {
      base: "https://kotekdz.com",
      cats: {
        cpu: 116,
        cooler: 99,
        motherboard: 88,
        ram: 238,
        ssd: 187,
        gpu: 94,
        psu: 96,
        case: 87,
        monitor: 83,
      },
    },
    cats: {
      cpu: ["kotek"], cooler: ["kotek"], motherboard: ["kotek"], ram: ["kotek"], ssd: ["kotek"],
      gpu: ["kotek"], psu: ["kotek"], case: ["kotek"], monitor: ["kotek"],
    },
  },
  GamingDZ: {
    wilaya: "Sétif",
    item: [".product-cart-wrap"],
    title: ["h2 a"],
    price: [".product-price"],
    cats: {
      cpu: [
        "https://gamingdz.com/store/composants/processeurs-cpu",
        "https://gamingdz.com/store/composants/cpu",
        "https://gamingdz.com/store/composants/processeurs",
      ],
      cooler: [
        "https://gamingdz.com/store/composants/refroidisseur-cpu",
        "https://gamingdz.com/store/composants/refroidissement",
      ],
      motherboard: [
        "https://gamingdz.com/store/composants/cartes-meres",
        "https://gamingdz.com/store/composants/carte-meres",
      ],
      ram: ["https://gamingdz.com/store/composants/memoire-ram"],
      ssd: [
        "https://gamingdz.com/store/composants/stockage",
        "https://gamingdz.com/store/composants/stockages",
      ],
      gpu: ["https://gamingdz.com/store/composants/cartes-graphiques"],
      psu: [
        "https://gamingdz.com/store/composants/alimentations-psu",
        "https://gamingdz.com/store/composants/alimentations",
      ],
      case: [
        "https://gamingdz.com/store/composants/boitier-case",
        "https://gamingdz.com/store/composants/boitiers",
      ],
      monitor: [
        "https://gamingdz.com/store/composants/moniteurs",
        "https://gamingdz.com/store/moniteur",
        "https://gamingdz.com/store/composants/ecrans",
      ],
    },
  },
  GigaStore: {
    wilaya: "Oran",
    item: ["ul.products li.product", "li.product"],
    title: WOO_TITLE,
    price: WOO_PRICE,
    child: true,
    wooApi: {
      base: "https://gigastore-dz.com",
      cats: {
        cpu: 226,
        cooler: 231,
        motherboard: 227,
        ram: 228,
        ssd: 230,
        gpu: 229,
        psu: 233,
        case: 232,
        monitor: 240,
      },
    },
    cats: {
      cpu: ["https://gigastore-dz.com/composants/processeur/"],
      cooler: ["https://gigastore-dz.com/composants/refroidissement/"],
      motherboard: ["https://gigastore-dz.com/composants/carte-mere/"],
      ram: ["https://gigastore-dz.com/composants/ram/"],
      ssd: ["https://gigastore-dz.com/composants/stockage-ssd-hdd/"],
      gpu: ["https://gigastore-dz.com/composants/carte-graphique/"],
      psu: ["https://gigastore-dz.com/composants/alimentation/"],
      case: ["https://gigastore-dz.com/composants/boitier/"],
      monitor: ["https://gigastore-dz.com/moniteur/"],
    },
  },
  Informatics: {
    wilaya: "Boumerdes",
    item: [".product-grid-item"],
    title: ["h3.wd-entities-title a", ".product-title a", "h3 a"],
    price: WOO_PRICE,
    wooApi: {
      base: "https://informatics-dz.com",
      cats: {
        cpu: "1185,1184",
        cooler: 561,
        motherboard: 321,
        ram: 322,
        ssd: 324,
        gpu: 323,
        psu: 325,
        case: 320,
        monitor: 317,
      },
    },
    cats: {
      cpu: ["https://informatics-dz.com/product-category/composant-pc/cpu/"],
      cooler: ["https://informatics-dz.com/product-category/composant-pc/cpu-cooler/"],
      motherboard: ["https://informatics-dz.com/product-category/composant-pc/carte-mere/"],
      ram: ["https://informatics-dz.com/product-category/composant-pc/memoire-ram/"],
      ssd: ["https://informatics-dz.com/product-category/composant-pc/peripheriques-de-stockage/"],
      gpu: ["https://informatics-dz.com/product-category/composant-pc/cartes-graphique/"],
      psu: ["https://informatics-dz.com/product-category/composant-pc/psu-alimentation-pc/"],
      case: ["https://informatics-dz.com/product-category/composant-pc/boitier/"],
      monitor: ["https://informatics-dz.com/product-category/ecran/"],
    },
  },
  Lahlou: {
    wilaya: "Alger",
    item: [],
    title: [],
    price: [],
    mode: "shopify",
    shopifyBase: "https://lahlou-industrie.com",
    shopifyAll: true,
    cats: {
      cpu: ["__all__"], cooler: ["__all__"], motherboard: ["__all__"], ram: ["__all__"], ssd: ["__all__"],
      gpu: ["__all__"], psu: ["__all__"], case: ["__all__"], monitor: ["__all__"],
    },
  },
  HardSoft: {
    wilaya: "Oran",
    item: [".article"],
    title: ["h3.designation a"],
    price: [".prix span", ".prix"],
    link: ["h3.designation a"],
    cats: {
      cpu: ["https://hardsoft.dz/categorie.php?id=4"],
      cooler: ["https://hardsoft.dz/categorie.php?id=47"],
      motherboard: ["https://hardsoft.dz/categorie.php?id=1"],
      ram: ["https://hardsoft.dz/categorie.php?id=26"],
      ssd: ["https://hardsoft.dz/categorie.php?id=6"],
      gpu: ["https://hardsoft.dz/categorie.php?id=19"],
      psu: ["https://hardsoft.dz/categorie.php?id=11"],
      case: ["https://hardsoft.dz/categorie.php?id=28"],
      monitor: [
        "https://hardsoft.dz/categorie.php?id=83",
        "https://hardsoft.dz/categorie.php?id=84",
      ],
    },
  },
  Campus: {
    wilaya: "Alger",
    item: [".product-grid-item"],
    title: ["h3.wd-entities-title a", ".product-title a", "h3 a"],
    price: WOO_PRICE,
    wooApi: {
      base: "https://campusinformatique.com",
      cats: {
        cpu: 235,
        cooler: 302,
        motherboard: 236,
        ram: 271,
        ssd: 333,
        gpu: 240,
        psu: 295,
        case: 286,
        monitor: 241,
      },
    },
    cats: {
      cpu: ["https://campusinformatique.com/composants-pc/processeurs/"],
      cooler: ["https://campusinformatique.com/composants-pc/refroidissement/"],
      motherboard: ["https://campusinformatique.com/composants-pc/carte-meres/"],
      ram: ["https://campusinformatique.com/composants-pc/ram/"],
      ssd: ["https://campusinformatique.com/composants-pc/disque-dur-ssd/"],
      gpu: ["https://campusinformatique.com/composants-pc/carte-graphique/"],
      psu: ["https://campusinformatique.com/composants-pc/alimentation/"],
      case: ["https://campusinformatique.com/composants-pc/boitiers/"],
      monitor: ["https://campusinformatique.com/moniteurs/ecran-gaming/"],
    },
  },
  KhabirTech: {
    wilaya: "M'sila",
    item: [".product-grid-item", ".product"],
    title: ["h2", "h3"],
    price: WOO_PRICE,
    sameOrigin: true,
    wooApi: {
      base: "https://khabirtech.com",
      cats: {
        cpu: 67,
        cooler: 81,
        motherboard: 16,
        ram: 21,
        ssd: 70,
        gpu: 68,
        psu: 18,
        case: 17,
        monitor: 106,
      },
    },
    cats: {
      cpu: ["https://khabirtech.com/pc-components/cpu/"],
      cooler: ["https://khabirtech.com/pc-components/cooling/"],
      motherboard: ["https://khabirtech.com/pc-components/motherboards/"],
      ram: ["https://khabirtech.com/pc-components/memory/"],
      ssd: ["https://khabirtech.com/storage-devices/ssd/"],
      gpu: ["https://khabirtech.com/pc-components/graphic-cards/"],
      psu: ["https://khabirtech.com/pc-components/power-supply/"],
      case: ["https://khabirtech.com/pc-components/case/"],
      monitor: ["https://khabirtech.com/monitors-accessories/monitors/"],
    },
  },
  DeskCom: {
    wilaya: "Oran",
    item: ["ul.products li.product", "li.product"],
    title: WOO_TITLE,
    price: WOO_PRICE,
    wooApi: {
      base: "https://deskcom-dz.com",
      cats: {
        cpu: 26,
        cooler: 33,
        motherboard: 28,
        ram: 30,
        ssd: 43,
        gpu: 27,
        psu: 32,
        case: 31,
        monitor: "37,67",
      },
    },
    cats: {
      cpu: ["https://deskcom-dz.com/product-category/computer-parts/computer-processors/"],
      cooler: ["https://deskcom-dz.com/product-category/computer-parts/cpu-coolers/"],
      motherboard: ["https://deskcom-dz.com/product-category/computer-parts/motherboards/"],
      ram: ["https://deskcom-dz.com/product-category/computer-parts/computer-memory/"],
      ssd: ["https://deskcom-dz.com/product-category/computer-parts/drives-and-storage/ssd/"],
      gpu: ["https://deskcom-dz.com/product-category/computer-parts/graphics-cards/"],
      psu: ["https://deskcom-dz.com/product-category/computer-parts/power-supplies/"],
      case: ["https://deskcom-dz.com/product-category/computer-parts/computer-cases/"],
      monitor: [
        "https://deskcom-dz.com/product-category/computers/computer_monitors/",
        "https://deskcom-dz.com/product-category/gaming/gaming-hardware/gaming-monitors/",
      ],
    },
  },
  NextGen: {
    wilaya: "Sétif",
    item: [],
    title: [],
    price: [],
    mode: "nextgen",
    shopifyBase: "https://nextgendz.com",
    cats: {
      cpu: ["cpu"],
      cooler: ["cooling"],
      motherboard: ["motherboard"],
      ram: ["ram"],
      ssd: ["storage"],
      gpu: ["gpu"],
      psu: ["psu"],
      case: ["case"],
      monitor: ["monitor"],
    },
  },
};

// JSON-LD offers.availability — the most reliable stock signal on WooCommerce/Shopify
// product pages (schema.org InStock / OutOfStock). "" when absent/unparseable.
function readJsonLdStock(loaded: cheerio.CheerioAPI): string {
  let found = "";
  loaded("script[type='application/ld+json']").each((_, el) => {
    if (found) return;
    try {
      const raw = loaded(el).contents().text();
      const docs = JSON.parse(raw);
      const walk = (n: unknown): void => {
        if (found || !n || typeof n !== "object") return;
        const o = n as Record<string, unknown>;
        const t = o["@type"];
        const types = Array.isArray(t) ? t : [t];
        if (types.includes("Product")) {
          const off = o.offers;
          const list = Array.isArray(off) ? off : off ? [off] : [];
          for (const item of list) {
            const av = String((item as Record<string, unknown>)?.availability ?? "");
            if (/OutOfStock/i.test(av)) { found = "Rupture"; return; }
            if (/InStock|LimitedAvailability/i.test(av)) { found = "En stock"; return; }
            if (/PreOrder/i.test(av)) { found = "À vérifier"; return; }
          }
        }
        for (const v of Object.values(o)) {
          if (Array.isArray(v)) v.forEach(walk);
          else if (v && typeof v === "object") walk(v);
        }
      };
      (Array.isArray(docs) ? docs : [docs]).forEach(walk);
    } catch {
      /* malformed JSON-LD — fall through to DOM signals */
    }
  });
  return found;
}

function readStock(e: cheerio.Cheerio<cheerio.AnyNode>, loaded: cheerio.CheerioAPI): string {
  // 0) JSON-LD first (page-level truth when present)
  const ld = readJsonLdStock(loaded);
  if (ld) return ld;
  // 1) Nest-style status badges (LICB+/GamingDZ): class tells the truth
  const badgeCls = e.find(".stock-status").first().attr("class") || "";
  if (/out-stock/.test(badgeCls)) return "Rupture";
  if (/(in-stock|new-stock|promo-stock|back-stock)/.test(badgeCls)) return "En stock";
  // 1b) WooCommerce stock paragraph class
  const wooCls = e.find("p.stock").first().attr("class") || "";
  if (/out-of-stock/i.test(wooCls)) return "Rupture";
  if (/in-stock/i.test(wooCls)) return "En stock";
  // 2) Woo/text badges: only VISIBLE elements (themes render hidden ribbons with stale text)
  const texts: string[] = [];
  e.find(".stock-status, .stock, .availability, .stock-info").each((_, el) => {
    const node = loaded(el);
    const meta = `${node.attr("class") || ""} ${node.attr("style") || ""} ${node.parents().map((_, p) => loaded(p).attr("class") || "").get().join(" ")}`;
    if (/hidden|d-none|sr-only|screen-reader|display:\s*none|visibility:\s*hidden/i.test(meta)) return;
    const t = node.text().replace(/\s+/g, " ").trim();
    if (t) texts.push(t);
  });
  const txt = texts.join(" | ");
  if (/rupture|out of stock|sold out|épuisé|indisponible|non disponible/i.test(txt)) return "Rupture";
  if (/en stock|in stock|disponible/i.test(txt)) return "En stock";
  return "À vérifier";
}

function pickImage(loaded: cheerio.CheerioAPI, el: unknown, base: string): string {
  let src = "";
  loaded(el as never)
    .find("img")
    .each((_, img) => {
      if (src) return;
      const im = loaded(img);
      src = im.attr("data-src") || im.attr("data-lazy-src") || im.attr("src") || "";
      if (src.startsWith("data:")) src = ""; // skip lazy placeholders
    });
  if (!src) return "";
  try {
    return new URL(src, base).toString();
  } catch {
    return "";
  }
}

function pickLink(
  loaded: cheerio.CheerioAPI,
  el: unknown,
  base: string,
  opts?: { childBase?: string; sameOrigin?: boolean; exclude?: string[] }
): string {
  const hrefs: string[] = [];
  loaded(el as never)
    .find("a[href]")
    .each((_, a) => {
      hrefs.push(loaded(a).attr("href") || "");
    });
  const abs = (h: string) => {
    try {
      return new URL(h, base).toString();
    } catch {
      return "";
    }
  };
  let prod = "";
  if (opts?.childBase) {
    const kids = hrefs.filter(
      (h) => h.startsWith(opts.childBase as string) && h.length > (opts.childBase as string).length + 2 && !(opts.exclude || []).includes(h)
    );
    prod = kids.sort((a, b) => b.length - a.length)[0] || "";
  }
  if (!prod && opts?.sameOrigin) {
    let origin = "";
    try {
      origin = new URL(base).origin + "/";
    } catch {
      origin = "";
    }
    const kids = hrefs
      .map(abs)
      .filter((h) => h.startsWith(origin) && h.length > origin.length + 4 && !(opts.exclude || []).some((x) => h === x || h === x.replace(/\/$/, "")));
    prod = kids.sort((a, b) => b.length - a.length)[0] || "";
  }
  if (!prod) {
    prod =
      hrefs.find((h) => /\/(product|produit)\//.test(h)) ||
      hrefs.find((h) => h.startsWith("http")) ||
      hrefs[0] ||
      "";
  }
  if (!prod) return base;
  try {
    return new URL(prod, base).toString();
  } catch {
    return base;
  }
}

// ---- Shopify-all mode (Lahlou): full catalog crawl, title-keyword categorization ----
interface LahlouItem { title: string; priceDa: number; url: string; image: string }
let lahlouCache: { at: number; items: LahlouItem[] } | null = null;

function lahlouCat(t: string): string {
  const x = " " + t.toLowerCase() + " ";
  if (/rtx|gtx|radeon|quadro|\brx \d|carte graphique/.test(x)) return "gpu";
  if (/ryzen|processeur|intel core/.test(x)) return "cpu";
  if (/wraith|laminar/.test(x) && !/ryzen|intel/.test(x)) return "cooler";
  if (/carte mere|carte-mere|motherboard|\bb550|\bb650|\bx670|\bz790|\bh610|\ba520|\ba620/.test(x)) return "motherboard";
  if (/\bram\b|ddr[345]|memoire/.test(x) && !/gddr|carte graphique|gpu/.test(x)) return "ram";
  if (/\bssd\b|nvme|disque dur|\bhdd\b|m\.2/.test(x)) return "ssd";
  if (/alimentation|\bpsu\b|\d{3,4}\s?w(atts)?\b/.test(x) && !/cable/.test(x)) return "psu";
  if (/watercool|refroidis|ventirad|cpu cooler|air cooling/.test(x) && !/boitier/.test(x)) return "cooler";
  if (/boitier|boîtier/.test(x) || (/\bcase\b/.test(x) && !/fan/.test(x))) return "case";
  if (/ecran|moniteur|\bmonitor\b/.test(x)) return "monitor";
  if (/\bcpu\b/.test(x) && !/fan|cooler|ventir/.test(x)) return "cpu";
  return "";
}

async function scrapeLahlouAll(cfg: StoreCfg): Promise<LahlouItem[]> {
  if (lahlouCache && Date.now() - lahlouCache.at < 12 * 3600e3) return lahlouCache.items;
  const items: LahlouItem[] = [];
  for (let page = 1; page <= 5; page++) {
    await delay(1000);
    try {
      const res = await fetch(`${cfg.shopifyBase}/products.json?limit=250&page=${page}`, { headers: { "User-Agent": UA } });
      if (!res.ok) break;
      const j = await res.json();
      if (!j.products?.length) break;
      for (const p of j.products) {
        const price = parsePrice(String(p.variants?.[0]?.price ?? ""));
        if (!p.title || !price) continue;
        items.push({
          title: cleanTitle(p.title),
          priceDa: price,
          url: `${cfg.shopifyBase}/products/${p.handle}`,
          image: p.images?.[0]?.src || "",
        });
      }
      if (j.products.length < 250) break;
    } catch {
      break;
    }
  }
  lahlouCache = { at: Date.now(), items };
  return items;
}

// ---- Shopify JSON mode (collections) ----
async function scrapeShopify(store: string, cfg: StoreCfg, category: string): Promise<ScrapedOffer[]> {
  if (cfg.shopifyAll) {
    const items = await scrapeLahlouAll(cfg);
    return items
      .filter((it) => lahlouCat(it.title) === category)
      .map((it) => ({
        store,
        category,
        title: it.title,
        priceDa: it.priceDa,
        url: it.url,
        stock: "À vérifier",
        image: it.image,
      }));
  }
  const out: ScrapedOffer[] = [];
  for (const handle of cfg.cats[category] || []) {
    await delay(1000);
    const url = `${cfg.shopifyBase}/collections/${handle}.products.json?limit=250`;
    try {
      const res = await fetch(url, { headers: { "User-Agent": UA } });
      if (!res.ok) continue;
      const j = await res.json();
      for (const p of j.products || []) {
        const v = (p.variants || [])[0];
        const price = parsePrice(String(v?.price ?? ""));
        if (!p.title || !price) continue;
        out.push({
          store,
          category,
          title: cleanTitle(p.title),
          priceDa: price,
          url: `${cfg.shopifyBase}/products/${p.handle}`,
          image: p.images?.[0]?.src || "",
          stock: v?.available === false ? "Rupture" : v?.available === true ? "En stock" : "À vérifier",
        });
      }
    } catch {
      /* skip */
    }
    if (out.length > 0) break;
  }
  return out.filter((o) => quickCheck(o));
}

// ---- NextGen.DZ: custom PHP catalog, filter via products.php?component_type=X ----
// Cards: .product-card, detail URL in onclick -> /product-detail.php?id=N,
// title from img alt (or heading text), price "409 000 DA" in card text.
async function scrapeNextGen(store: string, cfg: StoreCfg, category: string): Promise<ScrapedOffer[]> {
  const type = (cfg.cats[category] || [""])[0];
  if (!type) return [];
  const out: ScrapedOffer[] = [];
  for (let page = 1; page <= 4; page++) {
    await delay(1100);
    const url = `${cfg.shopifyBase}/products.php?component_type=${type}&lang=en${page > 1 ? `&page=${page}` : ""}`;
    let html = "";
    try {
      const res = await fetch(url, { headers: { "User-Agent": UA, "Accept-Language": "fr-DZ,fr;q=0.9" } });
      if (!res.ok) break;
      html = await res.text();
    } catch {
      break;
    }
    const loaded = cheerio.load(html);
    const cards = loaded(".product-card");
    if (cards.length === 0) break;
    cards.each((_, el) => {
      const e = loaded(el);
      let title = cleanTitle(e.find("img").first().attr("alt") || "");
      if (!title || title.length < 4) {
        title = cleanTitle(e.find("h3, h4, .product-title").first().text());
      }
      const price = parsePrice(e.text());
      if (!title || !price) return;
      const onclick = e.attr("onclick") || "";
      const m = onclick.match(/product-detail\.php\?id=(\d+)/);
      const link = m ? `${cfg.shopifyBase}/product-detail.php?id=${m[1]}` : url;
      let img = e.find("img.primary-image").attr("src") || e.find("img").first().attr("src") || "";
      if (img.startsWith("data:")) img = "";
      let image = "";
      try {
        image = img ? new URL(img, url).toString() : "";
      } catch {
        image = "";
      }
      const txt = e.text();
      const stock = /out of stock|rupture|sold out|épuisé/i.test(txt) ? "Rupture" : /en stock|in stock/i.test(txt) ? "En stock" : "À vérifier";
      out.push({ store, category, title, priceDa: price, url: link, image, stock });
    });
    if (cards.length < 24) break; // last page
  }
  return out.filter((o) => quickCheck(o));
}

export async function scrapeStoreCategory(store: string, category: string): Promise<ScrapedOffer[]> {
  const cfg = STORES[store];
  if (!cfg) throw new Error(`unknown store ${store}`);
  if (cfg.wooApi && cfg.wooApi.cats[category] !== undefined) {
    try {
      const apiOffers = await fetchProducts(
        store,
        cfg.wooApi.cats[category],
        category,
        cfg.wooApi.base
      );
      if (apiOffers.length > 0) {
        return apiOffers;
      }
    } catch {
      // On any error or empty, fall through to existing HTML / sitemap / shopify
    }
  }
  if (cfg.mode === "sitemap") {
    return (await scrapeKotek()).filter((o) => o.category === category);
  }
  if (cfg.mode === "shopify") {
    return scrapeShopify(store, cfg, category);
  }
  if (cfg.mode === "nextgen") {
    return scrapeNextGen(store, cfg, category);
  }
  const urls = cfg.cats[category];
  if (!urls) throw new Error(`no category ${category} for ${store}`);
  const out: ScrapedOffer[] = [];
  for (const url of urls) {
    await delay(1200);
    const res = await fetch(url, { headers: { "User-Agent": UA, "Accept-Language": "fr-DZ,fr;q=0.9" } });
    if (!res.ok) continue;
    const loaded = cheerio.load(await res.text());
    for (const itemSel of cfg.item) {
      const items = loaded(itemSel);
      if (items.length === 0) continue;
      items.each((_, el) => {
        const e = loaded(el);
        let title = "";
        for (const tSel of cfg.title) {
          title = cleanTitle(e.find(tSel).first().text());
          if (title.length > 3) break;
        }
        if (!title) title = cleanTitle(e.find("img").first().attr("alt") || "");
        let price: number | null = null;
        for (const pSel of cfg.price) {
          price = parsePrice(e.find(pSel).first().text());
          if (price) break;
        }
        if (!title || !price) return;
        const stock = readStock(e, loaded);
        let explicit = "";
        for (const lSel of cfg.link || []) {
          explicit = e.find(lSel).first().attr("href") || "";
          if (explicit) break;
        }
        let urlOut = "";
        try {
          urlOut = explicit ? new URL(explicit, url).toString() : "";
        } catch {
          urlOut = "";
        }
        out.push({
          store,
          category,
          title,
          priceDa: price,
          url:
            urlOut ||
            pickLink(loaded, el, url, {
              childBase: cfg.child ? new URL(url).origin + "/composants/" : undefined,
              sameOrigin: cfg.sameOrigin,
              exclude: urls,
            }),
          image: pickImage(loaded, el, url),
          stock,
        });
      });
      if (out.length > 0) break; // first working selector wins
    }
    if (out.length > 0) break; // first working URL wins
  }
  return out.filter((o) => quickCheck(o));
}

export const STORE_NAMES = Object.keys(STORES);
export const STORE_CATS = (store: string) => Object.keys(STORES[store]?.cats ?? {});
export const STORE_WILAYA = (store: string) => STORES[store]?.wilaya ?? "Alger";

// ---- KOTEK: JS-rendered archives -> crawl RankMath product sitemaps, parse SSR product pages ----
const KOTEK_CAT_MAP: [RegExp, string][] = [
  [/processeur/, "cpu"],
  [/refroidis/, "cooler"],
  [/carte m[eè]re/, "motherboard"],
  [/\bram\b|m[eé]moire/, "ram"],
  [/ssd|stockage|disque/, "ssd"],
  [/carte graphique/, "gpu"],
  [/alimentation/, "psu"],
  [/bo[iî]tier/, "case"],
  [/[eé]cran|moniteur/, "monitor"],
];

let kotekCache: { at: number; offers: ScrapedOffer[] } | null = null;

async function scrapeKotek(): Promise<ScrapedOffer[]> {
  if (kotekCache && Date.now() - kotekCache.at < 12 * 3600e3) return kotekCache.offers;
  const cfg = STORES["KOTEK"];
  const urls: string[] = [];
  for (const sm of cfg.sitemaps || []) {
    await delay(800);
    try {
      const res = await fetch(sm, { headers: { "User-Agent": UA } });
      if (!res.ok) continue;
      const xml = await res.text();
      urls.push(
        ...(xml.match(/<loc>([^<]+)<\/loc>/g) || []).map((s) => s.replace(/<\/?loc>/g, "")).slice(0, 25)
      );
    } catch {
      /* skip */
    }
  }
  const out: ScrapedOffer[] = [];
  for (const u of urls.slice(0, 80)) {
    let done = false;
    for (let attempt = 0; attempt < 2 && !done; attempt++) {
      if (attempt > 0) await delay(500);
      else await delay(700);
      try {
        const res = await fetch(u, { headers: { "User-Agent": UA, "Accept-Language": "fr-DZ,fr;q=0.9" } });
        if (!res.ok) continue;
        const p = cheerio.load(await res.text());
        // Porto injects related/upsell widgets with their own .price — remove first
        p("li.product-col, .products-slider, .related, .upsells, .cross-sells, header, footer").remove();
        const title = cleanTitle(p("h1.product_title, h1").first().text());
        const price = parsePrice(p(".summary .price ins, .summary .price, .price ins, .price").first().text());
        if (!title || !price) continue;
        const crumb = p(".breadcrumb, .woocommerce-breadcrumb").first().text().toLowerCase();
        let category = "";
        for (const [re, cat] of KOTEK_CAT_MAP) {
          if (re.test(crumb)) {
            category = cat;
            break;
          }
        }
        if (!category) continue;
        let img = p("img.wp-post-image").attr("data-src") || p("img.wp-post-image").attr("src") || "";
        if (!img || img.startsWith("data:")) {
          const g = p(".woocommerce-product-gallery img").first();
          img = g.attr("data-src") || g.attr("src") || "";
        }
        let image = "";
        try {
          image = img && !img.startsWith("data:") ? new URL(img, u).toString() : "";
        } catch {
          image = "";
        }
        const stockTxt = p(".summary .stock").first().text();
        out.push({
          store: "KOTEK",
          category,
          title,
          priceDa: price,
          url: u,
          image,
          stock: /rupture|out-of-stock|out of stock/i.test(stockTxt) ? "Rupture" : /en stock|in stock/i.test(stockTxt) ? "En stock" : "À vérifier",
        });
        done = true;
      } catch {
        /* retry / skip */
      }
    }
  }
  kotekCache = { at: Date.now(), offers: out.filter((o) => quickCheck(o)) };
  return kotekCache.offers;
}
