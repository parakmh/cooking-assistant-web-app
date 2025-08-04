import { Button } from "@/components/ui/button";
import { Clock, Zap, ChefHat, Timer } from "lucide-react";

interface CookingTimeSelectorProps {
  selectedCookingTime: string;
  onCookingTimeChange: (time: string) => void;
}

const cookingTimes = [
  { id: "quick", label: "Quick", subtitle: "< 15 min", icon: Zap, color: "from-red-400 to-orange-500" },
  { id: "any", label: "Any Time", subtitle: "No limit", icon: Timer, color: "from-blue-400 to-cyan-500" },
];

const CookingTimeSelector = ({ selectedCookingTime, onCookingTimeChange }: CookingTimeSelectorProps) => {
  return (
    <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto">
      {cookingTimes.map((timeOption) => {
        const isSelected = selectedCookingTime === timeOption.id;
        return (
          <Button
            key={timeOption.id}
            variant="ghost"
            onClick={() => onCookingTimeChange(selectedCookingTime === timeOption.id ? "" : timeOption.id)}
            className={`flex flex-col h-20 w-full p-2 transition-all duration-200 ease-in-out transform hover:scale-105 ${
              isSelected 
                ? `bg-gradient-to-br ${timeOption.color} text-white shadow-lg ring-2 ring-white/50` 
                : 'bg-white/90 hover:bg-white text-kitchen-dark border border-white/50 hover:shadow-md'
            }`}
          >
            <timeOption.icon className={`h-4 w-4 mb-1 ${isSelected ? 'text-white' : 'text-kitchen-dark'}`} />
            <span className={`text-xs font-medium mb-0.5 leading-tight ${isSelected ? 'text-white' : 'text-kitchen-dark'}`}>
              {timeOption.label}
            </span>
            <span className={`text-xs opacity-80 leading-tight ${isSelected ? 'text-white/90' : 'text-kitchen-dark/70'}`}>
              {timeOption.subtitle}
            </span>
          </Button>
        );
      })}
    </div>
  );
};

export default CookingTimeSelector;
