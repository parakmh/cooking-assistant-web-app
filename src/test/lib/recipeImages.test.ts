import { describe, it, expect } from 'vitest';
import { determineRecipeImageCategory, getRecipeImageUrl } from '@/lib/recipeImages';

describe('Recipe Image Utility', () => {
  describe('determineRecipeImageCategory', () => {
    it('should categorize chicken recipes correctly', () => {
      expect(determineRecipeImageCategory({
        title: 'Chicken Teriyaki', // Changed from "Chicken Stir Fry" to avoid stir-fry priority
        ingredients: ['chicken breast', 'vegetables'],
        tags: []
      })).toBe('chicken');

      expect(determineRecipeImageCategory({
        name: 'Grilled Chicken',
        ingredients: [{ name: 'chicken', quantity: '1', unit: 'lb' }],
        tags: []
      })).toBe('chicken');
    });

    it('should categorize pasta recipes correctly', () => {
      expect(determineRecipeImageCategory({
        title: 'Spaghetti Carbonara',
        ingredients: ['pasta', 'eggs', 'cheese'],
        tags: []
      })).toBe('pasta');

      expect(determineRecipeImageCategory({
        name: 'Linguine with Clams',
        ingredients: [{ name: 'linguine', quantity: '1', unit: 'lb' }],
        tags: []
      })).toBe('pasta');
    });

    it('should categorize breakfast recipes correctly', () => {
      expect(determineRecipeImageCategory({
        title: 'Greek Yogurt Bowl',
        ingredients: ['yogurt', 'berries'],
        tags: ['breakfast'],
        mealType: []
      })).toBe('breakfast');

      expect(determineRecipeImageCategory({
        name: 'Pancakes',
        ingredients: [],
        tags: [],
        mealType: ['breakfast']
      })).toBe('breakfast');
    });

    it('should categorize vegetarian recipes correctly when no specific dish type matches', () => {
      expect(determineRecipeImageCategory({
        title: 'Veggie Medley', // Changed from "Veggie Curry" to avoid curry priority
        ingredients: ['vegetables', 'herbs'],
        tags: ['vegetarian'],
        mealType: []
      })).toBe('vegetarian');
    });

    it('should categorize vegan recipes correctly when no specific dish type matches', () => {
      expect(determineRecipeImageCategory({
        title: 'Vegan Bowl', // Changed from "Vegan Smoothie" to avoid smoothie priority
        ingredients: ['almond milk', 'banana'],
        tags: ['vegan'],
        mealType: []
      })).toBe('vegan');
    });

    it('should return default for unrecognized recipes', () => {
      expect(determineRecipeImageCategory({
        title: 'Mystery Dish',
        ingredients: ['unknown ingredient'],
        tags: [],
        mealType: []
      })).toBe('default');
    });

    it('should prioritize specific dish types over protein ingredients', () => {
      expect(determineRecipeImageCategory({
        title: 'Chicken Pizza',
        ingredients: ['chicken', 'cheese'],
        tags: [],
        mealType: []
      })).toBe('pizza'); // Pizza should take priority over chicken
    });

    it('should prioritize specific dish types over dietary preferences', () => {
      expect(determineRecipeImageCategory({
        title: 'Veggie Curry',
        ingredients: ['vegetables', 'curry powder'],
        tags: ['vegetarian'],
        mealType: []
      })).toBe('curry'); // Curry should take priority over vegetarian

      expect(determineRecipeImageCategory({
        title: 'Vegan Smoothie',
        ingredients: ['almond milk', 'banana'],
        tags: ['vegan'],
        mealType: []
      })).toBe('smoothie'); // Smoothie should take priority over vegan
    });
  });

  describe('getRecipeImageUrl', () => {
    it('should return mapped image URL for recognized categories', () => {
      const result = getRecipeImageUrl({
        title: 'Chicken Teriyaki',
        ingredients: ['chicken', 'soy sauce'],
        tags: []
      });
      expect(result).toBe('/images/placeholders/chicken.png');
    });

    it('should return default image URL for unrecognized recipes', () => {
      const result = getRecipeImageUrl({
        title: 'Mystery Recipe',
        ingredients: ['unknown'],
        tags: []
      });
      expect(result).toBe('/images/placeholders/default.png');
    });

    it('should preserve existing valid imageUrl if provided', () => {
      const customUrl = '/custom/recipe/image.jpg';
      const result = getRecipeImageUrl({
        title: 'Chicken Recipe',
        ingredients: ['chicken'],
        tags: [],
        imageUrl: customUrl
      });
      expect(result).toBe(customUrl);
    });

    it('should ignore placeholder.svg and unsplash URLs', () => {
      const result1 = getRecipeImageUrl({
        title: 'Chicken Recipe',
        ingredients: ['chicken'],
        tags: [],
        imageUrl: '/placeholder.svg'
      });
      expect(result1).toBe('/images/placeholders/chicken.png');

      const result2 = getRecipeImageUrl({
        title: 'Chicken Recipe',
        ingredients: ['chicken'],
        tags: [],
        imageUrl: 'https://images.unsplash.com/photo-xyz'
      });
      expect(result2).toBe('/images/placeholders/chicken.png');
    });
  });
});
