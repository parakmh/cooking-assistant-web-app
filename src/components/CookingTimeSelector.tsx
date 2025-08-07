import { Button } from "@/components/ui/button";
import { Clock, Zap, ChefHat, Timer } from "lucide-react";

interface CookingTimeSelectorProps {
  selectedCookingTime: string;
  onCookingTimeChange: (time: string) => void;
}

const cookingTimes = [
  { id: "quick", label: "< 15 min", icon: Zap, color: "from-orange-400 to-orange-500" },
  { id: "any", label: "Any Time", icon: Timer, color: "from-orange-400 to-orange-500" },
];

const CookingTimeSelector = ({ selectedCookingTime, onCookingTimeChange }: CookingTimeSelectorProps) => {
  // Shared button styles to match MealTypeSelector - forcing refresh
  const getButtonClassName = (isSelected: boolean, color: string) => 
    `flex flex-col items-center justify-center h-16 w-16 p-2 transition-all duration-200 ease-in-out transform hover:scale-105 ${
      isSelected 
        ? `border-2 shadow-lg` 
        : 'bg-gray-200 border-2 border-gray-300 hover:shadow-md hover:bg-gray-200'
    }`
    + (isSelected ? ' hover:bg-[#E35336]/10' : '');

  const getIconClassName = (isSelected: boolean) => 
    `h-4 w-4 mb-1 ${isSelected ? 'text-[#E35336]' : 'text-gray-500'}`;

  const getTextClassName = (isSelected: boolean) => 
    `text-xs font-medium leading-tight text-center ${isSelected ? 'text-[#E35336]' : 'text-gray-500'}`;

  const getSubtitleClassName = (isSelected: boolean) => 
    `text-xs opacity-80 leading-tight text-center ${isSelected ? 'text-white/90' : 'text-kitchen-dark/70'}`;

  return (
    <div className="flex flex-wrap justify-center gap-3">
      {cookingTimes.map((timeOption) => {
        const isSelected = selectedCookingTime === timeOption.id;
        return (
          <Button
            key={timeOption.id}
            variant="ghost"
            onClick={() => onCookingTimeChange(timeOption.id)}
            className={getButtonClassName(isSelected, timeOption.color)}
            style={isSelected ? {
              backgroundColor: '#E35336' + '1A', // 10% opacity
              borderColor: '#E35336'
            } : {}}
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
