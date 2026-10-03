const fs = require('fs');

const enPath = 'D:/Projects/DZ-PartPicker/lib/i18n/dictionaries/en.ts';
const frPath = 'D:/Projects/DZ-PartPicker/lib/i18n/dictionaries/fr.ts';

let en = fs.readFileSync(enPath, 'utf8');
let fr = fs.readFileSync(frPath, 'utf8');

const enNewKeys = `  "builder.savedLocal": "Saved locally in your browser (private)",
  "builder.pickOffer": "Store offer:",
  "builder.allOffers": "All store offers ({count})",
  "builder.sortBy": "Sort by:",
  "builder.sortPriceAsc": "Price: Low to High",
  "builder.sortPriceDesc": "Price: High to Low",
  "builder.sortName": "Name (A-Z)",
  "builder.sortStock": "In Stock First",
  "builder.toastOfferSelected": "Store offer selected & saved.",
`;

const frNewKeys = `  "builder.savedLocal": "Sauvegardé localement dans votre navigateur (privé)",
  "builder.pickOffer": "Offre boutique :",
  "builder.allOffers": "Toutes les offres ({count})",
  "builder.sortBy": "Trier par :",
  "builder.sortPriceAsc": "Prix : Moins cher",
  "builder.sortPriceDesc": "Prix : Plus cher",
  "builder.sortName": "Nom (A-Z)",
  "builder.sortStock": "En stock d'abord",
  "builder.toastOfferSelected": "Offre boutique sélectionnée et enregistrée.",
`;

en = en.replace(`  "builder.toastDefault": "Reference gaming build loaded.",`, `  "builder.toastDefault": "Reference gaming build loaded.",\n${enNewKeys}`);
fr = fr.replace(`  "builder.toastDefault": "Build gamer de référence chargé.",`, `  "builder.toastDefault": "Build gamer de référence chargé.",\n${frNewKeys}`);

fs.writeFileSync(enPath, en, 'utf8');
fs.writeFileSync(frPath, fr, 'utf8');

console.log("Builder dictionary keys added to en.ts and fr.ts!");
