
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface IngredientTagProps {
  ingredient: string;
  onRemove: () => void;
}

const IngredientTag = ({ ingredient, onRemove }: IngredientTagProps) => {
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 bg-kitchen-green/10 text-kitchen-green rounded-full text-sm border border-kitchen-green/20">
      {ingredient}
      <Button
        variant="ghost"
        size="icon"
        className="h-4 w-4 hover:bg-kitchen-green/20"
        onClick={onRemove}
      >
        <X className="h-3 w-3" />
      </Button>
    </span>
  );
};

export default IngredientTag;
