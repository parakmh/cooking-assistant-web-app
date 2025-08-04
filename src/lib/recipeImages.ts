/**
 * Recipe Image Mapping Utility
 * Maps recipe types, ingredients, or cuisine to predefined placeholder images
 */

export type RecipeImageCategory = 
  | 'chicken'
  | 'beef' 
  | 'pork'
  | 'fish'
  | 'seafood'
  | 'vegetarian'
  | 'vegan'
  | 'pasta'
  | 'rice'
  | 'soup'
  | 'salad'
  | 'dessert'
  | 'breakfast'
  | 'sandwich'
  | 'pizza'
  | 'stir-fry'
  | 'curry'
  | 'bread'
  | 'smoothie'
  | 'default';

// Mapping of categories to placeholder image filenames
const IMAGE_MAPPING: Record<RecipeImageCategory, string> = {
  'chicken': '/images/placeholders/chicken.png',
  'beef': '/images/placeholders/beef.png',
  'pork': '/images/placeholders/pork.png',
  'fish': '/images/placeholders/fish.png',
  'seafood': '/images/placeholders/seafood.png',
  'vegetarian': '/images/placeholders/vegetarian.png',
  'vegan': '/images/placeholders/vegan.png',
  'pasta': '/images/placeholders/pasta.png',
  'rice': '/images/placeholders/rice.png',
  'soup': '/images/placeholders/soup.png',
  'salad': '/images/placeholders/salad.png',
  'dessert': '/images/placeholders/dessert.png',
  'breakfast': '/images/placeholders/breakfast.png',
  'sandwich': '/images/placeholders/sandwich.png',
  'pizza': '/images/placeholders/pizza.png',
  'stir-fry': '/images/placeholders/stir-fry.png',
  'curry': '/images/placeholders/curry.png',
  'bread': '/images/placeholders/bread.png',
  'smoothie': '/images/placeholders/smoothie.png',
  'default': '/images/placeholders/default.png'
};

/**
 * Determines the appropriate image category based on recipe data
 */
export function determineRecipeImageCategory(recipeData: {
  name?: string;
  title?: string;
  ingredients?: Array<{ name: string; quantity: string; unit: string }> | string[];
  tags?: string[];
  mealType?: string[];
  cuisine?: string;
}): RecipeImageCategory {
  const recipeName = (recipeData.name || recipeData.title || '').toLowerCase();
  const tags = (recipeData.tags || []).map(tag => tag.toLowerCase());
  const mealTypes = (recipeData.mealType || []).map(type => type.toLowerCase());
  const cuisine = (recipeData.cuisine || '').toLowerCase();
  
  // Extract ingredient names (handle both object and string formats)
  const ingredientNames = (recipeData.ingredients || []).map(ing => {
    if (typeof ing === 'string') {
      return ing.toLowerCase();
    }
    return ing.name.toLowerCase();
  });

  // Priority 1: Check recipe name for specific dish types (highest priority)
  if (recipeName.includes('pizza')) {
    return 'pizza';
  }
  if (recipeName.includes('soup') || recipeName.includes('broth') || recipeName.includes('bisque')) {
    return 'soup';
  }
  if (recipeName.includes('salad')) {
    return 'salad';
  }
  if (recipeName.includes('sandwich') || recipeName.includes('burger') || recipeName.includes('wrap')) {
    return 'sandwich';
  }
  if (recipeName.includes('pasta') || recipeName.includes('spaghetti') || recipeName.includes('linguine') ||
      ingredientNames.some(ing => ing.includes('pasta') || ing.includes('spaghetti'))) {
    return 'pasta';
  }
  if (recipeName.includes('stir-fry') || recipeName.includes('stir fry')) {
    return 'stir-fry';
  }
  if (recipeName.includes('curry') || cuisine.includes('indian') || cuisine.includes('thai')) {
    return 'curry';
  }
  if (recipeName.includes('bread') || recipeName.includes('toast') || recipeName.includes('baguette')) {
    return 'bread';
  }
  if (recipeName.includes('smoothie') || recipeName.includes('shake')) {
    return 'smoothie';
  }
  if (recipeName.includes('rice') || recipeName.includes('risotto') || recipeName.includes('fried rice') ||
      ingredientNames.some(ing => ing.includes('rice'))) {
    return 'rice';
  }

  // Priority 2: Check meal types and desserts
  if (mealTypes.includes('breakfast') || tags.includes('breakfast')) {
    return 'breakfast';
  }
  if (mealTypes.includes('dessert') || tags.includes('dessert') || 
      recipeName.includes('cake') || recipeName.includes('cookie') || recipeName.includes('ice cream')) {
    return 'dessert';
  }

  // Priority 3: Check dietary preferences/tags (before protein checks)
  if (tags.includes('vegan')) {
    return 'vegan';
  }
  if (tags.includes('vegetarian')) {
    return 'vegetarian';
  }

  // Priority 4: Check for main protein ingredients
  if (recipeName.includes('chicken') || ingredientNames.some(ing => ing.includes('chicken'))) {
    return 'chicken';
  }
  if (recipeName.includes('beef') || ingredientNames.some(ing => ing.includes('beef'))) {
    return 'beef';
  }
  if (recipeName.includes('pork') || ingredientNames.some(ing => ing.includes('pork'))) {
    return 'pork';
  }
  if (recipeName.includes('fish') || recipeName.includes('salmon') || recipeName.includes('tuna') || 
      ingredientNames.some(ing => ing.includes('fish') || ing.includes('salmon') || ing.includes('tuna'))) {
    return 'fish';
  }
  if (recipeName.includes('shrimp') || recipeName.includes('crab') || recipeName.includes('lobster') ||
      ingredientNames.some(ing => ing.includes('shrimp') || ing.includes('crab') || ing.includes('lobster'))) {
    return 'seafood';
  }

  // Priority 5: Check for common breakfast ingredients
  if (ingredientNames.some(ing => ing.includes('egg') && !recipeName.includes('salad'))) {
    return 'breakfast'; // Egg dishes are often breakfast
  }

  // Default fallback
  return 'default';
}

/**
 * Gets the placeholder image URL for a recipe
 */
export function getRecipeImageUrl(recipeData: {
  name?: string;
  title?: string;
  ingredients?: Array<{ name: string; quantity: string; unit: string }> | string[];
  tags?: string[];
  mealType?: string[];
  cuisine?: string;
  imageUrl?: string;
}): string {
  // If recipe already has a valid image URL, return it (for backwards compatibility)
  if (recipeData.imageUrl && 
      recipeData.imageUrl !== '/placeholder.svg' && 
      !recipeData.imageUrl.includes('unsplash.com')) {
    return recipeData.imageUrl;
  }

  const category = determineRecipeImageCategory(recipeData);
  return IMAGE_MAPPING[category];
}
