import { FoodItem, FoodAnalysisResponse } from '../api/types';

/**
 * Calculates total calories for a food item based on weight and calories per 100g
 * @param item - The food item with weight and calories per 100g
 * @returns number - Total calories for the item
 */
export function calculateItemCalories(item: FoodItem): number {
  const caloriesPerGram = item.calories_per_100g / 100;
  const totalCalories = caloriesPerGram * item.weight_grams;
  return Math.round(totalCalories); // Round to nearest whole number
}

/**
 * Calculates total calories for all items in a food analysis response
 * @param analysis - The food analysis response
 * @returns number - Total calories for all items
 */
export function calculateTotalCalories(analysis: FoodAnalysisResponse): number {
  return analysis.items.reduce((total, item) => {
    return total + calculateItemCalories(item);
  }, 0);
}

/**
 * Formats calories for display
 * @param calories - The number of calories
 * @returns string - Formatted calories string
 */
export function formatCalories(calories: number): string {
  return `${calories} cal`;
}

/**
 * Gets a summary of the food analysis with calculated calories
 * @param analysis - The food analysis response
 * @returns object - Summary with items and total calories
 */
export function getFoodAnalysisSummary(analysis: FoodAnalysisResponse) {
  const itemsWithCalories = analysis.items.map(item => ({
    ...item,
    total_calories: calculateItemCalories(item),
  }));

  const totalCalories = calculateTotalCalories(analysis);

  return {
    items: itemsWithCalories,
    total_calories: totalCalories,
    item_count: analysis.items.length,
  };
}
