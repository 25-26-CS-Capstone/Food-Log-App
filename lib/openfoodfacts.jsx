const TIMEOUT_MS = 15000;
const MAX_RETRIES = 3;
export const PAGE_SIZE = 20;

// Update this string to something unique for your app
const USER_AGENT = "MyDietLogApp - React Native - Version 1.0 - Contact: your@email.com";

const fetchWithTimeout = (url, ms) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  
  return fetch(url, { 
    signal: controller.signal,
    headers: {
      'User-Agent': USER_AGENT, // This is the most important fix
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  }).finally(() => clearTimeout(timer));
};

const SEARCH_URLS = (query, page) => [
  // Primary: The official Search API v2
  `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page=${page}&page_size=${PAGE_SIZE}&fields=code,product_name,product_name_en,brands,ingredients_text,ingredients_text_en,allergens_tags,nutriments`,
  `https://world.openfoodfacts.org/api/v2/search?categories_tags_en=${encodeURIComponent(query)}&page=${page}&page_size=${PAGE_SIZE}&json=1&fields=code,product_name,product_name_en,brands,ingredients_text,ingredients_text_en,allergens_tags,nutriments`,
  // Fallback: The standard search terms query
];

/* ---------------- RELEVANCE FILTER & SCORER ---------------- */

function scoreProduct(product, query) {
  const name = (product.product_name_en || product.product_name || '').toLowerCase().trim();
  const brand = (product.brands || '').toLowerCase().trim();
  const ingredients = (product.ingredients_text_en || product.ingredients_text || '').toLowerCase();
  const q = query.toLowerCase().trim();
  const qWords = q.split(/\s+/);

  if (!name && !ingredients) return -1;

  const searchableText = `${name} ${brand} ${ingredients}`;
  const nameMatchCount = qWords.filter((w) => searchableText.includes(w)).length;

  if (nameMatchCount === 0) return -1;

  let score = 0;
  if (name === q) score += 100;
  if (name.startsWith(q)) score += 50;
  if (name.includes(q)) score += 30;
  score += (nameMatchCount / qWords.length) * 20;
  if (brand && brand.includes(q)) score += 10;
  if (name.length < 3) score -= 10; 

  return score;
}

function rankProducts(products, query) {
  return products
    .map((p) => ({ product: p, score: scoreProduct(p, query) }))
    .filter(({ score }) => score >= -5)  
    .sort((a, b) => b.score - a.score)
    .map(({ product }) => product);
}

/* ---------------- EXPORTED FUNCTIONS ---------------- */

export async function offSearch(query, page = 1) {
  const safePage = (typeof page === 'number' && page >= 1) ? page : 1;
  const urls = SEARCH_URLS(query, safePage);

  for (let urlIndex = 0; urlIndex < urls.length; urlIndex++) {
    const url = urls[urlIndex];
    const isLastUrl = urlIndex === urls.length - 1;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const res = await fetchWithTimeout(url, TIMEOUT_MS);
        
        // If server says 403 or 500, throw error so it triggers retry/fallback
        if (!res.ok) {
           throw new Error(`HTTP Error ${res.status}`);
        }

        const text = await res.text();

        // Check if the response is HTML (the error page)
        if (text.trimStart().startsWith('<')) {
          throw new Error('Server returned HTML');
        }

        const data = JSON.parse(text);
        const raw = Array.isArray(data.products) ? data.products : [];
        const total = typeof data.count === 'number' ? data.count : raw.length;

        if (raw.length === 0 && !isLastUrl) break;

        const products = rankProducts(raw, query);

        if (products.length === 0 && raw.length > 0 && !isLastUrl) break;

        return { products, total: products.length > 0 ? total : 0 };

      } catch (err) {
        console.warn(`OpenFoodFacts attempt ${attempt} (url ${urlIndex + 1}) failed:`, err.message);

        if (attempt === MAX_RETRIES && isLastUrl) {
          return { products: [], total: 0 };
        }
        if (attempt === MAX_RETRIES) break;

        // Exponential backoff
        await new Promise(res => setTimeout(res, attempt * 1000)); 
      }
    }
  }
  return { products: [], total: 0 };
}

export async function offGetProductByBarcode(barcode) {
  const code = encodeURIComponent(String(barcode).trim());
  const url = `https://world.openfoodfacts.org/api/v2/product/${code}.json?fields=code,product_name,product_name_en,brands,ingredients_text,ingredients_text_en,allergens_tags,nutriments`;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetchWithTimeout(url, TIMEOUT_MS);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      
      const text = await res.text();
      if (text.trimStart().startsWith('<')) throw new Error('Server returned HTML');

      const data = JSON.parse(text);
      if (!data || data.status === 0 || !data.product) return null;

      return data.product;
    } catch (err) {
      console.warn(`Barcode attempt ${attempt} failed:`, err.message);
      if (attempt < MAX_RETRIES) {
        await new Promise((res) => setTimeout(res, attempt * 1000));
      }
    }
  }
  return null;
}