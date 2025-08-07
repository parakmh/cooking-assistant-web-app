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
    color: "from-cyan-400 to-blue-500"
  },
  { 
    id: "stove", 
    label: "Stove Top", 
    icon: Flame, 
    color: "from-orange-400 to-red-500"
  },
  { 
    id: "oven", 
    label: "Oven", 
    icon: ChefHat, 
    color: "from-amber-400 to-orange-500"
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

  // Shared button styles to match other components - forcing refresh
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

  return (
    <div className="flex flex-wrap justify-center gap-3">
      {equipmentTypes.map((equipment) => {
        const isSelected = selectedEquipment.includes(equipment.id);
        return (
          <Button
            key={equipment.id}
            variant="ghost"
            onClick={() => toggleEquipment(equipment.id)}
            className={getButtonClassName(isSelected, equipment.color)}
            style={isSelected ? {
              backgroundColor: '#E35336' + '1A', // 10% opacity
              borderColor: '#E35336'
            } : {}}
          >
            <equipment.icon className={getIconClassName(isSelected)} />
            <span className={getTextClassName(isSelected)}>
              {equipment.label}
            </span>
          </Button>
        );
      })}
    </div>
  );
};

export default KitchenEquipmentSelector;
