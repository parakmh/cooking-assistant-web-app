import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getSafeRecipe, RecipeSuggestion } from '@/lib/api';
import { getRecipeImageUrl } from '@/lib/recipeImages';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Users } from 'lucide-react';

const RecipeDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: recipe, isLoading, error } = useQuery<RecipeSuggestion, Error>({
    queryKey: ['recipe', id],
    queryFn: () => getSafeRecipe(id!), // Using safe wrapper
  });

  if (isLoading) return <div className="kitchen-container py-8">Loading recipe details...</div>;
  if (error || !recipe) return <div className="kitchen-container py-8">Error loading recipe details.</div>;

  return (
    <div className="kitchen-container py-8">
      <Button variant="outline" asChild>
        <Link to="/recipes">Back to Recipes</Link>
      </Button>
      <h1 className="text-3xl font-bold mt-4 mb-6">{recipe.name}</h1>
      <img
        src={getRecipeImageUrl({
          name: recipe.name,
          ingredients: recipe.ingredients,
          tags: recipe.tags,
          mealType: recipe.mealType,
          cuisine: recipe.cuisine,
          imageUrl: recipe.imageUrl
        })}
        alt={recipe.name}
        className="w-full h-64 object-cover rounded-lg mb-6"
      />
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-1">
          <Clock className="h-5 w-5" />
          <span>{(recipe.prepTimeMinutes || 0) + (recipe.cookTimeMinutes || 0)} mins</span>
        </div>
        <div className="flex items-center gap-1">
          <Users className="h-5 w-5" />
          <span>{recipe.servings} servings</span>
        </div>
      </div>
      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Ingredients</h2>
        <ul className="list-disc list-inside space-y-1">
          {recipe.ingredients.map((ing, idx) => (
            <li key={idx}>{ing.quantity} {ing.unit} {ing.name}</li>
          ))}
        </ul>
      </section>
      {recipe.instructions && (
        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Instructions</h2>
          <ol className="list-decimal list-inside space-y-2">
            {recipe.instructions.map((step, idx) => (
              <li key={idx}>{step}</li>
            ))}
          </ol>
        </section>
      )}
      {recipe.kitchenEquipmentNeeded && (
        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Equipment Needed</h2>
          <ul className="list-disc list-inside space-y-1">
            {recipe.kitchenEquipmentNeeded.map((eq, idx) => (
              <li key={idx}>{eq}</li>
            ))}
          </ul>
        </section>
      )}
      {recipe.tags && (
        <div className="mb-6 flex flex-wrap gap-2">
          {recipe.tags.map((tag, idx) => (
            <Badge key={idx}>{tag}</Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecipeDetailsPage;