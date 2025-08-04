import { Button } from "@/components/ui/button";
import { Coffee, Sun, Moon, Cookie, Zap, Leaf, Wheat, Milk, TreePine, Carrot, Heart } from "lucide-react";

interface MealTypeSelectorProps {
  selectedMealType: string;
  onMealTypeChange: (mealType: string) => void;
  selectedDietaryPreferences?: string[];
  onDietaryPreferencesChange?: (preferences: string[]) => void;
}

const mealTypes = [
  // Main meal types
  { id: "breakfast", label: "Breakfast", icon: Coffee, color: "from-amber-600 to-orange-600", category: "meal" },
  { id: "lunch", label: "Lunch", icon: Sun, color: "from-yellow-300 to-yellow-500", category: "meal" },
  { id: "dinner", label: "Dinner", icon: Moon, color: "from-blue-500 to-purple-600", category: "meal" },
  { id: "dessert", label: "Dessert", icon: Cookie, color: "from-pink-400 to-red-500", category: "meal" },
  { id: "smoothie", label: "Smoothie", icon: Zap, color: "from-green-400 to-emerald-500", category: "meal" },
  
  // Dietary preferences - match the Profile.tsx structure
  { id: "vegetarian", label: "Vegetarian", icon: Leaf, color: "from-green-500 to-green-600", category: "dietary" },
  { id: "vegan", label: "Vegan", icon: Heart, color: "from-emerald-500 to-green-700", category: "dietary" },
  { id: "glutenFree", label: "Gluten-Free", icon: Wheat, color: "from-amber-500 to-yellow-600", category: "dietary" },
  { id: "dairyFree", label: "Dairy-Free", icon: Milk, color: "from-blue-400 to-cyan-500", category: "dietary" },
  { id: "nutFree", label: "Nut-Free", icon: TreePine, color: "from-orange-500 to-red-500", category: "dietary" },
  { id: "lowCarb", label: "Low Carb", icon: Carrot, color: "from-purple-500 to-pink-500", category: "dietary" },
];

const MealTypeSelector = ({ 
  selectedMealType, 
  onMealTypeChange, 
  selectedDietaryPreferences = [],
  onDietaryPreferencesChange 
}: MealTypeSelectorProps) => {
  const mealTypesOnly = mealTypes.filter(type => type.category === "meal");
  const dietaryOptions = mealTypes.filter(type => type.category === "dietary");

  const handleDietaryToggle = (dietaryId: string) => {
    if (!onDietaryPreferencesChange) return;
    
    const newPreferences = selectedDietaryPreferences.includes(dietaryId)
      ? selectedDietaryPreferences.filter(id => id !== dietaryId)
      : [...selectedDietaryPreferences, dietaryId];
    
    onDietaryPreferencesChange(newPreferences);
  };

  return (
    <div className="space-y-4">
      {/* Meal Types */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-white block text-center">Meal Type</h4>
        <div className="flex flex-wrap justify-center gap-3 max-w-2xl mx-auto">
          {mealTypesOnly.map((mealType) => {
            const isSelected = selectedMealType === mealType.id;
            return (
              <Button
                key={mealType.id}
                variant="ghost"
                onClick={() => onMealTypeChange(selectedMealType === mealType.id ? "" : mealType.id)}
                className={`flex flex-col h-20 w-24 p-2 transition-all duration-200 ease-in-out transform hover:scale-105 ${
                  isSelected 
                    ? `bg-gradient-to-br ${mealType.color} text-white shadow-lg ring-2 ring-white/50` 
                    : 'bg-white/90 hover:bg-white text-kitchen-dark border border-white/50 hover:shadow-md'
                }`}
              >
                <mealType.icon className={`h-4 w-4 mb-1 ${isSelected ? 'text-white' : 'text-kitchen-dark'}`} />
                <span className={`text-xs font-medium leading-tight ${isSelected ? 'text-white' : 'text-kitchen-dark'}`}>
                  {mealType.label}
                </span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Dietary Preferences */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-white block text-center">
          Dietary Preferences
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-2xl mx-auto">
          {dietaryOptions.map((dietary) => {
            const isSelected = selectedDietaryPreferences.includes(dietary.id);
            return (
              <Button
                key={dietary.id}
                variant="ghost"
                onClick={() => handleDietaryToggle(dietary.id)}
                className={`flex flex-col h-16 w-full p-2 transition-all duration-200 ease-in-out transform hover:scale-105 ${
                  isSelected 
                    ? `bg-gradient-to-br ${dietary.color} text-white shadow-lg ring-2 ring-white/50` 
                    : 'bg-white/90 hover:bg-white text-kitchen-dark border border-white/50 hover:shadow-md'
                }`}
              >
                <dietary.icon className={`h-3 w-3 mb-1 ${isSelected ? 'text-white' : 'text-kitchen-dark'}`} />
                <span className={`text-xs font-medium leading-tight text-center ${isSelected ? 'text-white' : 'text-kitchen-dark'}`}>
                  {dietary.label}
                </span>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MealTypeSelector;
