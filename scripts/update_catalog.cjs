const fs = require('fs');

const JSON_PATH = './products.json';
const JS_DATA_PATH = './src/data/productsData.js';

// Clean pricing mapping matching net rates from images
const CORRECT_PRICES = {
  "easy-grow-gold": [
    { size: "120 GM", price: 365, oldPrice: 365, sku: "VA-EASY-GROW-GOLD-120GM", weight: "0.12kg", stockStatus: "In Stock" }
  ],
  "conference-gold-fs": [
    { size: "100 ML", price: 740, oldPrice: 740, sku: "VA-CONFERENCE-GOLD-FS-100ML", weight: "0.1kg", stockStatus: "In Stock" },
    { size: "50 ML", price: 399, oldPrice: 399, sku: "VA-CONFERENCE-GOLD-FS-50ML", weight: "0.05kg", stockStatus: "In Stock" }
  ],
  "easy-grow-sc": [
    { size: "200 ML", price: 370, oldPrice: 370, sku: "VA-EASY-GROW-SC-200ML", weight: "0.2kg", stockStatus: "In Stock" },
    { size: "100 ML", price: 245, oldPrice: 245, sku: "VA-EASY-GROW-SC-100ML", weight: "0.1kg", stockStatus: "In Stock" }
  ],
  "green-vision": [
    { size: "250 GM", price: 0, oldPrice: 0, sku: "VA-GREEN-VISION-250GM", weight: "0.25kg", stockStatus: "In Stock" },
    { size: "1 KG", price: 0, oldPrice: 0, sku: "VA-GREEN-VISION-1KG", weight: "1kg", stockStatus: "In Stock" }
  ],
  "moorqa": [
    { size: "250 GM", price: 0, oldPrice: 0, sku: "VA-MOORQA-250GM", weight: "0.25kg", stockStatus: "In Stock" },
    { size: "1 KG", price: 0, oldPrice: 0, sku: "VA-MOORQA-1KG", weight: "1kg", stockStatus: "In Stock" },
    { size: "25 KG", price: 0, oldPrice: 0, sku: "VA-MOORQA-25KG", weight: "25kg", stockStatus: "In Stock" }
  ],
  "moorqa-super": [
    { size: "1 KG", price: 0, oldPrice: 0, sku: "VA-MOORQA-SUPER-1KG", weight: "1kg", stockStatus: "In Stock" },
    { size: "25 KG", price: 0, oldPrice: 0, sku: "VA-MOORQA-SUPER-25KG", weight: "25kg", stockStatus: "In Stock" }
  ],
  "shelly": [
    { size: "400 ML", price: 1899, oldPrice: 1899, sku: "VA-SHELLY-400ML", weight: "0.4kg", stockStatus: "In Stock" }
  ],
  "master": [
    { size: "250 GM", price: 0, oldPrice: 0, sku: "VA-MASTER-250GM", weight: "0.25kg", stockStatus: "In Stock" }
  ],
  "dollar": [
    { size: "500 ML", price: 0, oldPrice: 0, sku: "VA-DOLLAR-500ML", weight: "0.5kg", stockStatus: "In Stock" }
  ],
  "woxy": [
    { size: "200 ML", price: 1399, oldPrice: 1399, sku: "VA-WOXY-200ML", weight: "0.2kg", stockStatus: "In Stock" }
  ],
  "collab": [
    { size: "250 GM", price: 850, oldPrice: 850, sku: "VA-COLLAB-250GM", weight: "0.25kg", stockStatus: "In Stock" },
    { size: "25 KG", price: 71000, oldPrice: 71000, sku: "VA-COLLAB-25KG", weight: "25kg", stockStatus: "In Stock" }
  ],
  "clay": [
    { size: "250 ML", price: 730, oldPrice: 730, sku: "VA-CLAY-250ML", weight: "0.25kg", stockStatus: "In Stock" },
    { size: "1 KG", price: 699, oldPrice: 699, sku: "VA-CLAY-1KG", weight: "1kg", stockStatus: "In Stock" }
  ],
  "farbasin": [
    { size: "2 KG", price: 1350, oldPrice: 1350, sku: "VA-FARBASIN-2KG", weight: "2kg", stockStatus: "In Stock" },
    { size: "25 KG", price: 15399, oldPrice: 15399, sku: "VA-FARBASIN-25KG", weight: "25kg", stockStatus: "In Stock" }
  ],
  "jidaar-plus": [
    { size: "80 GM", price: 510, oldPrice: 510, sku: "VA-JIDAAR-PLUS-80GM", weight: "0.08kg", stockStatus: "In Stock" }
  ],
  "tussle-extra": [
    { size: "75 GM", price: 570, oldPrice: 570, sku: "VA-TUSSLE-EXTRA-75GM", weight: "0.075kg", stockStatus: "In Stock" }
  ],
  "solid-super": [
    { size: "100 ML", price: 515, oldPrice: 515, sku: "VA-SOLID-SUPER-100ML", weight: "0.1kg", stockStatus: "In Stock" }
  ],
  "solid-32": [
    { size: "200 ML", price: 699, oldPrice: 699, sku: "VA-SOLID-32-200ML", weight: "0.2kg", stockStatus: "In Stock" }
  ],
  "tussle-70": [
    { size: "400 GM", price: 870, oldPrice: 870, sku: "VA-TUSSLE-70-400GM", weight: "0.4kg", stockStatus: "In Stock" },
    { size: "25 KG", price: 47000, oldPrice: 47000, sku: "VA-TUSSLE-70-25KG", weight: "25kg", stockStatus: "In Stock" }
  ],
  "work-15": [
    { size: "500 ML", price: 1100, oldPrice: 1100, sku: "VA-WORK-15-500ML", weight: "0.5kg", stockStatus: "In Stock" }
  ],
  "horizon-90": [
    { size: "300 ML", price: 780, oldPrice: 780, sku: "VA-HORIZON-90-300ML", weight: "0.3kg", stockStatus: "In Stock" }
  ],
  "douhaa-335": [
    { size: "750 ML", price: 1199, oldPrice: 1199, sku: "VA-DOUHAA-335-750ML", weight: "0.75kg", stockStatus: "In Stock" }
  ],
  "douha-1": [
    { size: "500 ML", price: 550, oldPrice: 550, sku: "VA-DOUHA-1-500ML", weight: "0.5kg", stockStatus: "In Stock" }
  ],
  "douha-extra": [
    { size: "400 GM", price: 870, oldPrice: 870, sku: "VA-DOUHA-EXTRA-400GM", weight: "0.4kg", stockStatus: "In Stock" }
  ],
  "douha": [
    { size: "1 LTR", price: 1250, oldPrice: 1250, sku: "VA-DOUHA-1LTR", weight: "1kg", stockStatus: "In Stock" }
  ],
  "nafiz": [
    { size: "1 LTR", price: 1050, oldPrice: 1050, sku: "VA-NAFIZ-1LTR", weight: "1kg", stockStatus: "In Stock" }
  ],
  "douha-plus": [
    { size: "35 ML", price: 999, oldPrice: 999, sku: "VA-DOUHA-PLUS-35ML", weight: "0.035kg", stockStatus: "In Stock" }
  ],
  "deft": [
    { size: "40 GM", price: 0, oldPrice: 0, sku: "VA-DEFT-40GM", weight: "0.04kg", stockStatus: "In Stock" }
  ],
  "taleb": [
    { size: "360 ML", price: 0, oldPrice: 0, sku: "VA-TALEB-360ML", weight: "0.36kg", stockStatus: "In Stock" }
  ],
  "genny": [
    { size: "1 LTR", price: 1030, oldPrice: 1030, sku: "VA-GENNY-1LTR", weight: "1kg", stockStatus: "In Stock" }
  ],
  "vital-gold-plus": [
    { size: "350 ML", price: 0, oldPrice: 0, sku: "VA-VITAL-GOLD-PLUS-350ML", weight: "0.35kg", stockStatus: "In Stock" }
  ],
  "genny-ultra": [
    { size: "1 KG", price: 0, oldPrice: 0, sku: "VA-GENNY-ULTRA-1KG", weight: "1kg", stockStatus: "In Stock" },
    { size: "500 GM", price: 0, oldPrice: 0, sku: "VA-GENNY-ULTRA-500GM", weight: "0.5kg", stockStatus: "In Stock" }
  ],
  "faalq-extra": [
    { size: "100 GM", price: 740, oldPrice: 740, sku: "VA-FAALQ-EXTRA-100GM", weight: "0.1kg", stockStatus: "In Stock" }
  ],
  "faalq-30": [
    { size: "100 GM", price: 699, oldPrice: 699, sku: "VA-FAALQ-30-100GM", weight: "0.1kg", stockStatus: "In Stock" }
  ],
  "saar": [
    { size: "350 GM", price: 780, oldPrice: 780, sku: "VA-SAAR-350GM", weight: "0.35kg", stockStatus: "In Stock" }
  ],
  "tokyo-6": [
    { size: "100 GM", price: 0, oldPrice: 0, sku: "VA-TOKYO-6-100GM", weight: "0.1kg", stockStatus: "In Stock" }
  ],
  "work-extra": [
    { size: "20 GM", price: 0, oldPrice: 0, sku: "VA-WORK-EXTRA-20GM", weight: "0.02kg", stockStatus: "In Stock" }
  ],
  "vital-gold": [
    { size: "350 ML", price: 0, oldPrice: 0, sku: "VA-VITAL-GOLD-350ML", weight: "0.35kg", stockStatus: "In Stock" }
  ],
  "yelowex-super": [
    { size: "800 ML", price: 1060, oldPrice: 1060, sku: "VA-YELOWEX-SUPER-800ML", weight: "0.8kg", stockStatus: "In Stock" }
  ],
  "yelowex": [
    { size: "1 LTR", price: 1350, oldPrice: 1350, sku: "VA-YELOWEX-1LTR", weight: "1kg", stockStatus: "In Stock" }
  ],
  "mission-gold": [
    { size: "6 KG", price: 0, oldPrice: 0, sku: "VA-MISSION-GOLD-6KG", weight: "6kg", stockStatus: "In Stock" }
  ],
  "super-4g": [
    { size: "8 KG", price: 1250, oldPrice: 1250, sku: "VA-SUPER-4G-8KG", weight: "8kg", stockStatus: "In Stock" }
  ],
  "aaqab": [
    { size: "400 ML", price: 599, oldPrice: 599, sku: "VA-AAQAB-400ML", weight: "0.4kg", stockStatus: "In Stock" }
  ],
  "accewait": [
    { size: "250 GM", price: 660, oldPrice: 660, sku: "VA-ACCEWAIT-250GM", weight: "0.25kg", stockStatus: "In Stock" }
  ],
  "advance-26": [
    { size: "150 GM", price: 399, oldPrice: 399, sku: "VA-ADVANCE-26-150GM", weight: "0.15kg", stockStatus: "In Stock" }
  ],
  "brinkozen": [
    { size: "500 ML", price: 799, oldPrice: 799, sku: "VA-BRINKOZEN-500ML", weight: "0.5kg", stockStatus: "In Stock" },
    { size: "1 LTR", price: 1480, oldPrice: 1480, sku: "VA-BRINKOZEN-1LTR", weight: "1kg", stockStatus: "In Stock" }
  ],
  "data": [
    { size: "200 ML", price: 899, oldPrice: 899, sku: "VA-DATA-200ML", weight: "0.2kg", stockStatus: "In Stock" }
  ],
  "bi-metic": [
    { size: "400 ML", price: 720, oldPrice: 720, sku: "VA-BI-METIC-400ML", weight: "0.4kg", stockStatus: "In Stock" }
  ],
  "conference-25": [
    { size: "200 GM", price: 430, oldPrice: 430, sku: "VA-CONFERENCE-25-200GM", weight: "0.2kg", stockStatus: "In Stock" }
  ],
  "cloromac-gold": [
    { size: "200 ML", price: 950, oldPrice: 950, sku: "VA-CLOROMAC-GOLD-200ML", weight: "0.2kg", stockStatus: "In Stock" }
  ],
  "cloromac-plus": [
    { size: "350 GM", price: 0, oldPrice: 0, sku: "VA-CLOROMAC-PLUS-350GM", weight: "0.35kg", stockStatus: "In Stock" }
  ],
  "conference": [
    { size: "240 ML", price: 0, oldPrice: 0, sku: "VA-CONFERENCE-240ML", weight: "0.24kg", stockStatus: "In Stock" }
  ],
  "code-10": [
    { size: "1 LTR", price: 1060, oldPrice: 1060, sku: "VA-CODE-10-1LTR", weight: "1kg", stockStatus: "In Stock" }
  ],
  "dr-pp": [
    { size: "75 ML", price: 520, oldPrice: 520, sku: "VA-DR-PP-75ML", weight: "0.075kg", stockStatus: "In Stock" },
    { size: "150 ML", price: 899, oldPrice: 899, sku: "VA-DR-PP-150ML", weight: "0.15kg", stockStatus: "In Stock" }
  ],
  "diffa-gold-plus": [
    { size: "200 ML", price: 799, oldPrice: 799, sku: "VA-DIFFA-GOLD-PLUS-200ML", weight: "0.2kg", stockStatus: "In Stock" },
    { size: "400 ML", price: 1480, oldPrice: 1480, sku: "VA-DIFFA-GOLD-PLUS-400ML", weight: "0.4kg", stockStatus: "In Stock" }
  ],
  "fly-over-gold": [
    { size: "60 GM", price: 799, oldPrice: 799, sku: "VA-FLY-OVER-GOLD-60GM", weight: "0.06kg", stockStatus: "In Stock" },
    { size: "120 GM", price: 1520, oldPrice: 1520, sku: "VA-FLY-OVER-GOLD-120GM", weight: "0.12kg", stockStatus: "In Stock" }
  ],
  "gt-warrior-super": [
    { size: "150 GM", price: 499, oldPrice: 499, sku: "VA-GT-WARRIOR-SUPER-150GM", weight: "0.15kg", stockStatus: "In Stock" },
    { size: "1 LTR", price: 970, oldPrice: 970, sku: "VA-GT-WARRIOR-SUPER-1LTR", weight: "1kg", stockStatus: "In Stock" }
  ],
  "gt-warrior": [
    { size: "200 ML", price: 310, oldPrice: 310, sku: "VA-GT-WARRIOR-200ML", weight: "0.2kg", stockStatus: "In Stock" },
    { size: "400 ML", price: 470, oldPrice: 470, sku: "VA-GT-WARRIOR-400ML", weight: "0.4kg", stockStatus: "In Stock" }
  ],
  "gorajin": [
    { size: "80 GM", price: 840, oldPrice: 840, sku: "VA-GORAJIN-80GM", weight: "0.08kg", stockStatus: "In Stock" },
    { size: "40 GM", price: 470, oldPrice: 470, sku: "VA-GORAJIN-40GM", weight: "0.04kg", stockStatus: "In Stock" }
  ],
  "hallin": [
    { size: "200 ML", price: 310, oldPrice: 310, sku: "VA-HALLIN-200ML", weight: "0.2kg", stockStatus: "In Stock" },
    { size: "400 ML", price: 499, oldPrice: 499, sku: "VA-HALLIN-400ML", weight: "0.4kg", stockStatus: "In Stock" },
    { size: "1 LTR", price: 1099, oldPrice: 1099, sku: "VA-HALLIN-1LTR", weight: "1kg", stockStatus: "In Stock" }
  ],
  "jidaar-80": [
    { size: "250 GM", price: 0, oldPrice: 0, sku: "VA-JIDAAR-80-250GM", weight: "0.25kg", stockStatus: "In Stock" }
  ],
  "lykodaa": [
    { size: "250 ML", price: 330, oldPrice: 330, sku: "VA-LYKODAA-250ML", weight: "0.25kg", stockStatus: "In Stock" },
    { size: "500 ML", price: 510, oldPrice: 510, sku: "VA-LYKODAA-500ML", weight: "0.5kg", stockStatus: "In Stock" },
    { size: "1 LTR", price: 899, oldPrice: 899, sku: "VA-LYKODAA-1LTR", weight: "1kg", stockStatus: "In Stock" }
  ],
  "mission-extra": [
    { size: "480 ML", price: 835, oldPrice: 835, sku: "VA-MISSION-EXTRA-480ML", weight: "0.48kg", stockStatus: "In Stock" }
  ],
  "purifizin": [
    { size: "900 GM", price: 1199, oldPrice: 1199, sku: "VA-PURIFIZIN-900GM", weight: "0.9kg", stockStatus: "In Stock" }
  ],
  "peso-gold": [
    { size: "500 ML", price: 850, oldPrice: 850, sku: "VA-PESO-GOLD-500ML", weight: "0.5kg", stockStatus: "In Stock" }
  ],
  "peso-gold-plus": [
    { size: "200 GM", price: 570, oldPrice: 570, sku: "VA-PESO-GOLD-PLUS-200GM", weight: "0.2kg", stockStatus: "In Stock" }
  ],
  "pushup": [
    { size: "48 GM", price: 230, oldPrice: 230, sku: "VA-PUSHUP-48GM", weight: "0.048kg", stockStatus: "In Stock" }
  ],
  "josh": [
    { size: "80 GM", price: 699, oldPrice: 699, sku: "VA-JOSH-80GM", weight: "0.08kg", stockStatus: "In Stock" }
  ],
  "sonami": [
    { size: "150 ML", price: 1899, oldPrice: 1899, sku: "VA-SONAMI-150ML", weight: "0.15kg", stockStatus: "In Stock" }
  ],
  "super-killer": [
    { size: "100 ML", price: 499, oldPrice: 499, sku: "VA-SUPER-KILLER-100ML", weight: "0.1kg", stockStatus: "In Stock" }
  ],
  "tallons-super": [
    { size: "800 ML", price: 1199, oldPrice: 1199, sku: "VA-TALLONS-SUPER-800ML", weight: "0.8kg", stockStatus: "In Stock" }
  ],
  "thorax": [
    { size: "200 ML", price: 430, oldPrice: 430, sku: "VA-THORAX-200ML", weight: "0.2kg", stockStatus: "In Stock" }
  ],
  "fe-fa": [
    { size: "150 ML", price: 660, oldPrice: 660, sku: "VA-FE-FA-150ML", weight: "0.15kg", stockStatus: "In Stock" }
  ],
  "faalq-gold": [
    { size: "600 ML", price: 1730, oldPrice: 1730, sku: "VA-FAALQ-GOLD-600ML", weight: "0.6kg", stockStatus: "In Stock" }
  ],
  "unit": [
    { size: "250 ML", price: 810, oldPrice: 810, sku: "VA-UNIT-250ML", weight: "0.25kg", stockStatus: "In Stock" }
  ],
  "ultra-nanoo": [
    { size: "50 GM", price: 340, oldPrice: 340, sku: "VA-ULTRA-NANOO-50GM", weight: "0.05kg", stockStatus: "In Stock" }
  ],
  "defeater-potassium-humate": [
    { size: "4 LTR", price: 740, oldPrice: 740, sku: "VA-DEFEATER-POTASSIUM-HUMATE-4LTR", weight: "4kg", stockStatus: "In Stock" },
    { size: "20 LTR", price: 3599, oldPrice: 3599, sku: "VA-DEFEATER-POTASSIUM-HUMATE-20LTR", weight: "20kg", stockStatus: "In Stock" },
    { size: "200 LTR", price: 32200, oldPrice: 32200, sku: "VA-DEFEATER-POTASSIUM-HUMATE-200LTR", weight: "200kg", stockStatus: "In Stock" }
  ],
  "fatty": [
    { size: "500 ML", price: 750, oldPrice: 750, sku: "VA-FATTY-500ML", weight: "0.5kg", stockStatus: "In Stock" }
  ],
  "output": [
    { size: "2 KG", price: 1510, oldPrice: 1510, sku: "VA-OUTPUT-2KG", weight: "2kg", stockStatus: "In Stock" },
    { size: "8 KG", price: 1999, oldPrice: 1999, sku: "VA-OUTPUT-8KG", weight: "8kg", stockStatus: "In Stock" },
    { size: "20 KG", price: 4600, oldPrice: 4600, sku: "VA-OUTPUT-20KG", weight: "20kg", stockStatus: "In Stock" }
  ],
  "setting-npk": [
    { size: "1 KG", price: 699, oldPrice: 699, sku: "VA-SETTING-NPK-1KG", weight: "1kg", stockStatus: "In Stock" },
    { size: "25 KG", price: 15230, oldPrice: 15230, sku: "VA-SETTING-NPK-25KG", weight: "25kg", stockStatus: "In Stock" }
  ],
  "sector": [
    { size: "4 KG", price: 1050, oldPrice: 1050, sku: "VA-SECTOR-4KG", weight: "4kg", stockStatus: "In Stock" },
    { size: "50 KG", price: 0, oldPrice: 0, sku: "VA-SECTOR-50KG", weight: "50kg", stockStatus: "In Stock" }
  ],
  "sonehri-potash-30": [
    { size: "1 LTR", price: 970, oldPrice: 970, sku: "VA-SONEHRI-POTASH-30-1LTR", weight: "1kg", stockStatus: "In Stock" }
  ],
  "sonehri-potash": [
    { size: "3 LTR", price: 1900, oldPrice: 1900, sku: "VA-SONEHRI-POTASH-3LTR", weight: "3kg", stockStatus: "In Stock" },
    { size: "20 LTR", price: 11930, oldPrice: 11930, sku: "VA-SONEHRI-POTASH-20LTR", weight: "20kg", stockStatus: "In Stock" },
    { size: "200 LTR", price: 117500, oldPrice: 117500, sku: "VA-SONEHRI-POTASH-200LTR", weight: "200kg", stockStatus: "In Stock" }
  ],
  "vac-zinc": [
    { size: "3 LTR", price: 850, oldPrice: 850, sku: "VA-VAC-ZINC-3LTR", weight: "3kg", stockStatus: "In Stock" },
    { size: "20 LTR", price: 4550, oldPrice: 4550, sku: "VA-VAC-ZINC-20LTR", weight: "20kg", stockStatus: "In Stock" },
    { size: "200 LTR", price: 45000, oldPrice: 45000, sku: "VA-VAC-ZINC-200LTR", weight: "200kg", stockStatus: "In Stock" }
  ],
  "vital-phos": [
    { size: "10 LTR", price: 6650, oldPrice: 6650, sku: "VA-VITAL-PHOS-10LTR", weight: "10kg", stockStatus: "In Stock" },
    { size: "20 LTR", price: 12999, oldPrice: 12999, sku: "VA-VITAL-PHOS-20LTR", weight: "20kg", stockStatus: "In Stock" }
  ],
  "vac": [
    { size: "1 LTR", price: 840, oldPrice: 840, sku: "VA-VAC-1LTR", weight: "1kg", stockStatus: "In Stock" }
  ],};

// Aliases mapping in case they are spelled differently in the source database
const KEY_ALIASES = {};

const MISSING_PRODUCT_TEMPLATES = {
  "easy-grow-gold": {
    "name": { "en": "EASY GROW GOLD - 12%WP", "ur": "ایزی گرو گولڈ" },
    "genericName": { "en": "DIFENOCONAZL + VALIDAMYCIN", "ur": "DIFENOCONAZL + VALIDAMYCIN" },
    "category": "seed-treatment",
    "tagline": "DIFENOCONAZL + VALIDAMYCIN — Advanced Seed Protection",
    "activeIngredient": "DIFENOCONAZL + VALIDAMYCIN",
    "formulation": "DIFENOCONAZL + VALIDAMYCIN",
    "shortDesc": { "en": "Premium seed treatment compound for complete protection against soil-borne and seed-borne diseases.", "ur": "بیج کی صفائی اور صحت مند بڑھوتری کے لیے بہترین فارمولا جو بیماریوں سے بچاتا ہے۔" }
  },
  "jidaar-plus": {
    "name": { "en": "JIDAAR PLUS - 50% WDG", "ur": "جدار پلس" },
    "genericName": { "en": "CLOTHIANIDIN", "ur": "CLOTHIANIDIN" },
    "category": "fungicide",
    "tagline": "Advanced Systemic Fungicide Protection",
    "activeIngredient": "CLOTHIANIDIN",
    "formulation": "CLOTHIANIDIN",
    "shortDesc": { "en": "Premium systemic protection for controlling sucking pests and fungal root incursions.", "ur": "سسٹمک پروٹیکشن جو پودے کی جڑوں کو فنگس اور کیڑوں سے محفوظ رکھتی ہے۔" }
  },
  "douha-1": {
    "name": { "en": "DOUHA-1 38% SC", "ur": "دوہا 1" },
    "genericName": { "en": "ATRAZINE 38% SC", "ur": "ATRAZINE 38% SC" },
    "category": "herbicide",
    "tagline": "Selective Pre & Early Post-Emergence Herbicide",
    "activeIngredient": "ATRAZINE 38% SC",
    "formulation": "ATRAZINE 38% SC",
    "shortDesc": { "en": "Eradicates broadleaf weeds in sugarcane and maize crops before and after germination.", "ur": "مکئی اور کماد کی جڑی بوٹیوں کے خاتمے کے لیے بہترین حفاظتی اسپرے۔" }
  },
  "douha-extra": {
    "name": { "en": "DOUHA EXTRA - 50% WP", "ur": "دوہا ایکسٹرا" },
    "genericName": { "en": "ATRAZINE + MESOTRIONE 50% WP", "ur": "ATRAZINE + MESOTRIONE 50% WP" },
    "category": "herbicide",
    "tagline": "Broad-Spectrum Weed Eliminator for Corn",
    "activeIngredient": "ATRAZINE + MESOTRIONE 50% WP",
    "formulation": "ATRAZINE + MESOTRIONE 50% WP",
    "shortDesc": { "en": "Controls major annual weeds in maize crops with excellent crop safety.", "ur": "مکئی کی فصل میں مختلف خود رو جڑی بوٹیوں کو تلف کرنے والا طاقتور فارمولا۔" }
  },
  "douha": {
    "name": { "en": "DOUHA - 55% SC", "ur": "دوہا" },
    "genericName": { "en": "ATRAZINE + MESOTRIONE 55% SC", "ur": "ATRAZINE + MESOTRIONE 55% SC" },
    "category": "herbicide",
    "tagline": "Advanced Liquid Herbicide for Maize Crops",
    "activeIngredient": "ATRAZINE + MESOTRIONE 55% SC",
    "formulation": "ATRAZINE + MESOTRIONE 55% SC",
    "shortDesc": { "en": "Highly effective pre and post emergence selective weed control system.", "ur": "جڑی بوٹیوں کے اگنے سے پہلے اور بعد کے لیے ایک پائیدار اور موثر حل۔" }
  },
  "genny": {
    "name": { "en": "GENNY - 48% SL", "ur": "جینی" },
    "genericName": { "en": "GLYPHOSATE 48% SL", "ur": "GLYPHOSATE 48% SL" },
    "category": "herbicide",
    "tagline": "Non-Selective Systemic Herbicide",
    "activeIngredient": "GLYPHOSATE 48% SL",
    "formulation": "GLYPHOSATE 48% SL",
    "shortDesc": { "en": "Controls annual and perennial weeds in orchards, non-crop areas, and zero-tillage fields.", "ur": "باغات اور خالی زمینوں کی ضدی جڑی بوٹیوں کو جڑ سے ختم کرنے والا سسٹمک سپرے۔" }
  },
  "vital-gold": {
    "name": { "en": "VITAL GOLD - 50% EC", "ur": "وائٹل گولڈ" },
    "genericName": { "en": "FLUROXYPYR MEPTYL + MCPA", "ur": "FLUROXYPYR MEPTYL + MCPA" },
    "category": "herbicide",
    "tagline": "Post-Emergence Broadleaf Weed Specialist",
    "activeIngredient": "FLUROXYPYR MEPTYL + MCPA",
    "formulation": "FLUROXYPYR MEPTYL + MCPA",
    "shortDesc": { "en": "Kills broadleaf weeds in wheat, corn, and grain crops with high efficiency.", "ur": "گندم اور اناج کی فصلوں میں چوڑے پتے والی جڑی بوٹیوں کو جڑ سے اکھاڑنے کا ماہر۔" }
  },
  "yelowex": {
    "name": { "en": "YELOWEX - 33% EC", "ur": "ییلو ویکس" },
    "genericName": { "en": "PENDIMETHALIN 33% EC", "ur": "PENDIMETHALIN 33% EC" },
    "category": "herbicide",
    "tagline": "Pre-Emergence Blanket Control Herbicide",
    "activeIngredient": "PENDIMETHALIN 33% EC",
    "formulation": "PENDIMETHALIN 33% EC",
    "shortDesc": { "en": "Formulates a chemical shield on soil to prevent weed germination in cotton, rice, and vegetables.", "ur": "کپاس، کپاہ اور سبزیوں میں جڑی بوٹیوں کو اگنے سے روکنے والا بہترین پری ایمرجنس اسپرے۔" }
  },
  "gt-warrior-super": {
    "name": { "en": "GT WARRIOR SUPER -10% SC", "ur": "جی ٹی واریئر سُپر" },
    "genericName": { "en": "EMAMECTIN + LUFENURON", "ur": "EMAMECTIN + LUFENURON" },
    "category": "insecticide",
    "tagline": "Dual Action Premium Insecticide",
    "activeIngredient": "EMAMECTIN + LUFENURON",
    "formulation": "EMAMECTIN + LUFENURON",
    "shortDesc": { "en": "Eradicates chewing caterpillars and armyworms instantly with long residual control.", "ur": "فوجی سنڈی اور چبانے والے کیڑوں کا فوراً اور دیرپا خاتمہ کرنے والا دہرا فارمولا۔" }
  },
  "gt-warrior": {
    "name": { "en": "GT WARRIOR - 3% SC", "ur": "جی ٹی واریئر" },
    "genericName": { "en": "EMAMECTIN BENZOATE", "ur": "EMAMECTIN BENZOATE" },
    "category": "insecticide",
    "tagline": "Trusted Insect Protection System",
    "activeIngredient": "EMAMECTIN BENZOATE",
    "formulation": "EMAMECTIN BENZOATE",
    "shortDesc": { "en": "Controls bollworms and chewing pests with quick knockdown actions.", "ur": "چبانے والے کیڑوں اور سنڈیوں کو سیکنڈوں میں ختم کرنے والی موثر دوا۔" }
  },
  "hallin": {
    "name": { "en": "HALLIN - 5% EC", "ur": "ہیلن" },
    "genericName": { "en": "LUFENURON", "ur": "LUFENURON" },
    "category": "insecticide",
    "tagline": "Chitin Synthesis Inhibitor for Caterpillars",
    "activeIngredient": "LUFENURON",
    "formulation": "LUFENURON",
    "shortDesc": { "en": "Disrupts the growth cycle of caterpillars and chewing pests inside vegetables and cotton crops.", "ur": "کیڑوں کی نشوونما روکنے اور ان کا مستقل خاتمہ کرنے والا چٹن بلاکر۔" }
  },
  "faalq-gold": {
    "name": { "en": "FAALQ GOLD 6% OD", "ur": "فالکن گولڈ" },
    "genericName": { "en": "BISPYRIBAC SODIUM 6% OD", "ur": "BISPYRIBAC SODIUM 6% OD" },
    "category": "herbicide",
    "tagline": "Advanced Post-Emergence Herbicide for Rice",
    "activeIngredient": "BISPYRIBAC SODIUM 6% OD",
    "formulation": "BISPYRIBAC SODIUM 6% OD",
    "shortDesc": { "en": "Cleans broadleaf, grassy, and sedge weeds from rice fields in a single application.", "ur": "دھان کی فصل سے جڑی بوٹیوں کو ختم کرنے کا جدید آئل بیسڈ فارمولا۔" }
  },
  "sonehri-potash": {
    "name": { "en": "SONERI - 30%", "ur": "سنہری پوٹاش" },
    "genericName": { "en": "POTASSIUM SULFATE (FERTIGATION)", "ur": "POTASSIUM SULFATE (FERTIGATION)" },
    "category": "plant-nutrition",
    "tagline": "Premium Fertigation Grade Liquid Potash",
    "activeIngredient": "POTASSIUM SULFATE (FERTIGATION)",
    "formulation": "POTASSIUM SULFATE (FERTIGATION)",
    "shortDesc": { "en": "Specially formulated fertigation grade potash for rapid plant absorption and crop weight enrichment.", "ur": "فصل کے سائز اور وزن کو بڑھانے کے لیے آبپاشی کے ذریعے استعمال ہونے والا مائع پوٹاش۔" }
  },
  "vac": {
    "name": { "en": "VAC (8:8:6)", "ur": "ویک" },
    "genericName": { "en": "LIQUID NPK 8:8:6", "ur": "LIQUID NPK 8:8:6" },
    "category": "plant-nutrition",
    "tagline": "Balanced Liquid NPK Supplement",
    "activeIngredient": "LIQUID NPK 8:8:6",
    "formulation": "LIQUID NPK 8:8:6",
    "shortDesc": { "en": "Provides perfectly balanced nitrogen, phosphorus, and potassium ratios for vegetative boost.", "ur": "پودوں کی بنیادی غذائی ضروریات پوری کرنے کے لیے متوازن مائع کھاد۔" }
  },};

const BASE_PRODUCT_TEMPLATE = {
  "imageUrl": "",
  "pngUrl": "",
  "rating": 4.8,
  "importedFormulaBadge": true,
  "premiumProductBadge": true,
  "researchBasedBadge": true,
  "seoTitle": "",
  "seoDescription": "",
  "packaging": "",
  "productCode": "",
  "status": {
    "en": "Premium Quality Compound",
    "ur": "اعلیٰ معیار کا مرکب"
  },
  "description": {
    "en": "Premium agrochemical compound designed under strict international quality controls to maximize your crop yields and ensure complete plant protection.",
    "ur": "پودے کی بہترین نشوونما اور تحفظ کے لیے عالمی معیار کے مطابق تیار کیا گیا مرکب جو فصل کی پیداوار بڑھاتا ہے۔"
  },
  "features": {
    "en": [
      "Ensures robust crop vigor and health",
      "Increases crop survival and yield capacity",
      "Strengthens defense mechanism of the plant"
    ],
    "ur": [
      "فصل کی بہترین نشوونما اور صحت کو یقینی بناتا ہے",
      "پیداواری صلاحیت اور قوت مدافعت کو بڑھاتا ہے",
      "پودے کے دفاعی نظام کو مضبوط کرتا ہے"
    ]
  },
  "crops": [
    { "name": { "en": "Cotton", "ur": "کپاس" }, "icon": "🌱" },
    { "name": { "en": "Rice", "ur": "دھان" }, "icon": "🌾" },
    { "name": { "en": "Maize", "ur": "مکئی" }, "icon": "🌽" },
    { "name": { "en": "Wheat", "ur": "گندم" }, "icon": "🌾" }
  ]
};

function run() {
  console.log('Reading products.json...');
  const productsJson = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));

  // Read productsData.js and overwrite PRODUCTS_DATA
  let jsContent = fs.readFileSync(JS_DATA_PATH, 'utf8');
  
  // Find where export const PRODUCTS_DATA = { starts
  const startIndex = jsContent.indexOf('export const PRODUCTS_DATA = {');
  if (startIndex === -1) {
    throw new Error('Could not find PRODUCTS_DATA export in productsData.js');
  }

  const header = jsContent.substring(0, startIndex);
  const newProductsBlock = 'export const PRODUCTS_DATA = ' + JSON.stringify(productsJson, null, 2) + ';\n';
  
  fs.writeFileSync(JS_DATA_PATH, header + newProductsBlock);
  console.log('Successfully updated productsData.js with new pricing & new products!');
}

run();
