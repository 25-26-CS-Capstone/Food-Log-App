const TIMEOUT_MS = 15000;
const MAX_RETRIES = 3;
export const PAGE_SIZE = 20;
 
const fetchWithTimeout = (url, ms) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return fetch(url, { signal: controller.signal })
    .finally(() => clearTimeout(timer));
};
 
const SEARCH_URLS = (query, page) => [
  `https://world.openfoodfacts.org/api/v2/search?q=${encodeURIComponent(query)}&page=${page}&page_size=${PAGE_SIZE}&sort_by=unique_scans_n&lang=en&fields=code,product_name,product_name_en,brands,ingredients_text,ingredients_text_en,allergens_tags,nutriments`,
  `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page=${page}&page_size=${PAGE_SIZE}&fields=code,product_name,product_name_en,brands,ingredients_text,ingredients_text_en,allergens_tags,nutriments`,
];
 
/* ---------------- RELEVANCE FILTER & SCORER ---------------- */
 
/**
 * Score a product against the search query.
 * Higher = more relevant. Returns -1 to discard entirely.
 */
function scoreProduct(product, query) {
  const name = (
    product.product_name_en ||
    product.product_name ||
    ''
  ).toLowerCase().trim();

  const brand = (product.brands || '').toLowerCase().trim();
  const ingredients = (product.ingredients_text_en || product.ingredients_text || '').toLowerCase();
  const q = query.toLowerCase().trim();
  const qWords = q.split(/\s+/);

  // Discard: no usable name AND no ingredients
  if (!name && !ingredients) return -1;

  // Use name OR ingredients OR brand for matching
  const searchableText = `${name} ${brand} ${ingredients}`;
  const nameMatchCount = qWords.filter((w) => searchableText.includes(w)).length;

  // Only discard if NONE of the query words appear anywhere
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
 

/**
 * Filter and sort products by relevance to the query.
 * Discards products scoring below 0 and sorts descending.
 */
function rankProducts(products, query) {
  return products
    .map((p) => ({ product: p, score: scoreProduct(p, query) }))
    .filter(({ score }) => score >= -5)  
    .sort((a, b) => b.score - a.score)
    .map(({ product }) => product);
}

export async function offSearch(query, page = 1) {
  const safePage = (typeof page === 'number' && page >= 1) ? page : 1;
  const urls = SEARCH_URLS(query, safePage);

  for (let urlIndex = 0; urlIndex < urls.length; urlIndex++) {
    const url = urls[urlIndex];
    const isLastUrl = urlIndex === urls.length - 1;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const res = await fetchWithTimeout(url, TIMEOUT_MS);
        const text = await res.text();

        if (text.trimStart().startsWith('<')) {
          throw new Error('Server returned HTML');
        }

        const data = JSON.parse(text);
        const raw = Array.isArray(data.products) ? data.products : [];
        const total = typeof data.count === 'number' ? data.count : raw.length;

        // Try next URL if no raw results and there's a fallback
        if (raw.length === 0 && !isLastUrl) break;

        const products = rankProducts(raw, query);

        // If filtering wiped everything and there's a fallback URL, try that
        if (products.length === 0 && raw.length > 0 && !isLastUrl) break;

        // Return whatever we have — even if empty on the last URL
        return { products, total: products.length > 0 ? total : 0 };

      } catch (err) {
        console.warn(`OpenFoodFacts attempt ${attempt} (url ${urlIndex + 1}) failed:`, err.message);

        const isLastAttempt = attempt === MAX_RETRIES;
        if (isLastAttempt && isLastUrl) {
          return { products: [], total: 0 };
        }
        if (isLastAttempt) break;

        await new Promise(res => setTimeout(res, attempt * 500)); 
      }
    }
  }

  return { products: [], total: 0 };
}
 
export async function offGetProductByBarcode(barcode) {
  const url = `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}?fields=code,product_name,product_name_en,brands,ingredients_text,ingredients_text_en,allergens_tags,nutriments`;
 
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetchWithTimeout(url, TIMEOUT_MS);
      const text = await res.text();
 
      if (text.trimStart().startsWith('<')) {
        throw new Error('Server returned HTML');
      }
 
      const data = JSON.parse(text);
      if (!data || data.status === 0 || !data.product) return null;
      return data.product;
 
    } catch (err) {
      console.warn(`OpenFoodFacts barcode attempt ${attempt} failed:`, err.message);
      if (attempt === MAX_RETRIES) {
        console.error('OpenFoodFacts barcode failed after all retries:', err);
        return null;
      }
      await new Promise(res => setTimeout(res, attempt * 2000));
    }
  }
 
  return null;
}
 