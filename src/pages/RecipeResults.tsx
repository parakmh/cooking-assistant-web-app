import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import RecipeCard from '@/components/RecipeCard'; // Import RecipeCard
import { RecipeSuggestion } from '@/lib/api'; // Import the RecipeSuggestion interface
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
  image: string;
  cookTime: string;
  servings: number;
  difficulty: "easy" | "medium" | "hard";
  tags: string[];
  // Add other properties if your RecipeCard uses them, e.g., ingredients, kitchenEquipmentNeeded
}

// Helper function to transform backend suggestion to RecipeCardRecipe format
const transformSuggestionToRecipeCardProps = (suggestion: RecipeSuggestion): RecipeCardRecipe => ({
  id: suggestion.id,
  title: suggestion.name,
  image: suggestion.imageUrl || '/placeholder.svg', // Fallback image
  cookTime: `${(suggestion.prepTimeMinutes || 0) + (suggestion.cookTimeMinutes || 0)} mins`,
  servings: suggestion.servings,
  difficulty: suggestion.difficulty.toLowerCase() as "easy" | "medium" | "hard", // Ensure lowercase and type assertion
  tags: suggestion.tags || [],
});

const RecipeResults = () => {
  const location = useLocation();
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeSuggestion | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Ensure results and suggestedForYou are properly destructured and have defaults
  const { queryParams, results } = location.state || { queryParams: {}, results: { recipes: [], suggestedForYou: [] } };
  const suggestions: RecipeSuggestion[] = results.suggestedForYou || [];
  const recipesFromSearch = results.recipes || []; // Assuming 'recipes' is the key for main search results

  // Log queryParams to the console
  useEffect(() => {
    console.log("Query Sent to Backend:", queryParams);
  }, [queryParams]);

  const handleViewRecipe = (recipe: RecipeSuggestion) => {
    setSelectedRecipe(recipe);
    setIsModalOpen(true);
  };

  return (
    <div className="kitchen-container py-8">
      <h1 className="text-3xl font-bold mb-6">Recipe Generation Results</h1>

      {/* Displaying Main Search Results - if any */}
      {recipesFromSearch.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Matching Recipes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* You'll need a similar transformer for recipesFromSearch if their structure differs from RecipeCardRecipe */}
            {/* For now, assuming they might be similar or you'll adapt RecipeCard or the data */}
            {recipesFromSearch.map((recipe: any) => (
              <RecipeCard 
                key={recipe.id} 
                recipe={transformSuggestionToRecipeCardProps(recipe as RecipeSuggestion)} // Adapt as needed
                onView={() => handleViewRecipe(recipe as RecipeSuggestion)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Displaying Suggested Recipes */}
      {suggestions.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Suggested For You</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {suggestions.map(suggestion => (
              <RecipeCard 
                key={suggestion.id} 
                recipe={transformSuggestionToRecipeCardProps(suggestion)} 
                onView={() => handleViewRecipe(suggestion)}
              />
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
              <img
                src={selectedRecipe.imageUrl || '/placeholder.svg'}
                alt={selectedRecipe.name}
                className="w-full h-64 object-cover rounded-lg mb-6"
              />
              <section className="mb-6">
                <h3 className="text-xl font-semibold mb-2">Ingredients</h3>
                <ul className="list-disc list-inside space-y-1">
                  {selectedRecipe.ingredients.map((ing, idx) => (
                    <li key={idx}>{ing.quantity} {ing.unit} {ing.name}</li>
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
