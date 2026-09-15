import { LIVE_OFFERS } from "./live";
import { LIVE_IMAGES } from "./live-images";
import PRICE_HISTORY_JSON from "./price-history.json";

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
  { id: "cpu-r7-7800x3d", category: "cpu", brand: "AMD", model: "Ryzen 7 7800X3D", specs: { socket: "AM5", tdp: 120, igpu: true, ram_type: "DDR5" } },
  { id: "cpu-i5-14400f", category: "cpu", brand: "Intel", model: "Core i5-14400F", specs: { socket: "LGA1700", tdp: 65, igpu: false, ram_type: "DDR4" } },
  { id: "cooler-h212-v3", category: "cooler", brand: "Cooler Master", model: "Hyper 212 Spectrum V3", specs: { height_mm: 158, sockets: ["AM4", "AM5", "LGA1700"] } },
  { id: "mobo-b550m-a-pro", category: "motherboard", brand: "MSI", model: "B550M-A Pro", specs: { socket: "AM4", chipset: "B550", ram_type: "DDR4", form_factor: "mATX", m2: 2 } },
  { id: "mobo-b650m", category: "motherboard", brand: "Gigabyte", model: "B650M (AM5 DDR5)", specs: { socket: "AM5", chipset: "B650", ram_type: "DDR5", form_factor: "mATX", m2: 2 } },
  { id: "mobo-b660m-e", category: "motherboard", brand: "ASUS", model: "Prime B660M-E", specs: { socket: "LGA1700", chipset: "B660", ram_type: "DDR4", form_factor: "mATX", m2: 2 } },
  { id: "ram-vengeance-16-d4", category: "ram", brand: "Corsair", model: "Vengeance LPX 16GB DDR4-3200", specs: { type: "DDR4", capacity_gb: 16, speed: 3200 } },
  { id: "ram-vengeance-32-d4", category: "ram", brand: "Corsair", model: "Vengeance LPX 32GB DDR4-3200", specs: { type: "DDR4", capacity_gb: 32, speed: 3200 } },
  { id: "ram-delta-32-d5", category: "ram", brand: "TeamGroup", model: "T-Force Delta 32GB DDR5-6000", specs: { type: "DDR5", capacity_gb: 32, speed: 6000 } },
  { id: "ssd-970evo-1tb", category: "ssd", brand: "Samsung", model: "970 Evo Plus 1TB NVMe", specs: { interface: "NVME" } },
  { id: "ssd-sn580-1tb", category: "ssd", brand: "WD", model: "Blue SN580 1TB NVMe", specs: { interface: "NVME" } },
  { id: "gpu-rtx3060-12gb", category: "gpu", brand: "MSI", model: "RTX 3060 Ventus 2X 12GB OC", specs: { length_mm: 235, tdp_w: 170, pins: "1x8" } },
  { id: "gpu-rtx5060-8gb", category: "gpu", brand: "MSI", model: "RTX 5060 Shadow 2X 8GB OC", specs: { length_mm: 240, tdp_w: 145, pins: "1x8" } },
  { id: "gpu-rtx5080-16gb", category: "gpu", brand: "MSI", model: "RTX 5080 Gaming Trio 16GB OC", specs: { length_mm: 330, tdp_w: 360, pins: "16-pin" } },
  { id: "gpu-rtx4060-8gb", category: "gpu", brand: "Gigabyte", model: "RTX 4060 Windforce 8GB", specs: { length_mm: 240, tdp_w: 115, pins: "1x8" } },
  { id: "gpu-rtx4070-12gb", category: "gpu", brand: "NVIDIA", model: "RTX 4070 12GB", specs: { length_mm: 240, tdp_w: 200, pins: "16-pin" } },
  { id: "gpu-rtx5070-12gb", category: "gpu", brand: "NVIDIA", model: "RTX 5070 12GB", specs: { length_mm: 240, tdp_w: 250, pins: "16-pin" } },
  { id: "gpu-rx580-8gb", category: "gpu", brand: "AMD", model: "RX 580 8GB", specs: { length_mm: 240, tdp_w: 185, pins: "1x8" } },
  { id: "gpu-rx580-4gb", category: "gpu", brand: "AMD", model: "RX 580 4GB", specs: { length_mm: 240, tdp_w: 185, pins: "1x8" } },
  { id: "gpu-rtx5070ti-16gb", category: "gpu", brand: "NVIDIA", model: "RTX 5070 Ti 16GB", specs: { length_mm: 305, tdp_w: 300, pins: "16-pin" } },
  { id: "gpu-rx9070xt-16gb", category: "gpu", brand: "AMD", model: "RX 9070 XT 16GB", specs: { length_mm: 340, tdp_w: 304, pins: "16-pin" } },
  { id: "gpu-rtx5050-8gb", category: "gpu", brand: "NVIDIA", model: "RTX 5050 8GB", specs: { length_mm: 200, tdp_w: 130, pins: "1x8" } },
  { id: "gpu-rx6600-8gb", category: "gpu", brand: "AMD", model: "RX 6600 8GB", specs: { length_mm: 242, tdp_w: 132, pins: "1x8" } },
  { id: "gpu-rx6600xt-8gb", category: "gpu", brand: "AMD", model: "RX 6600 XT 8GB", specs: { length_mm: 242, tdp_w: 160, pins: "1x8" } },
  { id: "gpu-rx6650xt-8gb", category: "gpu", brand: "AMD", model: "RX 6650 XT 8GB", specs: { length_mm: 242, tdp_w: 180, pins: "1x8" } },
  { id: "gpu-rx6700-10gb", category: "gpu", brand: "AMD", model: "RX 6700 10GB", specs: { length_mm: 267, tdp_w: 175, pins: "1x8+1x6" } },
  { id: "gpu-rx6700xt-12gb", category: "gpu", brand: "AMD", model: "RX 6700 XT 12GB", specs: { length_mm: 267, tdp_w: 230, pins: "1x8+1x6" } },
  { id: "gpu-rx6750xt-12gb", category: "gpu", brand: "AMD", model: "RX 6750 XT 12GB", specs: { length_mm: 267, tdp_w: 250, pins: "2x8" } },
  { id: "gpu-rx6800-16gb", category: "gpu", brand: "AMD", model: "RX 6800 16GB", specs: { length_mm: 267, tdp_w: 250, pins: "2x8" } },
  { id: "gpu-rx6800xt-16gb", category: "gpu", brand: "AMD", model: "RX 6800 XT 16GB", specs: { length_mm: 267, tdp_w: 300, pins: "2x8" } },
  { id: "gpu-rx6900xt-16gb", category: "gpu", brand: "AMD", model: "RX 6900 XT 16GB", specs: { length_mm: 267, tdp_w: 300, pins: "2x8" } },
  { id: "gpu-rx7600-8gb", category: "gpu", brand: "AMD", model: "RX 7600 8GB", specs: { length_mm: 242, tdp_w: 165, pins: "1x8" } },
  { id: "gpu-rx7600xt-16gb", category: "gpu", brand: "AMD", model: "RX 7600 XT 16GB", specs: { length_mm: 242, tdp_w: 190, pins: "1x8" } },
  { id: "gpu-rx7700xt-12gb", category: "gpu", brand: "AMD", model: "RX 7700 XT 12GB", specs: { length_mm: 267, tdp_w: 245, pins: "2x8" } },
  { id: "gpu-rx7800xt-16gb", category: "gpu", brand: "AMD", model: "RX 7800 XT 16GB", specs: { length_mm: 287, tdp_w: 263, pins: "2x8" } },
  { id: "gpu-rx7900xt-20gb", category: "gpu", brand: "AMD", model: "RX 7900 XT 20GB", specs: { length_mm: 287, tdp_w: 315, pins: "2x8" } },
  { id: "gpu-rx7900xtx-24gb", category: "gpu", brand: "AMD", model: "RX 7900 XTX 24GB", specs: { length_mm: 287, tdp_w: 355, pins: "2x8" } },
  { id: "gpu-rx9070-16gb", category: "gpu", brand: "AMD", model: "RX 9070 16GB", specs: { length_mm: 304, tdp_w: 220, pins: "2x8" } },
  { id: "gpu-rtx3070-8gb", category: "gpu", brand: "NVIDIA", model: "RTX 3070 8GB", specs: { length_mm: 242, tdp_w: 220, pins: "1x12" } },
  { id: "gpu-rtx3080-10gb", category: "gpu", brand: "NVIDIA", model: "RTX 3080 10GB", specs: { length_mm: 285, tdp_w: 320, pins: "2x8" } },
  { id: "gpu-rtx4060ti-8gb", category: "gpu", brand: "NVIDIA", model: "RTX 4060 Ti 8GB", specs: { length_mm: 240, tdp_w: 160, pins: "1x8" } },
  { id: "gpu-rtx4070s-12gb", category: "gpu", brand: "NVIDIA", model: "RTX 4070 SUPER 12GB", specs: { length_mm: 267, tdp_w: 220, pins: "16-pin" } },
  { id: "gpu-rtx5060ti-16gb", category: "gpu", brand: "NVIDIA", model: "RTX 5060 Ti 16GB", specs: { length_mm: 240, tdp_w: 180, pins: "16-pin" } },
  { id: "gpu-rtx5060ti-8gb", category: "gpu", brand: "NVIDIA", model: "RTX 5060 Ti 8GB", specs: { length_mm: 240, tdp_w: 145, pins: "16-pin" } },
  { id: "case-v217", category: "case", brand: "Raidmax", model: "V217 Mid Tower", specs: { max_gpu_mm: 350, max_cooler_mm: 165, supports: ["ATX", "mATX", "ITX"] } },
  { id: "psu-mwe650-b", category: "psu", brand: "Cooler Master", model: "MWE 650 Bronze V2", specs: { wattage: 650, rating: "Bronze" } },
  { id: "mon-mag255f", category: "monitor", brand: "MSI", model: "MAG 255F E20 25\" 200Hz", specs: { size: 25, hz: 200 } },
  { id: "cpu-r5-5600x", category: "cpu", brand: "AMD", model: "Ryzen 5 5600X", specs: { socket: "AM4", tdp: 65, igpu: false, ram_type: "DDR4" } },
  { id: "cpu-r7-5700x", category: "cpu", brand: "AMD", model: "Ryzen 7 5700X", specs: { socket: "AM4", tdp: 65, igpu: false, ram_type: "DDR4" } },
  { id: "cpu-r7-5800x", category: "cpu", brand: "AMD", model: "Ryzen 7 5800X", specs: { socket: "AM4", tdp: 105, igpu: false, ram_type: "DDR4" } },
  { id: "cpu-r9-5900x", category: "cpu", brand: "AMD", model: "Ryzen 9 5900X", specs: { socket: "AM4", tdp: 105, igpu: false, ram_type: "DDR4" } },
  { id: "cpu-r5-7600", category: "cpu", brand: "AMD", model: "Ryzen 5 7600", specs: { socket: "AM5", tdp: 65, igpu: true, ram_type: "DDR5" } },
  { id: "cpu-r7-7700x", category: "cpu", brand: "AMD", model: "Ryzen 7 7700X", specs: { socket: "AM5", tdp: 105, igpu: true, ram_type: "DDR5" } },
  { id: "cpu-r9-7900x", category: "cpu", brand: "AMD", model: "Ryzen 9 7900X", specs: { socket: "AM5", tdp: 170, igpu: true, ram_type: "DDR5" } },
  { id: "cpu-r9-7950x", category: "cpu", brand: "AMD", model: "Ryzen 9 7950X", specs: { socket: "AM5", tdp: 170, igpu: true, ram_type: "DDR5" } },
  { id: "cpu-r5-8600g", category: "cpu", brand: "AMD", model: "Ryzen 5 8600G", specs: { socket: "AM5", tdp: 65, igpu: true, ram_type: "DDR5" } },
  { id: "cpu-i3-12100f", category: "cpu", brand: "Intel", model: "Core i3-12100F", specs: { socket: "LGA1700", tdp: 58, igpu: false, ram_type: "DDR4" } },
  { id: "cpu-i5-10400f", category: "cpu", brand: "Intel", model: "Core i5-10400F", specs: { socket: "LGA1200", tdp: 65, igpu: false, ram_type: "DDR4" } },
  { id: "cpu-i5-13400f", category: "cpu", brand: "Intel", model: "Core i5-13400F", specs: { socket: "LGA1700", tdp: 65, igpu: false, ram_type: "DDR4" } },
  { id: "cpu-i5-13600kf", category: "cpu", brand: "Intel", model: "Core i5-13600KF", specs: { socket: "LGA1700", tdp: 125, igpu: false, ram_type: "DDR5" } },
  { id: "cpu-i7-13700k", category: "cpu", brand: "Intel", model: "Core i7-13700K", specs: { socket: "LGA1700", tdp: 125, igpu: true, ram_type: "DDR5" } },
  { id: "cpu-i5-14600kf", category: "cpu", brand: "Intel", model: "Core i5-14600KF", specs: { socket: "LGA1700", tdp: 125, igpu: false, ram_type: "DDR5" } },
  { id: "cpu-i7-14700kf", category: "cpu", brand: "Intel", model: "Core i7-14700KF", specs: { socket: "LGA1700", tdp: 125, igpu: false, ram_type: "DDR5" } },
  { id: "cpu-i9-14900k", category: "cpu", brand: "Intel", model: "Core i9-14900K", specs: { socket: "LGA1700", tdp: 125, igpu: true, ram_type: "DDR5" } },
  { id: "cooler-ak400", category: "cooler", brand: "DeepCool", model: "AK400", specs: { height_mm: 159, sockets: ["AM4", "AM5", "LGA1700", "LGA1200"] } },
  { id: "cooler-ak620", category: "cooler", brand: "DeepCool", model: "AK620", specs: { height_mm: 160, sockets: ["AM4", "AM5", "LGA1700", "LGA1200"] } },
  { id: "mobo-h610m", category: "motherboard", brand: "ASUS", model: "Prime H610M (DDR4)", specs: { socket: "LGA1700", chipset: "H610", ram_type: "DDR4", form_factor: "mATX", m2: 1 } },
  { id: "mobo-b760m", category: "motherboard", brand: "ASUS", model: "Prime B760M (DDR4)", specs: { socket: "LGA1700", chipset: "B760", ram_type: "DDR4", form_factor: "mATX", m2: 2 } },
  { id: "mobo-z790", category: "motherboard", brand: "Gigabyte", model: "Z790 (ATX DDR5)", specs: { socket: "LGA1700", chipset: "Z790", ram_type: "DDR5", form_factor: "ATX", m2: 3 } },
  { id: "mobo-b450m", category: "motherboard", brand: "ASUS", model: "Prime B450M (DDR4)", specs: { socket: "AM4", chipset: "B450", ram_type: "DDR4", form_factor: "mATX", m2: 1 } },
  { id: "mobo-a520m", category: "motherboard", brand: "MSI", model: "A520M-A Pro (DDR4)", specs: { socket: "AM4", chipset: "A520", ram_type: "DDR4", form_factor: "mATX", m2: 1 } },
  { id: "ram-vengeance-16-d5", category: "ram", brand: "Corsair", model: "Vengeance 16GB DDR5-5600", specs: { type: "DDR5", capacity_gb: 16, speed: 5600 } },
  { id: "ram-value-8-d4", category: "ram", brand: "Corsair", model: "Value 8GB DDR4-3200", specs: { type: "DDR4", capacity_gb: 8, speed: 3200 } },
  { id: "ssd-980pro-1tb", category: "ssd", brand: "Samsung", model: "980 Pro 1TB NVMe", specs: { interface: "NVME" } },
  { id: "ssd-sn850x-1tb", category: "ssd", brand: "WD", model: "Black SN850X 1TB NVMe", specs: { interface: "NVME" } },
  { id: "ssd-nvme-500gb", category: "ssd", brand: "Crucial", model: "P3 500GB NVMe", specs: { interface: "NVME" } },
  { id: "gpu-rtx3050-6gb", category: "gpu", brand: "NVIDIA", model: "RTX 3050 6GB", specs: { length_mm: 200, tdp_w: 70, pins: "none" } },
  { id: "gpu-rtx4080s-16gb", category: "gpu", brand: "NVIDIA", model: "RTX 4080 SUPER 16GB", specs: { length_mm: 310, tdp_w: 320, pins: "16-pin" } },
  { id: "gpu-rtx4090-24gb", category: "gpu", brand: "NVIDIA", model: "RTX 4090 24GB", specs: { length_mm: 336, tdp_w: 450, pins: "16-pin" } },
  { id: "gpu-rtx5090-32gb", category: "gpu", brand: "NVIDIA", model: "RTX 5090 32GB", specs: { length_mm: 336, tdp_w: 575, pins: "16-pin" } },
  { id: "gpu-rx9060xt-16gb", category: "gpu", brand: "AMD", model: "RX 9060 XT 16GB", specs: { length_mm: 240, tdp_w: 182, pins: "1x8" } },
  { id: "gpu-rx9060xt-8gb", category: "gpu", brand: "AMD", model: "RX 9060 XT 8GB", specs: { length_mm: 240, tdp_w: 150, pins: "1x8" } },
  { id: "psu-550-b", category: "psu", brand: "MSI", model: "MAG A550BN 550W Bronze", specs: { wattage: 550, rating: "Bronze" } },
  { id: "psu-750-gold", category: "psu", brand: "Corsair", model: "RM750e 750W Gold", specs: { wattage: 750, rating: "Gold" } },
  { id: "case-mcv3", category: "case", brand: "Mars Gaming", model: "MCV3 Mid Tower", specs: { max_gpu_mm: 340, max_cooler_mm: 160, supports: ["ATX", "mATX", "ITX"] } },
  { id: "mon-24-180", category: "monitor", brand: "MSI", model: "G244F E2 24\" 180Hz", specs: { size: 24, hz: 180 } },
  { id: "mon-27-qhd165", category: "monitor", brand: "MSI", model: "G274QPF 27\" QHD 165Hz", specs: { size: 27, hz: 165 } },
  { id: "cpu-i3-13100f", category: "cpu", brand: "Intel", model: "Core i3-13100F", specs: { socket: "LGA1700", tdp: 58, igpu: false, ram_type: "DDR4" } },
  { id: "cpu-i3-14100f", category: "cpu", brand: "Intel", model: "Core i3-14100F", specs: { socket: "LGA1700", tdp: 58, igpu: false, ram_type: "DDR4" } },
  { id: "cpu-r7-5700g", category: "cpu", brand: "AMD", model: "Ryzen 7 5700G", specs: { socket: "AM4", tdp: 65, igpu: true, ram_type: "DDR4" } },
  { id: "cpu-r5-5600gt", category: "cpu", brand: "AMD", model: "Ryzen 5 5600GT", specs: { socket: "AM4", tdp: 65, igpu: true, ram_type: "DDR4" } },
  { id: "cpu-r5-8500g", category: "cpu", brand: "AMD", model: "Ryzen 5 8500G", specs: { socket: "AM5", tdp: 65, igpu: true, ram_type: "DDR5" } },
  { id: "cpu-r5-8400f", category: "cpu", brand: "AMD", model: "Ryzen 5 8400F", specs: { socket: "AM5", tdp: 65, igpu: false, ram_type: "DDR5" } },
  { id: "cpu-r9-9900x", category: "cpu", brand: "AMD", model: "Ryzen 9 9900X", specs: { socket: "AM5", tdp: 120, igpu: true, ram_type: "DDR5" } },
  { id: "cpu-r7-5700", category: "cpu", brand: "AMD", model: "Ryzen 7 5700", specs: { socket: "AM4", tdp: 65, igpu: false, ram_type: "DDR4" } },
  { id: "cpu-r7-7700", category: "cpu", brand: "AMD", model: "Ryzen 7 7700", specs: { socket: "AM5", tdp: 65, igpu: true, ram_type: "DDR5" } },
  { id: "cpu-r5-9600", category: "cpu", brand: "AMD", model: "Ryzen 5 9600", specs: { socket: "AM5", tdp: 65, igpu: true, ram_type: "DDR5" } },
  { id: "cpu-u5-245k", category: "cpu", brand: "Intel", model: "Core Ultra 5 245K", specs: { socket: "LGA1851", tdp: 125, igpu: false, ram_type: "DDR5" } },
  { id: "cpu-u7-265k", category: "cpu", brand: "Intel", model: "Core Ultra 7 265K", specs: { socket: "LGA1851", tdp: 125, igpu: false, ram_type: "DDR5" } },
  { id: "cooler-lt240", category: "cooler", brand: "DeepCool", model: "LT240 240mm AIO", specs: { height_mm: 55, sockets: ["AM4", "AM5", "LGA1700", "LGA1851", "LGA1200"] } },
  { id: "cooler-lt360", category: "cooler", brand: "DeepCool", model: "LT360 360mm AIO", specs: { height_mm: 55, sockets: ["AM4", "AM5", "LGA1700", "LGA1851", "LGA1200"] } },
  { id: "cooler-ag620", category: "cooler", brand: "DeepCool", model: "AG620", specs: { height_mm: 165, sockets: ["AM4", "AM5", "LGA1700", "LGA1200"] } },
  { id: "cooler-ak500", category: "cooler", brand: "DeepCool", model: "AK500", specs: { height_mm: 158, sockets: ["AM4", "AM5", "LGA1700", "LGA1200"] } },
  { id: "cooler-ag200", category: "cooler", brand: "DeepCool", model: "AG200", specs: { height_mm: 129, sockets: ["AM4", "AM5", "LGA1700", "LGA1200"] } },
  { id: "mobo-a620m", category: "motherboard", brand: "Gigabyte", model: "A620M (AM5 DDR5)", specs: { socket: "AM5", chipset: "A620", ram_type: "DDR5", form_factor: "mATX", m2: 1 } },
  { id: "mobo-b860m", category: "motherboard", brand: "ASUS", model: "Prime B860M (DDR5)", specs: { socket: "LGA1851", chipset: "B860", ram_type: "DDR5", form_factor: "mATX", m2: 2 } },
  { id: "mobo-b850m", category: "motherboard", brand: "ASRock", model: "B850M (AM5 DDR5)", specs: { socket: "AM5", chipset: "B850", ram_type: "DDR5", form_factor: "mATX", m2: 2 } },
  { id: "mobo-z890", category: "motherboard", brand: "Gigabyte", model: "Z890 Eagle (ATX DDR5)", specs: { socket: "LGA1851", chipset: "Z890", ram_type: "DDR5", form_factor: "ATX", m2: 3 } },
  { id: "ssd-nvme-1tb-g4", category: "ssd", brand: "Kingston", model: "NV3 1TB Gen4 NVMe", specs: { interface: "NVME" } },
  { id: "ssd-nvme-512gb", category: "ssd", brand: "ADATA", model: "Legend 710 512GB NVMe", specs: { interface: "NVME" } },
  { id: "ssd-sata-25", category: "ssd", brand: "Crucial", model: "BX500 2.5\" SATA", specs: { interface: "SATA" } },
  { id: "gpu-gtx1660s-6gb", category: "gpu", brand: "NVIDIA", model: "GTX 1660 SUPER 6GB", specs: { length_mm: 242, tdp_w: 125, pins: "1x8" } },
  { id: "gpu-rtx2060-6gb", category: "gpu", brand: "NVIDIA", model: "RTX 2060 6GB", specs: { length_mm: 240, tdp_w: 160, pins: "1x8" } },
  { id: "gpu-rtx2060s-8gb", category: "gpu", brand: "NVIDIA", model: "RTX 2060 SUPER 8GB", specs: { length_mm: 240, tdp_w: 175, pins: "1x8" } },
  { id: "gpu-rtx3060ti-8gb", category: "gpu", brand: "NVIDIA", model: "RTX 3060 Ti 8GB", specs: { length_mm: 240, tdp_w: 200, pins: "1x8" } },
  { id: "gpu-rtx4070tis-16gb", category: "gpu", brand: "NVIDIA", model: "RTX 4070 Ti SUPER 16GB", specs: { length_mm: 305, tdp_w: 285, pins: "16-pin" } },
  { id: "gpu-gt1030-4gb", category: "gpu", brand: "NVIDIA", model: "GT 1030 4GB", specs: { length_mm: 170, tdp_w: 30, pins: "none" } },
  { id: "gpu-b580-12gb", category: "gpu", brand: "Intel", model: "Arc B580 12GB", specs: { length_mm: 280, tdp_w: 190, pins: "2x8" } },
  { id: "case-vector", category: "case", brand: "Raidmax", model: "Vector V219 Mid Tower", specs: { max_gpu_mm: 340, max_cooler_mm: 165, supports: ["ATX", "mATX", "ITX"] } },
  { id: "case-4000d", category: "case", brand: "Corsair", model: "4000D Airflow", specs: { max_gpu_mm: 360, max_cooler_mm: 170, supports: ["ATX", "mATX", "ITX"] } },
  { id: "case-h5flow", category: "case", brand: "NZXT", model: "H5 Flow", specs: { max_gpu_mm: 340, max_cooler_mm: 165, supports: ["ATX", "mATX", "ITX"] } },
  { id: "case-velox", category: "case", brand: "MSI", model: "MPG Velox 100R", specs: { max_gpu_mm: 360, max_cooler_mm: 180, supports: ["ATX", "mATX", "ITX"] } },
  { id: "psu-450-b", category: "psu", brand: "Antec", model: "META V450 450W Bronze", specs: { wattage: 450, rating: "Bronze" } },
  { id: "psu-500-b", category: "psu", brand: "GameMax", model: "GE500 500W Bronze", specs: { wattage: 500, rating: "Bronze" } },
  { id: "psu-850-gold", category: "psu", brand: "MSI", model: "MPG A850GS 850W Gold", specs: { wattage: 850, rating: "Gold" } },
  { id: "psu-1000-gold", category: "psu", brand: "MSI", model: "MPG A1000GS 1000W Gold", specs: { wattage: 1000, rating: "Gold" } },
  { id: "mon-24-200", category: "monitor", brand: "MSI", model: "MAG G242F 24\" 200Hz", specs: { size: 24, hz: 200 } },
  { id: "mon-27-4k", category: "monitor", brand: "ASUS", model: "TUF VG27UQ1A 27\" 4K 160Hz", specs: { size: 27, hz: 160 } },
  { id: "mon-34-uw", category: "monitor", brand: "MSI", model: "MAG 401QR 40\" Ultrawide 155Hz", specs: { size: 40, hz: 155 } },
  // ---- Expansion 2026-09-13: full Algerian market coverage (Ouedkniss + 14 stores) ----
  // CPU +22 (AM4/AM5/LGA1200/LGA1700/LGA1851 best sellers)
  { id: "cpu-r5-7500f", category: "cpu", brand: "AMD", model: "Ryzen 5 7500F", specs: { socket: "AM5", tdp: 65, igpu: false, ram_type: "DDR5" } },
  { id: "cpu-r7-9700x", category: "cpu", brand: "AMD", model: "Ryzen 7 9700X", specs: { socket: "AM5", tdp: 65, igpu: true, ram_type: "DDR5" } },
  { id: "cpu-r7-8700g", category: "cpu", brand: "AMD", model: "Ryzen 7 8700G", specs: { socket: "AM5", tdp: 65, igpu: true, ram_type: "DDR5" } },
  { id: "cpu-r7-8700f", category: "cpu", brand: "AMD", model: "Ryzen 7 8700F", specs: { socket: "AM5", tdp: 65, igpu: false, ram_type: "DDR5" } },
  { id: "cpu-r5-5600g", category: "cpu", brand: "AMD", model: "Ryzen 5 5600G", specs: { socket: "AM4", tdp: 65, igpu: true, ram_type: "DDR4" } },
  { id: "cpu-r9-9950x", category: "cpu", brand: "AMD", model: "Ryzen 9 9950X", specs: { socket: "AM5", tdp: 170, igpu: true, ram_type: "DDR5" } },
  { id: "cpu-r9-9950x3d", category: "cpu", brand: "AMD", model: "Ryzen 9 9950X3D", specs: { socket: "AM5", tdp: 200, igpu: true, ram_type: "DDR5" } },
  { id: "cpu-r7-9850x3d", category: "cpu", brand: "AMD", model: "Ryzen 7 9850X3D", specs: { socket: "AM5", tdp: 120, igpu: true, ram_type: "DDR5" } },
  { id: "cpu-r9-9900x3d", category: "cpu", brand: "AMD", model: "Ryzen 9 9900X3D", specs: { socket: "AM5", tdp: 120, igpu: true, ram_type: "DDR5" } },
  { id: "cpu-r3-3200g", category: "cpu", brand: "AMD", model: "Ryzen 3 3200G", specs: { socket: "AM4", tdp: 65, igpu: true, ram_type: "DDR4" } },
  { id: "cpu-r3-4100", category: "cpu", brand: "AMD", model: "Ryzen 3 4100", specs: { socket: "AM4", tdp: 65, igpu: false, ram_type: "DDR4" } },
  { id: "cpu-r5-3400g", category: "cpu", brand: "AMD", model: "Ryzen 5 3400G", specs: { socket: "AM4", tdp: 65, igpu: true, ram_type: "DDR4" } },
  { id: "cpu-r5-3500x", category: "cpu", brand: "AMD", model: "Ryzen 5 3500X", specs: { socket: "AM4", tdp: 65, igpu: false, ram_type: "DDR4" } },
  { id: "cpu-r7-3700x", category: "cpu", brand: "AMD", model: "Ryzen 7 3700X", specs: { socket: "AM4", tdp: 65, igpu: false, ram_type: "DDR4" } },
  { id: "cpu-r9-5950x", category: "cpu", brand: "AMD", model: "Ryzen 9 5950X", specs: { socket: "AM4", tdp: 105, igpu: false, ram_type: "DDR4" } },
  { id: "cpu-i5-12600k", category: "cpu", brand: "Intel", model: "Core i5-12600K", specs: { socket: "LGA1700", tdp: 125, igpu: true, ram_type: "DDR4" } },
  { id: "cpu-i7-13700f", category: "cpu", brand: "Intel", model: "Core i7-13700F", specs: { socket: "LGA1700", tdp: 65, igpu: false, ram_type: "DDR5" } },
  { id: "cpu-i7-10700f", category: "cpu", brand: "Intel", model: "Core i7-10700F", specs: { socket: "LGA1200", tdp: 65, igpu: false, ram_type: "DDR4" } },
  { id: "cpu-i5-10600kf", category: "cpu", brand: "Intel", model: "Core i5-10600KF", specs: { socket: "LGA1200", tdp: 95, igpu: false, ram_type: "DDR4" } },
  { id: "cpu-u5-225f", category: "cpu", brand: "Intel", model: "Core Ultra 5 225F", specs: { socket: "LGA1851", tdp: 65, igpu: false, ram_type: "DDR5" } },
  { id: "cpu-u9-285k", category: "cpu", brand: "Intel", model: "Core Ultra 9 285K", specs: { socket: "LGA1851", tdp: 125, igpu: true, ram_type: "DDR5" } },
  { id: "cpu-r5-5650g", category: "cpu", brand: "AMD", model: "Ryzen 5 PRO 5650G", specs: { socket: "AM4", tdp: 65, igpu: true, ram_type: "DDR4" } },
  // Cooler +20
  { id: "cooler-ma621c", category: "cooler", brand: "MAGMA", model: "MA621C Dual Tower ARGB", specs: { height_mm: 165, sockets: ["AM4", "AM5", "LGA1700", "LGA1851", "LGA1200"] } },
  { id: "cooler-ma421a", category: "cooler", brand: "MAGMA", model: "MA421A ARGB", specs: { height_mm: 155, sockets: ["AM4", "AM5", "LGA1700", "LGA1200"] } },
  { id: "cooler-ak700", category: "cooler", brand: "DeepCool", model: "AK700 Digital", specs: { height_mm: 165, sockets: ["AM4", "AM5", "LGA1700", "LGA1851", "LGA1200"] } },
  { id: "cooler-ak500-g2", category: "cooler", brand: "DeepCool", model: "AK500 G2 Digital", specs: { height_mm: 158, sockets: ["AM4", "AM5", "LGA1700", "LGA1200"] } },
  { id: "cooler-ag400", category: "cooler", brand: "DeepCool", model: "AG400 V2 ARGB", specs: { height_mm: 150, sockets: ["AM4", "AM5", "LGA1700", "LGA1200"] } },
  { id: "cooler-le520", category: "cooler", brand: "DeepCool", model: "LE520 240mm AIO", specs: { height_mm: 55, sockets: ["AM4", "AM5", "LGA1700", "LGA1851", "LGA1200"] } },
  { id: "cooler-lt520", category: "cooler", brand: "DeepCool", model: "LT520 240mm AIO", specs: { height_mm: 55, sockets: ["AM4", "AM5", "LGA1700", "LGA1851", "LGA1200"] } },
  { id: "cooler-lt720", category: "cooler", brand: "DeepCool", model: "LT720 360mm AIO", specs: { height_mm: 55, sockets: ["AM4", "AM5", "LGA1700", "LGA1851", "LGA1200"] } },
  { id: "cooler-assassin4", category: "cooler", brand: "DeepCool", model: "Assassin IV", specs: { height_mm: 165, sockets: ["AM4", "AM5", "LGA1700", "LGA1851", "LGA1200"] } },
  { id: "cooler-ml240-core", category: "cooler", brand: "Cooler Master", model: "MasterLiquid 240L Core ARGB", specs: { height_mm: 55, sockets: ["AM4", "AM5", "LGA1700", "LGA1851", "LGA1200"] } },
  { id: "cooler-hyper622", category: "cooler", brand: "Cooler Master", model: "Hyper 622 Halo", specs: { height_mm: 165, sockets: ["AM4", "AM5", "LGA1700", "LGA1200"] } },
  { id: "cooler-aura-gl240", category: "cooler", brand: "Gamdias", model: "Aura GL240 V2", specs: { height_mm: 55, sockets: ["AM4", "AM5", "LGA1700", "LGA1200"] } },
  { id: "cooler-boreas-m2", category: "cooler", brand: "Gamdias", model: "Boreas M2", specs: { height_mm: 155, sockets: ["AM4", "AM5", "LGA1700", "LGA1200"] } },
  { id: "cooler-prime-lc240", category: "cooler", brand: "ASUS", model: "Prime LC240 ARGB", specs: { height_mm: 55, sockets: ["AM4", "AM5", "LGA1700", "LGA1851"] } },
  { id: "cooler-corefrozr", category: "cooler", brand: "MSI", model: "MAG CoreFrozr AA13", specs: { height_mm: 160, sockets: ["AM4", "AM5", "LGA1700", "LGA1851", "LGA1200"] } },
  { id: "cooler-mag240", category: "cooler", brand: "MSI", model: "MAG 240R AIO", specs: { height_mm: 55, sockets: ["AM4", "AM5", "LGA1700", "LGA1200"] } },
  { id: "cooler-wl240ft", category: "cooler", brand: "MAGMA", model: "WL240FT 240mm ARGB", specs: { height_mm: 55, sockets: ["AM4", "AM5", "LGA1700", "LGA1200"] } },
  { id: "cooler-wl360ft", category: "cooler", brand: "MAGMA", model: "WL360FT 360mm ARGB", specs: { height_mm: 55, sockets: ["AM4", "AM5", "LGA1700", "LGA1200"] } },
  { id: "cooler-hl240", category: "cooler", brand: "HYBROK", model: "HL240 240mm ARGB", specs: { height_mm: 55, sockets: ["AM4", "AM5", "LGA1700", "LGA1200"] } },
  { id: "cooler-f2002-360", category: "cooler", brand: "HAVIT", model: "F2002 360mm RGB", specs: { height_mm: 55, sockets: ["AM4", "AM5", "LGA1700", "LGA1200"] } },
  // Motherboard +12
  { id: "mobo-b840m", category: "motherboard", brand: "Gigabyte", model: "B840M Eagle (AM5 DDR5)", specs: { socket: "AM5", chipset: "B840", ram_type: "DDR5", form_factor: "mATX", m2: 2 } },
  { id: "mobo-x870", category: "motherboard", brand: "Gigabyte", model: "X870 Gaming (AM5 DDR5)", specs: { socket: "AM5", chipset: "X870", ram_type: "DDR5", form_factor: "ATX", m2: 3 } },
  { id: "mobo-x870e", category: "motherboard", brand: "MSI", model: "PRO X870E-P WiFi (AM5 DDR5)", specs: { socket: "AM5", chipset: "X870E", ram_type: "DDR5", form_factor: "ATX", m2: 3 } },
  { id: "mobo-x670e", category: "motherboard", brand: "MSI", model: "X670E Gaming Plus (AM5 DDR5)", specs: { socket: "AM5", chipset: "X670E", ram_type: "DDR5", form_factor: "ATX", m2: 3 } },
  { id: "mobo-b460m", category: "motherboard", brand: "MSI", model: "B460M Pro-VDH (DDR4)", specs: { socket: "LGA1200", chipset: "B460", ram_type: "DDR4", form_factor: "mATX", m2: 1 } },
  { id: "mobo-z690", category: "motherboard", brand: "Biostar", model: "Z690MX2-E D4 (DDR4)", specs: { socket: "LGA1700", chipset: "Z690", ram_type: "DDR4", form_factor: "ATX", m2: 2 } },
  { id: "mobo-x570", category: "motherboard", brand: "ASUS", model: "TUF X570-Plus (AM4 DDR4)", specs: { socket: "AM4", chipset: "X570", ram_type: "DDR4", form_factor: "ATX", m2: 2 } },
  { id: "mobo-z490", category: "motherboard", brand: "ASUS", model: "ROG Strix Z490-F (DDR4)", specs: { socket: "LGA1200", chipset: "Z490", ram_type: "DDR4", form_factor: "ATX", m2: 2 } },
  { id: "mobo-h510m", category: "motherboard", brand: "Esonic", model: "H510DA (DDR4)", specs: { socket: "LGA1200", chipset: "H510", ram_type: "DDR4", form_factor: "mATX", m2: 1 } },
  { id: "mobo-h810m", category: "motherboard", brand: "Gigabyte", model: "H810M Gaming (DDR5)", specs: { socket: "LGA1851", chipset: "H810", ram_type: "DDR5", form_factor: "mATX", m2: 1 } },
  { id: "mobo-z590", category: "motherboard", brand: "ASUS", model: "ROG Strix Z590 (DDR4)", specs: { socket: "LGA1200", chipset: "Z590", ram_type: "DDR4", form_factor: "ATX", m2: 2 } },
  { id: "mobo-b650e", category: "motherboard", brand: "Gigabyte", model: "B650E Aorus (AM5 DDR5)", specs: { socket: "AM5", chipset: "B650E", ram_type: "DDR5", form_factor: "ATX", m2: 3 } },
  // RAM +15
  { id: "ram-8gb-d5-5600", category: "ram", brand: "ADATA", model: "8GB DDR5-5600", specs: { type: "DDR5", capacity_gb: 8, speed: 5600 } },
  { id: "ram-16gb-d5-5600", category: "ram", brand: "Kingston", model: "Fury 16GB DDR5-5600", specs: { type: "DDR5", capacity_gb: 16, speed: 5600 } },
  { id: "ram-32gb-d5-5600", category: "ram", brand: "TeamGroup", model: "Elite 32GB DDR5-5600", specs: { type: "DDR5", capacity_gb: 32, speed: 5600 } },
  { id: "ram-32gb-d5-6000", category: "ram", brand: "Corsair", model: "Vengeance 32GB DDR5-6000", specs: { type: "DDR5", capacity_gb: 32, speed: 6000 } },
  { id: "ram-32gb-d5-6400", category: "ram", brand: "ADATA", model: "XPG Lancer 32GB DDR5-6400", specs: { type: "DDR5", capacity_gb: 32, speed: 6400 } },
  { id: "ram-48gb-d5-6000", category: "ram", brand: "Corsair", model: "Vengeance RGB 48GB DDR5-6000", specs: { type: "DDR5", capacity_gb: 48, speed: 6000 } },
  { id: "ram-16gb-d4-3600", category: "ram", brand: "G.Skill", model: "RipJaws V 16GB DDR4-3600", specs: { type: "DDR4", capacity_gb: 16, speed: 3600 } },
  { id: "ram-8gb-d4-3600", category: "ram", brand: "Dahua", model: "C600 8GB DDR4-3600 RGB", specs: { type: "DDR4", capacity_gb: 8, speed: 3600 } },
  { id: "ram-4gb-d4-2666", category: "ram", brand: "Crucial", model: "4GB DDR4-2666", specs: { type: "DDR4", capacity_gb: 4, speed: 2666 } },
  { id: "ram-32gb-d4-3600", category: "ram", brand: "G.Skill", model: "RipJaws V 32GB DDR4-3600", specs: { type: "DDR4", capacity_gb: 32, speed: 3600 } },
  { id: "ram-16gb-d5-6000", category: "ram", brand: "G.Skill", model: "Trident Z5 16GB DDR5-6000", specs: { type: "DDR5", capacity_gb: 16, speed: 6000 } },
  { id: "ram-64gb-d5-6000", category: "ram", brand: "Corsair", model: "Vengeance 64GB DDR5-6000", specs: { type: "DDR5", capacity_gb: 64, speed: 6000 } },
  { id: "ram-8gb-d3-1600", category: "ram", brand: "Kingston", model: "8GB DDR3-1600", specs: { type: "DDR3", capacity_gb: 8, speed: 1600 } },
  { id: "ram-16gb-d5-6400", category: "ram", brand: "TeamGroup", model: "T-Force Delta 16GB DDR5-6400", specs: { type: "DDR5", capacity_gb: 16, speed: 6400 } },
  // Storage +13
  { id: "ssd-nvme-256gb", category: "ssd", brand: "ADATA", model: "Legend 710 256GB NVMe", specs: { interface: "NVME" } },
  { id: "ssd-nvme-2tb", category: "ssd", brand: "Silicon Power", model: "UD90 2TB Gen4 NVMe", specs: { interface: "NVME" } },
  { id: "ssd-nvme-4tb", category: "ssd", brand: "Silicon Power", model: "UD90 4TB Gen4 NVMe", specs: { interface: "NVME" } },
  { id: "ssd-gen5-1tb", category: "ssd", brand: "ADATA", model: "XPG Mars 980 Blade 1TB Gen5", specs: { interface: "NVME" } },
  { id: "ssd-sata-256gb", category: "ssd", brand: "Crucial", model: "BX500 240GB SATA", specs: { interface: "SATA" } },
  { id: "ssd-sata-512gb", category: "ssd", brand: "ADATA", model: "SU680 512GB SATA", specs: { interface: "SATA" } },
  { id: "ssd-sata-1tb", category: "ssd", brand: "TeamGroup", model: "CX2 1TB SATA", specs: { interface: "SATA" } },
  { id: "ssd-sata-2tb", category: "ssd", brand: "CUSU", model: "C300 2TB SATA", specs: { interface: "SATA" } },
  { id: "hdd-2tb", category: "ssd", brand: "Seagate", model: "BarraCuda 2TB HDD", specs: { interface: "SATA" } },
  { id: "hdd-4tb", category: "ssd", brand: "Seagate", model: "SkyHawk 4TB Surveillance", specs: { interface: "SATA" } },
  { id: "hdd-6tb", category: "ssd", brand: "WD", model: "Purple 6TB Surveillance", specs: { interface: "SATA" } },
  { id: "ssd-portable-1tb", category: "ssd", brand: "SanDisk", model: "Extreme Portable 1TB", specs: { interface: "USB" } },
  { id: "ssd-990pro-2tb", category: "ssd", brand: "Samsung", model: "990 Pro 2TB NVMe", specs: { interface: "NVME" } },
  // PSU +11
  { id: "psu-600-b", category: "psu", brand: "GameMax", model: "GE-600 600W", specs: { wattage: 600, rating: "Bronze" } },
  { id: "psu-650-b", category: "psu", brand: "Corsair", model: "CV650 650W Bronze", specs: { wattage: 650, rating: "Bronze" } },
  { id: "psu-650-gold", category: "psu", brand: "MSI", model: "MAG A650GL 650W Gold", specs: { wattage: 650, rating: "Gold" } },
  { id: "psu-700-b", category: "psu", brand: "DeepCool", model: "PF700D 700W", specs: { wattage: 700, rating: "White" } },
  { id: "psu-750-b", category: "psu", brand: "Gamdias", model: "Helios M1-750B 750W Bronze", specs: { wattage: 750, rating: "Bronze" } },
  { id: "psu-800-gold", category: "psu", brand: "Raidmax", model: "Vortex 800W Gold", specs: { wattage: 800, rating: "Gold" } },
  { id: "psu-850-b", category: "psu", brand: "MSI", model: "MAG A850BN 850W Bronze", specs: { wattage: 850, rating: "Bronze" } },
  { id: "psu-1050-gold", category: "psu", brand: "GameMax", model: "RGB-1050 Pro 1050W Gold", specs: { wattage: 1050, rating: "Gold" } },
  { id: "psu-1200-gold", category: "psu", brand: "DeepCool", model: "PN1200M 1200W Gold", specs: { wattage: 1200, rating: "Gold" } },
  { id: "psu-1250-gold", category: "psu", brand: "MSI", model: "MAG A1250GL 1250W Gold", specs: { wattage: 1250, rating: "Gold" } },
  { id: "psu-1300-plat", category: "psu", brand: "MSI", model: "MEG AI1300P 1300W Platinum", specs: { wattage: 1300, rating: "Platinum" } },
  // Case +22
  { id: "case-nx400", category: "case", brand: "Antec", model: "NX400 RGB", specs: { max_gpu_mm: 340, max_cooler_mm: 165, supports: ["ATX", "mATX", "ITX"] } },
  { id: "case-vx310", category: "case", brand: "Antec", model: "VX310 ARGB", specs: { max_gpu_mm: 320, max_cooler_mm: 160, supports: ["mATX", "ITX"] } },
  { id: "case-cx300", category: "case", brand: "Antec", model: "CX300 Elite ARGB", specs: { max_gpu_mm: 340, max_cooler_mm: 165, supports: ["ATX", "mATX", "ITX"] } },
  { id: "case-cg580", category: "case", brand: "DeepCool", model: "CG580", specs: { max_gpu_mm: 400, max_cooler_mm: 165, supports: ["ATX", "mATX", "ITX"] } },
  { id: "case-ap201", category: "case", brand: "ASUS", model: "Prime AP201 Mesh", specs: { max_gpu_mm: 338, max_cooler_mm: 170, supports: ["mATX", "ITX"] } },
  { id: "case-rev06", category: "case", brand: "GALAX", model: "Revolution 06", specs: { max_gpu_mm: 340, max_cooler_mm: 165, supports: ["ATX", "mATX", "ITX"] } },
  { id: "case-archon2", category: "case", brand: "Cougar", model: "Archon II", specs: { max_gpu_mm: 340, max_cooler_mm: 165, supports: ["ATX", "mATX", "ITX"] } },
  { id: "case-atlas-p2", category: "case", brand: "Gamdias", model: "Atlas P2", specs: { max_gpu_mm: 340, max_cooler_mm: 160, supports: ["ATX", "mATX", "ITX"] } },
  { id: "case-shield-m100", category: "case", brand: "MSI", model: "MAG Shield M100R", specs: { max_gpu_mm: 330, max_cooler_mm: 160, supports: ["mATX", "ITX"] } },
  { id: "case-forge-320r", category: "case", brand: "MSI", model: "MAG Forge 320R", specs: { max_gpu_mm: 340, max_cooler_mm: 160, supports: ["ATX", "mATX", "ITX"] } },
  { id: "case-pano-110r", category: "case", brand: "MSI", model: "MAG Pano 110R", specs: { max_gpu_mm: 400, max_cooler_mm: 170, supports: ["ATX", "mATX", "ITX"] } },
  { id: "case-infinita-i802", category: "case", brand: "Raidmax", model: "Infinita I802 Air", specs: { max_gpu_mm: 350, max_cooler_mm: 165, supports: ["ATX", "mATX", "ITX"] } },
  { id: "case-meshian-x605", category: "case", brand: "Raidmax", model: "Meshian X605", specs: { max_gpu_mm: 350, max_cooler_mm: 165, supports: ["ATX", "mATX", "ITX"] } },
  { id: "case-hurrikan-h200", category: "case", brand: "Raidmax", model: "Hurrikan H200", specs: { max_gpu_mm: 360, max_cooler_mm: 165, supports: ["ATX", "mATX", "ITX"] } },
  { id: "case-ghost5", category: "case", brand: "Spirit of Gamer", model: "Ghost 5 ARGB", specs: { max_gpu_mm: 340, max_cooler_mm: 160, supports: ["ATX", "mATX", "ITX"] } },
  { id: "case-infinity-dark", category: "case", brand: "Spirit of Gamer", model: "Infinity Dark ARGB", specs: { max_gpu_mm: 340, max_cooler_mm: 160, supports: ["ATX", "mATX", "ITX"] } },
  { id: "case-gamma-c60", category: "case", brand: "Ocypus", model: "Gamma C60", specs: { max_gpu_mm: 340, max_cooler_mm: 160, supports: ["ATX", "mATX", "ITX"] } },
  { id: "case-magma-v02", category: "case", brand: "MAGMA", model: "V02", specs: { max_gpu_mm: 340, max_cooler_mm: 160, supports: ["ATX", "mATX", "ITX"] } },
  { id: "case-magma-t9", category: "case", brand: "MAGMA", model: "T9 Silver", specs: { max_gpu_mm: 340, max_cooler_mm: 160, supports: ["ATX", "mATX", "ITX"] } },
  { id: "case-hybrok-ares", category: "case", brand: "HYBROK", model: "Ares RGB", specs: { max_gpu_mm: 340, max_cooler_mm: 160, supports: ["ATX", "mATX", "ITX"] } },
  { id: "case-nox-hummer", category: "case", brand: "NOX", model: "Hummer", specs: { max_gpu_mm: 340, max_cooler_mm: 160, supports: ["ATX", "mATX", "ITX"] } },
  { id: "case-xigmatek-aura", category: "case", brand: "Xigmatek", model: "Aura", specs: { max_gpu_mm: 340, max_cooler_mm: 160, supports: ["ATX", "mATX", "ITX"] } },
  // Monitor +16
  { id: "mon-22-100", category: "monitor", brand: "MSI", model: "PRO MP223 E2 22\" 100Hz", specs: { size: 22, hz: 100 } },
  { id: "mon-24-100", category: "monitor", brand: "MSI", model: "PRO MP241 E2 24\" 100Hz", specs: { size: 24, hz: 100 } },
  { id: "mon-24-120", category: "monitor", brand: "AOC", model: "24B31H 24\" 120Hz", specs: { size: 24, hz: 120 } },
  { id: "mon-24-144", category: "monitor", brand: "AOC", model: "24B36X 24\" 144Hz IPS", specs: { size: 24, hz: 144 } },
  { id: "mon-24-165", category: "monitor", brand: "Acer", model: "KG241Q 24\" 165Hz", specs: { size: 24, hz: 165 } },
  { id: "mon-25-300", category: "monitor", brand: "MSI", model: "MAG 255PXF 25\" 300Hz", specs: { size: 25, hz: 300 } },
  { id: "mon-27-100", category: "monitor", brand: "BenQ", model: "GW2790 27\" 100Hz IPS", specs: { size: 27, hz: 100 } },
  { id: "mon-27-180", category: "monitor", brand: "AOC", model: "27G42E 27\" 180Hz", specs: { size: 27, hz: 180 } },
  { id: "mon-27-200", category: "monitor", brand: "ASUS", model: "TUF VG279Q5R 27\" 200Hz", specs: { size: 27, hz: 200 } },
  { id: "mon-27-240", category: "monitor", brand: "MSI", model: "MAG 272F 27\" 240Hz", specs: { size: 27, hz: 240 } },
  { id: "mon-27-280", category: "monitor", brand: "AOC", model: "C27G4ZXE 27\" 280Hz", specs: { size: 27, hz: 280 } },
  { id: "mon-32-qhd180", category: "monitor", brand: "ASUS", model: "ROG XG32WCMS 32\" QHD 280Hz", specs: { size: 32, hz: 280 } },
  { id: "mon-32-4k240", category: "monitor", brand: "Gigabyte", model: "FO32U2 32\" 4K 240Hz OLED", specs: { size: 32, hz: 240 } },
  { id: "mon-34-oled", category: "monitor", brand: "Gigabyte", model: "MO34WQC 34\" OLED 175Hz", specs: { size: 34, hz: 175 } },
  { id: "mon-49-superwide", category: "monitor", brand: "AOC", model: "PD49 49\" DQHD 240Hz OLED", specs: { size: 49, hz: 240 } },
  { id: "mon-20-75", category: "monitor", brand: "Maxipower", model: "MP20V 20\" 75Hz", specs: { size: 20, hz: 75 } },
  // GPU +11
  { id: "gpu-gtx1650-4gb", category: "gpu", brand: "MSI", model: "GTX 1650 Ventus 4GB", specs: { length_mm: 229, tdp_w: 75, pins: "none" } },
  { id: "gpu-gtx1050ti-4gb", category: "gpu", brand: "MSI", model: "GTX 1050 Ti 4GB", specs: { length_mm: 200, tdp_w: 75, pins: "none" } },
  { id: "gpu-gtx1070-8gb", category: "gpu", brand: "Gigabyte", model: "GTX 1070 G1 8GB", specs: { length_mm: 267, tdp_w: 150, pins: "1x8" } },
  { id: "gpu-gtx1660ti-6gb", category: "gpu", brand: "ASUS", model: "GTX 1660 Ti 6GB", specs: { length_mm: 242, tdp_w: 120, pins: "1x8" } },
  { id: "gpu-rtx2070s-8gb", category: "gpu", brand: "ASUS", model: "RTX 2070 SUPER 8GB", specs: { length_mm: 267, tdp_w: 215, pins: "1x8+1x6" } },
  { id: "gpu-rtx2080s-8gb", category: "gpu", brand: "MSI", model: "RTX 2080 SUPER 8GB", specs: { length_mm: 267, tdp_w: 250, pins: "1x8+1x6" } },
  { id: "gpu-rtx3070ti-8gb", category: "gpu", brand: "Gigabyte", model: "RTX 3070 Ti 8GB", specs: { length_mm: 267, tdp_w: 290, pins: "2x8" } },
  { id: "gpu-rtx4080-16gb", category: "gpu", brand: "MSI", model: "RTX 4080 Gaming X 16GB", specs: { length_mm: 310, tdp_w: 320, pins: "16-pin" } },
  { id: "gpu-gt730-4gb", category: "gpu", brand: "MSI", model: "GT 730 4GB", specs: { length_mm: 150, tdp_w: 30, pins: "none" } },
  { id: "gpu-rtx3060-8gb", category: "gpu", brand: "MSI", model: "RTX 3060 Ventus 8GB", specs: { length_mm: 235, tdp_w: 170, pins: "1x8" } },
  { id: "gpu-rtx4060ti-16gb", category: "gpu", brand: "NVIDIA", model: "RTX 4060 Ti 16GB", specs: { length_mm: 240, tdp_w: 160, pins: "1x8" } },
  // ---- Expansion batch 2 (2026-09-13): long tail from full.json mining ----
  { id: "cpu-r5-7500x3d", category: "cpu", brand: "AMD", model: "Ryzen 5 7500X3D", specs: { socket: "AM5", tdp: 65, igpu: false, ram_type: "DDR5" } },
  { id: "cpu-r9-7900", category: "cpu", brand: "AMD", model: "Ryzen 9 7900", specs: { socket: "AM5", tdp: 65, igpu: true, ram_type: "DDR5" } },
  { id: "cpu-i9-13900k", category: "cpu", brand: "Intel", model: "Core i9-13900K", specs: { socket: "LGA1700", tdp: 125, igpu: true, ram_type: "DDR5" } },
  { id: "cpu-i9-12900k", category: "cpu", brand: "Intel", model: "Core i9-12900K", specs: { socket: "LGA1700", tdp: 125, igpu: true, ram_type: "DDR5" } },
  { id: "cpu-i5-11400f", category: "cpu", brand: "Intel", model: "Core i5-11400F", specs: { socket: "LGA1200", tdp: 65, igpu: false, ram_type: "DDR4" } },
  { id: "cpu-i3-10100f", category: "cpu", brand: "Intel", model: "Core i3-10100F", specs: { socket: "LGA1200", tdp: 65, igpu: false, ram_type: "DDR4" } },
  { id: "cpu-r3-3100", category: "cpu", brand: "AMD", model: "Ryzen 3 3100", specs: { socket: "AM4", tdp: 65, igpu: false, ram_type: "DDR4" } },
  { id: "cpu-r3-4300g", category: "cpu", brand: "AMD", model: "Ryzen 3 4300G", specs: { socket: "AM4", tdp: 65, igpu: true, ram_type: "DDR4" } },
  { id: "cpu-r5-5500gt", category: "cpu", brand: "AMD", model: "Ryzen 5 5500GT", specs: { socket: "AM4", tdp: 65, igpu: true, ram_type: "DDR4" } },
  { id: "cpu-r3-2200g", category: "cpu", brand: "AMD", model: "Ryzen 3 2200G", specs: { socket: "AM4", tdp: 65, igpu: true, ram_type: "DDR4" } },
  { id: "cooler-am1204", category: "cooler", brand: "Raidmax", model: "AM1204 Digital ARGB", specs: { height_mm: 155, sockets: ["AM4", "AM5", "LGA1700", "LGA1200"] } },
  { id: "cooler-lq360", category: "cooler", brand: "DeepCool", model: "LQ360 360mm", specs: { height_mm: 55, sockets: ["AM4", "AM5", "LGA1700", "LGA1851", "LGA1200"] } },
  { id: "cooler-gl120", category: "cooler", brand: "Gamdias", model: "Aura GL120 V2", specs: { height_mm: 55, sockets: ["AM4", "AM5", "LGA1700", "LGA1200"] } },
  { id: "cooler-tt120", category: "cooler", brand: "Thermaltake", model: "TH 120 ARGB", specs: { height_mm: 55, sockets: ["AM4", "AM5", "LGA1700", "LGA1200"] } },
  { id: "cooler-mars", category: "cooler", brand: "Mars Gaming", model: "MCPU-XT ARGB", specs: { height_mm: 155, sockets: ["AM4", "AM5", "LGA1700", "LGA1200"] } },
  { id: "cooler-f2005", category: "cooler", brand: "HAVIT", model: "F2005 RGB", specs: { height_mm: 155, sockets: ["AM4", "AM5", "LGA1700", "LGA1200"] } },
  { id: "cooler-a30", category: "cooler", brand: "Antec", model: "A30 Pro", specs: { height_mm: 130, sockets: ["AM4", "AM5", "LGA1700", "LGA1200"] } },
  { id: "cooler-proart360", category: "cooler", brand: "ASUS", model: "ProArt LC 360", specs: { height_mm: 55, sockets: ["AM4", "AM5", "LGA1700", "LGA1851"] } },
  { id: "mobo-x670", category: "motherboard", brand: "Gigabyte", model: "X670 Gaming X (AM5 DDR5)", specs: { socket: "AM5", chipset: "X670", ram_type: "DDR5", form_factor: "ATX", m2: 3 } },
  { id: "mobo-b560m", category: "motherboard", brand: "MSI", model: "B560M Pro (DDR4)", specs: { socket: "LGA1200", chipset: "B560", ram_type: "DDR4", form_factor: "mATX", m2: 1 } },
  { id: "mobo-h410m", category: "motherboard", brand: "ASUS", model: "Prime H410M-K (DDR4)", specs: { socket: "LGA1200", chipset: "H410", ram_type: "DDR4", form_factor: "mATX", m2: 1 } },
  { id: "mobo-h310m", category: "motherboard", brand: "ASUS", model: "Prime H310M (DDR4)", specs: { socket: "LGA1151", chipset: "H310", ram_type: "DDR4", form_factor: "mATX", m2: 1 } },
  { id: "mobo-h110m", category: "motherboard", brand: "Esonic", model: "H110 (DDR4)", specs: { socket: "LGA1151", chipset: "H110", ram_type: "DDR4", form_factor: "mATX", m2: 1 } },
  { id: "mobo-a320m", category: "motherboard", brand: "ASUS", model: "Prime A320M-K (AM4 DDR4)", specs: { socket: "AM4", chipset: "A320", ram_type: "DDR4", form_factor: "mATX", m2: 1 } },
  { id: "mobo-z390", category: "motherboard", brand: "MSI", model: "Z390-A Pro (DDR4)", specs: { socket: "LGA1151", chipset: "Z390", ram_type: "DDR4", form_factor: "ATX", m2: 2 } },
  { id: "mobo-z370", category: "motherboard", brand: "MSI", model: "Z370 Tomahawk (DDR4)", specs: { socket: "LGA1151", chipset: "Z370", ram_type: "DDR4", form_factor: "ATX", m2: 2 } },
  { id: "mobo-h81", category: "motherboard", brand: "Esonic", model: "H81DA1 (DDR3)", specs: { socket: "LGA1150", chipset: "H81", ram_type: "DDR3", form_factor: "mATX", m2: 0 } },
  { id: "mobo-h61", category: "motherboard", brand: "Enigma", model: "H61 (DDR3)", specs: { socket: "LGA1155", chipset: "H61", ram_type: "DDR3", form_factor: "mATX", m2: 0 } },
  { id: "ram-24gb-d5", category: "ram", brand: "ADATA", model: "XPG Lancer Blade 24GB DDR5", specs: { type: "DDR5", capacity_gb: 24, speed: 6000 } },
  { id: "ssd-external", category: "ssd", brand: "WD", model: "External Portable Storage", specs: { interface: "USB" } },
  { id: "psu-400-b", category: "psu", brand: "DeepCool", model: "PF400D 400W", specs: { wattage: 400, rating: "White" } },
  { id: "case-mars", category: "case", brand: "Mars Gaming", model: "MC Series Mid Tower", specs: { max_gpu_mm: 340, max_cooler_mm: 160, supports: ["ATX", "mATX", "ITX"] } },
  { id: "case-gamemax", category: "case", brand: "GameMax", model: "Vista Gaming Mid Tower", specs: { max_gpu_mm: 340, max_cooler_mm: 160, supports: ["ATX", "mATX", "ITX"] } },
  { id: "case-masterbox", category: "case", brand: "Cooler Master", model: "MasterBox MB520", specs: { max_gpu_mm: 410, max_cooler_mm: 165, supports: ["ATX", "mATX", "ITX"] } },
  { id: "case-gungnir", category: "case", brand: "MSI", model: "MAG Gungnir 110R", specs: { max_gpu_mm: 340, max_cooler_mm: 170, supports: ["ATX", "mATX", "ITX"] } },
  { id: "case-ch560", category: "case", brand: "DeepCool", model: "CH560 Digital", specs: { max_gpu_mm: 380, max_cooler_mm: 175, supports: ["ATX", "mATX", "ITX"] } },
  { id: "case-gc7", category: "case", brand: "Gamdias", model: "Aura GC7 / Athena M3", specs: { max_gpu_mm: 340, max_cooler_mm: 160, supports: ["ATX", "mATX", "ITX"] } },
  { id: "mon-office-22", category: "monitor", brand: "HP", model: "22\" Office 75Hz", specs: { size: 22, hz: 75 } },
  { id: "mon-office-24", category: "monitor", brand: "HP", model: "24\" Office 75Hz", specs: { size: 24, hz: 75 } },
  { id: "mon-office-s", category: "monitor", brand: "HP", model: "19-21\" Office 60Hz", specs: { size: 21, hz: 60 } },
  { id: "mon-27-120", category: "monitor", brand: "MSI", model: "PRO MP275 27\" 120Hz", specs: { size: 27, hz: 120 } },
  { id: "mon-25-120", category: "monitor", brand: "ASUS", model: "VA249HG 24\" 120Hz", specs: { size: 24, hz: 120 } },
  { id: "mon-27-165", category: "monitor", brand: "Cooler Master", model: "GM27 27\" 165Hz", specs: { size: 27, hz: 165 } },
  { id: "mon-24-280", category: "monitor", brand: "AOC", model: "CS25G 24\" 310Hz", specs: { size: 24, hz: 310 } },
  { id: "mon-315", category: "monitor", brand: "Acer", model: "Nitro 31.5\" QHD 180Hz", specs: { size: 32, hz: 180 } },
  { id: "gpu-rtx4070ti-12gb", category: "gpu", brand: "MSI", model: "RTX 4070 Ti 12GB", specs: { length_mm: 305, tdp_w: 285, pins: "16-pin" } },
  { id: "gpu-rtx3090-24gb", category: "gpu", brand: "ASUS", model: "ROG Strix RTX 3090 24GB", specs: { length_mm: 318, tdp_w: 350, pins: "3x8" } },
  { id: "gpu-rtx3080ti-12gb", category: "gpu", brand: "ASUS", model: "TUF RTX 3080 Ti 12GB", specs: { length_mm: 300, tdp_w: 350, pins: "2x8" } },
  { id: "gpu-rx5700xt-8gb", category: "gpu", brand: "AMD", model: "RX 5700 XT 8GB", specs: { length_mm: 267, tdp_w: 225, pins: "1x8+1x6" } },
  { id: "gpu-rx5700-8gb", category: "gpu", brand: "XFX", model: "RX 5700 8GB", specs: { length_mm: 267, tdp_w: 180, pins: "1x8+1x6" } },
  { id: "gpu-rx6500xt-4gb", category: "gpu", brand: "MSI", model: "RX 6500 XT 4GB", specs: { length_mm: 200, tdp_w: 107, pins: "1x6" } },
  { id: "gpu-gtx950-2gb", category: "gpu", brand: "Gigabyte", model: "GTX 950 2GB", specs: { length_mm: 200, tdp_w: 90, pins: "1x6" } },
  { id: "gpu-quadro", category: "gpu", brand: "NVIDIA", model: "Quadro Workstation", specs: { length_mm: 200, tdp_w: 75, pins: "none" } },
  // ---- Expansion batch 3 (2026-09-13): premium + office long tail ----
  { id: "cpu-u7-270k", category: "cpu", brand: "Intel", model: "Core Ultra 7 270K Plus", specs: { socket: "LGA1851", tdp: 125, igpu: true, ram_type: "DDR5" } },
  { id: "cpu-i7-12700k", category: "cpu", brand: "Intel", model: "Core i7-12700K", specs: { socket: "LGA1700", tdp: 125, igpu: true, ram_type: "DDR5" } },
  { id: "cpu-i9-11900k", category: "cpu", brand: "Intel", model: "Core i9-11900KF", specs: { socket: "LGA1200", tdp: 125, igpu: false, ram_type: "DDR4" } },
  { id: "cpu-i9-10900k", category: "cpu", brand: "Intel", model: "Core i9-10900K", specs: { socket: "LGA1200", tdp: 125, igpu: true, ram_type: "DDR4" } },
  { id: "cooler-ml360", category: "cooler", brand: "Cooler Master", model: "MasterLiquid 360L Core", specs: { height_mm: 55, sockets: ["AM4", "AM5", "LGA1700", "LGA1851", "LGA1200"] } },
  { id: "cooler-kraken", category: "cooler", brand: "NZXT", model: "Kraken 280 RGB", specs: { height_mm: 55, sockets: ["AM4", "AM5", "LGA1700", "LGA1851"] } },
  { id: "cooler-ocypus", category: "cooler", brand: "Ocypus", model: "Delta A40 ARGB", specs: { height_mm: 155, sockets: ["AM4", "AM5", "LGA1700", "LGA1200"] } },
  { id: "gpu-gtx1060-6gb", category: "gpu", brand: "MSI", model: "GTX 1060 Gaming X 6GB", specs: { length_mm: 242, tdp_w: 120, pins: "1x8" } },
  { id: "gpu-rx5600xt-6gb", category: "gpu", brand: "XFX", model: "RX 5600 XT 6GB", specs: { length_mm: 242, tdp_w: 150, pins: "1x8" } },
  { id: "gpu-rx480-8gb", category: "gpu", brand: "Sapphire", model: "RX 480 Nitro+ 8GB", specs: { length_mm: 242, tdp_w: 150, pins: "1x8" } },
  { id: "ssd-990evo-plus", category: "ssd", brand: "Samsung", model: "990 Evo Plus NVMe", specs: { interface: "NVME" } },
  { id: "hdd-5tb", category: "ssd", brand: "Seagate", model: "FireCuda 5TB Gaming HDD", specs: { interface: "SATA" } },
  { id: "case-a21", category: "case", brand: "ASUS", model: "Prime A21", specs: { max_gpu_mm: 380, max_cooler_mm: 165, supports: ["ATX", "mATX", "ITX"] } },
  { id: "case-xpg", category: "case", brand: "XPG", model: "Lander 501", specs: { max_gpu_mm: 340, max_cooler_mm: 160, supports: ["ATX", "mATX", "ITX"] } },
  { id: "case-gigabyte", category: "case", brand: "Gigabyte", model: "C301G", specs: { max_gpu_mm: 340, max_cooler_mm: 165, supports: ["ATX", "mATX", "ITX"] } },
  { id: "case-gt502", category: "case", brand: "ASUS", model: "TUF GT502 Plus", specs: { max_gpu_mm: 400, max_cooler_mm: 170, supports: ["ATX", "mATX", "ITX"] } },
  { id: "case-phanteks", category: "case", brand: "Phanteks", model: "Eclipse G500A", specs: { max_gpu_mm: 400, max_cooler_mm: 170, supports: ["ATX", "mATX", "ITX"] } },
  { id: "case-gearmaster", category: "case", brand: "GearMaster", model: "GM Series", specs: { max_gpu_mm: 340, max_cooler_mm: 160, supports: ["ATX", "mATX", "ITX"] } },
  { id: "case-asus-pro", category: "case", brand: "ASUS", model: "ProArt LC/PA Series", specs: { max_gpu_mm: 380, max_cooler_mm: 170, supports: ["ATX", "mATX", "ITX"] } },
  // ---- Expansion batch 4 (2026-09-13): final long-tail sweep ----
  { id: "case-antec", category: "case", brand: "Antec", model: "AX/C5 Series", specs: { max_gpu_mm: 340, max_cooler_mm: 160, supports: ["ATX", "mATX", "ITX"] } },
  { id: "case-havit", category: "case", brand: "HAVIT", model: "CF Series", specs: { max_gpu_mm: 340, max_cooler_mm: 160, supports: ["ATX", "mATX", "ITX"] } },
  { id: "case-budget", category: "case", brand: "Generic", model: "Budget Mid Tower", specs: { max_gpu_mm: 330, max_cooler_mm: 155, supports: ["ATX", "mATX", "ITX"] } },
  { id: "cooler-phantom", category: "cooler", brand: "Thermalright", model: "Phantom Spirit 120", specs: { height_mm: 154, sockets: ["AM4", "AM5", "LGA1700", "LGA1851", "LGA1200"] } },
  { id: "mobo-z270", category: "motherboard", brand: "Gigabyte", model: "Z270X-Gaming (DDR4)", specs: { socket: "LGA1151", chipset: "Z270", ram_type: "DDR4", form_factor: "ATX", m2: 2 } },
  { id: "mobo-g41", category: "motherboard", brand: "Esonic", model: "G41 (DDR3)", specs: { socket: "LGA775", chipset: "G41", ram_type: "DDR3", form_factor: "mATX", m2: 0 } },
  { id: "mobo-nzxt", category: "motherboard", brand: "NZXT", model: "N Series Intel (DDR4/DDR5)", specs: { socket: "LGA1700", chipset: "Z690", ram_type: "DDR5", form_factor: "ATX", m2: 2 } },
  { id: "mobo-b150m", category: "motherboard", brand: "Gigabyte", model: "B150M (DDR4)", specs: { socket: "LGA1151", chipset: "B150", ram_type: "DDR4", form_factor: "mATX", m2: 1 } },
  { id: "ssd-128gb", category: "ssd", brand: "Generic", model: "128GB SATA SSD", specs: { interface: "SATA" } },
  { id: "ssd-budget", category: "ssd", brand: "Generic", model: "Budget SSD", specs: { interface: "SATA" } },
  { id: "hdd-1tb", category: "ssd", brand: "WD", model: "Blue 1TB HDD", specs: { interface: "SATA" } },
];

export const OFFERS: Offer[] = LIVE_OFFERS;

export function productImage(p: Product): string | undefined {
  return LIVE_IMAGES[p.id] ?? bestOffer(p.id)?.image;
}

export function isRuptured(o: Pick<Offer, "stock">): boolean {
  return /rupture|out of stock|sold out/i.test(o.stock || "");
}

function offerRank(o: Offer): number {
  // Hero/buy-box must NEVER be a used or dead listing while a live new one exists.
  // tier: new+confirmed stock (0) < new+unconfirmed (1) < used+confirmed (2) < used+unconfirmed (3) < ruptured (4)
  const ruptured = /rupture|out of stock|sold out|épuisé|indisponible|non disponible/i.test(o.stock);
  if (ruptured) return 4;
  const confirmed = /en stock|^in stock/i.test(o.stock);
  const used = o.condition === "used";
  if (!used && confirmed) return 0;
  if (!used) return 1;
  if (confirmed) return 2;
  return 3;
}

export function bestOffer(productId: string, offers: Offer[] = OFFERS): Offer | undefined {
  // Ruptured listings never win while a live one exists (trust rule).
  const list = offers.filter((o) => o.productId === productId);
  const pool = list.some((o) => !isRuptured(o)) ? list.filter((o) => !isRuptured(o)) : list;
  return pool.sort(
    (a, b) => offerRank(a) - offerRank(b) || a.priceDa - b.priceDa
  )[0];
}

export interface PricePoint {
  day: string;
  store: string;
  price: number;
}

interface HistoryRow {
  d: string;
  p: string;
  s: string;
  pr: number;
}

export function priceHistory(productId: string): PricePoint[] {
  return (PRICE_HISTORY_JSON as HistoryRow[])
    .filter((h) => h.p === productId)
    .map((h) => ({ day: h.d, store: h.s, price: h.pr }))
    .sort((a, b) => (a.day < b.day ? -1 : 1));
}
