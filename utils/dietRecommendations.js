/**
 * Diet Recommendations Engine
 * Suggests alternative foods based on flagged items and nutritional needs
 */

const foodAlternatives = {
  // Dairy alternatives
  'milk': ['almond milk', 'oat milk', 'coconut milk', 'soy milk', 'rice milk', 'cashew milk'],
  'cheese': ['dairy-free cheese', 'nutritional yeast', 'cashew cheese'],
  'yogurt': ['dairy-free yogurt', 'greek yogurt alternatives'],
  'butter': ['coconut oil', 'olive oil', 'ghee'],
  'cream': ['coconut cream', 'cashew cream', 'oat cream'],

  // Gluten alternatives
  'wheat': ['rice', 'corn', 'oats', 'quinoa', 'buckwheat', 'almond flour'],
  'bread': ['gluten-free bread', 'rice cakes', 'cauliflower bread'],
  'pasta': ['gluten-free pasta', 'rice noodles', 'zucchini noodles', 'quinoa pasta'],
  'flour': ['almond flour', 'rice flour', 'coconut flour'],

  // Soy alternatives
  'soy': ['tempeh', 'tofu', 'chickpeas', 'lentils'],
  'tofu': ['tempeh', 'seitan', 'chickpeas'],
  'soy sauce': ['tamari', 'coconut aminos'],

  // Nut alternatives (for nut allergies)
  'peanuts': ['sunflower seeds', 'tahini', 'soy nuts'],
  'almonds': ['sunflower seeds', 'pumpkin seeds'],
  'cashews': ['macadamia nuts', 'pine nuts'],

  // Egg alternatives
  'eggs': ['flax eggs', 'chia eggs', 'applesauce', 'mashed banana', 'aquafaba'],

  // High histamine alternatives (for intolerance)
  'aged cheese': ['fresh mozzarella', 'fresh ricotta', 'cream cheese'],
  'cured meat': ['fresh chicken', 'fresh turkey', 'fresh fish'],
  'wine': ['fresh juice', 'herbal tea'],
  'fermented': ['fresh vegetables', 'fresh fruits'],

  // Nightshade alternatives
  'tomato': ['carrot', 'beet', 'bell pepper alternative'],
  'potato': ['sweet potato', 'cauliflower', 'turnip'],
  'pepper': ['ginger', 'turmeric', 'cardamom'],

  // Shellfish alternatives
  'shrimp': ['fish', 'chicken', 'tofu'],
  'crab': ['salmon', 'chicken breast'],

  // Fish alternatives
  'salmon': ['sardines', 'mackerel', 'trout'],
  'tuna': ['sardines', 'mackere', 'herring'],
};

const nutritionalEquivalents = {
  // Protein sources
  'chicken': ['turkey', 'beef', 'pork', 'fish', 'tofu', 'lentils', 'beans'],
  'beef': ['chicken', 'turkey', 'lamb', 'bison', 'venison'],
  'fish': ['shrimp', 'salmon', 'tuna', 'chicken', 'tofu'],
  'eggs': ['greek yogurt', 'cottage cheese', 'lentils', 'beans'],
  'beans': ['lentils', 'chickpeas', 'tofu', 'tempeh', 'nuts'],

  // Carbs
  'rice': ['quinoa', 'pasta', 'oats', 'sweet potato', 'couscous'],
  'pasta': ['rice', 'quinoa', 'bread', 'oats'],
  'sweet potato': ['regular potato', 'yam', 'butternut squash', 'carrots'],

  // Fats
  'olive oil': ['coconut oil', 'avocado oil', 'sesame oil'],
  'butter': ['ghee', 'coconut oil', 'olive oil'],
};

/**
 * Get alternative foods for a flagged item
 * @param {string} foodName - The name of the flagged food
 * @param {string} reason - Why it was flagged (allergen, trigger, etc.)
 * @returns {Array} List of alternative foods
 */
export function getAlternatives(foodName, reason = 'allergen') {
  const searchName = foodName.toLowerCase();
  
  // First check specific alternatives map
  for (const key in foodAlternatives) {
    if (searchName.includes(key) || key.includes(searchName)) {
      return foodAlternatives[key];
    }
  }

  // If no specific alternative, suggest nutritional equivalents
  for (const key in nutritionalEquivalents) {
    if (searchName.includes(key) || key.includes(searchName)) {
      return nutritionalEquivalents[key];
    }
  }

  return [];
}

/**
 * Generate a personalized recommendation based on user patterns
 * @param {Array} flaggedFoods - Array of flagged food objects
 * @param {Array} foodLogs - Array of all food logs
 * @returns {Object} Recommendation with alternatives
 */
export function generateRecommendation(flaggedFoods, foodLogs) {
  const recommendations = [];

  flaggedFoods.forEach(flaggedFood => {
    const alternatives = getAlternatives(flaggedFood.foodName, flaggedFood.reason);
    
    // Count how often this food was logged
    const timesLogged = foodLogs.filter(log =>
      log.foodName.toLowerCase() === flaggedFood.foodName.toLowerCase()
    ).length;

    if (alternatives.length > 0) {
      recommendations.push({
        flaggedFood: flaggedFood.foodName,
        reason: flaggedFood.reason,
        severity: flaggedFood.severity,
        timesLogged,
        alternatives: alternatives.slice(0, 5), // Top 5 alternatives
        priority: timesLogged > 0 ? 'high' : 'medium',
      });
    }
  });

  // Sort by frequency (most eaten flagged foods first)
  return recommendations.sort((a, b) => b.timesLogged - a.timesLogged);
}

/**
 * Get tips for specific dietary needs
 * @param {string} allergen - The allergen or dietary restriction
 * @returns {string} Helpful tip
 */
export function getDietaryTip(allergen) {
  const tips = {
    'dairy': 'Try plant-based milk alternatives fortified with calcium and vitamin D for comparable nutrition.',
    'gluten': 'Look for certified gluten-free products. Many naturally gluten-free foods include rice, corn, quinoa, and potatoes.',
    'soy': 'Legumes like lentils, chickpeas, and beans provide similar protein and nutrients to soy products.',
    'nuts': 'Seeds like sunflower and pumpkin seeds, plus tahini, offer similar protein and healthy fats.',
    'eggs': 'Use flax or chia eggs as binders in baking, or add extra moisture with applesauce or mashed banana.',
    'shellfish': 'Fish and other lean meats provide similar protein. Try salmon for omega-3s as an alternative.',
    'fish': 'Look for other omega-3 sources like flaxseeds, walnuts, chia seeds, and algae supplements.',
    'histamine': 'Choose freshly caught or freshly prepared foods. Avoid aged, fermented, and processed foods.',
    'nightshade': 'Replace with other colorful vegetables like carrots, beets, and squash for nutrients and color.',
  };

  const allergenLower = allergen.toLowerCase();
  for (const key in tips) {
    if (allergenLower.includes(key) || key.includes(allergenLower)) {
      return tips[key];
    }
  }

  return 'Consider consulting a nutritionist for personalized dietary advice.';
}

/**
 * Calculate nutritional balance across alternatives
 * @param {string} originalFood - Original food name
 * @param {Array} alternatives - Array of alternative foods
 * @returns {Object} Comparison data
 */
export function compareNutrition(originalFood, alternatives) {
  return {
    original: originalFood,
    alternatives,
    tip: getDietaryTip(originalFood),
    note: `These alternatives may have different nutritional profiles. Use the Food Info Lookup to compare nutrition details.`
  };
}

export default {
  getAlternatives,
  generateRecommendation,
  getDietaryTip,
  compareNutrition,
};
