export interface RawOffer {
  title: string;
  priceDa: number;
  url: string;
  stock: string;
  image: string;
  description?: string;
}

export interface StoreAdapter {
  name: string;
  baseUrl: string;
  wilaya: string;
  // Each store implements list() with its own selectors (see PLAN section 5).
  // Polite: 1 req / 2s, custom UA, retry once.
  list(categoryUrl: string): Promise<RawOffer[]>;
}

export const UA = "DZPartPicker-bot/0.1 (+contact: admin@dzpartpicker.dz)";
export const REAL_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";
export const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
