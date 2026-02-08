import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import RecipeCard from '@/components/RecipeCard';
import { RecipeSuggestion, getBackendDomain, getSafeInventory, toggleRecipeFavorite } from '@/lib/api';
import { sanitizeRecipe } from '@/lib/sanitize'; // Import sanitize function
import { getRecipeImageUrl } from '@/lib/recipeImages';
import IngredientBadgeListItem from '@/components/IngredientBadgeListItem';
import { useToast } from '@/hooks/use-toast';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Clock, Users } from 'lucide-react';

// Define a type for the recipe prop expected by RecipeCard
// This should align with the structure of your RecipeCard component's props
interface RecipeCardRecipe {
  id: string;
  title: string;
  imageUrl?: string; // Made optional since we generate it
  cookTime: string;
  servings: number;
  tags: string[];
  ingredients?: Array<{ name: string; quantity: string; unit: string }>;
  mealType?: string[];
  cuisine?: string;
  name?: string;
  ingredientMatchPercentage?: number;
}

// Helper function to transform backend suggestion to RecipeCardRecipe format
const transformSuggestionToRecipeCardProps = (suggestion: RecipeSuggestion): RecipeCardRecipe => ({
  id: suggestion.id,
  title: suggestion.name,
  name: suggestion.name,
  cookTime: `${(suggestion.prepTimeMinutes || 0) + (suggestion.cookTimeMinutes || 0)} mins`,
  servings: suggestion.servings,
  tags: suggestion.tags || [],
  ingredients: suggestion.ingredients,
  mealType: suggestion.mealType,
  cuisine: suggestion.cuisine,
  ingredientMatchPercentage: (suggestion as any).ingredientMatchPercentage || (suggestion as any).ingredient_match_percentage,
  // Don't pass imageUrl - let the new system determine the appropriate image
});

const RecipeResults = () => {
  const location = useLocation();
  const { toast } = useToast();
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeSuggestion | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userStaples, setUserStaples] = useState<string[]>([]);
  const [userInventory, setUserInventory] = useState<string[]>([]);
  const [searchedIngredients, setSearchedIngredients] = useState<string[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  // Ensure results and suggestedForYou are properly destructured and have defaults
  const { queryParams, results } = location.state || { queryParams: {}, results: { results: [], suggestedForYou: [] } };
  
  // SECURITY: Sanitize all recipes from location state to prevent XSS
  const suggestions: RecipeSuggestion[] = (results.suggestedForYou || []).map(sanitizeRecipe);
  const recipesFromSearch: RecipeSuggestion[] = (results.results || []).map(sanitizeRecipe);
  
  // Fetch user's inventory to determine staples and tracked items
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const data = await getSafeInventory();
        const staples = data.items?.filter((item: any) => item.itemType === 'staple').map((item: any) => item.name) || [];
        const tracked = data.items?.filter((item: any) => item.itemType !== 'staple').map((item: any) => item.name) || [];
        setUserStaples(staples);
        setUserInventory(tracked);
      } catch (error) {
        console.error('Failed to fetch inventory:', error);
      }
    };
    
    fetchInventory();
    
    // Parse searched ingredients from queryParams
    if (queryParams.ingredients) {
      const ingredients = queryParams.ingredients.split(',').map((i: string) => i.trim()).filter(Boolean);
      setSearchedIngredients(ingredients);
    }
  }, [queryParams]);

  const handleViewRecipe = (recipe: RecipeSuggestion) => {
    // Sanitize before setting (defense in depth)
    const sanitizedRecipe = sanitizeRecipe(recipe);
    setSelectedRecipe(sanitizedRecipe);
    setIsModalOpen(true);
  };

  const handleToggleFavorite = async (recipe: RecipeSuggestion) => {
    try {
      const result = await toggleRecipeFavorite(recipe.id, recipe);
      
      if (result.isFavorite) {
        setFavoriteIds(prev => new Set([...prev, recipe.id]));
        toast({
          title: "Added to favorites",
          description: "Recipe saved to your favorites",
        });
      } else {
        setFavoriteIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(recipe.id);
          return newSet;
        });
        toast({
          title: "Removed from favorites",
          description: "Recipe removed from your favorites",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update favorites",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Recipe Suggestions</h1>

      {/* Displaying Main Search Results - if any */}
      {recipesFromSearch.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Matching Recipes</h2>
          {/* Changed from grid to flexbox for better centering of wrapped items */}
          <div className="flex flex-wrap justify-center -mx-3">
            {recipesFromSearch.map((recipe: any) => (
              // Added a wrapper div for width control and padding, moved key here
              <div key={recipe.id} className="w-full sm:w-1/2 lg:w-1/3 xl:w-1/4 p-3">
                <RecipeCard
                  recipe={transformSuggestionToRecipeCardProps(recipe as RecipeSuggestion)} // Adapt as needed
                  onView={() => handleViewRecipe(recipe as RecipeSuggestion)}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Displaying Suggested Recipes */}
      {suggestions.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Suggested For You</h2>
          {/* Changed from grid to flexbox for better centering of wrapped items */}
          <div className="flex flex-wrap justify-center -mx-3"> 
            {suggestions.map(suggestion => (
              // Added a wrapper div for width control and padding, moved key here
              <div key={suggestion.id} className="w-full sm:w-1/2 lg:w-1/3 xl:w-1/4 p-3">
                <RecipeCard 
                  recipe={transformSuggestionToRecipeCardProps(suggestion)} 
                  onView={() => handleViewRecipe(suggestion)}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recipe Detail Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedRecipe && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">{selectedRecipe.name}</DialogTitle>
                <DialogDescription className="flex items-center gap-4 mt-2 mb-6">
                  <span className="flex items-center gap-1">
                    <Clock className="h-5 w-5" />
                    <span>{(selectedRecipe.prepTimeMinutes || 0) + (selectedRecipe.cookTimeMinutes || 0)} mins</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-5 w-5" />
                    <span>{selectedRecipe.servings} servings</span>
                  </span>
                </DialogDescription>
              </DialogHeader>
              <div className="relative">
                <img
                  src={getRecipeImageUrl({
                    name: selectedRecipe.name,
                    ingredients: selectedRecipe.ingredients,
                    tags: selectedRecipe.tags,
                    mealType: selectedRecipe.mealType,
                    cuisine: selectedRecipe.cuisine,
                    imageUrl: selectedRecipe.imageUrl
                  })}
                  alt={selectedRecipe.name}
                  className="w-full h-64 object-cover rounded-lg mb-6"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className={`absolute top-3 right-3 ${favoriteIds.has(selectedRecipe.id) ? 'text-red-500' : 'text-gray-400'} hover:text-red-500 bg-white/80 backdrop-blur-sm rounded-full shadow-md`}
                  onClick={() => handleToggleFavorite(selectedRecipe)}
                >
                  <Heart className={`h-6 w-6 ${favoriteIds.has(selectedRecipe.id) ? 'fill-current' : ''}`} />
                </Button>
              </div>
              <section className="mb-6">
                <h3 className="text-xl font-semibold mb-2">Ingredients</h3>
                <ul className="space-y-2">
                  {selectedRecipe.ingredients.map((ing, idx) => (
                    <IngredientBadgeListItem
                      key={idx}
                      ingredient={ing}
                      searchedIngredients={searchedIngredients}
                      userStaples={userStaples}
                      userInventory={userInventory}
                      showBadges={true}
                    />
                  ))}
                </ul>
              </section>
              {selectedRecipe.instructions && (
                <section className="mb-6">
                  <h3 className="text-xl font-semibold mb-2">Instructions</h3>
                  <ol className="list-decimal list-inside space-y-2">
                    {selectedRecipe.instructions.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ol>
                </section>
              )}
              {selectedRecipe.kitchenEquipmentNeeded && (
                <section className="mb-6">
                  <h3 className="text-xl font-semibold mb-2">Equipment Needed</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedRecipe.kitchenEquipmentNeeded.map((eq, idx) => (
                      <li key={idx}>{eq}</li>
                    ))}
                  </ul>
                </section>
              )}
              {selectedRecipe.tags && (
                <div className="flex flex-wrap gap-2">
                  {selectedRecipe.tags.map((tag, idx) => (
                    <Badge key={idx}>{tag}</Badge>
                  ))}
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RecipeResults;
