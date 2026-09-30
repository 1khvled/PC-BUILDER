import type { Guide } from "./guides";
import { GUIDES } from "./guides";
import type { Locale } from "@/lib/i18n/config";

/**
 * English edition of the buying-guide editorial content.
 *
 * Same shape as the French `GUIDES` array (same slugs, same `parts` ids, same
 * `readMin`) so both locales share every page template and every price lookup:
 * `/en/guides/[slug]` simply picks the English object and keeps pricing, the
 * recommended-parts table and the builder permalink identical.
 */
export const GUIDES_EN: Guide[] = [
  {
    slug: "gaming-1080p-algerie",
    title: "1080p Gaming PC in Algeria: the build that actually makes sense",
    hook: "Ryzen 5 5600 + RTX 3060 12GB: 144Hz at 1080p without throwing money away. Prices collected live from stores in Algiers, Sétif and Oran.",
    readMin: 6,
    parts: ["cpu-r5-5600", "cooler-ak400", "mobo-b550m-a-pro", "ram-vengeance-16-d4", "ssd-nvme-1tb-g4", "gpu-rtx3060-12gb", "case-4000d", "psu-550-b"],
    blocks: [
      {
        h: "Why this combination",
        p: [
          "The Ryzen 5 5600 remains the king of the performance-per-dinar in Algiers: 6 cores that never bottleneck an RTX 3060 at 1080p, and because it sits on the AM4 socket, B550 motherboards stay cheap and DDR4 is priced at rock bottom.",
          "The RTX 3060 12GB (not the 8GB one): 12GB of VRAM absorbs 2025-2026 textures where 8GB saturates. Used on Ouedkniss it trades under 90,000 DA — always check it has not been mined (see our used-hardware guide).",
        ],
      },
      {
        h: "Power supply: do not improvise",
        p: [
          "5600 (65W) + 3060 (170W) + 150W for the rest = roughly 385W at peak. A branded 650W Bronze unit (Cooler Master, MSI, DeepCool) leaves about 260W of headroom: quiet, cool and long-lived.",
          "With the cuts and micro-blackouts on the Algerian grid, add a 1000VA UPS if you are in an unstable area — a decent PSU plus a UPS costs less than one fried motherboard.",
        ],
      },
      {
        h: "New versus used, in DA",
        p: [
          "New from a store: you pay the full price but get a 12-month warranty and cash on delivery nationwide (all 58 wilayas via Yalidine/Maystro).",
          "Used on Ouedkniss: a 3060 12GB negotiates in the 75,000–90,000 DA range. Ask for a benchmark video (10 minutes of FurMark with the temperature on screen), the original invoice, and test it in person when the seller is in Algiers, Sétif or Oran.",
        ],
      },
    ],
    pitfalls: [
      "B550 + Ryzen 5600: no BIOS trouble at all (native support). Be careful with older used B450 boards, they demand a BIOS update.",
      "Case: check the GPU length (the Ventus is 235mm, it fits everywhere — a 330mm Gaming Trio does not).",
      "DDR4 3200 CL16 is enough; 3600 brings almost nothing extra on AM4 for what it costs in DA.",
    ],
  },
  {
    slug: "bureautique-etudes-90k",
    title: "Office and study PC under 95,000 DA",
    hook: "i5-12400F + a used RX 580: office work, studies, light video editing and even 1080p gaming. The smart student budget.",
    readMin: 4,
    parts: ["cpu-i5-12400f", "mobo-h610m", "ram-vengeance-16-d4", "ssd-nvme-512gb", "gpu-rx580-8gb", "case-4000d", "psu-450-b"],
    blocks: [
      {
        h: "The reasoning",
        p: [
          "The i5-12400F (6 performance cores, no iGPU — the F means no integrated graphics) is available at a good price and demolishes everything in office workloads. You therefore need a graphics card, even a small one.",
          "A used RX 580 8GB (25,000–35,000 DA on Ouedkniss) is enough for Windows, Office, 1080p editing and 1080p esports games. It has been the small-budget card for years — there is a huge amount of used stock in Algiers.",
        ],
      },
      {
        h: "Upgrade path",
        p: [
          "LGA1700 + B660 + 650W: in two years you drop in a used RTX 4060 without changing anything else. That is what a good budget build means — an upgrade path, not a dead end.",
        ],
      },
    ],
    pitfalls: [
      "The 12400F outputs no picture without a graphics card. If the RX 580 dies you get a black screen — plan for it.",
      "Used RX 580: 90% of them have been mined. Run FurMark and make sure the fans are not screaming.",
      "Go straight for a 1TB NVMe SSD: 256GB models are a false economy — Windows plus two games and it is full.",
    ],
  },
  {
    slug: "gaming-1440p-300k",
    title: "1440p gaming: AM5 + RTX 4070/5070",
    hook: "When 1080p is no longer enough: a Ryzen 9600X, DDR5 and an x70-class card. The enthusiast tier, costed in DA.",
    readMin: 6,
    parts: ["cpu-r5-9600x", "cooler-ak620", "mobo-b650m", "ram-delta-32-d5", "ssd-nvme-1tb-g4", "gpu-rtx4070-12gb", "case-4000d", "psu-750-gold"],
    blocks: [
      {
        h: "Why AM5, and why now",
        p: [
          "AM4 is a dead end for brand-new builds in 2026: DDR4 prices have stagnated and new CPUs are getting scarce. AM5 (9600X + B650 + DDR5) costs more today, but on the CPU side it will live until around 2028.",
          "32GB DDR5-6000: the Ryzen sweet spot (a 1:1 ratio with the memory controller). Below 5600 MT/s you lose free FPS.",
        ],
      },
      {
        h: "4070 versus 5070",
        p: [
          "Compare both spec sheets on the site: the 5070 brings roughly 15-20% more plus DLSS 4, while the 4070 is easier to find cheap on the used market. At a similar price take the new 5070 with its warranty; at -25% or more, the used 4070 wins.",
        ],
      },
    ],
    pitfalls: [
      "Case limited to 350mm (V217): dual-fan x70-class cards (~240mm) fit, big 330mm triple-fan cards do not.",
      "650W is enough for a 9600X (65W) + 4070 (200W) ≈ 480W estimated — but if you might want a 5080 one day, take 750W straight away.",
      "Update the BIOS before installing Windows: early B650 boards had DDR5 bugs that have since been fixed.",
    ],
  },
  {
    slug: "ouedkniss-occasion-survie",
    title: "Ouedkniss: buying used hardware without getting scammed",
    hook: "60% of the country's best GPU deals go through Ouedkniss. Survival rules, classic scams and a test checklist.",
    readMin: 7,
    parts: ["gpu-rtx3060-12gb", "gpu-rx580-8gb", "cpu-r5-5600"],
    blocks: [
      {
        h: "Reference prices (recorded from the site)",
        p: [
          "A healthy used RTX 3060 12GB sells for 75,000–95,000 DA. Below 65,000 DA, get suspicious: a worn-out mined card, a dying fan, or plain fraud (stolen photos, teaser prices).",
          "Always compare with the lowest new price shown on our product pages before you negotiate — your negotiating margin is exactly that gap.",
        ],
      },
      {
        h: "Checklist before you pay",
        list: [
          "Ask for a video: 10 minutes of FurMark or of a game, with the temperature visible (HWInfo). +85°C means dead thermal paste or a clogged heatsink.",
          "Photos of the card out of the case, front and back: rust marks, tape, missing screws = heavy mining.",
          "Original invoice, blister pack ideally. Without an invoice, halve your maximum price.",
          "Test it in person if you can (Algiers, Sétif, Oran: serious sellers accept). Never wire a CCP/BaridiMob deposit to a stranger.",
          "1 DA listings or absurd crossed-out prices: bait. Walk away.",
        ],
      },
    ],
    pitfalls: [
      "\"Never mined, warranty\" without proof = mined. Miners sell in batches: same photos, several listings.",
      "Used complete builds often hide a no-name PSU: ask for the exact PSU brand.",
      "Factor in the trip: a \"bargain\" 300km away stops being one once you pay for the transport.",
    ],
  },
  {
    slug: "alim-onduleur-algerie",
    title: "Power supply and UPS: the anti-blackout guide",
    hook: "Algerian mains electricity kills more PCs than heat does. Size your PSU and pick your UPS, with the actual numbers.",
    readMin: 5,
    parts: ["psu-750-gold", "cpu-r5-5600", "gpu-rtx3060-12gb"],
    blocks: [
      {
        h: "Sizing: the x1.3 rule",
        p: [
          "Add up CPU + GPU + 150W (motherboard, RAM, SSD, fans), then multiply by 1.3. Example from the site: 65 + 170 + 150 = 385W → 500W theoretical → take 650W (a standard tier, quiet and efficient).",
          "80+ Bronze is the bare minimum, not a luxury: at the same load a budget PSU runs hotter, makes more noise and protects less (overvoltage = dead motherboard).",
        ],
      },
      {
        h: "UPS: which one to buy",
        p: [
          "For a 400-500W gaming PC plus a monitor: a 1000-1500VA line-interactive UPS. It absorbs micro-blackouts and gives you 5-10 minutes to save your work and shut down.",
          "Plug into it: the tower and the monitor only. Not the laser printer (its power spike kills the UPS), not the heater.",
          "Replace the battery every 2-3 years: a UPS with a dead battery protects nothing and gives false confidence.",
        ],
      },
    ],
    pitfalls: [
      "A no-name 650W at 6,000 DA is not a 650W: look at the real wattage on the 12V rail (the label).",
      "A surge-protected power strip is not a UPS: it does nothing against blackouts.",
      "In summer, dust it out: 45°C ambient plus dust means the PSU runs flat out and ages twice as fast.",
    ],
  },
];

/** Locale-aware guide lookup. Falls back to French when an English entry is missing. */
export function findGuide(slug: string, locale: Locale | "en" | "fr"): Guide | undefined {
  const pool = locale === "en" ? GUIDES_EN : GUIDES;
  return pool.find((g) => g.slug === slug);
}

/** Locale-aware guide list, keeping the French ordering (by editorial priority). */
export function listGuides(locale: Locale | "en" | "fr"): Guide[] {
  if (locale !== "en") return GUIDES;
  const order = new Map(GUIDES.map((g, i) => [g.slug, i]));
  return [...GUIDES_EN].sort(
    (a, b) => (order.get(a.slug) ?? 99) - (order.get(b.slug) ?? 99),
  );
}
