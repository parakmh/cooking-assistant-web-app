import React from 'react';
import { Button } from '@/components/ui/button';
import { Star, Trash, Edit3, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface StapleCardProps {
  id: string;
  name: string;
  category?: string;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onEdit: (id: string) => void;
}

export const StapleCard: React.FC<StapleCardProps> = ({
  id,
  name,
  category,
  onToggle,
  onRemove,
  onEdit
}) => {
  return (
    <div className="flex items-center justify-between p-3 border rounded-md bg-amber-50/50 border-amber-200 hover:bg-amber-100/50 transition-colors">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100">
          <Star className="h-4 w-4 text-amber-600 fill-amber-600" />
        </div>
        <div>
          <div className="font-medium flex items-center gap-2">
            {name}
            <Badge variant="outline" className="bg-amber-100/50 text-amber-800 border-amber-300">
              staple
            </Badge>
          </div>
          {category && (
            <div className="text-sm text-muted-foreground">
              {category}
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onToggle(id)}
          className="text-xs"
          title="Convert to tracked ingredient"
        >
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Track
        </Button>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => onEdit(id)}
          className="h-8 w-8"
          title="Edit staple"
        >
          <Edit3 className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => onRemove(id)}
          className="h-8 w-8 hover:text-destructive"
          title="Remove staple"
        >
          <Trash className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default StapleCard;
