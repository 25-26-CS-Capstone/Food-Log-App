import { getFoodLogs, getSymptomLogs, getFlaggedFoods } from './storage';

/**
 * Generate a summary report for a given date range
 */
export async function generateReport(startDate, endDate) {
  try {
    const foodLogs = await getFoodLogs();
    const symptomLogs = await getSymptomLogs();
    const flaggedFoods = await getFlaggedFoods();

    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();

    // Filter logs by date range
    const filteredFoods = foodLogs.filter(log => {
      const logTime = new Date(log.timestamp).getTime();
      return logTime >= start && logTime <= end;
    });

    const filteredSymptoms = symptomLogs.filter(log => {
      const logTime = new Date(log.timestamp).getTime();
      return logTime >= start && logTime <= end;
    });

    // Calculate food statistics
    const foodStats = {
      totalEntries: filteredFoods.length,
      uniqueFoods: [...new Set(filteredFoods.map(f => f.foodName))].length,
      flaggedFoodsConsumed: filteredFoods
        .filter(f => flaggedFoods.some(flag => flag.foodName.toLowerCase() === f.foodName.toLowerCase()))
        .length,
      totalNutrition: calculateNutritionTotals(filteredFoods),
      averageMacros: calculateAverageMacros(filteredFoods),
      mostFrequentFood: getMostFrequentFood(filteredFoods),
      foodsByDay: groupFoodsByDay(filteredFoods)
    };

    // Calculate symptom statistics
    const symptomStats = {
      totalEntries: filteredSymptoms.length,
      uniqueSymptoms: [...new Set(filteredSymptoms.map(s => s.symptomType))].length,
      symptomsByType: groupSymptomsByType(filteredSymptoms),
      symptomsByDay: groupSymptomsByDay(filteredSymptoms),
      averageSeverity: calculateAverageSeverity(filteredSymptoms)
    };

    // Correlation analysis
    const correlations = analyzeCorrelations(filteredFoods, filteredSymptoms, flaggedFoods);

    return {
      dateRange: { startDate, endDate },
      generatedAt: new Date().toISOString(),
      foodStats,
      symptomStats,
      correlations,
      summary: generateTextSummary(foodStats, symptomStats, correlations)
    };
  } catch (error) {
    console.error('Error generating report:', error);
    return null;
  }
}

function calculateNutritionTotals(foodLogs) {
  return foodLogs.reduce((totals, log) => {
    const usda = log.usdaData || {};
    return {
      calories: (totals.calories || 0) + (usda.calories || 0),
      protein: (totals.protein || 0) + (usda.protein || 0),
      carbs: (totals.carbs || 0) + (usda.carbs || 0),
      fat: (totals.fat || 0) + (usda.fat || 0)
    };
  }, {});
}

function calculateAverageMacros(foodLogs) {
  if (foodLogs.length === 0) return null;
  
  const totals = calculateNutritionTotals(foodLogs);
  return {
    caloriesPerDay: Math.round(totals.calories / foodLogs.length),
    proteinPerDay: Math.round(totals.protein / foodLogs.length * 10) / 10,
    carbsPerDay: Math.round(totals.carbs / foodLogs.length * 10) / 10,
    fatPerDay: Math.round(totals.fat / foodLogs.length * 10) / 10
  };
}

function getMostFrequentFood(foodLogs) {
  if (foodLogs.length === 0) return null;
  
  const foodCounts = {};
  foodLogs.forEach(log => {
    foodCounts[log.foodName] = (foodCounts[log.foodName] || 0) + 1;
  });

  let mostFrequent = null;
  let maxCount = 0;

  Object.entries(foodCounts).forEach(([food, count]) => {
    if (count > maxCount) {
      maxCount = count;
      mostFrequent = { food, count };
    }
  });

  return mostFrequent;
}

function groupFoodsByDay(foodLogs) {
  const grouped = {};
  
  foodLogs.forEach(log => {
    const date = new Date(log.timestamp).toISOString().split('T')[0];
    if (!grouped[date]) {
      grouped[date] = [];
    }
    grouped[date].push(log);
  });

  return grouped;
}

function groupSymptomsByType(symptomLogs) {
  const grouped = {};
  
  symptomLogs.forEach(log => {
    const type = log.symptomType;
    if (!grouped[type]) {
      grouped[type] = [];
    }
    grouped[type].push(log);
  });

  return grouped;
}

function groupSymptomsByDay(symptomLogs) {
  const grouped = {};
  
  symptomLogs.forEach(log => {
    const date = new Date(log.timestamp).toISOString().split('T')[0];
    if (!grouped[date]) {
      grouped[date] = [];
    }
    grouped[date].push(log);
  });

  return grouped;
}

function calculateAverageSeverity(symptomLogs) {
  if (symptomLogs.length === 0) return null;
  
  const total = symptomLogs.reduce((sum, log) => sum + (log.severity || 5), 0);
  return Math.round(total / symptomLogs.length * 10) / 10;
}

function analyzeCorrelations(foodLogs, symptomLogs, flaggedFoods) {
  const correlations = [];

  flaggedFoods.forEach(flaggedFood => {
    // Find all times this flagged food was eaten
    const timesEaten = foodLogs
      .filter(f => f.foodName.toLowerCase() === flaggedFood.foodName.toLowerCase())
      .map(f => new Date(f.timestamp));

    if (timesEaten.length === 0) return;

    // Find symptoms within 24 hours of eating this food
    const relatedSymptoms = symptomLogs.filter(symptom => {
      const symptomTime = new Date(symptom.timestamp);
      return timesEaten.some(eatenTime => {
        const diff = Math.abs(symptomTime - eatenTime);
        return diff <= 24 * 60 * 60 * 1000; // 24 hours
      });
    });

    if (relatedSymptoms.length > 0) {
      correlations.push({
        food: flaggedFood.foodName,
        reason: flaggedFood.reason,
        timesEaten: timesEaten.length,
        relatedSymptoms: relatedSymptoms.length,
        symptomTypes: [...new Set(relatedSymptoms.map(s => s.symptomType))],
        confidence: Math.round((relatedSymptoms.length / timesEaten.length) * 100)
      });
    }
  });

  return correlations.sort((a, b) => b.confidence - a.confidence);
}

function generateTextSummary(foodStats, symptomStats, correlations) {
  let summary = [];

  summary.push(`📊 Food Report:`);
  summary.push(`- Total food entries: ${foodStats.totalEntries}`);
  summary.push(`- Unique foods consumed: ${foodStats.uniqueFoods}`);
  
  if (foodStats.mostFrequentFood) {
    summary.push(`- Most frequent: ${foodStats.mostFrequentFood.food} (${foodStats.mostFrequentFood.count}x)`);
  }
  
  if (foodStats.flaggedFoodsConsumed > 0) {
    summary.push(`⚠️ Flagged foods consumed: ${foodStats.flaggedFoodsConsumed}`);
  }

  summary.push(`\n📈 Symptom Report:`);
  summary.push(`- Total symptom entries: ${symptomStats.totalEntries}`);
  summary.push(`- Unique symptom types: ${symptomStats.uniqueSymptoms}`);
  
  if (symptomStats.averageSeverity) {
    summary.push(`- Average severity: ${symptomStats.averageSeverity}/10`);
  }

  if (correlations.length > 0) {
    summary.push(`\n🔗 Potential Triggers:`);
    correlations.slice(0, 5).forEach(corr => {
      summary.push(`- ${corr.food}: ${corr.confidence}% confidence (${corr.relatedSymptoms} symptoms after ${corr.timesEaten} servings)`);
    });
  }

  return summary.join('\n');
}

export default {
  generateReport
};
