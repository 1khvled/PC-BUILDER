const fs = require('fs');

// Helper to patch English builder page: app/builder/page.tsx
function patchEnBuilder() {
  const filePath = 'D:/Projects/DZ-PartPicker/app/builder/page.tsx';
  let code = fs.readFileSync(filePath, 'utf8');

  // 1. Add selectedOffers state and isHydratedRef
  const stateAnchor = '  const [picks, setPicks] = useState<Record<string, string>>(DEFAULT_BUILD);';
  const stateReplacement = `  const [picks, setPicks] = useState<Record<string, string>>(DEFAULT_BUILD);
  const [selectedOffers, setSelectedOffers] = useState<Record<string, string>>({});
  const isHydratedRef = useRef(false);
  const [modalSort, setModalSort] = useState<"price-asc" | "price-desc" | "name" | "stock">("price-asc");`;

  code = code.replace(stateAnchor, stateReplacement);

  // 2. Update hydration effect to load selectedOffers and set isHydratedRef
  const mountEffectTarget = `      const localSaved = parsePicks(window.localStorage.getItem("dz_builder_picks"));
      if (localSaved) setPicks(localSaved);
    } catch {
      /* private mode etc. — stay on default */
    }
  }, []);`;

  const mountEffectReplacement = `      const localSaved = parsePicks(window.localStorage.getItem("dz_builder_picks"));
      if (localSaved) setPicks(localSaved);
      const savedOffers = JSON.parse(window.localStorage.getItem("dz_builder_offers") || "{}");
      if (savedOffers && typeof savedOffers === "object") setSelectedOffers(savedOffers);
    } catch {
      /* private mode etc. — stay on default */
    } finally {
      isHydratedRef.current = true;
    }
  }, []);`;

  code = code.replace(mountEffectTarget, mountEffectReplacement);

  // 3. Update saving effect to protect against hydration overwrite
  const saveEffectTarget = `  useEffect(() => {
    try {
      const s = serializePicks(picks);
      window.history.replaceState(null, "", s ? \`\${builderPath}?p=\${encodeURIComponent(s)}\` : builderPath);
      window.localStorage.setItem("dz_builder_picks", s);
    } catch {
      /* noop */
    }
  }, [picks, builderPath]);`;

  const saveEffectReplacement = `  useEffect(() => {
    if (!isHydratedRef.current) return;
    try {
      const s = serializePicks(picks);
      window.history.replaceState(null, "", s ? \`\${builderPath}?p=\${encodeURIComponent(s)}\` : builderPath);
      window.localStorage.setItem("dz_builder_picks", s);
      window.localStorage.setItem("dz_builder_offers", JSON.stringify(selectedOffers));
    } catch {
      /* noop */
    }
  }, [picks, selectedOffers, builderPath]);`;

  code = code.replace(saveEffectTarget, saveEffectReplacement);

  // 4. Add getSlotOffer helper and update total calculation
  const totalTarget = `  const total = useMemo(
    () => Object.values(build).reduce((s, p) => s + (bestOffer(p.id, offers)?.priceDa ?? 0), 0),
    [build, offers]
  );`;

  const totalReplacement = `  const getSlotOffer = (category: string, product: Product | undefined) => {
    if (!product) return undefined;
    const catOffers = offers.filter((o) => o.productId === product.id && !isRuptured(o));
    const allProdOffers = offers.filter((o) => o.productId === product.id);
    const chosenUrl = selectedOffers[category];
    if (chosenUrl) {
      const match = allProdOffers.find((o) => o.url === chosenUrl);
      if (match) return match;
    }
    return catOffers.length > 0 ? catOffers[0] : bestOffer(product.id, offers);
  };

  const handleSelectOffer = (category: string, offerUrl: string) => {
    setSelectedOffers((prev) => ({ ...prev, [category]: offerUrl }));
    triggerFlash(category);
    showToast(t("builder.toastOfferSelected"));
  };

  const total = useMemo(
    () => Object.entries(build).reduce((s, [cat, p]) => s + (getSlotOffer(cat, p)?.priceDa ?? 0), 0),
    [build, offers, selectedOffers]
  );`;

  code = code.replace(totalTarget, totalReplacement);

  // 5. Update handleReset to clear selectedOffers
  const resetTarget = `  const handleReset = () => {
    setPicks({});
    showToast(t("builder.toastReset"));
  };`;

  const resetReplacement = `  const handleReset = () => {
    setPicks({});
    setSelectedOffers({});
    try {
      window.localStorage.removeItem("dz_builder_picks");
      window.localStorage.removeItem("dz_builder_offers");
    } catch {}
    showToast(t("builder.toastReset"));
  };`;

  code = code.replace(resetTarget, resetReplacement);

  // 6. Add local storage reassurance badge in header
  const headerBadgeTarget = `          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {t("builder.subtitle")}
          </p>`;

  const headerBadgeReplacement = `          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {t("builder.subtitle")}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{t("builder.savedLocal")}</span>
            </span>
          </div>`;

  code = code.replace(headerBadgeTarget, headerBadgeReplacement);

  // 7. Update mobile card best offer to use getSlotOffer and offer dropdown
  const mobileOfferTarget = `            const product = build[cat.slug];
            const best = product ? bestOffer(product.id, offers) : undefined;
            const allProductOffers = product ? offers.filter((o) => o.productId === product.id) : [];
            const otherCount = allProductOffers.length - 1;
            const catLabel = categoryLabel(cat.slug, t);`;

  const mobileOfferReplacement = `            const product = build[cat.slug];
            const activeOffer = product ? getSlotOffer(cat.slug, product) : undefined;
            const best = activeOffer;
            const allProductOffers = product ? offers.filter((o) => o.productId === product.id) : [];
            const otherCount = allProductOffers.length - 1;
            const catLabel = categoryLabel(cat.slug, t);`;

  code = code.replace(mobileOfferTarget, mobileOfferReplacement);

  // Add offer dropdown in mobile view
  const mobileDropdownAnchor = `                              {otherCount > 0 && (
                                <Link
                                  href={href(\`/product/\${product.id}\`)}
                                  className="text-[10px] text-slate-400 hover:underline"
                                >
                                  {\`+\${t("common.offersCounted", { count: otherCount, plural: otherCount > 1 ? "s" : "" })}\`}
                                </Link>
                              )}`;

  const mobileDropdownReplacement = `                              {otherCount > 0 && (
                                <Link
                                  href={href(\`/product/\${product.id}\`)}
                                  className="text-[10px] text-slate-400 hover:underline"
                                >
                                  {\`+\${t("common.offersCounted", { count: otherCount, plural: otherCount > 1 ? "s" : "" })}\`}
                                </Link>
                              )}
                            </div>
                            {allProductOffers.length > 1 && (
                              <div className="pt-1.5">
                                <label htmlFor={\`mob-offer-\${cat.slug}\`} className="text-[10px] text-slate-400 font-bold block mb-1">
                                  {t("builder.pickOffer")}
                                </label>
                                <select
                                  id={\`mob-offer-\${cat.slug}\`}
                                  value={activeOffer?.url || ""}
                                  onChange={(e) => handleSelectOffer(cat.slug, e.target.value)}
                                  className="w-full text-[11px] font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded px-2 py-1.5 focus:outline-none focus:border-[#2c87c3]"
                                >
                                  {allProductOffers.map((o) => (
                                    <option key={o.url} value={o.url}>
                                      {formatPrice(o.priceDa, LOCALE)} — {o.store} ({o.wilaya}) [{o.condition === "new" ? t("common.new") : t("common.used")}]
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}`;

  code = code.replace(mobileDropdownAnchor, mobileDropdownReplacement);

  // 8. Update desktop table row to use getSlotOffer and offer dropdown
  const desktopOfferTarget = `              {CATEGORIES.map((cat, catIdx) => {
                const product = build[cat.slug];
                const best = product ? bestOffer(product.id, offers) : undefined;
                const allProductOffers = product ? offers.filter((o) => o.productId === product.id) : [];
                const otherCount = allProductOffers.length - 1;
                const catLabel = categoryLabel(cat.slug, t);`;

  const desktopOfferReplacement = `              {CATEGORIES.map((cat, catIdx) => {
                const product = build[cat.slug];
                const activeOffer = product ? getSlotOffer(cat.slug, product) : undefined;
                const best = activeOffer;
                const allProductOffers = product ? offers.filter((o) => o.productId === product.id) : [];
                const otherCount = allProductOffers.length - 1;
                const catLabel = categoryLabel(cat.slug, t);`;

  code = code.replace(desktopOfferTarget, desktopOfferReplacement);

  const desktopDropdownAnchor = `                            {otherCount > 0 && (
                              <Link
                                href={href(\`/product/\${product.id}\`)}
                                className="text-[11px] text-slate-400 hover:text-slate-600 underline print:hidden"
                              >
                                {\`+\${t("common.offersCounted", { count: otherCount, plural: otherCount > 1 ? "s" : "" })}\`}
                              </Link>
                            )}`;

  const desktopDropdownReplacement = `                            {otherCount > 0 && (
                              <Link
                                href={href(\`/product/\${product.id}\`)}
                                className="text-[11px] text-slate-400 hover:text-slate-600 underline print:hidden"
                              >
                                {\`+\${t("common.offersCounted", { count: otherCount, plural: otherCount > 1 ? "s" : "" })}\`}
                              </Link>
                            )}
                          </div>
                          {allProductOffers.length > 1 && (
                            <div className="mt-1.5 print:hidden">
                              <select
                                value={activeOffer?.url || ""}
                                onChange={(e) => handleSelectOffer(cat.slug, e.target.value)}
                                className="text-[11px] font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded px-2 py-1 focus:outline-none focus:border-[#2c87c3] max-w-[210px] truncate cursor-pointer"
                                title={t("builder.pickOffer")}
                              >
                                {allProductOffers.map((o) => (
                                  <option key={o.url} value={o.url}>
                                    {formatPrice(o.priceDa, LOCALE)} — {o.store} ({o.wilaya}) [{o.condition === "new" ? t("common.new") : t("common.used")}]
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}`;

  code = code.replace(desktopDropdownAnchor, desktopDropdownReplacement);

  // 9. Update Component Picker Modal: add sort control and apply sort
  const modalSearchTarget = `            {/* Modal Search Bar */}
            <div className="p-3 border-b border-slate-100 bg-white">
              <input
                type="text"
                value={modalSearch}
                onChange={(e) => setModalSearch(e.target.value)}
                placeholder={t("builder.modalSearchPlaceholder")}
                aria-label={t("builder.modalSearchPlaceholder")}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 min-h-[44px] text-base sm:text-xs text-slate-800 outline-none focus:border-[#2c87c3] focus:bg-white focus:shadow-[0_0_0_3px_rgba(44,135,195,0.15)] transition-all"
                autoFocus
              />
            </div>`;

  const modalSearchReplacement = `            {/* Modal Search Bar & Sorting */}
            <div className="p-3 border-b border-slate-100 bg-white flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="text"
                value={modalSearch}
                onChange={(e) => setModalSearch(e.target.value)}
                placeholder={t("builder.modalSearchPlaceholder")}
                aria-label={t("builder.modalSearchPlaceholder")}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 min-h-[44px] text-base sm:text-xs text-slate-800 outline-none focus:border-[#2c87c3] focus:bg-white focus:shadow-[0_0_0_3px_rgba(44,135,195,0.15)] transition-all"
                autoFocus
              />
              <div className="flex items-center gap-1.5 shrink-0">
                <label htmlFor="modal-sort-select" className="text-[11px] font-bold uppercase tracking-wider text-slate-400 hidden sm:inline">
                  {t("builder.sortBy")}
                </label>
                <select
                  id="modal-sort-select"
                  value={modalSort}
                  onChange={(e) => setModalSort(e.target.value as never)}
                  className="w-full sm:w-auto text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 min-h-[44px] focus:outline-none focus:border-[#2c87c3]"
                >
                  <option value="price-asc">💰 {t("builder.sortPriceAsc")}</option>
                  <option value="price-desc">💎 {t("builder.sortPriceDesc")}</option>
                  <option value="name">🔤 {t("builder.sortName")}</option>
                  <option value="stock">✓ {t("builder.sortStock")}</option>
                </select>
              </div>
            </div>`;

  code = code.replace(modalSearchTarget, modalSearchReplacement);

  // Modal sorting logic
  const modalListTarget = `            {/* Modal Product List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2.5">
              {(products.length ? products : PRODUCTS).filter((p) => p.category === activeModalCat)
                .filter((p) => {
                  if (!modalSearch.trim()) return true;
                  const q = modalSearch.toLowerCase();
                  return \`\${p.brand} \${p.model}\`.toLowerCase().includes(q);
                })
                .map((product) => {`;

  const modalListReplacement = `            {/* Modal Product List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2.5">
              {(products.length ? products : PRODUCTS).filter((p) => p.category === activeModalCat)
                .filter((p) => {
                  if (!modalSearch.trim()) return true;
                  const q = modalSearch.toLowerCase();
                  return \`\${p.brand} \${p.model}\`.toLowerCase().includes(q);
                })
                .sort((a, b) => {
                  const aBest = bestOffer(a.id, offers)?.priceDa ?? Infinity;
                  const bBest = bestOffer(b.id, offers)?.priceDa ?? Infinity;
                  const aInStock = offers.some((o) => o.productId === a.id && !isRuptured(o));
                  const bInStock = offers.some((o) => o.productId === b.id && !isRuptured(o));

                  if (modalSort === "price-asc") return aBest - bBest;
                  if (modalSort === "price-desc") return bBest - aBest;
                  if (modalSort === "name") return \`\${a.brand} \${a.model}\`.localeCompare(\`\${b.brand} \${b.model}\`);
                  if (modalSort === "stock") return (bInStock ? 1 : 0) - (aInStock ? 1 : 0) || aBest - bBest;
                  return 0;
                })
                .map((product) => {`;

  code = code.replace(modalListTarget, modalListReplacement);

  fs.writeFileSync(filePath, code, 'utf8');
  console.log("English builder page patched successfully!");
}

patchEnBuilder();
