import { searchFood as searchOpenFoodFacts } from './openFoodFactsAPI';
import { searchFood as searchUSDA } from './usdaAPI';

/**
 * Parse barcode and lookup food from OpenFoodFacts or USDA database
 * @param {string} barcode - UPC/EAN barcode string
 * @returns {Promise<Object>} Food data with source and details
 */
export const lookupBarcodeFood = async (barcode) => {
  if (!barcode || barcode.trim().length === 0) {
    throw new Error('Invalid barcode');
  }

  try {
    // Try OpenFoodFacts first (better barcode support with detailed allergen info)
    const offResult = await searchOpenFoodFactsByBarcode(barcode);
    if (offResult) {
      return {
        success: true,
        source: 'OpenFoodFacts',
        ...offResult,
      };
    }

    // Fallback to USDA if OpenFoodFacts doesn't find it
    const usdaResult = await searchUSDAByBarcode(barcode);
    if (usdaResult) {
      return {
        success: true,
        source: 'USDA',
        ...usdaResult,
      };
    }

    // If neither finds it, attempt generic search with barcode
    const genericResult = await fallbackBarcodeSearch(barcode);
    if (genericResult) {
      return {
        success: true,
        source: 'Generic',
        ...genericResult,
      };
    }

    throw new Error('Food not found for this barcode');
  } catch (error) {
    console.error('Barcode lookup error:', error);
    throw error;
  }
};

/**
 * Search OpenFoodFacts by barcode/UPC/EAN code
 * @param {string} barcode - Product barcode
 * @returns {Promise<Object|null>} Product details or null if not found
 */
export const searchOpenFoodFactsByBarcode = async (barcode) => {
  try {
    // OpenFoodFacts API endpoint for barcode lookup
    const response = await fetch(
      `https://world.openfoodfacts.org/api/v3/product/${barcode}?fields=code,product_name,brands,categories,nutriments,allergens_tags,nutriscore_grade,image_url,servings_size,quantity`
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    if (!data.product) {
      return null;
    }

    const product = data.product;
    return formatOpenFoodFactsProduct(product);
  } catch (error) {
    console.error('OpenFoodFacts barcode search error:', error);
    return null;
  }
};

/**
 * Fallback search using barcode as query string
 * @param {string} barcode - Product barcode
 * @returns {Promise<Object|null>} Product details or null
 */
export const fallbackBarcodeSearch = async (barcode) => {
  try {
    // Try searching by barcode as a query in OpenFoodFacts
    const response = await fetch(
      `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(barcode)}&search_simple=1&action=process&json=1&page_size=1`
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    if (!data.products || data.products.length === 0) {
      return null;
    }

    const product = data.products[0];
    return formatOpenFoodFactsProduct(product);
  } catch (error) {
    console.error('Fallback barcode search error:', error);
    return null;
  }
};

/**
 * Search USDA database by barcode (limited support)
 * @param {string} barcode - Product barcode
 * @returns {Promise<Object|null>} Product details or null
 */
export const searchUSDAByBarcode = async (barcode) => {
  try {
    // USDA FDC API search by barcode/UPC
    const response = await fetch(
      `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(barcode)}&pageSize=1&api_key=DEMO_KEY`
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    if (!data.foods || data.foods.length === 0) {
      return null;
    }

    const food = data.foods[0];
    return {
      code: food.fdcId,
      name: food.description,
      brands: food.brandOwner || 'Unknown',
      barcode: barcode,
      nutrition: formatUSDANutrients(food.foodNutrients),
      calories: getNutrientValue(food.foodNutrients, 'Energy'),
      carbs: getNutrientValue(food.foodNutrients, 'Carbohydrate'),
      protein: getNutrientValue(food.foodNutrients, 'Protein'),
      fat: getNutrientValue(food.foodNutrients, 'Total lipid'),
      fiber: getNutrientValue(food.foodNutrients, 'Fiber, total dietary'),
      sugar: getNutrientValue(food.foodNutrients, 'Sugars, total'),
      sodium: getNutrientValue(food.foodNutrients, 'Sodium'),
      source: 'USDA',
    };
  } catch (error) {
    console.error('USDA barcode search error:', error);
    return null;
  }
};

/**
 * Format OpenFoodFacts product for app display
 * @param {Object} product - OpenFoodFacts product object
 * @returns {Object} Formatted product data
 */
const formatOpenFoodFactsProduct = (product) => {
  return {
    code: product.code,
    name: product.product_name || 'Unknown Product',
    brands: product.brands || 'Unknown Brand',
    barcode: product.code,
    nutrition: product.nutriments || {},
    calories: product.nutriments?.['energy-kcal'] || 0,
    carbs: product.nutriments?.carbohydrates || 0,
    protein: product.nutriments?.proteins || 0,
    fat: product.nutriments?.fat || 0,
    fiber: product.nutriments?.fiber || 0,
    sugar: product.nutriments?.sugars || 0,
    sodium: product.nutriments?.sodium || 0,
    allergens: product.allergens_tags || [],
    nutriscoreGrade: product.nutriscore_grade?.toUpperCase() || 'N/A',
    imageUrl: product.image_url,
    servingSize: product.servings_size,
  };
};

/**
 * Format USDA nutrients object
 * @param {Array} nutrients - USDA nutrient array
 * @returns {Object} Formatted nutrients
 */
const formatUSDANutrients = (nutrients) => {
  const result = {};
  if (Array.isArray(nutrients)) {
    nutrients.forEach(nutrient => {
      result[nutrient.nutrientName] = nutrient.value;
    });
  }
  return result;
};

/**
 * Extract specific nutrient value from USDA nutrients array
 * @param {Array} nutrients - USDA nutrient array
 * @param {string} nutrientName - Name of nutrient to find
 * @returns {number} Nutrient value or 0
 */
const getNutrientValue = (nutrients, nutrientName) => {
  if (!Array.isArray(nutrients)) return 0;
  const nutrient = nutrients.find(n => n.nutrientName === nutrientName);
  return nutrient ? nutrient.value : 0;
};

/**
 * Validate barcode format (basic validation)
 * @param {string} barcode - Barcode to validate
 * @returns {boolean} True if barcode format appears valid
 */
export const isValidBarcode = (barcode) => {
  if (!barcode || typeof barcode !== 'string') return false;
  
  // Remove whitespace and dashes
  const clean = barcode.replace(/[\s-]/g, '');
  
  // Valid barcodes are typically 8-14 digits
  return /^\d{8,14}$/.test(clean);
};

/**
 * Normalize barcode format
 * @param {string} barcode - Raw barcode string
 * @returns {string} Normalized barcode
 */
export const normalizeBarcode = (barcode) => {
  if (!barcode) return '';
  return barcode.replace(/[\s-]/g, '').trim();
};

/**
 * Get barcode type/format
 * @param {string} barcode - Barcode to analyze
 * @returns {string} Barcode type (UPC, EAN, CODE128, etc)
 */
export const getBarcodeType = (barcode) => {
  const clean = normalizeBarcode(barcode);
  const length = clean.length;

  if (length === 12) return 'UPC-A';
  if (length === 8) return 'UPC-E';
  if (length === 13) return 'EAN-13';
  if (length === 14) return 'GTIN-14';
  if (length > 14) return 'CODE128';
  
  return 'Unknown';
};

export default {
  lookupBarcodeFood,
  searchOpenFoodFactsByBarcode,
  searchUSDAByBarcode,
  fallbackBarcodeSearch,
  isValidBarcode,
  normalizeBarcode,
  getBarcodeType,
};
