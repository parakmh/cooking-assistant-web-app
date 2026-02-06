import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

const RecipesHistory = () => {
  const { toast } = useToast();
  const [userStaples, setUserStaples] = useState<string[]>([]);
  const [userInventory, setUserInventory] = useState<string[]>([]);
  
  const [favoriteRecipes, setFavoriteRecipes] = useState<RecipeSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeSuggestion | null>(null);
  const [isRecipeDialogOpen, setIsRecipeDialogOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    difficulty: "",
    time: [60],
    diet: "",
    mealType: "",
    isQuickCooking: false,
  });
  
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
    // Filter by difficulty
    if (activeFilters.difficulty && recipe.difficulty !== activeFilters.difficulty) {
      return false;
    }
    
    // Filter by cooking time
    const totalTime = (recipe.prepTimeMinutes || 0) + (recipe.cookTimeMinutes || 0);
    if (activeFilters.time[0] < 60 && totalTime > activeFilters.time[0]) {
      return false;
    }

    // Filter by diet (check dietary tags)
    if (activeFilters.diet && !recipe.tags?.includes(activeFilters.diet)) {
      return false;
    }

    if (activeFilters.mealType && !recipe.mealType?.includes(activeFilters.mealType)) {
      return false;
    }

    if (activeFilters.isQuickCooking && totalTime > 30) {
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
          <h1 className="text-3xl font-bold">Recipes History</h1>
          <p className="text-muted-foreground">
            View and manage your AI-generated recipes
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
                <label className="text-sm font-medium">Diet</label>
                <Select 
                  value={activeFilters.diet} 
                  onValueChange={(value) => setActiveFilters({...activeFilters, diet: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select diet" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="vegetarian">Vegetarian</SelectItem>
                    <SelectItem value="vegan">Vegan</SelectItem>
                    <SelectItem value="keto">Keto</SelectItem>
                    <SelectItem value="paleo">Paleo</SelectItem>
                    <SelectItem value="gluten-free">Gluten-free</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-3 block">Meal Type</label>
                <MealTypeSelector
                  selectedMealType={activeFilters.mealType}
                  onMealTypeChange={(mealType) => setActiveFilters({...activeFilters, mealType})}
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
                  {activeFilters.isQuickCooking ? "Quick (< 30 mins)" : "Any cooking time"}
                </Button>
              </div>
              
              <div>
                <label className="text-sm font-medium">Difficulty</label>
                <Select 
                  value={activeFilters.difficulty} 
                  onValueChange={(value) => setActiveFilters({...activeFilters, difficulty: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              className="w-full mt-4"
              onClick={() => setActiveFilters({
                difficulty: "",
                time: [60],
                diet: "",
                mealType: "",
                isQuickCooking: false,
              })}
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
          <Tabs defaultValue="all">
            <TabsList className="mb-6">
              <TabsTrigger value="all">All Generated Recipes</TabsTrigger>
              <TabsTrigger value="favorites">
                <Heart className="mr-2 h-4 w-4" />
                Favorites ({favoriteRecipes.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-0">
              {filteredRecipes.length > 0 ? (
                <div className="recipe-grid">
                  {filteredRecipes.map((recipe) => (
                    <div key={recipe.id} className="relative">
                      <RecipeCard
                        recipe={recipe}
                        onView={handleViewRecipe}
                        onSave={() => {}} // Not used in this context
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`absolute top-2 right-2 ${recipe.isFavorite ? 'text-red-500' : 'text-gray-400'} hover:text-red-500`}
                        onClick={() => handleToggleFavorite(recipe.id)}
                      >
                        <Heart className={`h-5 w-5 ${recipe.isFavorite ? 'fill-current' : ''}`} />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <p className="text-lg mb-4">No generated recipes match your filters</p>
                  <Button variant="outline" onClick={() => setActiveFilters({
                    difficulty: "",
                    time: [60],
                    diet: "",
                    mealType: "",
                    isQuickCooking: false,
                  })}>
                    Clear Filters
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="favorites" className="mt-0">
              {favoriteRecipes.length > 0 ? (
                <div className="recipe-grid">
                  {favoriteRecipes.map((recipe) => (
                    <div key={recipe.id} className="relative">
                      <RecipeCard
                        recipe={recipe}
                        onView={handleViewRecipe}
                        onSave={() => {}} // Not used in this context
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
                    Click the heart icon on any generated recipe to add it to your favorites
                  </p>
                  <Button onClick={() => window.location.href = '/'}>
                    Generate New Recipes
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Recipe View Dialog */}
      <Dialog open={isRecipeDialogOpen} onOpenChange={setIsRecipeDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedRecipe && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedRecipe.title}</DialogTitle>
                <DialogDescription>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{selectedRecipe.cookTime}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{selectedRecipe.servings} servings</span>
                    </div>
                    <Badge variant="secondary">{selectedRecipe.difficulty}</Badge>
                  </div>
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                <img 
                  src={getRecipeImageUrl({
                    title: selectedRecipe.title,
                    ingredients: selectedRecipe.ingredients,
                    tags: selectedRecipe.tags,
                    mealType: selectedRecipe.mealType
                  })} 
                  alt={selectedRecipe.title}
                  className="w-full h-64 object-cover rounded-lg"
                />
                
                <div>
                  <h3 className="font-semibold text-lg mb-3">Ingredients</h3>
                  <ul className="space-y-2">
                    {selectedRecipe.ingredients.map((ingredient, index) => (
                      <IngredientBadgeListItem
                        key={index}
                        ingredient={{ name: ingredient }}
                        searchedIngredients={[]}
                        userStaples={userStaples}
                        userInventory={userInventory}
                        showBadges={true}
                      />
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg mb-3">Instructions</h3>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      This is a sample recipe generated by AI. Detailed cooking instructions would appear here.
                    </p>
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                      <li>Prepare all ingredients and equipment</li>
                      <li>Follow the cooking process as generated by AI</li>
                      <li>Serve and enjoy your meal</li>
                    </ol>
                  </div>
                </div>
                
                <div className="flex gap-2 flex-wrap">
                  {selectedRecipe.tags.map((tag, index) => (
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
