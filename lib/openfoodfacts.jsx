const TIMEOUT_MS = 15000;
const MAX_RETRIES = 3;
 
const fetchWithTimeout = (url, ms) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return fetch(url, { signal: controller.signal })
    .finally(() => clearTimeout(timer));
};
 
const SEARCH_URLS = (query) => [
  // Primary: legacy CGI — better text search relevance
  `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=10&fields=code,product_name,product_name_en,brands,ingredients_text,ingredients_text_en,allergens_tags,nutriments`,
  // Fallback: v2 API
  `https://world.openfoodfacts.org/api/v2/search?q=${encodeURIComponent(query)}&page_size=10&sort_by=unique_scans_n&lang=en&fields=code,product_name,product_name_en,brands,ingredients_text,ingredients_text_en,allergens_tags,nutriments`,
];
 
export async function offSearch(query) {
  const urls = SEARCH_URLS(query);
 
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
        const products = Array.isArray(data.products) ? data.products : [];
 
        if (products.length === 0 && !isLastUrl) {
          throw new Error('No results, trying fallback');
        }
 
        return products;
 
      } catch (err) {
        console.warn(`OpenFoodFacts attempt ${attempt} (url ${urlIndex + 1}) failed:`, err.message);
 
        const isLastAttempt = attempt === MAX_RETRIES;
 
        if (isLastAttempt && isLastUrl) {
          console.error('OpenFoodFacts search failed on all endpoints:', err);
          return [];
        }
 
        if (isLastAttempt) {
          break;
        }
 
        await new Promise(res => setTimeout(res, attempt * 2000));
      }
    }
  }
 
  return [];
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
 