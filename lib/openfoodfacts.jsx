export async function offSearch(query) {
  const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
    query
  )}&search_simple=1&action=process&json=1&page_size=20`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    return Array.isArray(data.products) ? data.products : [];
  } catch (err) {
    console.error("OpenFoodFacts error:", err);
    return [];
  }
}

