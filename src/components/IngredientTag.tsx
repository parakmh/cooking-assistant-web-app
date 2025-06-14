import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface IngredientTagProps {
  ingredient: string;
  onRemove: () => void;
}

const IngredientTag = ({ ingredient, onRemove }: IngredientTagProps) => {
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 bg-kitchen-green text-white rounded-full text-sm border border-kitchen-green-dark shadow-sm">
      {ingredient}
      <Button
        variant="ghost"
        size="icon"
        className="h-4 w-4 text-white hover:bg-white/20 hover:text-white"
        onClick={onRemove}
      >
        <X className="h-3 w-3" />
      </Button>
    </span>
  );
};

export default IngredientTag;
