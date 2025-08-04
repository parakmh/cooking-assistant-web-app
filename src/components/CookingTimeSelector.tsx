import { Button } from "@/components/ui/button";
import { Clock, Zap, ChefHat, Timer } from "lucide-react";

interface CookingTimeSelectorProps {
  selectedCookingTime: string;
  onCookingTimeChange: (time: string) => void;
}

const cookingTimes = [
  { id: "quick", label: "Quick (< 15 min)", icon: Zap, color: "from-red-400 to-orange-500" },
  { id: "any", label: "Any Time", icon: Timer, color: "from-blue-400 to-cyan-500" },
];

const CookingTimeSelector = ({ selectedCookingTime, onCookingTimeChange }: CookingTimeSelectorProps) => {
  // Shared button styles to match MealTypeSelector
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

  const getSubtitleClassName = (isSelected: boolean) => 
    `text-xs opacity-80 leading-tight text-center ${isSelected ? 'text-white/90' : 'text-kitchen-dark/70'}`;

  return (
    <div className="grid grid-cols-2 gap-3 max-w-60 mx-auto">
      {cookingTimes.map((timeOption) => {
        const isSelected = selectedCookingTime === timeOption.id;
        return (
          <Button
            key={timeOption.id}
            variant="ghost"
            onClick={() => onCookingTimeChange(selectedCookingTime === timeOption.id ? "" : timeOption.id)}
            className={getButtonClassName(isSelected, timeOption.color)}
          >
            <timeOption.icon className={getIconClassName(isSelected)} />
            <span className={getTextClassName(isSelected)}>
              {timeOption.label}
            </span>
          </Button>
        );
      })}
    </div>
  );
};

export default CookingTimeSelector;
