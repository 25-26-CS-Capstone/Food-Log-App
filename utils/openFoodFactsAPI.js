import axios from 'axios';

const BASE_URL = 'https://world.openfoodfacts.org/api/v2';
const USER_AGENT = 'FoodLogApp/1.0 (https://github.com/SebasCerLop/Food-Log-App)';

// Standard allergen list from FDA and EU regulations
const STANDARD_ALLERGENS = {
  'en:milk': 'Dairy/Milk',
  'en:eggs': 'Eggs',
  'en:fish': 'Fish',
  'en:crustaceans': 'Crustaceans',
  'en:shellfish': 'Shellfish',
  'en:tree-nuts': 'Tree Nuts',
  'en:peanuts': 'Peanuts',
  'en:wheat': 'Wheat',
  'en:gluten': 'Gluten',
  'en:soybeans': 'Soy',
  'en:sesame-seeds': 'Sesame',
  'en:celery': 'Celery',
  'en:mustard': 'Mustard',
  'en:lupin': 'Lupin',
  'en:molluscs': 'Molluscs',
  'en:sulphur-dioxide-and-sulphites': 'Sulfites'
};

/**
 * Search foods by keyword with language filtering
 * @param {string} query - Search term
 * @param {string} language - Language code (default: 'en' for English)
 * @param {number} pageSize - Number of results (default: 20)
 * @returns {Promise<Array>} Array of food products
 */
export async function searchFood(query, language = 'en', pageSize = 20) {
  try {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const response = await axios.get(`${BASE_URL}/search`, {
      params: {
        search_terms: query.trim(),
        page_size: pageSize,
        json: true,
        fields: 'code,product_name,brands,allergens,allergens_tags,ingredients_text,nutriments,nutriscore_grade,image_url,serving_size,languages_codes'
      },
      headers: {
        'User-Agent': USER_AGENT
      }
    });

    const products = response.data.products || [];
    
    // Filter for preferred language and quality
    const filteredProducts = products.filter(product => {
      // Must have a product name
      if (!product.product_name) return false;
      
      // Prefer products that have the requested language
      if (product.languages_codes && Array.isArray(product.languages_codes)) {
        return product.languages_codes.includes(language);
      }
      
      return true;
    });

    return filteredProducts;
  } catch (error) {
    console.error('Error fetching OpenFoodFacts search:', error);
    return [];
  }
}

/**
 * Get detailed info for a specific product by barcode
 * @param {string} barcode - Product barcode/code
 * @returns {Promise<Object|null>} Detailed product information
 */
export async function getFoodDetails(barcode) {
  try {
    const response = await axios.get(`${BASE_URL}/product/${barcode}`, {
      headers: {
        'User-Agent': USER_AGENT
      }
    });

    if (response.data.status !== 1 || !response.data.product) {
      return null;
    }

    const product = response.data.product;
    
    // Extract and format nutritional data
    const nutriments = product.nutriments || {};
    
    // Parse allergens
    const allergens = parseAllergens(product);
    const allergensTags = product.allergens_tags || [];
    
    return {
      code: product.code,
      name: product.product_name || 'Unknown Product',
      brandName: product.brands || null,
      
      // Nutritional info (per 100g)
      calories: nutriments['energy-kcal_100g'] || nutriments.energy_100g ? 
        Math.round((nutriments.energy_100g || 0) / 4.184) : null,
      protein: nutriments.proteins_100g ? 
        Math.round(nutriments.proteins_100g * 10) / 10 : null,
      carbs: nutriments.carbohydrates_100g ? 
        Math.round(nutriments.carbohydrates_100g * 10) / 10 : null,
      fat: nutriments.fat_100g ? 
        Math.round(nutriments.fat_100g * 10) / 10 : null,
      fiber: nutriments.fiber_100g ? 
        Math.round(nutriments.fiber_100g * 10) / 10 : null,
      sugar: nutriments.sugars_100g ? 
        Math.round(nutriments.sugars_100g * 10) / 10 : null,
      sodium: nutriments.sodium_100g ? 
        Math.round(nutriments.sodium_100g * 1000 * 10) / 10 : null, // Convert to mg
      
      // Additional info
      ingredients: product.ingredients_text || 'No ingredients listed',
      allergens: allergens,
      allergensTags: allergensTags,
      servingSize: product.serving_size || null,
      nutriscoreGrade: product.nutriscore_grade || null,
      imageUrl: product.image_url || null,
      
      // Full nutriments for detailed view
      nutriments: nutriments,
      
      // Data source
      source: 'OpenFoodFacts'
    };
  } catch (error) {
    console.error('Error fetching OpenFoodFacts product details:', error);
    return null;
  }
}

/**
 * Parse and format allergen information
 * @param {Object} product - OpenFoodFacts product object
 * @returns {string} Formatted allergen string
 */
function parseAllergens(product) {
  const allergensTags = product.allergens_tags || [];
  
  if (allergensTags.length === 0) {
    return 'No known allergens listed';
  }

  // Map tags to readable names
  const readableAllergens = allergensTags
    .map(tag => STANDARD_ALLERGENS[tag] || tag.replace('en:', '').replace(/-/g, ' '))
    .filter(allergen => allergen); // Remove any undefined

  if (readableAllergens.length === 0) {
    return 'No known allergens listed';
  }

  return readableAllergens.join(', ');
}

/**
 * Format food item for display in search results
 * @param {Object} product - OpenFoodFacts product
 * @returns {Object} Formatted product for UI
 */
export function formatFoodSearchResult(product) {
  const allergensTags = product.allergens_tags || [];
  const hasAllergens = allergensTags.length > 0;
  
  return {
    code: product.code,
    name: product.product_name || 'Unknown Product',
    brandName: product.brands || null,
    allergens: parseAllergens(product),
    hasAllergens: hasAllergens,
    allergensTags: allergensTags,
    nutriscoreGrade: product.nutriscore_grade || null,
    imageUrl: product.image_url || null,
    displayName: product.brands 
      ? `${product.product_name} (${product.brands})`
      : product.product_name
  };
}

/**
 * Check if a product contains specific allergens
 * @param {Object} product - Product object
 * @param {Array<string>} allergenList - List of allergens to check
 * @returns {Array<string>} List of matching allergens
 */
export function checkAllergens(product, allergenList = []) {
  const allergensTags = product.allergensTags || product.allergens_tags || [];
  const ingredients = (product.ingredients || product.ingredients_text || '').toLowerCase();
  
  const matchingAllergens = [];
  
  allergenList.forEach(allergen => {
    const allergenLower = allergen.toLowerCase();
    
    // Check tags
    const tagMatch = allergensTags.some(tag => 
      tag.toLowerCase().includes(allergenLower)
    );
    
    // Check ingredients text
    const ingredientMatch = ingredients.includes(allergenLower);
    
    if (tagMatch || ingredientMatch) {
      matchingAllergens.push(allergen);
    }
  });
  
  return matchingAllergens;
}

/**
 * Get allergen categories for symptom analysis
 * @param {Object} product - Product object with allergen data
 * @returns {Object} Categorized allergens
 */
export function categorizeAllergens(product) {
  const allergensTags = product.allergensTags || product.allergens_tags || [];
  
  const categories = {
    dairy: false,
    gluten: false,
    nuts: false,
    eggs: false,
    soy: false,
    shellfish: false,
    fish: false,
    sesame: false,
    sulfites: false
  };
  
  allergensTags.forEach(tag => {
    const tagLower = tag.toLowerCase();
    
    if (tagLower.includes('milk') || tagLower.includes('dairy')) {
      categories.dairy = true;
    }
    if (tagLower.includes('gluten') || tagLower.includes('wheat')) {
      categories.gluten = true;
    }
    if (tagLower.includes('nut') || tagLower.includes('peanut')) {
      categories.nuts = true;
    }
    if (tagLower.includes('egg')) {
      categories.eggs = true;
    }
    if (tagLower.includes('soy')) {
      categories.soy = true;
    }
    if (tagLower.includes('shellfish') || tagLower.includes('crustacean')) {
      categories.shellfish = true;
    }
    if (tagLower.includes('fish')) {
      categories.fish = true;
    }
    if (tagLower.includes('sesame')) {
      categories.sesame = true;
    }
    if (tagLower.includes('sulphite') || tagLower.includes('sulfite')) {
      categories.sulfites = true;
    }
  });
  
  return categories;
}

export default {
  searchFood,
  getFoodDetails,
  formatFoodSearchResult,
  checkAllergens,
  categorizeAllergens,
  STANDARD_ALLERGENS
};
