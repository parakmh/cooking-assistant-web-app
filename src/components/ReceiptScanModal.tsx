import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, Loader2, X, Edit3, Plus } from "lucide-react";
import { scanReceipt, bulkAddInventoryItems, ReceiptItem, InventoryItemData } from "@/lib/api";

interface ReceiptScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onItemsAdded: (items: InventoryItemData[]) => void;
}

const ingredientCategories = [
  "Vegetables",
  "Fruits", 
  "Dairy",
  "Protein",
  "Grains",
  "Spices",
  "Pantry",
  "Beverages"
];

const units = [
  "g", "kg", "ml", "l", "pcs", "tbsp", "tsp", "oz", "lb", "cup"
];

const ReceiptScanModal = ({ isOpen, onClose, onItemsAdded }: ReceiptScanModalProps) => {
  const { toast } = useToast();
  const [step, setStep] = useState<'upload' | 'review'>('upload');
  const [isScanning, setIsScanning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [detectedItems, setDetectedItems] = useState<ReceiptItem[]>([]);
  const [editingItems, setEditingItems] = useState<ReceiptItem[]>([]);

  const handleClose = () => {
    setStep('upload');
    setSelectedFile(null);
    setDetectedItems([]);
    setEditingItems([]);
    setIsScanning(false);
    setIsSaving(false);
    onClose();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file.",
          variant: "destructive",
        });
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 10MB.",
          variant: "destructive",
        });
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const handleScanReceipt = async () => {
    if (!selectedFile) return;

    setIsScanning(true);
    try {
      const result = await scanReceipt(selectedFile);
      
      if (result.error) {
        toast({
          title: "Scanning failed",
          description: result.error,
          variant: "destructive",
        });
        return;
      }

      if (result.detected_items.length === 0) {
        toast({
          title: "No items detected",
          description: "Could not detect any food items from the receipt. Please try a clearer image.",
          variant: "destructive",
        });
        return;
      }

      setDetectedItems(result.detected_items);
      setEditingItems([...result.detected_items]);
      setStep('review');
      
      toast({
        title: "Receipt scanned successfully",
        description: `Found ${result.detected_items.length} food items. Please review and modify as needed.`,
      });

    } catch (error: any) {
      console.error("Receipt scanning error:", error);
      toast({
        title: "Scanning failed",
        description: error.data?.error || "Failed to scan receipt. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const updateItem = (index: number, field: keyof ReceiptItem, value: string) => {
    const updated = [...editingItems];
    if (field === 'quantity') {
      const numValue = parseFloat(value);
      if (!isNaN(numValue) && numValue > 0) {
        updated[index] = { ...updated[index], [field]: numValue };
      }
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setEditingItems(updated);
  };

  const removeItem = (index: number) => {
    const updated = editingItems.filter((_, i) => i !== index);
    setEditingItems(updated);
  };

  const addNewItem = () => {
    const newItem: ReceiptItem = {
      name: "",
      quantity: 1,
      unit: "pcs",
      category: "Pantry"
    };
    setEditingItems([...editingItems, newItem]);
  };

  const handleSaveToInventory = async () => {
    const validItems = editingItems.filter(item => 
      item.name.trim() !== "" && 
      item.quantity && 
      parseFloat(item.quantity.toString()) > 0
    );

    if (validItems.length === 0) {
      toast({
        title: "No valid items",
        description: "Please ensure all items have a name and valid quantity.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const result = await bulkAddInventoryItems(validItems);
      
      toast({
        title: "Items added successfully",
        description: result.message,
      });

      if (result.errors && result.errors.length > 0) {
        console.warn("Some items had errors:", result.errors);
      }

      onItemsAdded(result.created_items);
      handleClose();

    } catch (error: any) {
      console.error("Error saving items:", error);
      toast({
        title: "Failed to save items",
        description: error.data?.error || "Failed to add items to inventory.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === 'upload' ? 'Scan Receipt' : 'Review Detected Items'}
          </DialogTitle>
          <DialogDescription>
            {step === 'upload' 
              ? 'Upload a photo of your grocery receipt to automatically add items to your inventory.'
              : 'Review and modify the detected items before adding them to your inventory.'
            }
          </DialogDescription>
        </DialogHeader>

        {step === 'upload' && (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <div className="space-y-2">
                <p className="text-lg font-medium">Upload Receipt Image</p>
                <p className="text-sm text-muted-foreground">
                  Choose a clear photo of your grocery receipt (JPG, PNG, max 10MB)
                </p>
                <Label htmlFor="receipt-upload" className="cursor-pointer">
                  <Button variant="outline" className="mt-2" asChild>
                    <span>
                      {selectedFile ? 'Change Image' : 'Select Image'}
                    </span>
                  </Button>
                </Label>
                <Input
                  id="receipt-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                {selectedFile && (
                  <p className="text-sm text-green-600 mt-2">
                    Selected: {selectedFile.name}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {step === 'review' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                {editingItems.length} items detected. You can edit, remove, or add items before saving.
              </p>
              <Button variant="outline" size="sm" onClick={addNewItem}>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {editingItems.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-center p-3 border rounded-lg">
                  <div className="col-span-4">
                    <Label htmlFor={`name-${index}`} className="text-xs">Name</Label>
                    <Input
                      id={`name-${index}`}
                      value={item.name}
                      onChange={(e) => updateItem(index, 'name', e.target.value)}
                      placeholder="Item name"
                      className="h-8"
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <Label htmlFor={`quantity-${index}`} className="text-xs">Quantity</Label>
                    <Input
                      id={`quantity-${index}`}
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                      min="0"
                      step="0.1"
                      className="h-8"
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <Label htmlFor={`unit-${index}`} className="text-xs">Unit</Label>
                    <Select value={item.unit} onValueChange={(value) => updateItem(index, 'unit', value)}>
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {units.map((unit) => (
                          <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="col-span-3">
                    <Label htmlFor={`category-${index}`} className="text-xs">Category</Label>
                    <Select value={item.category || "Pantry"} onValueChange={(value) => updateItem(index, 'category', value)}>
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ingredientCategories.map((category) => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="col-span-1 flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(index)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isScanning || isSaving}>
            Cancel
          </Button>
          
          {step === 'upload' && (
            <Button 
              onClick={handleScanReceipt} 
              disabled={!selectedFile || isScanning}
              className="bg-kitchen-green hover:bg-kitchen-green/90"
            >
              {isScanning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isScanning ? 'Scanning...' : 'Scan Receipt'}
            </Button>
          )}
          
          {step === 'review' && (
            <>
              <Button variant="outline" onClick={() => setStep('upload')}>
                Back to Upload
              </Button>
              <Button 
                onClick={handleSaveToInventory}
                disabled={editingItems.length === 0 || isSaving}
                className="bg-kitchen-green hover:bg-kitchen-green/90"
              >
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSaving ? 'Saving...' : `Add ${editingItems.length} Items`}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReceiptScanModal;
