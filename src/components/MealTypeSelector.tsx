import { Button } from "@/components/ui/button";
import { Coffee, Sun, Moon, Cookie, Zap, Leaf, Wheat, Milk, TreePine, Carrot, Heart, ChevronDown } from "lucide-react";
import { useState } from "react";

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
  const [isDietaryExpanded, setIsDietaryExpanded] = useState(false);
  const mealTypesOnly = mealTypes.filter(type => type.category === "meal");
  const dietaryOptions = mealTypes.filter(type => type.category === "dietary");

  const handleDietaryToggle = (dietaryId: string) => {
    if (!onDietaryPreferencesChange) return;
    
    const newPreferences = selectedDietaryPreferences.includes(dietaryId)
      ? selectedDietaryPreferences.filter(id => id !== dietaryId)
      : [...selectedDietaryPreferences, dietaryId];
    
    onDietaryPreferencesChange(newPreferences);
  };

  // Shared button styles to ensure consistency
  const getButtonClassName = (isSelected: boolean, color: string) => 
    `flex flex-col h-16 w-full p-2 transition-all duration-200 ease-in-out transform hover:scale-105 ${
      isSelected 
        ? `bg-gradient-to-br ${color} text-white shadow-lg ring-2 ring-white/50` 
        : 'bg-white/90 hover:bg-white text-kitchen-dark border border-white/50 hover:shadow-md'
    }`;

  const getIconClassName = (isSelected: boolean) => 
    `h-4 w-4 mb-1 ${isSelected ? 'text-white' : 'text-kitchen-dark'}`;

  const getTextClassName = (isSelected: boolean) => 
    `text-xs font-medium leading-tight text-center ${isSelected ? 'text-white' : 'text-kitchen-dark'}`;

  return (
    <div className="space-y-4">
      {/* Meal Types */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-white block text-center">Meal Type</h4>
        <div className="flex flex-wrap justify-center sm:grid sm:grid-cols-5 gap-3 max-w-xl mx-auto">
          {mealTypesOnly.map((mealType) => {
            const isSelected = selectedMealType === mealType.id;
            return (
              <Button
                key={mealType.id}
                variant="ghost"
                onClick={() => onMealTypeChange(selectedMealType === mealType.id ? "" : mealType.id)}
                className={`${getButtonClassName(isSelected, mealType.color)} ${
                  // Fixed width for mobile to ensure consistent sizing
                  'w-20 sm:w-full'
                }`}
              >
                <mealType.icon className={getIconClassName(isSelected)} />
                <span className={getTextClassName(isSelected)}>
                  {mealType.label}
                </span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Dietary Preferences Dropdown */}
      <div className="space-y-3">
        <button
          onClick={() => setIsDietaryExpanded(!isDietaryExpanded)}
          className="flex items-center justify-between w-full max-w-xs mx-auto p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200 border border-white/20 group backdrop-blur-sm"
        >
          <span className="font-medium text-white text-sm">
            Dietary Preferences
            {selectedDietaryPreferences.length > 0 && (
              <span className="ml-2 text-xs text-green-300 font-normal">
                ({selectedDietaryPreferences.length} selected)
              </span>
            )}
          </span>
          <ChevronDown 
            className={`w-4 h-4 text-white/70 transition-transform duration-200 group-hover:text-white ${
              isDietaryExpanded ? 'rotate-180' : ''
            }`}
          />
        </button>
        
        {/* Animated Dropdown Content */}
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isDietaryExpanded ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 max-w-2xl mx-auto pt-2">
            {dietaryOptions.map((dietary) => {
              const isSelected = selectedDietaryPreferences.includes(dietary.id);
              return (
                <Button
                  key={dietary.id}
                  variant="ghost"
                  onClick={() => handleDietaryToggle(dietary.id)}
                  className={getButtonClassName(isSelected, dietary.color)}
                >
                  <dietary.icon className={getIconClassName(isSelected)} />
                  <span className={getTextClassName(isSelected)}>
                    {dietary.label}
                  </span>
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MealTypeSelector;
