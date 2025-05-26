
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Plus, Search, Upload } from "lucide-react";
import IngredientItem from "@/components/IngredientItem";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// Mock inventory data
const mockInventory = [
  {
    id: "1",
    name: "Chicken breast",
    quantity: "1",
    unit: "kg",
    expiryDate: "2025-05-20",
    category: "Protein"
  },
  {
    id: "2",
    name: "Spinach",
    quantity: "500",
    unit: "g",
    expiryDate: "2025-05-14",
    category: "Vegetables"
  },
  {
    id: "3",
    name: "Brown rice",
    quantity: "2",
    unit: "kg",
    category: "Grains"
  },
  {
    id: "4",
    name: "Eggs",
    quantity: "12",
    unit: "pcs",
    expiryDate: "2025-05-25",
    category: "Dairy"
  },
  {
    id: "5",
    name: "Greek yogurt",
    quantity: "500",
    unit: "g",
    expiryDate: "2025-05-16",
    category: "Dairy"
  },
  {
    id: "6",
    name: "Tomatoes",
    quantity: "6",
    unit: "pcs",
    expiryDate: "2025-05-18",
    category: "Vegetables"
  }
];

// Categories for filtering
const ingredientCategories = [
  "All",
  "Vegetables",
  "Fruits",
  "Dairy",
  "Protein",
  "Grains",
  "Spices",
  "Pantry"
];

const Inventory = () => {
  const { toast } = useToast();
  const [inventory, setInventory] = useState(mockInventory);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [expiringOnly, setExpiringOnly] = useState(false);
  
  // New ingredient form state
  const [newIngredient, setNewIngredient] = useState({
    name: "",
    quantity: "",
    unit: "pcs",
    category: "Vegetables",
    expiryDate: undefined as Date | undefined
  });
  
  // Filter inventory based on search and category
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const matchesExpiring = !expiringOnly || 
      (item.expiryDate && new Date(item.expiryDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
    
    return matchesSearch && matchesCategory && matchesExpiring;
  });
  
  const handleRemoveIngredient = (id: string) => {
    setInventory(inventory.filter(item => item.id !== id));
    toast({
      title: "Ingredient removed",
      description: "Item has been removed from your inventory",
    });
  };
  
  const handleAddIngredient = () => {
    if (!newIngredient.name || !newIngredient.quantity) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    const newId = (inventory.length + 1).toString();
    const newItem = {
      id: newId,
      name: newIngredient.name,
      quantity: newIngredient.quantity,
      unit: newIngredient.unit,
      category: newIngredient.category,
      expiryDate: newIngredient.expiryDate ? format(newIngredient.expiryDate, "yyyy-MM-dd") : undefined
    };
    
    setInventory([...inventory, newItem]);
    setIsAddDialogOpen(false);
    setNewIngredient({
      name: "",
      quantity: "",
      unit: "pcs",
      category: "Vegetables",
      expiryDate: undefined
    });
    
    toast({
      title: "Ingredient added",
      description: `${newItem.name} has been added to your inventory`
    });
  };
  
  const handleScanReceipt = () => {
    toast({
      title: "Receipt scanning",
      description: "This feature would scan your receipt to add items automatically"
    });
  };
  
  return (
    <div className="kitchen-container">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Your Ingredients</h1>
          <p className="text-muted-foreground">
            Manage your kitchen inventory and keep track of expiring items
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-kitchen-green hover:bg-kitchen-green/90">
                <Plus className="mr-2 h-4 w-4" /> Add Ingredient
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add new ingredient</DialogTitle>
                <DialogDescription>
                  Add a new ingredient to your kitchen inventory
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input 
                    id="name" 
                    placeholder="e.g. Tomatoes" 
                    value={newIngredient.name}
                    onChange={(e) => setNewIngredient({...newIngredient, name: e.target.value})}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input 
                      id="quantity" 
                      placeholder="e.g. 500" 
                      type="text" 
                      value={newIngredient.quantity}
                      onChange={(e) => setNewIngredient({...newIngredient, quantity: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="unit">Unit</Label>
                    <Select 
                      value={newIngredient.unit} 
                      onValueChange={(value) => setNewIngredient({...newIngredient, unit: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="g">grams</SelectItem>
                        <SelectItem value="kg">kg</SelectItem>
                        <SelectItem value="ml">ml</SelectItem>
                        <SelectItem value="l">liters</SelectItem>
                        <SelectItem value="pcs">pieces</SelectItem>
                        <SelectItem value="tbsp">tablespoon</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    value={newIngredient.category} 
                    onValueChange={(value) => setNewIngredient({...newIngredient, category: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {ingredientCategories.slice(1).map((category) => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="expiry">Expiry date (optional)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal",
                          !newIngredient.expiryDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newIngredient.expiryDate ? format(newIngredient.expiryDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={newIngredient.expiryDate}
                        onSelect={(date) => setNewIngredient({...newIngredient, expiryDate: date || undefined})}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddIngredient}>
                  Add to Inventory
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Button variant="outline" onClick={handleScanReceipt}>
            <Upload className="mr-2 h-4 w-4" /> Scan Receipt
          </Button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <Tabs defaultValue="all" className="w-full">
          <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
            <TabsList className="mb-4 md:mb-0">
              <TabsTrigger value="all" onClick={() => setExpiringOnly(false)}>
                All Ingredients
              </TabsTrigger>
              <TabsTrigger value="expiring" onClick={() => setExpiringOnly(true)}>
                Expiring Soon
              </TabsTrigger>
            </TabsList>
            
            <div className="flex space-x-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search ingredients..."
                  className="w-full md:w-[200px] pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {ingredientCategories.map((category) => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <TabsContent value="all" className="mt-0">
            {filteredInventory.length > 0 ? (
              <div className="space-y-2">
                {filteredInventory.map((ingredient) => (
                  <IngredientItem
                    key={ingredient.id}
                    ingredient={ingredient}
                    inInventory={true}
                    onRemove={handleRemoveIngredient}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-muted-foreground mb-4">No ingredients found</p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("All");
                    setExpiringOnly(false);
                  }}
                >
                  Clear filters
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="expiring" className="mt-0">
            {filteredInventory.length > 0 ? (
              <div className="space-y-2">
                {filteredInventory.map((ingredient) => (
                  <IngredientItem
                    key={ingredient.id}
                    ingredient={ingredient}
                    inInventory={true}
                    onRemove={handleRemoveIngredient}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-muted-foreground">No expiring ingredients found</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Ingredient Tips</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-muted rounded-lg p-4">
            <h3 className="font-semibold mb-2">Storage Tips</h3>
            <p className="text-sm text-muted-foreground">
              Store leafy greens with a paper towel to absorb moisture and keep them fresh longer.
            </p>
          </div>
          <div className="bg-muted rounded-lg p-4">
            <h3 className="font-semibold mb-2">Expiry Alerts</h3>
            <p className="text-sm text-muted-foreground">
              Receive notifications when your ingredients are about to expire to reduce food waste.
            </p>
          </div>
          <div className="bg-muted rounded-lg p-4">
            <h3 className="font-semibold mb-2">Inventory Management</h3>
            <p className="text-sm text-muted-foreground">
              Regularly update your inventory to get better recipe recommendations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
