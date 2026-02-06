/**
 * Shared filter configuration for consistent filter behavior across pages
 */

export const FILTER_CONFIG = {
  // Cooking time thresholds in minutes
  QUICK_COOKING_THRESHOLD: 15,
  
  // Dietary preferences
  DIETARY_OPTIONS: [
    { value: '', label: 'Any' },
    { value: 'vegetarian', label: 'Vegetarian' },
    { value: 'vegan', label: 'Vegan' },
    { value: 'gluten-free', label: 'Gluten Free' },
  ],
  
  // Meal types
  MEAL_TYPES: ['breakfast', 'lunch', 'dinner', 'snack', 'dessert'],
} as const;

/**
 * Filter state interface for recipe filtering
 */
export interface RecipeFilterState {
  diet: string;
  mealType: string;
  isQuickCooking: boolean;
}

/**
 * Initial filter state
 */
export const initialFilterState: RecipeFilterState = {
  diet: '',
  mealType: '',
  isQuickCooking: false,
};

/**
 * Check if a recipe matches the quick cooking threshold
 */
export const isQuickRecipe = (prepTimeMinutes: number = 0, cookTimeMinutes: number = 0): boolean => {
  return (prepTimeMinutes + cookTimeMinutes) <= FILTER_CONFIG.QUICK_COOKING_THRESHOLD;
};
