import axios from 'axios';

const API_KEY = 'szC85PUO2yeTgtt7yKLImnFV0wr7Z0kgSIQNZqJg';
const BASE_URL = 'https://api.nal.usda.gov/fdc/v1';

// Search foods by keyword
export async function searchFood(query) {
  try {
    if (!query || query.trim().length === 0) {
      return [];
    }
    
    const response = await axios.get(`${BASE_URL}/foods/search`, {
      params: { 
        query: query.trim(),
        api_key: API_KEY,
        pageSize: 10 // Limit results for better performance
      },
    });
    
    return response.data.foods || [];
  } catch (error) {
    console.error('Error fetching food search:', error);
    return [];
  }
}

// Get detailed info for one food item
export async function getFoodDetails(fdcId) {
  try {
    const response = await axios.get(`${BASE_URL}/food/${fdcId}`, {
      params: { api_key: API_KEY },
    });

    const food = response.data;

    // Extract nutritional information
    const nutrients = food.foodNutrients || [];
    const calories = nutrients.find(n => 
      n.nutrient?.name === 'Energy' || 
      n.nutrientName === 'Energy'
    )?.amount || null;

    const protein = nutrients.find(n => 
      n.nutrient?.name === 'Protein' || 
      n.nutrientName === 'Protein'
    )?.amount || null;

    const carbs = nutrients.find(n => 
      n.nutrient?.name === 'Carbohydrate, by difference' || 
      n.nutrientName === 'Carbohydrate, by difference'
    )?.amount || null;

    const fat = nutrients.find(n => 
      n.nutrient?.name === 'Total lipid (fat)' || 
      n.nutrientName === 'Total lipid (fat)'
    )?.amount || null;

    // Extract other information
    const ingredients = food.ingredients || 'No ingredients listed';
    const allergens = food.allergens || 'No known allergens listed';

    return {
      fdcId: food.fdcId,
      name: food.description,
      brandName: food.brandName || null,
      calories: calories ? Math.round(calories) : null,
      protein: protein ? Math.round(protein * 10) / 10 : null,
      carbs: carbs ? Math.round(carbs * 10) / 10 : null,
      fat: fat ? Math.round(fat * 10) / 10 : null,
      ingredients,
      allergens,
      nutrients: nutrients.slice(0, 10), // Top 10 nutrients for display
      servingSize: food.servingSize || null,
      servingSizeUnit: food.servingSizeUnit || null
    };
  } catch (error) {
    console.error('Error fetching food details:', error);
    return null;
  }
}

// Format food item for display in search results
export function formatFoodSearchResult(food) {
  return {
    fdcId: food.fdcId,
    name: food.description,
    brandName: food.brandName || null,
    ingredients: food.ingredients || null,
    category: food.foodCategory || null,
    dataType: food.dataType || null,
    displayName: food.brandName 
      ? `${food.description} (${food.brandName})`
      : food.description
  };
}

// Helper function to check if a food contains specific allergens
export function checkAllergens(food, allergenList = []) {
  if (!food.ingredients) return [];
  
  const ingredients = food.ingredients.toLowerCase();
  return allergenList.filter(allergen => 
    ingredients.includes(allergen.toLowerCase())
  );
}

export default {
  searchFood,
  getFoodDetails,
  formatFoodSearchResult,
  checkAllergens
};