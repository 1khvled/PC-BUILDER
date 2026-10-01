import type { Guide } from "./guides";
import { GUIDES as GUIDES_FR } from "./guides";
import type { Locale } from "@/lib/i18n/config";

/**
 * English edition of the buying-guide editorial content.
 *
 * Same shape as the French `GUIDES` array - same slugs in the same order, same
 * `parts` ids, same `readMin` - so both locales share every page template, the
 * builder permalink and the price lookups. The prose is written as English
 * rather than translated word-for-word: the arguments are the same, the phrasing
 * is not.
 */
export const GUIDES_EN: Guide[] = [
  {
    slug: "gaming-1080p-algerie",
    title: "1080p gaming PC: the build that does the job without waste",
    hook: "A Ryzen 5 5600, 8GB of VRAM and a 180Hz monitor: the 1080p combination that still holds up in 2026. The total at the top of this page recalculates on every price snapshot, and that is the number to budget from.",
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
        h: "Why six cores, not eight",
        p: [
          "At 1080p the graphics card is your bottleneck, not the CPU. Moving from a Ryzen 5 5600 to a Ryzen 7 5700X3D barely changes average frame rate. What it changes is 1% low performance, which is where the micro-stutters come from when several units animate the same scene. On a 1080p budget, those dinars buy more as VRAM or as a monitor.",
          "The 5600 has a second advantage that matters just as much: it is an AM4 part, so B450 and B550 boards and DDR4 stay the cheapest things in the catalogue. The whole platform can be restocked part by part for years.",
        ],
      },
      {
        h: "The card: 8GB is a floor, not a choice",
        p: [
          "Eight gigabytes of VRAM in 2026 is the bare minimum for 1080p without the game engine thrashing between allocations. 2025-2026 textures, ray tracing and especially frame generation all eat considerably more than they used to. An 8GB card will hold a steady 60 fps in esports titles, and will hitch the moment a big AAA release lands in 1440p.",
          "Two options are close here: the RX 6650 XT 8GB, which is the fastest in pure raster for a 1080p budget, or an RTX 4060 8GB if you want ray tracing, NVENC encoding and DLSS doing part of the work for you. Both are in the price table below: compare them at today's numbers.",
        ],
      },
      {
        h: "The monitor is the most under-budgeted part",
        p: [
          "The real trap in Algeria is not the CPU or the card, it is the monitor. Plenty of 200,000 DA builds end up driving a 24-inch 75Hz office TN panel bought separately. The entire compute budget is then wasted, because the GPU is waiting on the panel to refresh.",
          "A 24-inch 180Hz IPS panel is the best dinar-per-image on this build. IPS is not a luxury: it is what keeps you away from the vertical banding and washed-out colours of an entry-level TN. If you want more frequency, a 24-inch 200Hz is in the catalogue for almost the same money.",
        ],
      },
      {
        h: "Power supply: 650W, and why not 750",
        p: [
          "The 5600 draws 65W, an RX 6650 XT around 180W, and everything else (board, RAM, SSD, fans) about 150W. That puts you just under 400W at peak. The usual rule is to stay at 30-40% load, which lands here on 650W: the most widely sold tier and the cheapest per watt.",
          "Buying 750W just in case costs money and does nothing while the card stays the same. If you genuinely plan to drop in a 250W card later, 750W is justified, and that is the day to buy it, not today.",
        ],
      },
      {
        h: "What is left after this build",
        p: [
          "There is room for two upgrades without touching the motherboard: moving to 32GB of DDR4, and adding a secondary SSD. Both use slots that already exist on the B550M-A Pro, which has two M.2 connectors. That is what a good first PC is: a base that is happy to age, not a sealed assembly.",
        ],
      },
    ],
    pitfalls: [
      "B550 plus a Ryzen 5 5600 needs no BIOS update at all, support is native. Used B450 boards, on the other hand, often demand one.",
      "Graphics card length: check the figure in the product sheet against your case limit. A 330mm board such as an RTX 5080 does not fit everywhere; a 235-240mm card fits everywhere.",
      "DDR4-3200 CL16 is enough. Going to 3600 costs more in DA for one or two percent on AM4, which is not worth the gap.",
      "Two identical sticks (2x8GB) beat a mismatched 2x8GB plus 4GB: mixing capacities loses dual channel.",
    ],
  },
  {
    slug: "carte-graphique-prix-2026",
    title: "Graphics cards in Algeria: what 8GB actually costs you in 2026",
    hook: "The VRAM tiers are real, but the entry point has moved up the range. With live prices in the table below, here is which tier your budget actually buys and where the 8GB cliff sits.",
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
        h: "The 8GB cliff is real, and it sits above the price people assume",
        p: [
          "Eight gigabytes was comfortable three years ago. The reason it no longer is, is mechanical rather than marketing. Higher-detail textures, ray tracing with reflections, and above all frame generation - which holds an internal image, motion data and an upscaled final image at once - all compete for the same pool. When the pool overflows you do not get a smooth decline. You get hitching, and stutter that does not average out.",
          "The price picture is what decides how much this matters. Only the RX 580, at the bottom of this table, sits in the range where 8GB is genuinely fine for its age. The RX 6600 and the RX 6650 XT sit well above it, and those are the cards most people call a budget 1080p buy. The 6650 XT has cost close to three times the 6600 for the same 8GB, which is a hard way to learn that the entry point moved.",
        ],
      },
      {
        h: "Where each tier lands",
        p: [
          "The cheapest way into this page is the RX 580, and at that price nothing about its age matters. It is a complete 1080p card for office work, video editing and older games.",
          "The 8GB cards that are actually current, the RX 6600 and the RTX 4060, sit in different markets entirely, separated by tens of thousands of dinars for a card that is broadly faster. It is worth asking which one your use justifies before treating them as alternatives.",
          "The first 16GB card on this page is the RX 7600 XT, and it makes the most interesting comparison here: 16GB for less than an RTX 4060 with 8GB. If VRAM is your criterion rather than raster performance, that comparison decides it on its own.",
        ],
      },
      {
        h: "Why AMD wins this market specifically",
        p: [
          "In pure raster, AMD's cards give more frames per dinar in Algeria, and the VRAM gap has become their main argument. The RX 7600 XT pairs 16GB with a price the NVIDIA equivalents do not approach at this tier.",
          "NVIDIA holds the lead in ray tracing, video encoding, and a broader upscaling ecosystem. The RTX 4060 is a coherent card for a creator who also games; it is poor value for a gamer who does not encode.",
          "For a pure gamer the rule is simple: take the best price per frame with at least 12GB. The table is sorted so you can do that comparison directly rather than trusting a ranking.",
        ],
      },
      {
        h: "The listing trap",
        p: [
          "On Ouedkniss the first listing in any category is usually a trap: a teaser price that is not the real price, a defective card with no mention of it, or a keyboard, a case and a GPU in one ad. This site's product pages show offers from verified shops sorted by price. Read those, not the top search result.",
          "The second trap is comparing a used offer against a new one without checking who is selling. An RX 580 at half the new price is not a bargain when the seller has no invoice and no warranty: your risk is the full price and your cover is zero.",
        ],
      },
    ],
    pitfalls: [
      "Never compare two used listings without checking how many offers exist. A single listing with no HD photos is rarely a good deal.",
      "Card length is a physical limit, not a preference. Check the millimetres against your case before you commit to anything over 240mm.",
      "A card that needs a 16-pin connector needs a PSU that supplies it, and only the cable it shipped with should ever be used.",
      "Two-fan cards run hotter than three-fan ones. At equal price in 1080p two fans remain a fine compromise; at 1440p favour the cooling.",
      "Do not read an index figure on this site as a measured benchmark. It is our own rounded estimate, labelled as such, and the sources are linked underneath every part.",
    ],
  },
  {
    slug: "config-pc-170k-da",
    title: "A 170,000 DA gaming PC that is actually balanced",
    hook: "Eight parts chosen to land near 170,000 DA, with the reasoning behind each. The live total sits at the top of this page and it moves daily - what follows is the reasoning, not the arithmetic.",
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
        h: "What this machine actually is",
        p: [
          "An AM5 platform with a Ryzen 5 7500F, 16GB of DDR5-5600, and an RX 6600 XT. In 1080p that card holds high refresh rates on almost everything, and the 7500F has enough single-thread speed that the CPU is never the reason a frame is missing.",
          "It is not a 4K machine and it is not a 1440p machine with margin. It is a 1080p machine with room to add a second stick of memory later, which is the single most likely upgrade in its life.",
        ],
      },
      {
        h: "The split, line by line",
        p: [
          "The graphics card is roughly a third of this build. The processor and motherboard together are a little under another third. Everything else - memory, storage, cooling, case, power - makes up the rest.",
          "That ratio is the whole argument, and it holds regardless of what the total happens to be this week. A balanced 1080p build spends roughly a third of its money on the card and a quarter on the platform, because those are the two parts that decide whether the machine feels fast. The remainder is where people quietly overpay.",
        ],
      },
      {
        h: "Where you can legitimately save",
        p: [
          "The cooler. The AK400 handles a 65W processor without argument and costs less than half of what a 240mm AIO does. An AIO earns its place above 105W, and this is a 65W part.",
          "The case. The RX 6600 XT is 242mm long; almost any ATX tower on the market swallows that. Nothing about the budget case you can see through the side panel changes the frame rate.",
          "The chipset. A B650 board is the floor for AM5, so there is nothing below it to skip to. You are already on the cheapest platform that takes this processor.",
        ],
      },
      {
        h: "Where saving costs you the machine",
        p: [
          "The power supply. This is the one line with no floor worth taking. The 7500F and the RX 6600 XT draw around 300W together, and modern cards ask for brief voltage spikes at startup that a no-name unit cannot supply. A 650W Gold unit is the right size, and no cheaper alternative in this build is worth the risk of taking the motherboard with it.",
          "Storage. The 1TB NVMe is the least glamorous line and the one that causes the most regret. Modern games install at 80 to 150GB each. A 512GB drive fills in a year of ordinary use, and then you are deleting games to make room.",
        ],
      },
      {
        h: "What it will not do",
        p: [
          "At 1440p the RX 6600 XT is playable, not comfortable: you will hold a locked frame rate on competitive settings and lose to native on the quality settings. If you intend to game above 1080p, the honest upgrade is the card, not the processor.",
          "The memory is 16GB on a board that takes more. If you know you will edit video or run a lot of browser tabs alongside a game, add a second 16GB stick now while the slot is free.",
        ],
      },
    ],
    pitfalls: [
      "Do not substitute a no-name 450W unit to save a few thousand dinars. On this configuration the saving is small and the failure mode is the motherboard.",
      "The RX 6600 XT is 242mm long. Check the case's maximum GPU length before ordering; it is the most common reason an otherwise finished PC will not close.",
      "A 512GB drive is the wrong place to economise on a PC you expect to keep. Games fill it faster than you think.",
      "Do not buy an AIO for a 65W processor. The money buys nothing measurable and adds a pump that can fail.",
      "AM5 boards need DDR5. A DDR4 stick will not seat, and a DDR5 stick will not fit a B450.",
    ],
  },
  {
    slug: "config-pc-250k-da",
    title: "The 250,000 DA tier: 1080p with no compromises left",
    hook: "A 12GB card, 32GB of memory and a 180Hz monitor. At this budget the question is no longer how to hit 60 fps but how much headroom to keep for 2027.",
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
        h: "Where the extra money goes",
        p: [
          "Three things change compared with an entry build: the card moves to 12GB of VRAM, memory moves to 32GB, and the monitor moves to 180Hz. Those are precisely the three parts that hold back a 1080p machine.",
          "Everything else is deliberately identical. A B550 rather than a B450 for the SSD's PCIe 4.0, a real tower heatsink rather than the cheap one, and a decent case. This is a budget you can see in the parts rather than in the marketing.",
        ],
      },
      {
        h: "Why 12GB of VRAM changes the picture",
        p: [
          "At 1080p the card runs out first when VRAM runs out. Recent background textures, ray tracing and frame generation all consume considerably more than they did two years ago, and an 8GB card starts showing hitches even at 1080p.",
          "An RX 6700 XT 12GB or an RTX 5070 12GB buys you comfortable headroom. The step up from a previous-generation 8GB card is the best-value money on this whole tier.",
        ],
      },
      {
        h: "32GB, not 16",
        p: [
          "16GB is still enough to play. But at 32GB you can leave a game running, keep a browser with a lot of tabs open, plus Discord and a capture tool, and nothing slows down. On a machine meant to last five years that is an investment that avoids frustration in 2029.",
          "The 32GB kit in the table is DDR4-3200, which is the sensible ceiling for AM4. Do not pay more for a faster kit: the gain on AM4 is one to two percent.",
        ],
      },
      {
        h: "Power supply and room to grow",
        p: [
          "The 5600 (65W) plus an RX 6700 XT (230W) plus about 150W for the rest comes to roughly 445W at peak. 650W is the right tier: a comfortable load ratio means it runs quietly, and it leaves room for a bigger card in two years.",
          "The 4000D case has real airflow, two 2.5-inch bays and clearance for a second tower cooler. That is not a detail: a cheap case that limits heatsink height will still be limiting you in five years.",
        ],
      },
    ],
    pitfalls: [
      "Do not buy a DDR4 kit more expensive or faster than the one in the table: on AM4 the gain is negligible.",
      "A budget case limits heatsink height and graphics card length. Check both figures before ordering.",
      "The 180Hz panel in the table is half the display budget. Do not swap it for a 75Hz office monitor to save money.",
      "650W is enough for this build. 750W only makes sense if you already know you will change the card.",
      "If the budget is tight, cut the case before cutting memory or the power supply.",
    ],
  },
  {
    slug: "bureautique-etudes-90k",
    title: "Office and study PC: what it actually costs now",
    hook: "The 90,000 DA office PC everyone quotes no longer adds up once you include a graphics card and a decent SSD. Here is the configuration that is genuinely reasonable, and the two places to save.",
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
        h: "Why the 90,000 DA budget no longer works",
        p: [
          "Add up the table line by line and the picture is obvious: the processor, the memory and the SSD together now cost more than most 90,000 DA listings actually cover. Those listings are usually a tower with no graphics card, or with a used card nobody will stand behind six months from now.",
          "The real problem with an office budget is not the tower, it is the monitor. If you already own a screen, this build is honest. If you are buying everything, add a 24-inch panel and the budget doubles.",
        ],
      },
      {
        h: "The F suffix trap",
        p: [
          "An i5-12400F has no integrated graphics. Without a graphics card it outputs nothing at all: black screen, not even the BIOS. It is an excellent processor, but it is a processor for a machine that already has a graphics card.",
          "There are three workarounds, cheapest first: a healthy used card, a processor with an iGPU, or buying the card only after checking whether your course actually requires one. This build goes with a used RX 580 8GB, which is also the part you should test most carefully before paying.",
        ],
      },
      {
        h: "Where to save, and where not to",
        p: [
          "Two parts absorb a legitimate saving. The case: an Antec NX400 costs noticeably less than a Corsair 4000D and does the same job for this card size. And memory: 16GB is the acceptable minimum, but a single kit is enough, not 2x16GB.",
          "One part should not be economised on, and it is the power supply. The 12400F (65W) plus an RX 580 (185W) plus 150W for the rest is 400W at peak, with voltage spikes at startup. A 450W unit works, but at a permanent 90% load it runs hot, it gets loud, and it has no margin at all. A 550W costs a few thousand dinars more and removes the risk.",
        ],
      },
      {
        h: "Study: what actually matters",
        p: [
          "For study (Word, Excel, PDF, a browser with forty tabs, Visio, code) the ranking of parts by importance is inverted compared with gaming: the SSD rules, memory comes next, the CPU has plenty of slack, and the graphics card is almost irrelevant. A 512GB NVMe is the minimum, and a mechanical drive alongside it for archives is perfectly fine.",
          "The one real trap specific to students: buying a tower with no graphics card on the promise that you will add one later. The day you want to play, you also have to buy the card, the power supply and sometimes a case that no longer fits. A complete tower at this level lets you play tonight.",
        ],
      },
    ],
    pitfalls: [
      "The F suffix means no iGPU. A 12400F with no graphics card produces no image, not even at the BIOS.",
      "450W with a 185W GPU is borderline. Go to 550W and you will not regret the few extra thousand dinars.",
      "8GB of RAM is finished in 2026: a browser with a handful of tabs is enough to choke it. 16GB is the floor.",
      "A 256GB SSD is a false economy: Windows and its updates already take a hundred-odd gigabytes, and the drive is full before the year ends.",
      "Check that your chosen case accepts the length of your used card. RX 580s are 240mm, which is standard but not universal.",
    ],
  },
  {
    slug: "carte-mere-am4-ou-am5",
    title: "Motherboard: B450, B550 or AM5, and what you are really paying for",
    hook: "The chipset does not make the machine. What each one actually gives you, when AM4 is still the right call, and the three mistakes that make people overpay for a board.",
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
        h: "The chipset does not make the machine",
        p: [
          "What makes the machine is the processor, the memory and the graphics card. The chipset is the equipment around them: port count, M.2 slots, PCIe generation, connectivity. None of that changes a frame per second.",
          "Concretely, a B450 and a B550 deliver identical performance with the same CPU and the same card. The B550 adds PCIe 4.0 for the SSD and overclocking. That is useful, not decisive.",
        ],
      },
      {
        h: "AM4: a platform with years left",
        p: [
          "AM4 launched in 2019 and is not finished. The catalogue still shows B450 and B550 boards at prices with no relation to their AM5 equivalents, and a 5600 is excellent in 1080p on them. For a PC that should last three years, that is the rational choice.",
          "The trap is elsewhere: an old used B450 may not boot a 5600 without a BIOS update. A board that does not power on is a return ticket. Buy a B450 that explicitly supports your CPU, or take the B550, where the price gap is small.",
        ],
      },
      {
        h: "AM5: what the premium buys",
        p: [
          "On AM5 the real argument is socket longevity, not speed. AM5 keeps receiving processors for years, so a board bought in 2026 still gives you upgrades well into the next decade.",
          "Between B650, B850 and X870, look at what you will actually use: two M.2 slots, Wi-Fi, a decent VRM. The X870E in the table is built for overclocking and PCIe 5.0, two things the majority of players never touch.",
        ],
      },
      {
        h: "mATX is enough almost always",
        p: [
          "A micro-ATX board covers nearly every build: two to four RAM slots, one or two M.2 connectors, four SATA. The ATX format only adds two things, more expansion slots and more rear connectors.",
          "So only buy ATX if you know why: three graphics cards (pointless), four extra drives (rare), or a large heatsink on the top.",
        ],
      },
    ],
    pitfalls: [
      "An old B450 may not boot a Ryzen 5 5600 without a BIOS update, and the update may be impossible before you even have a display.",
      "Check the memory type before buying: a DDR5 board will not take DDR4, and the reverse is equally true. This is the most common and least recoverable mistake.",
      "Not every M.2 is a real M.2. On some boards the second slot shares PCIe lanes with SATA ports, and one of them silently disables.",
      "SATA port count and M.2 count depend on the exact model, not on the chipset. Read the product sheet, not the chipset list.",
      "A used board with a single M.2 slot and no Wi-Fi forces you to buy PCIe adapters, which often costs more than a new board.",
    ],
  },
  {
    slug: "memoire-ddr4-ou-ddr5",
    title: "DDR4 or DDR5: the gap that decides your platform",
    hook: "A 32GB DDR4 kit costs a fraction of the 32GB DDR5 kit sitting in the same table. That gap decides the platform before any speed number does - here is how to spend it.",
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
        h: "The numbers that settle it",
        p: [
          "There is no AM5 motherboard that takes DDR4, and no AM4 or LGA1700 board that takes DDR5. The memory question has no independent answer: it follows from the processor you already picked.",
          "On this page's table, 32GB of DDR4-3600 and 32GB of DDR5-6000 are separated by a gap wide enough to buy the graphics card several times over. It is not a rounding difference.",
          "In games the two generations land within a few percentage points of each other, and only when the CPU is the bottleneck, which at 1080p and 1440p is rare. So the calculation is not which is faster. It is: do you need the platform upgrade badly enough to pay that gap for memory you will not feel?",
        ],
      },
      {
        h: "The one DDR4 result worth knowing",
        p: [
          "The 32GB DDR4-3600 kit is the best value in the memory catalogue, and not narrowly: a 16GB DDR4-3200 kit costs a little more than half as much for half the capacity.",
          "If you are building on AM4 and have decided to stay there, that kit is the correct purchase and nothing on the DDR5 side of this table beats it on value. Capacity matters more than generation at every price where both are available.",
        ],
      },
      {
        h: "16GB or 32GB",
        p: [
          "16GB in 2026 is the standard, not the minimum. 8GB is finished: a browser with a few tabs and Discord in the background is enough to exhaust it before a game launches. The 8GB DDR4 kit is in this table to show where the floor is, not to recommend it.",
          "32GB earns its place when you do something alongside gaming: streaming with the encoder, video editing, virtual machines, or simply leaving a game running while you work. On AM4 the cost of that capacity is trivial next to what the same capacity costs on AM5, which is a different conversation.",
          "The single case where 32GB is mandatory for pure gaming: if you expect to keep this machine past 2030. Buy it in one go rather than adding a mismatched stick later, because mixing capacities loses dual channel.",
        ],
      },
      {
        h: "DDR5-6000, and no higher",
        p: [
          "On Ryzen the memory clock has to stay tied to the memory controller clock. Push past that point and moving data takes more cycles than it saves. DDR5-6000 with sane timings is the balance point, and it is what AMD itself recommends.",
          "Above 6000 you are paying twice for three things: lower stability with four sticks populated, a requirement to tune timings by hand, and in our catalogue a higher price for the same capacity. The 6400 kit buys you 400 MT/s and no frames.",
        ],
      },
      {
        h: "The RGB question, honestly",
        p: [
          "Lit memory reliably costs more than an unlit kit of the same speed and timings. On the DDR5 side the step up in price is steep, and a 32GB DDR5-6000 kit against a 6400 kit of equivalent capacity is not a lighting premium. It is a speed premium that happens to include lighting.",
          "The one real caveat is physical. Some kits without LEDs use a rougher PCB and taller heat spreaders that foul a large tower cooler. If you are pairing memory with a dual tower like the ones in our cooling guide, check the stick height against the cooler's clearance.",
        ],
      },
    ],
    pitfalls: [
      "Memory type is tied to the motherboard. DDR5 will not boot on a B450 or B550, and DDR4 will not fit a B650.",
      "Two sticks beat one. A 2x16GB kit runs dual channel; a single 32GB stick does not.",
      "Mixing a 16GB kit with an 8GB kit loses dual channel and carries no manufacturer guarantee.",
      "XMP or EXPO is off by default in the BIOS. Without it your memory runs at its base speed, well below what you paid for.",
      "Do not go under 16GB to save a few thousand dinars. It is the worst value trade available in the whole catalogue.",
    ],
  },
  {
    slug: "stockage-nvme-vs-sata",
    title: "NVMe or SATA: the cheap-storage trap",
    hook: "A 256GB SATA SSD costs a third of an NVMe of the same size, and the whole PC feels the difference. Where the real line sits, and how much capacity you actually need.",
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
        h: "SATA is not wrong, it is misplaced",
        p: [
          "A SATA SSD is roughly two to three times slower than an NVMe on sequential reads, and the difference shows on anything that loads a lot of files: Windows boot, opening a game, loading an edit project. Compared with a mechanical drive the jump to SATA is enormous; between SATA and NVMe it is real but does not justify paying double for a secondary drive.",
          "The rule: system drive in NVMe, games in SATA if you want to expand, archives wherever you like. A 512GB NVMe for Windows and the two current games, plus a 1TB SATA drive for the rest, is smarter than a single 1TB drive.",
        ],
      },
      {
        h: "Capacity matters more than the brand",
        p: [
          "A triple-A game occupies between 80 and 150GB. Windows and its updates alone eat around a hundred gigabytes before you install anything. On a 256GB drive you are full before the year ends, and you start uninstalling.",
          "In 2026, 512GB is the reasonable minimum and 1TB is the comfort point. The price gap between 512GB and 1TB is smaller than the gap between new and used for the same model, which makes it often the best value in an entire build.",
        ],
      },
      {
        h: "Gen 3, Gen 4, Gen 5: what actually counts",
        p: [
          "The PCIe interface is a lane count, not a stick speed. A Gen 4 NVMe at 7000 MB/s is always faster than a Gen 3 at 3500 MB/s, but on a system drive the difference becomes small once you are past the point where the filesystem waits.",
          "The Gen 5 drive in the table only makes sense if your motherboard has a Gen 5 M.2 slot and an SSD heatsink. Most B650 and X870E models do not. That is money thrown out of the window.",
        ],
      },
      {
        h: "The M.2 that is not really an M.2",
        p: [
          "On some motherboards the second M.2 slot shares its PCIe lanes with two SATA ports. Fit an SSD in the secondary M.2 and two SATA ports silently disappear. The manual says so, the product sheet often does not.",
          "Before buying several drives, count your slots: real M.2 connectors, available SATA ports, and USB ports for a backup external drive. An external drive over USB 3.2 is better value than an internal drive that kills your SATA.",
        ],
      },
    ],
    pitfalls: [
      "A SATA system drive is felt, especially at boot and when loading games. It is the first upgrade to make on an old PC.",
      "256GB is a false economy: the drive fills up before the warranty runs out.",
      "Form factor matters: a shorter M.2 2242 does not fit every 2280 slot. Match it to the connector.",
      "Do not delete the recovery partition to save space: you will have no quick fix left if Windows breaks.",
      "An SSD with no warranty is a disk with no warranty. A used listing price often includes no protection at all.",
    ],
  },
  {
    slug: "choisir-alimentation-pc",
    title: "Power supply: why wattage is not the thing to optimise",
    hook: "Once the wattage is calculated, only one real variable is left: build quality. What the 80+ label genuinely changes, what a modular cable is for, and what ATX 3.x brings with the new cards.",
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
        h: "Wattage is not a variable to optimise",
        p: [
          "Wattage gets calculated, not optimised: add your processor and graphics card consumption, add roughly 150W for everything else, and take the standard tier above the result. Once that number is fixed, the rest of the decision is about something else.",
          "One important detail: look at the power actually available on the 12V rail, not the number on the label. Almost all consumption happens there, as a graphics card pulls 200 to 350W in 12V. On older multi-rail units that number is often below the advertised total. Modern single-rail designs have removed the problem.",
        ],
      },
      {
        h: "The 80+ label: what it really changes",
        p: [
          "The 80+ label measures efficiency under load. It is not a quality score, it is an energy-saving score, and it has three concrete effects: less waste heat, less current drawn from the socket, and a fan that spins slower because the interior is cooler.",
          "Bronze is neither a luxury nor a scam. It is enough. Gold becomes interesting when the machine runs at high load for long stretches, and Gold Plus above that is rarely justified for a gaming PC. Compare price per real watt across the models in the table rather than reading the label.",
        ],
      },
      {
        h: "Modular, semi-modular, non-modular",
        p: [
          "A non-modular PSU has every cable fixed, including the ones you will never use. Semi-modular detaches the peripheral cables (drives, USB); modular detaches them all. The benefit is tidiness and airflow, not electrical: unused cables clutter and block intake vents.",
          "The safety point: never use a modular cable from a different power supply. The connectors have the same shape and not the same pinout. That is the number one cause of short circuits on a brand new machine.",
        ],
      },
      {
        h: "ATX 3.x and the 16-pin connector",
        p: [
          "Recent graphics cards use a single 16-pin connector, more compact and able to carry more current. ATX 3.0 and 3.1 power supplies are designed for it, with transient tolerance the older standard does not have.",
          "If your card has a 16-pin connector, use an ATX 3.x unit or the 12V-2x6 cable supplied with the card. An adapter on an older supply is the most common cause of melted connectors.",
        ],
      },
    ],
    pitfalls: [
      "Never buy the cheapest power supply in the catalogue. It is a small share of the budget and it is the one that pays for all the others if it fails.",
      "A bad label is not a bad number: a branded 650W Bronze is a better buy than an unbranded Gold.",
      "A modular cable from another brand can melt. Never do it, even when the connectors look identical.",
      "A power supply run by prolonged undervoltage dies within months. On an unstable grid, a UPS is real protection.",
      "Third-party 8-pin to 16-pin adapters are the leading cause of melted connectors. Use the card's own cable or a true ATX 3.x unit.",
    ],
  },
  {
    slug: "refroidissement-pc-algerie",
    title: "Cooling in an Algerian summer: what the numbers actually say",
    hook: "Yes, it throttles - a few percent, not half your performance. And the cooler ranking in our catalogue inverts once you price it per watt. Here is the corrected version.",
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
        h: "Yes it throttles, but less than the forums claim",
        p: [
          "A gaming PC in an unconditioned room at 45°C ambient loses a few percent of boost clock. A few percent on the processor, a few percent on the card. That is not the catastrophe sold in comment sections, but it is not free either, and it compounds with a dusty heatsink.",
          "The risk that deserves attention is wear, not frame rate. A silicon chip held at 95°C for months ages faster than one held at 70°C. That is a margin argument, and it is why the ratings below matter more at 40°C ambient than they do in a showroom.",
        ],
      },
      {
        h: "Price per watt reverses the ranking",
        p: [
          "Sort the coolers above by cost per watt of rated capacity and the order is not the one people expect. The GL120 AIO rates 150W and costs less than the MA621C dual tower, which rates 260W. Per watt of capacity the small AIO wins, and it is not close.",
          "That is a consequence of how these parts are priced in this market rather than a claim that liquid beats metal. At equal price a tower is the more durable choice: no pump, no loop, and a warranty that usually outlasts the heatsink's competitors. The point is that paying more for a heatsink does not reliably buy more capacity here, so buy the rating you need and stop there.",
          "For reference the 260W Assassin IV costs more than the MA621C for the same rating. The cheaper one is the better value, and nobody tells you that.",
        ],
      },
      {
        h: "Air or AIO: the honest argument for each",
        p: [
          "A tower heatsink is the right default. It handles a 65W to 105W processor with no moving liquid, nothing to leak, and no failure point beyond the fan. The AK400 rates 155W, which covers a 7500F or a 5600 with substantial headroom.",
          "A water cooler has two legitimate cases: a processor at 120W or above where you want the headroom, or a compact case where a 158mm tower simply will not fit. The 240mm units above rate 250W.",
          "We do not publish a temperature difference between them, because we have not measured one and neither has anyone else who would show their work. Anyone quoting you a specific figure for a cooler they have not tested is repeating a number, not measuring it.",
        ],
      },
      {
        h: "Thermal paste: leave it alone",
        p: [
          "The paste applied at the factory is adequate and it does not need replacing on a schedule. It does not dry out in two years and it does not burn. A PC that cools well out of the box will still cool acceptably three years later.",
          "Two situations justify opening it up: a machine more than three years old, or one assembled with an absurdly generous blob. Toothpaste and cooking oil are not options, and neither is adding a second layer over an existing one - two layers insulate.",
        ],
      },
      {
        h: "Dust is the actual Algerian problem",
        p: [
          "An Algerian summer is a dust problem as much as a heat problem, and dust is the one that degrades performance year over year. A heatsink packed with fibre loses effective surface area, and the temperature climbs steadily while every other variable stays the same.",
          "A clean-out every twelve to eighteen months is the only maintenance a PC genuinely needs. The case matters as much as the heatsink: filtered intakes, clearance at the rear and an exhaust fan do more for summer temperatures than moving from a good tower to an AIO.",
          "And never cover the intakes with a cloth or a curtain. Front airflow is what cools the processor.",
        ],
      },
    ],
    pitfalls: [
      "A water cooler is not more durable than a good heatsink. The pump is the failure point and it is often worse warranted.",
      "Check the case's maximum cooler height before ordering. A cooler that is too tall simply will not fit, and it is the most common assembly mistake.",
      "The stock cooler on a Ryzen 7 or 9 is rarely enough in summer. An entry-level 120mm tower changes a lot for very little.",
      "Never block the case intakes. If the machine is in a closed cabinet, that is the problem, not the cooler.",
      "Do not treat a quoted temperature difference as a measurement. We have not measured ours and we say so rather than repeating a number.",
    ],
  },
  {
    slug: "choisir-son-ecran",
    title: "Monitors: 1080p or 1440p, panel and refresh rate, what counts",
    hook: "This is the part where money is both misspent and most visible. Resolution, IPS, refresh rate, size: the order in which to decide, and the trap of the 75Hz office panel.",
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
        h: "The office monitor trap",
        p: [
          "The first instinct of many buyers is a 24-inch 75Hz office TN panel, because it costs half what a real gaming display costs. The result is a 200,000 DA machine stuck at 75 frames per second in games where it would do 150, with washed-out colours and narrow viewing angles.",
          "A decent gaming panel starts with an IPS matrix and at least 144Hz. The premium over an office screen is small, and it is the difference between a machine you game on and a machine that computes images nobody sees.",
        ],
      },
      {
        h: "Resolution first",
        p: [
          "24-inch at 1080p and 27-inch at 1440p are the two native formats on the market. They give the best sharpness for their size, and they are the cheapest at comparable screen sizes.",
          "Moving to 1440p requires a card that genuinely feeds that resolution at high refresh. An entry-level card doing 60 fps at 1080p may manage only 40 at 1440p: the resolution doubles the load. Check that the card listed in the table sustains the refresh rate of the panel you are choosing.",
        ],
      },
      {
        h: "TN, VA, IPS: the only criterion that really matters",
        p: [
          "TN is fast but has poor viewing angles and dull colours: that is the panel of cheap office monitors and models from a decade ago. VA gives perfect blacks but shows visible haze on bright content, which is tiring on a white background. IPS is the safe middle: correct angles, accurate colours, a slight black glow you will not notice.",
          "Across the panels in the table, choose IPS without hesitating. The 100-144Hz models may be VA or TN: read the spec sheet, the price alone tells you nothing.",
        ],
      },
      {
        h: "Refresh rate: do not pay for frames your card cannot feed",
        p: [
          "A 240Hz panel on a machine managing 90 fps shows you nothing extra. The highest useful refresh rate is the one your build sustains stably, plus a little margin for the 1% lows.",
          "In practice: at 1080p on a mid-range card, target 144 to 180Hz. At 1440p, target 165Hz. 240Hz and above are for high-end cards, or for esports where every frame counts.",
        ],
      },
      {
        h: "Size",
        p: [
          "Do not buy a 32-inch at 1080p: the pixels are too large and the image looks visibly stretched. If you want 32 inches, 1440p is the minimum and the price nearly doubles.",
          "The 24-inch 1080p format is the most comfortable on a desk 1.4m or narrower. 27-inch 1440p is the best compromise on a normal desk. A 34-inch ultrawide is a pleasure for gaming and a nuisance for everything else.",
        ],
      },
    ],
    pitfalls: [
      "A 75Hz office monitor is the first thing to replace on a gaming PC. The gain is immediate and needs no settings.",
      "Check for FreeSync or G-Sync Compatible: without it, tearing is visible and it hurts comfort.",
      "The advertised brightness says nothing about how it handles a bright room. Too dim to use is wasted money.",
      "A screen with no physical controls and no OSD menu is usually an entry-level model: check the dead pixel policy before buying.",
      "A 1440p 165Hz panel that costs barely more than a 1080p 180Hz is almost always the better buy: the price gap is small and the gain lasts longer.",
    ],
  },
  {
    slug: "config-pc-300k-da",
    title: "1440p while staying on AM4: often the right call",
    hook: "The same budget in DDR5 and AM5 buys less gaming than AM4 does. Here is the full argument, with the snapshot numbers behind it, and the exact point at which the investment becomes justified.",
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
        h: "The argument in one sentence",
        p: [
          "A 32GB DDR5 kit costs tens of thousands of dinars more than a 32GB DDR4 kit for the same frames per dinar, and the gaming gain is a few percentage points rather than a resolution tier. On a machine that will render at 1440p, the graphics card is the part that matters, not the memory generation.",
          "In other words: at equal budget, AM4 buys you a better card. That is the only criterion that should decide it.",
        ],
      },
      {
        h: "What AM4 gives you, and what AM5 gives you",
        p: [
          "AM4 gives you price. Cheap B450 and B550 boards, DDR4 at rock bottom, and a Ryzen 7 5700X with more than enough power to drive a 16GB card at 1440p. No 1440p card needs a more expensive processor.",
          "AM5 gives you duration. The AM5 socket will keep taking processors for years, so an AM5 board bought today is an investment. But that duration is paid for up front, and it is invisible on screen.",
        ],
      },
      {
        h: "The decision threshold",
        p: [
          "The question is not AM4 or AM5, it is how long this machine has to last. If the answer is three years, AM4 wins without argument. If the answer is five years or more and you plan to fit an X3D or a 9800X3D later, AM5 starts to defend itself.",
          "The trap is buying AM4 in 2026 while telling yourself you will upgrade the processor later. The day you want to, AM4 processors will be dearer than they are today because production is stopping. And no B550 board will ever take a 3D chip.",
        ],
      },
      {
        h: "The configuration",
        p: [
          "The Ryzen 7 5700X is the last AM4 chip that makes sense for gaming: eight cores, 65W, and it will not choke a 7800 XT. The AK620 tower cooler in the table is more than enough, the B550 gives you two M.2 slots, and 650W Gold leaves room for a stronger card later.",
          "The result is a machine that renders 1440p at high refresh today, with a 16GB card that will last five years, and you never pay the DDR5 premium. That is a trade-off, not a compromise.",
        ],
      },
    ],
    pitfalls: [
      "Do not buy AM4 planning to fit an X3D later: AM4 processors get scarce and expensive, and no B550 board supports them.",
      "A DDR4 kit faster than 3600 is pointless on AM4: the limit is physical, and beyond it the memory controller cannot keep up.",
      "If you go this route, take a B550 rather than a B450: it supports every AM4 CPU natively, including the 5700X, with no BIOS update.",
      "Do not cut the power supply to fund the graphics card: it is the mistake that kills the most machines at this budget.",
      "The tower cooler in the table takes more room than a low-profile one. Check the case's maximum height.",
    ],
  },
  {
    slug: "gaming-1440p-165hz",
    title: "1440p: the build that stays valid for years",
    hook: "A 7600X, B650, DDR5 and a 16GB card: 1440p 165Hz without sinking the rest of the budget into the motherboard. The reasoning behind each line item.",
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
        h: "Why AM5 here but not on the lower tiers",
        p: [
          "A 1440p PC lasts five years or more: the graphics card gets replaced, the processor much less often. AM5 is the only socket in the catalogue that still guarantees you processors in four years, against two for AM4 and one for LGA1700. The platform premium pays for itself precisely because the machine lasts.",
          "The corollary matters: if the PC will last three years, the same money in AM4 plays exactly the same today. The platform is not visible on screen, it is paid in age.",
        ],
      },
      {
        h: "The GPU: 16GB is the 1440p threshold",
        p: [
          "At 1440p, 8GB is already short: it is the resolution where 4K background textures and ray tracing start to make the limit felt. 16GB is not a luxury premium, it is the service life of the card.",
          "Compare the RX 7600 XT 16GB and the RX 7800 XT 16GB in the table. The price gap is visible, and it buys a card you will not be replacing in three years.",
        ],
      },
      {
        h: "DDR5-6000, not 6400",
        p: [
          "On Ryzen the memory clock has to stay tied to the controller clock or the latency penalty eats the bandwidth gain. DDR5-6000 with sensible timings is the balance point: above it you pay more for less stability, and you have to tune timings by hand.",
          "Put the two DDR5 kits in the table side by side. If the price gap is small, take the slower one. 6400 brings nothing in a 1440p game.",
        ],
      },
      {
        h: "Power supply and case: do not cut corners here",
        p: [
          "A 7600X (105W) plus an RX 7800 XT (250W) plus 150W for the rest is a little over 500W. A 750W Gold leaves real headroom, runs cool, and stays quiet at partial load, which is the most common case.",
          "On the case, the only real constraint is graphics card length. An RX 7800 XT is 287mm; the longest cards in the catalogue reach 330mm. Compare the length in the spec sheet with the case limit before you order: that is the one mistake that kills an order.",
        ],
      },
    ],
    pitfalls: [
      "DDR5-6400 CL32 kits cost more than 6000 CL30 and are less stable with four sticks. Do not pay for the frequency bump.",
      "Update the BIOS before installing Windows: early B650 boards had memory compatibility bugs that have since been fixed.",
      "A case limited to 300mm takes a 7800 XT (287mm) but not a 5070 Ti (305mm). Check before you pay.",
      "The 7600X is a 105W part: the stock cooler barely holds it. A real heatsink, even an entry-level one, changes temperatures and noise.",
    ],
  },
  {
    slug: "config-pc-550k-da",
    title: "Moving to 4K: the AM5 build, monitor included",
    hook: "A 7800X3D, 16GB of VRAM and a 4K panel. At this level you stop optimising and start building something that stays valid to the end of the decade.",
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
        h: "Why an X3D here",
        p: [
          "At 4K the graphics card is the bottleneck, not the CPU. An X3D changes almost nothing in average frame rate at this resolution. It changes a lot if you also want to game at 1080p on a fast panel, where the CPU becomes the limit again.",
          "If you will only ever game at 4K, a regular Ryzen 5 or 7 is enough and costs less. The X3D buys versatility, not 4K performance.",
        ],
      },
      {
        h: "The card: 16GB is the minimum",
        p: [
          "At 4K, VRAM is the criterion. Textures load at full resolution, ray tracing adds its own data, and supersampling layers take even more. A 16GB card is the absolute minimum at 4K with recent titles.",
          "Compare the 16GB cards in the table. The choice comes down to price per frame and to physical length: a 305mm triple-fan model does not fit every case.",
        ],
      },
      {
        h: "Storage and memory at this level",
        p: [
          "2TB is not a luxury here: a single 4K game with high-resolution textures takes 150GB and more. 1TB fills up with four big titles. The 32GB DDR5-6000 kit is the balance point, and 6000 pairs well with an X3D.",
          "Do not buy 64GB of DDR5 to game. That money only makes sense if you edit video or run virtual machines, and even then 48GB is enough.",
        ],
      },
      {
        h: "Power supply: the one part not to negotiate",
        p: [
          "A 7800X3D plus a 16GB card of this generation plus the rest is 500 to 600W depending on the card. 750W Gold is the reasonable minimum and leaves room for a bigger card later. Do not jump to 850W on principle: past 750W you gain nothing and the price climbs.",
          "The 4K panel in the table is the last thing to check: a 27-inch 4K display is the sweet spot for this resolution. A 32-inch 4K is beautiful but costs much more for the same desk comfort.",
        ],
      },
    ],
    pitfalls: [
      "Graphics card length: the longest triple-fan cards in the catalogue reach 330mm. The case in the table fits, but check the sheet if you change cards.",
      "The 16-pin connector on recent cards needs an ATX 3.x supply. An adapter on an older unit can melt.",
      "Do not overspend on memory: 64GB of DDR5 costs more than a mid-range graphics card and does nothing for games.",
      "A 4K panel at 60Hz wastes half the machine. Check the refresh rate in the spec sheet before ordering.",
      "2TB of storage is a real need at this level, not a gadget. 1TB fills fast in 4K.",
    ],
  },
  {
    slug: "pc-monte-vs-montage",
    title: "Shop-built PC or self-assembled: the real economics",
    hook: "Warranty, availability and no assembly risk against freedom of choice. What a shop build really costs, and how to read its spec sheet in sixty seconds.",
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
        h: "What a shop build really gives you",
        p: [
          "Three things, and they matter: the warranty covering the assembled system, immediate availability, and the ability to try the machine before you leave. That last one is the most underrated. In store you power it on, launch a game, and see with your own eyes whether it holds 60 fps or whether the fans are screaming.",
          "For someone who has never built a PC and does not want to risk bending a CPU while seating it, that is a service worth paying for. Shop assembly is not a scam, it is labour.",
        ],
      },
      {
        h: "Where a shop build loses money",
        p: [
          "Shop builds are often unbalanced: an undersized 450W supply, an entry-level motherboard, 8GB of RAM, or a 256GB hard drive. None of those four show up in a photo and all of them show up in a spec sheet.",
          "The countermeasure is simple: before signing, ask for the exact component list (processor, motherboard, graphics card model, RAM amount and speed, storage type, power supply model). A seller who refuses to name the power supply is a seller with something to hide.",
        ],
      },
      {
        h: "The economic calculation",
        p: [
          "Our prebuilt page automatically prices the equivalent separate parts and shows the gap against the assembled PC. That is the most honest calculation available: a small gap means the build is sound and you are paying for the service. A 30% gap means you are paying for an unbalanced configuration.",
          "The parts table on this page shows the configuration shops assemble most often. Compare it line by line against the prebuilt being offered to you and you will immediately see where the difference comes from.",
        ],
      },
      {
        h: "The part people forget",
        p: [
          "A shop build's warranty almost always covers the complete PC. If your graphics card dies in six months you go back to the shop, not to the card manufacturer. That is a drawback, but it is also protection: somebody stands behind the result.",
          "If you build it yourself, each part keeps its own full warranty and you know exactly what you bought. The flip side is that the warranty covers neither the assembly, nor compatibility mistakes, nor the BIOS. Accept that difference: it is a trade in risk, not in money.",
        ],
      },
    ],
    pitfalls: [
      "Always ask for the exact power supply model. It is the part nobody looks at and the one that decides how long the machine lives.",
      "A shop build with 8GB of RAM and 256GB of storage at a fair price is a PC that is obsolete in two years.",
      "A shop build with an unlocked or boosted processor means it was overclocked, and often under-cooled. Ask whether the warranty covers overclocking.",
      "A seller who refuses to detail the configuration is not a trustworthy seller, it is a seller hiding a part.",
      "Never pay a brand premium on a prebuilt without checking the real configuration: the brand does not guarantee the balance.",
    ],
  },
  {
    slug: "ouedkniss-occasion-survie",
    title: "Ouedkniss: buying used hardware without getting scammed",
    hook: "The used market carries most of the new GPU price in Algeria. Reference prices, the classic scams, and the test checklist to run before you pay.",
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
        h: "How to read a listing before you negotiate",
        p: [
          "The advertised price is not the real price, and the gap between them is often the only information available about the machine's condition. An honest listing gives a firm price, recent photos of the card out of the case, and a place you can collect from.",
          "A vague listing gives a struck-through price, catalogue photos, no location, and a seller who answers only by private message. That is not a bargain, it is a disguised auction.",
        ],
      },
      {
        h: "Checklist before you pay",
        list: [
          "Ask for video: ten minutes of gaming or FurMark with the temperature on screen. A card that climbs past 85°C has dead thermal paste or a clogged heatsink.",
          "Front and back photos of the card out of the case: rust, signs of disassembly, a peeled sticker, missing screws all mean the card has been opened.",
          "The original invoice, or at least a verifiable serial number. Without an invoice, halve your maximum price.",
          "Test it in person if you can. In Algiers, Oran, Sétif and Blida most serious sellers agree. A refusal is a signal.",
          "Never send a deposit by transfer or BaridiMob to someone you have not met.",
        ],
      },
      {
        h: "The tests that actually matter",
        p: [
          "Ten minutes of a real game reveals what a thirty-second menu test does not: stability under sustained load, fan noise, and visual artefacts. A card that buzzes or that makes the image shimmer is a card on its way out.",
          "A complete used PC has a different classic scam: a nameless power supply and a case with no airflow. Neither shows in a front-on photo, and that is exactly where the expensive failure is.",
        ],
      },
      {
        h: "Using the comparison tool to negotiate",
        p: [
          "The simplest lever: before negotiating, open the product page on this site and note the lowest new price from a verified shop delivering to all 58 wilayas. That gap is your margin. If a used card is within 15% of a new one with a warranty, it is not worth the risk.",
          "Simple rule: below 50% of the new price, used becomes interesting. Above that, you are paying for the risk with your own money for a saving that does not justify it.",
        ],
      },
    ],
    pitfalls: [
      "\"Never mined, three months warranty\" with no video and no invoice means it was mined. Miners sell in batches with the same photos across several listings.",
      "A complete used build often hides a nameless power supply. Ask for the exact PSU model before agreeing.",
      "Travel costs money. A bargain 300km away, plus transport, plus the trip, is no longer a bargain.",
      "An RX 580 advertised as good as new at close to the new price has been mined. The price is the tell.",
      "Never pay the full amount before testing. A reasonable deposit plus a test appointment is the norm.",
    ],
  },
  {
    slug: "erreurs-premier-pc",
    title: "First-build mistakes, part by part",
    hook: "Most disappointing machines are not built from bad components but from one undersized line item. The ten most common mistakes and what each one really costs.",
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
        h: "The five expensive mistakes",
        list: [
          "An undersized power supply. A 450W with a 185W card works, but at a permanent 90% load and with voltage spikes at startup. The motherboard or the graphics card pays for the mistake. It is 5% of the budget and it protects the other 95%.",
          "8GB of RAM. A browser with a few tabs fills it. The PC slows before you understand why, and the only fix is replacing everything.",
          "A graphics card with 4GB of VRAM. This is the worst value in the catalogue: slower than an 8GB card, weaker than an 8GB card, and obsolete before the year ends. Never buy a 4GB card at any price.",
          "A 256GB SSD. Windows and its updates take a hundred-odd gigabytes. You will be uninstalling before the year is out.",
          "An entry-level chipset in a case with no airflow. The machine will never hold up under load and you will not know why.",
        ],
      },
      {
        h: "The five mistakes that cost time",
        list: [
          "An out-of-date BIOS. If the board does not natively support your processor, it will not boot. That is the first thing to check when a new PC will not start.",
          "XMP or EXPO not enabled. Memory runs at its base speed: you paid for 3200 and you have 2133. The gain is real and free once switched on.",
          "No Windows licence. An unlicensed PC runs, but with a watermark and some features limited. Budget for the licence.",
          "No USB boot drive prepared. Make an installation key before the first power-on, or an empty or dead drive leaves you stuck.",
          "Thermal paste applied badly or in an absurdly generous amount. If the machine is hot on day one, open it and redo it properly.",
        ],
      },
      {
        h: "The reasoning mistakes",
        p: [
          "The most common: buying a powerful PC on the promise that a graphics card will be added later. The day you want to play, you have to buy the card, the power supply and possibly a new case. That is three parts instead of one.",
          "The second: overinvesting in the processor. On a fixed budget, every dinar spent on a high-end chip instead of a graphics card is a dinar wasted. At 1080p, the card is the limit.",
          "The third: paying the premium for RGB, a tempered glass case and a water cooler on a machine that renders at 1080p. None of those change a single frame.",
        ],
      },
      {
        h: "Checklist before the first power-on",
        list: [
          "The CPU is in the right socket: the triangle on the chip and the triangle on the board must line up. Check before clipping the cooler.",
          "Memory is in the two alternating slots (A2 and B2) for dual channel.",
          "The power supply is plugged in, including the 4 or 8-pin CPU connector, which is the most commonly forgotten one.",
          "The SATA data cable is connected, and so is the SATA power cable.",
          "The heatsink is secured and the fan spins when you open the case.",
        ],
      },
    ],
    pitfalls: [
      "The most expensive mistake on this list is the power supply. It stays invisible until the motherboard will not boot.",
      "Do not skimp on the case: a cheap case limits heatsink height, drive count and graphics card length. It is the part that constrains you for five years.",
      "A 4GB card is not good value, it is a trap. The low price does not compensate.",
      "Do not assume a PC that will not boot is defective. The first move is to check the CPU and the BIOS version.",
      "Noise at startup that then stops is normal. Constant noise is a case with no airflow.",
    ],
  },
  {
    slug: "alim-onduleur-algerie",
    title: "Power supply and UPS: the anti-blackout guide",
    hook: "On the Algerian grid it is not heat that kills PCs, it is undervoltage. How to size a power supply, what a UPS genuinely protects against, and what it does not protect against at all.",
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
        h: "The printed wattage is not the delivered wattage",
        p: [
          "Read the label, not the product name. What matters is the power available on the 12V rail, because that is where almost all consumption happens: a graphics card pulls 200 to 350W in 12V. On older multi-rail units that number is often below the advertised total.",
          "A second point: the connector count. A 750W supply with two 8-pin connectors cannot feed a card that needs three. Check the card's sheet before the supply, not the other way round.",
        ],
      },
      {
        h: "The sizing rule",
        p: [
          "Add the processor and graphics card ratings, add about 150W for the rest of the machine, and you have peak consumption. Once you have that number, take the commercial tier just above it: there is always a 50 to 100W gap between tiers, and it is almost always free in price per watt.",
          "Do not oversize. Above that tier you pay more for nothing, the fan runs continuously at light load (which is where supplies are noisiest), and you sit at a mediocre efficiency point in a load range you will never use.",
        ],
      },
      {
        h: "The UPS: what it does",
        p: [
          "A line-interactive UPS does three things: it detects the outage, it takes over on battery for a few minutes, and it stabilises the voltage when it fluctuates. On the Algerian grid the second function matters most: prolonged undervoltage kills power supplies without anyone noticing a visible cut.",
          "Sizing is in VA, not W. For a 450W tower plus a 30W monitor, budget 800 to 1000 VA minimum. Real runtime depends on load: at full load a 1000 VA UPS holds for about five minutes, which is just enough to save your work and shut down cleanly.",
        ],
      },
      {
        h: "The UPS: what it does not do",
        p: [
          "A surge-protected power strip does nothing about a blackout. It protects against brief overvoltage, which is a different threat and a real one in Algeria when a neighbour's supply drops. The two protections are complementary: surge protection for spikes, UPS for outages and undervoltage.",
          "Watch the battery's age. A UPS battery lasts three to four years, and a UPS with a dead battery protects nothing while giving complete confidence. Test it once a year.",
        ],
      },
    ],
    pitfalls: [
      "Never plug a laser printer into the UPS: its startup power spike trips the protection and cuts everything.",
      "A 600 VA UPS will not cope with a 450W PC plus a monitor: it will trip as soon as you power on.",
      "Run the tower and monitor from the UPS and everything else from a surge strip fed by it. The order matters.",
      "Six outlets for a PC and monitor is the bare minimum, eight is comfortable. A UPS's USB ports do not deliver their advertised charge rate.",
      "A PC's power cable is specific to that machine. Another PC with the same connector shape may not work, and the reverse is equally true.",
    ],
  },
  {
    slug: "upgrader-ou-remplacer",
    title: "Upgrade or replace: when changing the motherboard makes sense",
    hook: "Memory and storage are always replaceable. The processor is not, without changing the board. Here is the number that decides, and the upgrades that always pay.",
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
        h: "The upgrades that always pay",
        list: [
          "Memory. Going from 8GB to 16GB is the best-value upgrade in PC history, and on an older machine it is often the only one that genuinely changes things.",
          "Storage. Swapping a hard drive or SATA SSD for an NVMe gives visibly faster boot and game loading for the price of a meal.",
          "The power supply. On a machine over five years old, replacing a questionable supply with a sound one costs little and removes a cause of failure.",
          "The graphics card. It is the most visible upgrade, and on a machine over five years old it is usually the only one worth making.",
        ],
      },
      {
        h: "What cannot be changed alone",
        p: [
          "A processor needs a compatible socket. Moving from a Ryzen 5 3600 to a Ryzen 7 5700X is free, because it is the same AM4 socket. Moving to a 7600X requires an AM5 board, DDR5, and usually a new cooler: three parts, not one.",
          "That is where the real threshold sits. If the processor upgrade you are considering forces a motherboard and memory change too, you are no longer upgrading, you are replacing half the machine.",
        ],
      },
      {
        h: "The number that decides",
        p: [
          "Simple rule: if the total cost of the upgrade (processor plus motherboard plus memory, plus the value of your time) exceeds roughly 40% of the price of a comparable new machine, buy the new machine. Below that, upgrading is rational.",
          "A worked example: on an AM4 machine with a 3600 and a B450, moving to a 5700X costs the processor alone, and it makes sense. On that same machine, aiming for a 7600X costs processor plus board plus memory, which is over the line.",
        ],
      },
      {
        h: "Do not forget the resale",
        p: [
          "A machine that has received a new graphics card and an NVMe drive resells better even if the rest is old. The local used market values the graphics card heavily and everything else barely.",
          "Before deciding, look up the new price of your current configuration on this site: that is your reference. If your machine is worth 60,000 DA used and the upgrade costs 80,000 DA for a 10% gain, the upgrade is a straight loss.",
        ],
      },
    ],
    pitfalls: [
      "Changing the motherboard means changing memory, cooling and often connectors. Budget the full cost, not the processor price.",
      "A processor upgrade on a board with an old BIOS may not boot at all. Check compatibility before buying.",
      "Selling the old graphics card before the new one arrives means risking having no machine if the new card is faulty.",
      "The upgrade that changes nothing: a 3600 to a 4600 on a machine rendering 1080p with a mid-range card. The bottleneck is elsewhere.",
      "A PC over ten years old is not repaired component by component, it is replaced. The parts cost more than the machine.",
    ],
  },
  // __GUIDES_END__
];

/** Locale-aware guide lookup. */
export function findGuide(slug: string, locale: Locale): Guide | undefined {
  const pool = locale === "en" ? GUIDES_EN : GUIDES_FR;
  return pool.find((g) => g.slug === slug);
}

/** Locale-aware guide list, in the shared editorial order. */
export function listGuides(locale: Locale): Guide[] {
  return locale === "en" ? GUIDES_EN : GUIDES_FR;
}