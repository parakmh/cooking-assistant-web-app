import { Button } from "@/components/ui/button";
import { Wind, Flame, ChefHat } from "lucide-react";

interface KitchenEquipmentSelectorProps {
  selectedEquipment: string[];
  onEquipmentChange: (equipment: string[]) => void;
}

const equipmentTypes = [
  { 
    id: "airfryer", 
    label: "Air Fryer", 
    icon: Wind, 
    color: "from-cyan-400 to-blue-500",
    description: "Quick & crispy"
  },
  { 
    id: "stove", 
    label: "Stove Top", 
    icon: Flame, 
    color: "from-orange-400 to-red-500",
    description: "Pan cooking"
  },
  { 
    id: "oven", 
    label: "Oven", 
    icon: ChefHat, 
    color: "from-amber-400 to-orange-500",
    description: "Bake & roast"
  },
];

const KitchenEquipmentSelector = ({ selectedEquipment, onEquipmentChange }: KitchenEquipmentSelectorProps) => {
  const toggleEquipment = (equipment: string) => {
    if (selectedEquipment.includes(equipment)) {
      onEquipmentChange(selectedEquipment.filter(item => item !== equipment));
    } else {
      onEquipmentChange([...selectedEquipment, equipment]);
    }
  };

  // Shared button styles to match other components
  const getButtonClassName = (isSelected: boolean, color: string) => 
    `flex flex-col h-20 w-full p-2 transition-all duration-200 ease-in-out transform hover:scale-105 ${
      isSelected 
        ? `bg-gradient-to-br ${color} text-white shadow-lg ring-2 ring-white/50` 
        : 'bg-white/90 hover:bg-white text-kitchen-dark border border-white/50 hover:shadow-md'
    }`;

  const getIconClassName = (isSelected: boolean) => 
    `h-4 w-4 mb-1 ${isSelected ? 'text-white' : 'text-kitchen-dark'}`;

  const getTextClassName = (isSelected: boolean) => 
    `text-xs font-medium leading-tight text-center ${isSelected ? 'text-white' : 'text-kitchen-dark'}`;

  const getDescriptionClassName = (isSelected: boolean) => 
    `text-xs opacity-80 leading-tight text-center ${isSelected ? 'text-white/90' : 'text-kitchen-dark/70'}`;

  return (
    <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
      {equipmentTypes.map((equipment) => {
        const isSelected = selectedEquipment.includes(equipment.id);
        return (
          <Button
            key={equipment.id}
            variant="ghost"
            onClick={() => toggleEquipment(equipment.id)}
            className={getButtonClassName(isSelected, equipment.color)}
          >
            <equipment.icon className={getIconClassName(isSelected)} />
            <span className={getTextClassName(isSelected)}>
              {equipment.label}
            </span>
            <span className={getDescriptionClassName(isSelected)}>
              {equipment.description}
            </span>
          </Button>
        );
      })}
    </div>
  );
};

export default KitchenEquipmentSelector;
