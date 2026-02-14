


import axios from 'axios';

const API_KEY = 'szC85PUO2yeTgtt7yKLImnFV0wr7Z0kgSIQNZqJg';
const BASE_URL = 'https://api.nal.usda.gov/fdc/v1';

// Search foods by keyword
export async function searchFood(query) {
  try {
    const response = await axios.get(`${BASE_URL}/foods/search`, {
      params: { query, api_key: API_KEY },
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

    // Extract ingredients and allergens
    const calories =
      food.foodNutrients?.find(n => n.nutrientName === 'Energy')?.value || 'N/A';
    const ingredients = food.ingredients || 'No ingredients listed';
    const allergens =
      food.allergens || 'No known allergens listed';

    return {
      name: food.description,
      calories,
      ingredients,
      allergens,
    };
  } catch (error) {
    console.error('Error fetching food details:', error);
    return null;
  }
}
