
import { Button } from "@/components/ui/button";
import { Wind, Flame } from "lucide-react";

interface KitchenEquipmentSelectorProps {
  selectedEquipment: string[];
  onEquipmentChange: (equipment: string[]) => void;
}

const equipmentTypes = [
  { id: "airfryer", label: "Air Fryer", icon: Wind },
  { id: "stove", label: "Stove", icon: Flame },
  { id: "oven", label: "Oven", icon: "oven" as any },
];

const KitchenEquipmentSelector = ({ selectedEquipment, onEquipmentChange }: KitchenEquipmentSelectorProps) => {
  const toggleEquipment = (equipmentId: string) => {
    const isSelected = selectedEquipment.includes(equipmentId);
    if (isSelected) {
      onEquipmentChange(selectedEquipment.filter(id => id !== equipmentId));
    } else {
      onEquipmentChange([...selectedEquipment, equipmentId]);
    }
  };

  return (
    <div className="flex gap-2 flex-wrap justify-center">
      {equipmentTypes.map((equipment) => (
        <Button
          key={equipment.id}
          variant={selectedEquipment.includes(equipment.id) ? "default" : "outline"}
          size="icon"
          onClick={() => toggleEquipment(equipment.id)}
          className="h-12 w-12 bg-white/90 text-kitchen-dark hover:bg-white/80"
        >
          {equipment.icon === "oven" ? (
            <div className="h-6 w-6 border-2 border-current rounded-sm flex items-center justify-center">
              <div className="h-3 w-3 border border-current rounded-xs"></div>
            </div>
          ) : (
            <equipment.icon className="h-6 w-6" />
          )}
        </Button>
      ))}
    </div>
  );
};

export default KitchenEquipmentSelector;
