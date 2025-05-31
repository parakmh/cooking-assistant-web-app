import React from 'react';
import { Button } from '@/components/ui/button';
import { Check, Plus, Trash, Edit3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Ingredient {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  expiryDate?: string;
  category: string;
}

interface IngredientItemProps {
  ingredient: Ingredient;
  inInventory?: boolean;
  onAdd?: (id: string) => void;
  onRemove?: (id: string) => void;
  onEdit?: (id: string) => void; // Add onEdit to props
  onSelect?: (id: string) => void;
  selected?: boolean;
}

export default function IngredientItem({ 
  ingredient, 
  inInventory = false,
  onAdd,
  onRemove,
  onEdit, // Destructure onEdit
  onSelect,
  selected = false
}: IngredientItemProps) {
  // Calculate days until expiry if expiryDate exists
  const daysUntilExpiry = ingredient.expiryDate ? 
    Math.ceil((new Date(ingredient.expiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24)) : null;
  
  const handleAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (inInventory) {
      onRemove?.(ingredient.id);
    } else {
      onAdd?.(ingredient.id);
    }
  };
  
  const handleSelect = () => {
    onSelect?.(ingredient.id);
  };
  
  const expiryBadgeColor = daysUntilExpiry !== null ? 
    daysUntilExpiry <= 3 ? 'bg-red-100 text-red-800' :
    daysUntilExpiry <= 7 ? 'bg-yellow-100 text-yellow-800' : 
    'bg-green-100 text-green-800' : '';
  
  return (
    <div 
      className={`flex items-center justify-between p-3 border rounded-md mb-2 hover:bg-muted/50 transition-colors ${selected ? 'bg-muted' : ''}`}
      onClick={onSelect ? handleSelect : undefined}
    >
      <div className="flex items-center gap-2">
        {onSelect && (
          <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selected ? 'bg-primary border-primary' : 'border-gray-300'}`}>
            {selected && <Check className="text-primary-foreground w-3 h-3" />}
          </div>
        )}
        <div>
          <div className="font-medium">{ingredient.name}</div>
          <div className="text-sm text-muted-foreground">
            {ingredient.quantity} {ingredient.unit}
            <span className="mx-2">•</span>
            {ingredient.category}
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {inInventory && daysUntilExpiry !== null && (
          <Badge variant="outline" className={expiryBadgeColor}>
            {daysUntilExpiry <= 0
              ? "Expired"
              : `${daysUntilExpiry} ${daysUntilExpiry === 1 ? "day" : "days"}`}
          </Badge>
        )}
        
        {(onAdd || onRemove || onEdit) && (
          <div className="flex items-center gap-2">
            {inInventory && onEdit && (
              <Button 
                variant="outline" 
                size="icon" 
                onClick={(e) => { e.stopPropagation(); onEdit(ingredient.id); }}
                className="h-8 w-8"
              >
                <Edit3 className="h-4 w-4" /> {/* Assuming Edit3 is imported or use another icon */}
              </Button>
            )}
            {(onAdd || onRemove) && (
              <Button 
                variant={inInventory ? "destructive" : "outline"} 
                size="icon" 
                onClick={handleAction}
                className="h-8 w-8"
              >
                {inInventory ? <Trash className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
