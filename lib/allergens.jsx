export const ALLERGEN_MAP = {
  // FDA allergens
  milk: "Milk",
  egg: "Eggs",
  fish: "Fish",
  shellfish: "Crustacean Shellfish",
  wheat: "Wheat",
  soybeans: "Soy",
  soy: "Soy",
  peanut: "Peanuts",
  sesame: "Sesame",
  tree_nuts: "Tree Nuts",

  // EU allergens
  celery: "Celery",
  mustard: "Mustard",
  lupin: "Lupin",
  molluscs: "Mollusks",
  sulphites: "Sulfites",
  sulfites: "Sulfites",
  gluten: "Gluten",

  // OFF internal categories
  nuts: "Tree Nuts",
  eggs: "Eggs",
  milk_products: "Milk",
  crustaceans: "Crustacean Shellfish",
  mollusks: "Mollusks",
};

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function normalizeOffAllergen(tag) {
  if (!tag) return null;
  const key = tag.replace(/^.*:/, "").toLowerCase(); 
  return ALLERGEN_MAP[key] || capitalize(key);
}

export const ALLERGEN_KEYWORDS = [
  "milk", "casein", "whey", "cheese", "cream", "lactose",
  "egg", "albumin",
  "fish", "salmon", "tuna", "cod",
  "crab", "shrimp", "lobster", "shellfish",
  "peanut",
  "almond", "walnut", "pecan", "cashew", "hazelnut", "pistachio",
  "wheat", "barley", "rye", "malt", "gluten",
  "soy", "soybean", "tofu", "miso", "edamame", "soy lecithin",
  "sesame", "tahini",
  "mustard",
  "celery",
  "lupin",
  "sulfites", "sulphites",
  "molluscs", "mollusks",
];

export function detectAllergensFromIngredients(text = "") {
  const lower = text.toLowerCase();
  const found = ALLERGEN_KEYWORDS.filter((word) => lower.includes(word));
  return found.map(normalizeOffAllergen);
}

export function mergeAllergens(offTags = [], detected = []) {
  const normalized = [
    ...offTags.map(normalizeOffAllergen),
    ...detected,
  ];

  return Array.from(new Set(normalized.filter(Boolean)));
}
