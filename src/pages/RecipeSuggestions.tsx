import { useState, useEffect } from "react";
import RecipeCard from "@/components/RecipeCard";
import { apiGet } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

// Define the structure of a recipe suggestion based on your API response
// This might be similar to your existing Recipe type but could have additional fields
// like 'matchScore' or 'reasonForSuggestion'.
interface RecipeSuggestion {
  id: string;
  name: string; // Changed from title to name to match backend
  description?: string;
  mealType: string[];
  cuisine: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  difficulty: "easy" | "medium" | "hard"; // Assuming backend uses lowercase
  averageRating?: number;
  ratingsCount?: number;
  imageUrl?: string;
  ingredients: { name: string; quantity: string; unit: string }[];
  instructions?: string[];
  kitchenEquipmentNeeded?: string[];
  tags?: string[];
  // Add any other fields specific to suggestions, e.g.:
  // matchScore?: number;
  // reasonForSuggestion?: string;
  // userHasIngredients?: number; // Number of ingredients the user has
  // missingIngredients?: string[];
}

interface RecipeSuggestionsResponse {
  suggestions: RecipeSuggestion[];
  // Add other potential fields from the response, like message or userId
}


export default function RecipeSuggestionsPage() {
  const [suggestions, setSuggestions] = useState<RecipeSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSuggestions = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Assuming your backend endpoint for suggestions is /api/recipes/suggestions
        // and it returns an object with a \'suggestions\' array.
        const response = await apiGet<RecipeSuggestionsResponse>('/recipes/suggestions');
        if (response && response.suggestions) {
          setSuggestions(response.suggestions);
        } else {
          // Handle cases where response.suggestions might be undefined or empty
          // even if the API call itself was successful.
          setSuggestions([]);
          toast({
            title: "No Suggestions",
            description: "Could not fetch any recipe suggestions at this time.",
            variant: "default",
          });
        }
      } catch (err: any) {
        console.error("Failed to fetch recipe suggestions:", err);
        setError("Failed to load recipe suggestions. Please try again later.");
        toast({
          title: "Error",
          description: err.data?.message || "Could not fetch recipe suggestions.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestions();
  }, [toast]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading recipe suggestions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }
  
  // Helper to transform RecipeSuggestion to the format expected by RecipeCard
  // This is crucial if RecipeCard expects different prop names or structures.
  const transformSuggestionToRecipeCardProps = (suggestion: RecipeSuggestion) => ({
    id: suggestion.id,
    title: suggestion.name, // Map 'name' to 'title'
    image: suggestion.imageUrl || "/placeholder.svg", // Provide a fallback image
    cookTime: `${suggestion.prepTimeMinutes + suggestion.cookTimeMinutes} mins`, // Calculate total time
    servings: suggestion.servings,
    difficulty: suggestion.difficulty,
    tags: suggestion.tags || [],
    // ingredients: suggestion.ingredients.map(ing => `${ing.quantity} ${ing.unit} ${ing.name}`), // Example transformation
    // kitchenEquipmentNeeded: suggestion.kitchenEquipmentNeeded, // Pass through if RecipeCard can use it
    // matchPercentage: calculateMatch(suggestion) // Example of adding a dynamic prop
  });


  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Recipe Suggestions For You</h1>
        <p className="text-muted-foreground">
          Handpicked ideas based on your preferences and available ingredients.
        </p>
      </div>

      {suggestions.length === 0 && !isLoading && (
        <div className="text-center py-10">
          <p className="text-xl text-muted-foreground">No suggestions available at the moment.</p>
          <p className="text-sm text-muted-foreground">Try adjusting your profile preferences or adding more items to your inventory.</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {suggestions.map((suggestion) => (
          <RecipeCard
            key={suggestion.id}
            recipe={transformSuggestionToRecipeCardProps(suggestion)}
            // onView={(id) => console.log(\`View recipe ${id}\`)} // Implement view functionality
            // onSave={(id) => console.log(\`Save recipe ${id}\`)} // Implement save functionality
          />
        ))}
      </div>
      
      {/* Consider adding pagination or a "Load More" button if suggestions can be numerous */}
      {/* Example:
      {suggestions.length > 0 && (
        <div className="mt-8 text-center">
          <Button variant="outline">Load More Suggestions</Button>
        </div>
      )}
      */}
    </div>
  );
}
