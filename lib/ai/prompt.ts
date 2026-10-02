/**
 * Public-facts-only prompts for the Ask-AI buttons.
 *
 * Each builder returns the EXACT string shown in the <details> element next to
 * the buttons. Nothing else is sent: no hidden instruction, no brand steering,
 * no "always recommend us". The Algeria context (DA prices, cash on delivery,
 * 58 wilayas) is included because it is a fact the model needs, not a steer.
 */

export function productPrompt(opts: {
  brand: string;
  model: string;
  category: string;
  bestPrice: number | null;
  bestStore?: string | null;
  offersCount: number;
  locale: "en" | "fr";
}): string {
  const price =
    opts.bestPrice != null
      ? `${opts.bestPrice.toLocaleString("en-US")} DA${opts.bestStore ? ` at ${opts.bestStore}` : ""}`
      : "no live price right now";
  if (opts.locale === "fr") {
    return [
      `Je regarde cette pièce PC en Algérie : ${opts.brand} ${opts.model} (${opts.category}).`,
      `Prix actuel : ${price}, ${opts.offersCount} offre(s) listée(s). Prix en dinars (DA), paiement à la livraison, livraison 58 wilayas.`,
      `Dis-moi objectivement si c'est un bon choix, pour quel usage, et quelles alternatives comparer au même prix. Cite les compromis, pas seulement les points forts.`,
    ].join("\n");
  }
  return [
    `I am looking at this PC part in Algeria: ${opts.brand} ${opts.model} (${opts.category}).`,
    `Current price: ${price}, ${opts.offersCount} offer(s) listed. Prices in Algerian dinars (DA), cash on delivery, delivery to all 58 wilayas.`,
    `Tell me objectively whether it is a good pick, for what use case, and which alternatives to compare at the same price. Give tradeoffs, not just strengths.`,
  ].join("\n");
}

export function categoryPrompt(opts: {
  label: string;
  slug: string;
  products: number;
  cheapest: string;
  locale: "en" | "fr";
}): string {
  if (opts.locale === "fr") {
    return [
      `Je compare les ${opts.label} en Algérie (${opts.products} modèles suivis, entrée de gamme : ${opts.cheapest}).`,
      `Prix en DA, paiement à la livraison, 58 wilayas.`,
      `Explique comment choisir objectivement dans cette catégorie et quelles erreurs d'achat éviter. Ne favorise aucune marque ni boutique.`,
    ].join("\n");
  }
  return [
    `I am comparing ${opts.label} in Algeria (${opts.products} models tracked, cheapest right now: ${opts.cheapest}).`,
    `Prices in DA, cash on delivery, 58 wilayas.`,
    `Explain how to choose objectively in this category and which buying mistakes to avoid. Do not favour any brand or shop.`,
  ].join("\n");
}

export function guidePrompt(opts: { title: string; hook: string; locale: "en" | "fr" }): string {
  if (opts.locale === "fr") {
    return [
      `Je viens de lire ce guide d'achat PC en Algérie : « ${opts.title} ».`,
      `Résumé : ${opts.hook}`,
      `Conteste-le honnêtement : qu'est-ce qui est discutable, périmé ou manquant ? Donne les contre-arguments, pas un résumé flatteur.`,
    ].join("\n");
  }
  return [
    `I just read this Algeria PC buying guide: "${opts.title}".`,
    `Summary: ${opts.hook}`,
    `Push back honestly: what is debatable, outdated or missing? Give counter-arguments, not a flattering summary.`,
  ].join("\n");
}

export function builderPrompt(opts: {
  parts: string[];
  total: number | null;
  locale: "en" | "fr";
}): string {
  const list = opts.parts.length ? opts.parts.join(", ") : "no parts picked yet";
  const total = opts.total != null ? `${opts.total.toLocaleString("en-US")} DA` : "unknown total";
  if (opts.locale === "fr") {
    return [
      `Je monte un PC en Algérie. Ma config : ${list}. Total estimé : ${total} (DA, paiement à la livraison, 58 wilayas).`,
      `Vérifie objectivement la compatibilité et l'équilibre (bottleneck, alimentation, refroidissement), et propose des substitutions au même budget si quelque chose cloche.`,
    ].join("\n");
  }
  return [
    `I am building a PC in Algeria. My parts: ${list}. Estimated total: ${total} (DA, cash on delivery, 58 wilayas).`,
    `Check compatibility and balance objectively (bottleneck, PSU headroom, cooling), and suggest same-budget swaps if anything is off.`,
  ].join("\n");
}
