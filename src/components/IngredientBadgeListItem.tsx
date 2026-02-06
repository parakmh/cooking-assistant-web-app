import React from 'react';
import { Star, CheckCircle2, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface IngredientBadgeListItemProps {
  ingredient: {
    name: string;
    quantity?: string | number;
    unit?: string;
  };
  searchedIngredients?: string[]; // Ingredients the user searched for
  userStaples?: string[]; // User's kitchen staples
  userInventory?: string[]; // User's tracked inventory items
  showBadges?: boolean; // Whether to show badges at all
}

/**
 * Component to display a recipe ingredient with appropriate badges:
 * ⭐ Staple - ingredient is in user's kitchen staples
 * ✅ Have - ingredient was searched or is in user's inventory
 * ❌ Missing - ingredient is not available
 */
export const IngredientBadgeListItem: React.FC<IngredientBadgeListItemProps> = ({
  ingredient,
  searchedIngredients = [],
  userStaples = [],
  userInventory = [],
  showBadges = true,
}) => {
  const ingredientName = ingredient.name.toLowerCase().trim();
  
  // Check if ingredient is a staple
  const isStaple = userStaples.some(staple => {
    const stapleLower = staple.toLowerCase().trim();
    return ingredientName.includes(stapleLower) || stapleLower.includes(ingredientName);
  });
  
  // Check if ingredient was searched or is in inventory
  const isSearched = searchedIngredients.some(searched => {
    const searchedLower = searched.toLowerCase().trim();
    return ingredientName.includes(searchedLower) || searchedLower.includes(ingredientName);
  });
  
  const isInInventory = userInventory.some(inv => {
    const invLower = inv.toLowerCase().trim();
    return ingredientName.includes(invLower) || invLower.includes(ingredientName);
  });
  
  const haveIngredient = isSearched || isInInventory;
  
  // Determine badge to show (priority: staple > have > missing)
  let badge: React.ReactNode = null;
  if (showBadges) {
    if (isStaple) {
      badge = (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 ml-2">
          <Star className="h-3 w-3 mr-1 fill-amber-600 text-amber-600" />
          Staple
        </Badge>
      );
    } else if (haveIngredient) {
      badge = (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 ml-2">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Have
        </Badge>
      );
    } else {
      badge = (
        <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200 ml-2">
          <X className="h-3 w-3 mr-1" />
          Need
        </Badge>
      );
    }
  }
  
  const displayText = ingredient.quantity && ingredient.unit
    ? `${ingredient.quantity} ${ingredient.unit} ${ingredient.name}`
    : ingredient.name;
  
  return (
    <li className="flex items-center justify-between">
      <span>{displayText}</span>
      {badge}
    </li>
  );
};

export default IngredientBadgeListItem;
