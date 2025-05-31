import { Button } from "@/components/ui/button";
import { Coffee, Sun, Moon, Cookie } from "lucide-react";

interface MealTypeSelectorProps {
  selectedMealType: string;
  onMealTypeChange: (mealType: string) => void;
}

const mealTypes = [
  { id: "breakfast", label: "Breakfast", icon: Coffee },
  { id: "lunch", label: "Lunch", icon: Sun },
  { id: "dinner", label: "Dinner", icon: Moon },
  { id: "dessert", label: "Dessert", icon: Cookie },
];

const MealTypeSelector = ({ selectedMealType, onMealTypeChange }: MealTypeSelectorProps) => {
  return (
    <div className="flex gap-2 flex-wrap justify-center">
      {mealTypes.map((mealType) => (
        <Button
          key={mealType.id}
          variant={selectedMealType === mealType.id ? "default" : "outline"}
          size="icon"
          onClick={() => onMealTypeChange(selectedMealType === mealType.id ? "" : mealType.id)}
          className={`h-12 w-12 text-kitchen-dark transition-all duration-150 ease-in-out transform hover:scale-110 ${selectedMealType === mealType.id ? 'bg-kitchen-green text-white ring-2 ring-kitchen-green-dark' : 'bg-white/90 hover:bg-white/80 border-white/30'}`}
        >
          <mealType.icon className="h-6 w-6" />
        </Button>
      ))}
    </div>
  );
};

export default MealTypeSelector;
