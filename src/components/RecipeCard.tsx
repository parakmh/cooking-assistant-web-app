import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, User } from "lucide-react";
import { getBackendDomain } from "@/lib/api";
import { getRecipeImageUrl } from "@/lib/recipeImages";

interface Recipe {
  id: string;
  title: string;
  imageUrl?: string; // Made optional since we'll generate it
  cookTime: string;
  servings: number;
  difficulty: "easy" | "medium" | "hard";
  tags: string[];
  ingredients?: string[] | Array<{ name: string; quantity: string; unit: string }>;
  mealType?: string[];
  cuisine?: string;
  name?: string; // Some recipes use 'name' instead of 'title'
}

interface RecipeCardProps {
  recipe: Recipe;
  onView?: (id: string) => void;
  onSave?: (id: string) => void;
  saved?: boolean;
}

export default function RecipeCard({ recipe, onView, onSave, saved = false }: RecipeCardProps) {
  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSave?.(recipe.id);
  };
  
  const handleView = () => {
    onView?.(recipe.id);
  };
  
  const difficultyColor = {
    easy: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    hard: "bg-red-100 text-red-800"
  };

  // Determine the image source using the new mapping system
  const imageSrc = getRecipeImageUrl({
    name: recipe.name,
    title: recipe.title,
    ingredients: recipe.ingredients,
    tags: recipe.tags,
    mealType: recipe.mealType,
    cuisine: recipe.cuisine,
    imageUrl: recipe.imageUrl
  });
  
  // Fallback to placeholder.svg if the mapped image doesn't exist or for backwards compatibility
  const finalImageSrc = imageSrc.startsWith('/images/placeholders/') 
    ? imageSrc 
    : (recipe.imageUrl?.startsWith('/') ? `${getBackendDomain()}${recipe.imageUrl}` : (recipe.imageUrl || '/placeholder.svg'));
  
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
      <div className="relative h-48 overflow-hidden">
        <img
          src={finalImageSrc}
          alt={recipe.title || recipe.name || 'Recipe image'}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 right-2 flex flex-col gap-2">
          <span className={`badge ${difficultyColor[recipe.difficulty]} text-xs px-2 py-1 rounded-full`}>
            {recipe.difficulty.charAt(0).toUpperCase() + recipe.difficulty.slice(1)}
          </span>
        </div>
      </div>
      
      <CardHeader className="p-4 pb-0">
        <h3 className="font-medium text-lg line-clamp-2">{recipe.title}</h3>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{recipe.cookTime}</span>
          </div>
          <div className="flex items-center gap-1">
            <User className="h-4 w-4" />
            <span>{recipe.servings} servings</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-2 flex-grow">
        <div className="flex flex-wrap gap-1 mt-3">
          {recipe.tags.map((tag, index) => (
            <span key={index} className="badge bg-muted text-xs px-2 py-1 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex justify-between">
        <Button variant="outline" size="sm" className="w-full" onClick={handleView}>
          View Recipe
        </Button>
      </CardFooter>
    </Card>
  );
}
