export const offSearch = async (query) => {
  const url =
    `https://world.openfoodfacts.org/cgi/search.pl` +
    `?search_terms=${encodeURIComponent(query)}` +
    `&search_simple=1` +
    `&action=process` +
    `&json=1` +
    `&page_size=20`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();

  return data.products || [];
};

export async function offGetProductByBarcode(barcode) {
  const url = `https://world.openfoodfacts.net/api/v2/product/${encodeURIComponent(barcode)}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!data || data.status === 0 || !data.product) return null;

    return data.product;
  } catch (err) {
    console.error("OpenFoodFacts barcode error:", err);
    return null;
  }
}