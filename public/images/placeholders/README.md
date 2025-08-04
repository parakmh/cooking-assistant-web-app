# Recipe Placeholder Images

This directory contains predefined placeholder images for different recipe categories. The system automatically determines which image to use based on the recipe's main ingredient, dish type, or meal category.

## How It Works

The recipe image mapping system automatically assigns images based on:

1. **Dish Type Priority** (highest): pizza, soup, salad, sandwich, pasta, smoothie, rice
2. **Meal Type Priority**: breakfast, dessert
3. **Dietary Preferences**: vegan (includes vegetarian)
4. **Main Protein**: chicken, meat (beef/pork combined), fish (includes seafood)
5. **Default Fallback**: default.png (for curry, stir-fry, bread, etc.)

## Image Files

Replace these placeholder files with actual .png images (recommended size: 800x600 pixels):

- **chicken.png** - Chicken dishes (chicken parmesan, grilled chicken, etc.)
- **meat.png** - Meat dishes (beef stew, steak, pork chops, bacon, burgers, etc.)
- **fish.png** - Fish and seafood dishes (salmon, tuna, cod, shrimp, crab, lobster, etc.)
- **vegan.png** - Vegan and vegetarian dishes (when no specific dish type matches)
- **pasta.png** - Pasta dishes (spaghetti, lasagna, linguine, etc.)
- **rice.png** - Rice dishes (fried rice, risotto, rice bowls, etc.)
- **soup.png** - Soup dishes (chicken soup, tomato soup, etc.)
- **salad.png** - Salad dishes (caesar salad, garden salad, etc.)
- **dessert.png** - Dessert dishes (cakes, cookies, ice cream, etc.)
- **breakfast.png** - Breakfast dishes (pancakes, eggs, cereal, etc.)
- **sandwich.png** - Sandwich dishes (sandwiches, burgers, wraps, etc.)
- **pizza.png** - Pizza dishes
- **smoothie.png** - Smoothie and shake dishes
- **default.png** - Default fallback for unrecognized recipes

## Examples

- "Chicken Teriyaki" → chicken.png
- "Beef Stew" → meat.png
- "Pork Chops" → meat.png
- "Shrimp Pasta" → fish.png (seafood uses fish image)
- "Vegetable Stir Fry" → default.png (stir-fry now falls back to default)
- "Veggie Curry" → default.png (curry now falls back to default)
- "Margherita Pizza" → pizza.png (pizza takes priority over vegetarian)
- "Greek Salad" → salad.png
- "Breakfast Burrito" → breakfast.png (meal type takes priority)
- "Chocolate Cake" → dessert.png
- "Vegetarian Bowl" → vegan.png (vegetarian uses vegan image)
- "Mystery Recipe" → default.png

## Notes

- The system no longer uses random/AI-generated images
- External image URLs (like Unsplash) are ignored in favor of these categorized placeholders
- The mapping prioritizes specific dish types over general dietary preferences
- You can replace any of these files with your own images as needed
