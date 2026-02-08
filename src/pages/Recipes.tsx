import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Heart } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import RecipeCard from "@/components/RecipeCard";
import MealTypeSelector from "@/components/MealTypeSelector";
import { useToast } from "@/hooks/use-toast";
import { getRecipeImageUrl } from "@/lib/recipeImages";
import { getSafeInventory, getFavoriteRecipes, toggleRecipeFavorite, type RecipeSuggestion } from "@/lib/api";
import IngredientBadgeListItem from "@/components/IngredientBadgeListItem";
import { FILTER_CONFIG, RecipeFilterState, initialFilterState, isQuickRecipe } from "@/lib/filterConfig";

const RecipesHistory = () => {
  const { toast } = useToast();
  const [userStaples, setUserStaples] = useState<string[]>([]);
  const [userInventory, setUserInventory] = useState<string[]>([]);
  
  const [favoriteRecipes, setFavoriteRecipes] = useState<RecipeSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeSuggestion | null>(null);
  const [isRecipeDialogOpen, setIsRecipeDialogOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<RecipeFilterState>(initialFilterState);
  
  // Fetch user's favorites and inventory
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch inventory
        const inventoryData = await getSafeInventory();
        const staples = inventoryData.items?.filter((item: any) => item.itemType === 'staple').map((item: any) => item.name) || [];
        const tracked = inventoryData.items?.filter((item: any) => item.itemType !== 'staple').map((item: any) => item.name) || [];
        setUserStaples(staples);
        setUserInventory(tracked);
        
        // Fetch favorites
        const favoritesData = await getFavoriteRecipes();
        const recipes = favoritesData.favorites.map(fav => fav.recipe);
        setFavoriteRecipes(recipes);
        
      } catch (error) {
        console.error('Failed to fetch data:', error);
        toast({
          title: "Error",
          description: "Failed to load your favorites. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Filtered recipes based on filters
  const filteredRecipes = favoriteRecipes.filter(recipe => {
    // Filter by diet (check dietary tags)
    if (activeFilters.diet && !recipe.tags?.includes(activeFilters.diet)) {
      return false;
    }

    // Filter by meal type
    if (activeFilters.mealType && !recipe.mealType?.includes(activeFilters.mealType)) {
      return false;
    }

    // Filter by quick cooking time (using shared configuration)
    if (activeFilters.isQuickCooking && !isQuickRecipe(recipe.prepTimeMinutes, recipe.cookTimeMinutes)) {
      return false;
    }
    
    return true;
  });
  
  const handleViewRecipe = (id: string) => {
    const recipe = favoriteRecipes.find(r => r.id === id);
    if (recipe) {
      setSelectedRecipe(recipe);
      setIsRecipeDialogOpen(true);
    }
  };
  
  const handleToggleFavorite = async (id: string) => {
    try {
      await toggleRecipeFavorite(id);
      
      // Remove from local state
      setFavoriteRecipes(prev => prev.filter(recipe => recipe.id !== id));
      
      toast({
        title: "Removed from favorites",
        description: "Recipe removed from your favorites",
      });
    } catch (error) {
      console.error('Failed to remove favorite:', error);
      toast({
        title: "Error",
        description: "Failed to remove from favorites. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="kitchen-container pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Favorite Recipes</h1>
          <p className="text-muted-foreground">
            View and manage your favorite recipes
          </p>
        </div>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filters Sidebar */}
        <div className="lg:w-64 space-y-6">
          <div>
            <h3 className="font-semibold mb-4">Filters</h3>
            
            <div className="space-y-4">
              <div>
                <MealTypeSelector
                  selectedMealType={activeFilters.mealType}
                  onMealTypeChange={(mealType) => setActiveFilters({...activeFilters, mealType})}
                  selectedDietaryPreferences={activeFilters.diet ? [activeFilters.diet] : []}
                  onDietaryPreferencesChange={(prefs) => setActiveFilters({...activeFilters, diet: prefs[0] || ''})}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-3 block">Cooking Time</label>
                <Button
                  variant={activeFilters.isQuickCooking ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveFilters({...activeFilters, isQuickCooking: !activeFilters.isQuickCooking})}
                  className="w-full"
                >
                  {activeFilters.isQuickCooking ? `Quick (< ${FILTER_CONFIG.QUICK_COOKING_THRESHOLD} mins)` : "Any cooking time"}
                </Button>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              className="w-full mt-4"
              onClick={() => setActiveFilters(initialFilterState)}
            >
              Clear Filters
            </Button>
          </div>
          
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">Need new recipes?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Go back to the main page to generate new recipes based on your ingredients.
            </p>
            <Button 
              variant="default" 
              size="sm"
              className="w-full"
              onClick={() => window.location.href = '/'}
            >
              Generate New Recipes
            </Button>
          </div>
        </div>
        
        {/* Recipe Grid */}
        <div className="flex-1">
          {isLoading ? (
            <div className="text-center py-20">
              <p className="text-lg">Loading your favorites...</p>
            </div>
          ) : filteredRecipes.length > 0 ? (
            <div className="recipe-grid">
              {filteredRecipes.map((recipe) => (
                <div key={recipe.id} className="relative">
                  <RecipeCard
                    recipe={{
                      id: recipe.id,
                      title: recipe.name,
                      cookTime: `${(recipe.prepTimeMinutes || 0) + (recipe.cookTimeMinutes || 0)} mins`,
                      servings: recipe.servings || 1,
                      tags: recipe.tags || [],
                      ingredients: recipe.ingredients?.map((ing: any) => 
                        typeof ing === 'string' ? ing : ing.name || ''
                      ) || [],
                      mealType: recipe.mealType || [],
                    }}
                    onView={handleViewRecipe}
                    onSave={() => {}}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 text-red-500 hover:text-red-600"
                    onClick={() => handleToggleFavorite(recipe.id)}
                  >
                    <Heart className="h-5 w-5 fill-current" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg mb-4">No favorite recipes yet</p>
              <p className="text-muted-foreground mb-6">
                Click the heart icon on any recipe to add it to your favorites
              </p>
              <Button onClick={() => window.location.href = '/'}>
                Generate New Recipes
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Recipe View Dialog */}
      <Dialog open={isRecipeDialogOpen} onOpenChange={setIsRecipeDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedRecipe && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedRecipe.name}</DialogTitle>
                <DialogDescription>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{(selectedRecipe.prepTimeMinutes || 0) + (selectedRecipe.cookTimeMinutes || 0)} mins</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{selectedRecipe.servings} servings</span>
                    </div>
                  </div>
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                <img 
                  src={getRecipeImageUrl({
                    title: selectedRecipe.name,
                    ingredients: selectedRecipe.ingredients?.map((ing: any) => 
                      typeof ing === 'string' ? ing : ing.name || ''
                    ) || [],
                    tags: selectedRecipe.tags || [],
                    mealType: selectedRecipe.mealType || []
                  })} 
                  alt={selectedRecipe.name}
                  className="w-full h-64 object-cover rounded-lg"
                />
                
                <div>
                  <h3 className="font-semibold text-lg mb-3">Ingredients</h3>
                  <ul className="space-y-2">
                    {selectedRecipe.ingredients?.map((ingredient: any, index: number) => {
                      const ingName = typeof ingredient === 'string' ? ingredient : ingredient.name || '';
                      return (
                        <IngredientBadgeListItem
                          key={index}
                          ingredient={ingName}
                          userStaples={userStaples}
                          userInventory={userInventory}
                          showBadges={true}
                        />
                      );
                    })}
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg mb-3">Instructions</h3>
                  {selectedRecipe.instructions && Array.isArray(selectedRecipe.instructions) ? (
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                      {selectedRecipe.instructions.map((step, index) => (
                        <li key={index}>{step}</li>
                      ))}
                    </ol>
                  ) : (
                    <p className="text-sm text-muted-foreground">No instructions available</p>
                  )}
                </div>
                
                <div className="flex gap-2 flex-wrap">
                  {selectedRecipe.tags?.map((tag, index) => (
                    <Badge key={index} variant="outline">{tag}</Badge>
                  ))}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RecipesHistory;
