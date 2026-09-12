import { LIVE_OFFERS } from "./live";
import { LIVE_IMAGES } from "./live-images";

export type Category =
  | "cpu" | "cooler" | "motherboard" | "ram"
  | "ssd" | "gpu" | "case" | "psu" | "monitor";

export interface Product {
  id: string;
  category: Category;
  brand: string;
  model: string;
  specs: Record<string, unknown>;
}

export interface Offer {
  productId: string;
  store: string;
  wilaya: string;
  titleRaw: string;
  priceDa: number;
  url: string;
  stock: string;
  condition: "new" | "used";
  image?: string;
  scrapedAt: string;
}

export const CATEGORIES: { slug: Category; label: string }[] = [
  { slug: "cpu", label: "CPU" },
  { slug: "cooler", label: "CPU Cooler" },
  { slug: "motherboard", label: "Motherboard" },
  { slug: "ram", label: "Memory" },
  { slug: "ssd", label: "Storage" },
  { slug: "gpu", label: "Video Card" },
  { slug: "case", label: "Case" },
  { slug: "psu", label: "Power Supply" },
  { slug: "monitor", label: "Monitor" },
];

// Seed catalog — extend to 300 per PLAN. Prices/offers are samples wired to real DZ stores.
export const PRODUCTS: Product[] = [
  { id: "cpu-r5-5600", category: "cpu", brand: "AMD", model: "Ryzen 5 5600", specs: { socket: "AM4", tdp: 65, igpu: false, ram_type: "DDR4" } },
  { id: "cpu-i5-12400f", category: "cpu", brand: "Intel", model: "Core i5-12400F", specs: { socket: "LGA1700", tdp: 65, igpu: false, ram_type: "DDR4" } },
  { id: "cpu-r5-7600x", category: "cpu", brand: "AMD", model: "Ryzen 5 7600X", specs: { socket: "AM5", tdp: 105, igpu: true, ram_type: "DDR5" } },
  { id: "cpu-r5-9600x", category: "cpu", brand: "AMD", model: "Ryzen 5 9600X", specs: { socket: "AM5", tdp: 65, igpu: true, ram_type: "DDR5" } },
  { id: "cpu-r7-9800x3d", category: "cpu", brand: "AMD", model: "Ryzen 7 9800X3D", specs: { socket: "AM5", tdp: 120, igpu: true, ram_type: "DDR5" } },
  { id: "cooler-h212-v3", category: "cooler", brand: "Cooler Master", model: "Hyper 212 Spectrum V3", specs: { height_mm: 158, sockets: ["AM4", "AM5", "LGA1700"] } },
  { id: "mobo-b550m-a-pro", category: "motherboard", brand: "MSI", model: "B550M-A Pro", specs: { socket: "AM4", chipset: "B550", ram_type: "DDR4", form_factor: "mATX", m2: 2 } },
  { id: "mobo-b650m", category: "motherboard", brand: "Gigabyte", model: "B650M (AM5 DDR5)", specs: { socket: "AM5", chipset: "B650", ram_type: "DDR5", form_factor: "mATX", m2: 2 } },
  { id: "mobo-b660m-e", category: "motherboard", brand: "ASUS", model: "Prime B660M-E", specs: { socket: "LGA1700", chipset: "B660", ram_type: "DDR4", form_factor: "mATX", m2: 2 } },
  { id: "ram-vengeance-16-d4", category: "ram", brand: "Corsair", model: "Vengeance LPX 16GB DDR4-3200", specs: { type: "DDR4", capacity_gb: 16, speed: 3200 } },
  { id: "ram-delta-32-d5", category: "ram", brand: "TeamGroup", model: "T-Force Delta 32GB DDR5-6000", specs: { type: "DDR5", capacity_gb: 32, speed: 6000 } },
  { id: "ssd-970evo-1tb", category: "ssd", brand: "Samsung", model: "970 Evo Plus 1TB NVMe", specs: { interface: "NVME" } },
  { id: "gpu-rtx3060-12gb", category: "gpu", brand: "MSI", model: "RTX 3060 Ventus 2X 12GB OC", specs: { length_mm: 235, tdp_w: 170, pins: "1x8" } },
  { id: "gpu-rtx5060-8gb", category: "gpu", brand: "MSI", model: "RTX 5060 Shadow 2X 8GB OC", specs: { length_mm: 240, tdp_w: 145, pins: "1x8" } },
  { id: "gpu-rtx5080-16gb", category: "gpu", brand: "MSI", model: "RTX 5080 Gaming Trio 16GB OC", specs: { length_mm: 330, tdp_w: 360, pins: "16-pin" } },
  { id: "gpu-rtx4060-8gb", category: "gpu", brand: "Gigabyte", model: "RTX 4060 Windforce 8GB", specs: { length_mm: 240, tdp_w: 115, pins: "1x8" } },
  { id: "gpu-rtx4070-12gb", category: "gpu", brand: "NVIDIA", model: "RTX 4070 12GB", specs: { length_mm: 240, tdp_w: 200, pins: "16-pin" } },
  { id: "gpu-rtx5070-12gb", category: "gpu", brand: "NVIDIA", model: "RTX 5070 12GB", specs: { length_mm: 240, tdp_w: 250, pins: "16-pin" } },
  { id: "gpu-rx580-8gb", category: "gpu", brand: "AMD", model: "RX 580 8GB", specs: { length_mm: 240, tdp_w: 185, pins: "1x8" } },
  { id: "case-v217", category: "case", brand: "Raidmax", model: "V217 Mid Tower", specs: { max_gpu_mm: 350, max_cooler_mm: 165, supports: ["ATX", "mATX", "ITX"] } },
  { id: "psu-mwe650-b", category: "psu", brand: "Cooler Master", model: "MWE 650 Bronze V2", specs: { wattage: 650, rating: "Bronze" } },
  { id: "mon-mag255f", category: "monitor", brand: "MSI", model: "MAG 255F E20 25\" 200Hz", specs: { size: 25, hz: 200 } },
];

export const OFFERS: Offer[] = [
  { productId: "cpu-r5-5600", store: "LICB+", wilaya: "Alger", titleRaw: "RYZEN 5 5600 6-COEUR BOX", priceDa: 24500, url: "https://mail.licbplus.com/", stock: "En stock", condition: "new", scrapedAt: new Date().toISOString() },
  { productId: "cpu-r5-5600", store: "Digitec", wilaya: "Alger", titleRaw: "AMD Ryzen 5 5600", priceDa: 23900, url: "https://www.digitecdz.com/", stock: "En stock", condition: "new", scrapedAt: new Date().toISOString() },
  { productId: "cooler-h212-v3", store: "Digitec", wilaya: "Alger", titleRaw: "COOLERMASTER HYPER 212 SPECTRUM V3", priceDa: 5900, url: "https://www.digitecdz.com/", stock: "En stock", condition: "new", scrapedAt: new Date().toISOString() },
  { productId: "mobo-b550m-a-pro", store: "Click-DZ", wilaya: "Alger", titleRaw: "MSI B550M-A PRO DDR4", priceDa: 19800, url: "https://click-dz.com/", stock: "En stock", condition: "new", scrapedAt: new Date().toISOString() },
  { productId: "ram-vengeance-16-d4", store: "WifiDjelfa", wilaya: "Djelfa", titleRaw: "CORSAIR VENGEANCE 16GB DDR4 3200", priceDa: 11200, url: "https://wifidjelfa.com/", stock: "En stock", condition: "new", scrapedAt: new Date().toISOString() },
  { productId: "ssd-970evo-1tb", store: "LICB+", wilaya: "Alger", titleRaw: "SAMSUNG 970 EVO PLUS 1TB NVME", priceDa: 14500, url: "https://mail.licbplus.com/", stock: "En stock", condition: "new", scrapedAt: new Date().toISOString() },
  { productId: "gpu-rtx3060-12gb", store: "KOTEK (Ouedkniss)", wilaya: "Draria", titleRaw: "CARTE GRAPHIQUE MSI RTX 3060 12GB VENTUS 2X OC", priceDa: 89000, url: "https://www.ouedkniss.com/", stock: "Neuf", condition: "new", scrapedAt: new Date().toISOString() },
  { productId: "gpu-rtx3060-12gb", store: "Click-DZ", wilaya: "Alger", titleRaw: "MSI RTX 3060 12GB VENTUS 2X OC", priceDa: 94500, url: "https://click-dz.com/", stock: "En stock", condition: "new", scrapedAt: new Date().toISOString() },
  { productId: "case-v217", store: "Digitec", wilaya: "Alger", titleRaw: "RAIDMAX VECTOR V217", priceDa: 8500, url: "https://www.digitecdz.com/", stock: "En stock", condition: "new", scrapedAt: new Date().toISOString() },
  { productId: "psu-mwe650-b", store: "Click-DZ", wilaya: "Alger", titleRaw: "COOLER MASTER MWE 650 BRONZE V2", priceDa: 13900, url: "https://click-dz.com/", stock: "En stock", condition: "new", scrapedAt: new Date().toISOString() },
  { productId: "mon-mag255f", store: "Digitec", wilaya: "Alger", titleRaw: "ECRAN MSI MAG 255F E20 200HZ", priceDa: 32500, url: "https://www.digitecdz.com/", stock: "En stock", condition: "new", scrapedAt: new Date().toISOString() },
  // Live-verified 2026-09-12 via scrapers (real product pages)
  { productId: "gpu-rtx5060-8gb", store: "Digitec", wilaya: "Alger", titleRaw: "GeForce RTX 5060 8G SHADOW 2X OC", priceDa: 102500, url: "https://www.digitecdz.com/product/geforce-rtx-5060-8g-shadow-2x-oc/", stock: "En stock", condition: "new", scrapedAt: new Date().toISOString() },
  { productId: "gpu-rtx5060-8gb", store: "LICB+", wilaya: "Alger", titleRaw: "GPU CARTE GRAPHIQUE ASUS DUAL GEFORCE RTX 5060 OC EDITION 8GB", priceDa: 108000, url: "https://mail.licbplus.com/product/gpu-carte-graphique-asus-dual-geforce-rtx-5060-oc-edition-8gb-2705", stock: "En stock", condition: "new", scrapedAt: new Date().toISOString() },
  { productId: "gpu-rtx5080-16gb", store: "LICB+", wilaya: "Alger", titleRaw: "GPU CARTE GRAPHIQUE MSI GEFORCE RTX 5080 16GB GAMING TRIO OC", priceDa: 384500, url: "https://mail.licbplus.com/product/gpu-carte-graphique-msi-geforce-rtx-5080-16gb-gaming-trio-oc-3254", stock: "En stock", condition: "new", scrapedAt: new Date().toISOString() },
  { productId: "cpu-r5-9600x", store: "LICB+", wilaya: "Alger", titleRaw: "PROCESSEUR AMD RYZEN5 9600X TRAY VERSION", priceDa: 51000, url: "https://mail.licbplus.com/product/processeur-amd-ryzen5-9600x-6-coeurs-12-threads-39-ghz-54-ghz-tray-version-2354", stock: "En stock", condition: "new", scrapedAt: new Date().toISOString() },
  { productId: "cpu-r5-7600x", store: "LICB+", wilaya: "Alger", titleRaw: "PROCESSEUR AMD RYZEN5 7600X TRAY VERSION", priceDa: 41900, url: "https://mail.licbplus.com/product/processeur-amd-ryzen5-7600x-6-coeurs-12-threads-47-ghz-53-ghz-tray-version-3282", stock: "En stock", condition: "new", scrapedAt: new Date().toISOString() },
  { productId: "cpu-r7-9800x3d", store: "Digitec", wilaya: "Alger", titleRaw: "AMD Ryzen 7 9800X3D (4.7 GHz / 5.2 GHz)", priceDa: 117000, url: "https://www.digitecdz.com/product/amd-ryzen-7-9800x3d-4-7-ghz-5-2-ghz/", stock: "En stock", condition: "new", scrapedAt: new Date().toISOString() },
];

// Live scrape bake (bake.cjs from full.json) — appended, seed entries above win dupes
OFFERS.push(...LIVE_OFFERS);

export function productImage(p: Product): string | undefined {
  return LIVE_IMAGES[p.id] ?? bestOffer(p.id)?.image;
}

export function bestOffer(productId: string): Offer | undefined {
  return OFFERS.filter((o) => o.productId === productId).sort((a, b) => a.priceDa - b.priceDa)[0];
}
