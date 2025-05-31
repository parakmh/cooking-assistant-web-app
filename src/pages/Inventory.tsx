import { useState, useEffect } from "react";
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
import { Calendar as CalendarIcon, Plus, Search, Upload, Loader2 } from "lucide-react"; // Added Loader2
import IngredientItem from "@/components/IngredientItem";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { apiGet, apiPost, apiDelete, apiPut, InventoryItemData } from "@/lib/api";

// Local interface for form state management
interface InventoryFormItem {
  id?: string;
  name: string;
  quantity: string; // Store as string for form input flexibility
  unit: string;
  category?: string; // Frontend-specific for now, matches mock data structure
  expiryDate?: Date; // Use Date object for calendar
}

// Categories for filtering - can remain as is or be fetched if dynamic
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
  const [inventory, setInventory] = useState<InventoryItemData[]>([]); // Use InventoryItemData type
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [expiringOnly, setExpiringOnly] = useState(false);
  
  // New ingredient form state
  const initialNewIngredientState: InventoryFormItem = {
    name: "",
    quantity: "",
    unit: "pcs",
    category: "Vegetables",
    expiryDate: undefined
  };
  const [newIngredient, setNewIngredient] = useState<InventoryFormItem>(initialNewIngredientState);
  
  const [editingItem, setEditingItem] = useState<InventoryFormItem | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Fetch inventory from backend
  useEffect(() => {
    const fetchInventory = async () => {
      setIsLoading(true);
      try {
        const data = await apiGet<{items: InventoryItemData[]}>("/inventory");
        setInventory(data.items || []);
      } catch (error: any) {
        console.error("Failed to fetch inventory:", error);
        toast({
          title: "Error fetching inventory",
          description: error.data?.message || "Could not load your inventory.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchInventory();
  }, [toast]);
  
  // Filter inventory based on search and category
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    // Assuming item.category exists on InventoryItemData for client-side filtering,
    // though it's not on the backend model. If not, this needs adjustment or removal.
    const matchesCategory = selectedCategory === "All" || (item.category || "Pantry") === selectedCategory;
    const matchesExpiring = !expiringOnly || 
      (item.expiryDate && new Date(item.expiryDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
    
    return matchesSearch && matchesCategory && matchesExpiring;
  });
  
  const handleRemoveIngredient = async (id: string) => {
    console.log(`Attempting to remove ingredient with ID: ${id}`); // Added log
    try {
      await apiDelete(`/inventory/${id}`);
      setInventory(prevInventory => prevInventory.filter(item => item.id !== id));
      toast({
        title: "Ingredient removed",
        description: "Item has been removed from your inventory",
      });
    } catch (error: any) {
      console.error("Failed to remove ingredient:", error);
      toast({
        title: "Error removing ingredient",
        description: error.data?.message || "Could not remove the item.",
        variant: "destructive",
      });
    }
  };
  
  const handleAddIngredient = async () => {
    if (!newIngredient.name || newIngredient.quantity === "") {
      toast({
        title: "Missing information",
        description: "Please fill in name and quantity.",
        variant: "destructive"
      });
      return;
    }
    
    const quantityAsNumber = parseFloat(newIngredient.quantity);
    if (isNaN(quantityAsNumber) || quantityAsNumber <= 0) {
        toast({ title: "Invalid Quantity", description: "Quantity must be a positive number.", variant: "destructive" });
        return;
    }

    const payload = {
      name: newIngredient.name,
      quantity: quantityAsNumber,
      unit: newIngredient.unit,
      expiryDate: newIngredient.expiryDate ? format(newIngredient.expiryDate, "yyyy-MM-dd") : null,
      // category is not sent to backend as it's not in InventoryItem model
    };

    setIsSubmitting(true);
    try {
      const addedItem = await apiPost<InventoryItemData>("/inventory", payload);
      // The backend might not return 'category', so we add it client-side if needed for display
      // or ensure InventoryItemData from api.ts matches backend strictly.
      // For now, assuming addedItem matches InventoryItemData.
      setInventory(prevInventory => [...prevInventory, { ...addedItem, category: newIngredient.category }]);
      setIsAddDialogOpen(false);
      setNewIngredient(initialNewIngredientState);
      toast({
        title: "Ingredient added",
        description: `${addedItem.name} has been added to your inventory`
      });
    } catch (error: any) {
      console.error("Failed to add ingredient:", error);
      toast({
        title: "Error adding ingredient",
        description: error.data?.message || "Could not add the item.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditDialog = (item: InventoryItemData) => {
    setEditingItem({
        id: item.id,
        name: item.name,
        quantity: String(item.quantity), // Convert number to string for form
        unit: item.unit,
        category: item.category || "Pantry", // Use existing or default
        expiryDate: item.expiryDate ? new Date(item.expiryDate) : undefined // Convert string to Date
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateIngredient = async () => {
    if (!editingItem || !editingItem.name || editingItem.quantity === "") {
      toast({ title: "Missing information", description: "Name and quantity are required.", variant: "destructive" });
      return;
    }

    const quantityAsNumber = parseFloat(editingItem.quantity);
    if (isNaN(quantityAsNumber) || quantityAsNumber <= 0) {
        toast({ title: "Invalid Quantity", description: "Quantity must be a positive number.", variant: "destructive" });
        return;
    }

    const payload = {
      name: editingItem.name,
      quantity: quantityAsNumber,
      unit: editingItem.unit,
      expiryDate: editingItem.expiryDate ? format(editingItem.expiryDate, "yyyy-MM-dd") : null,
      // category is not sent
    };
    
    setIsSubmitting(true);
    try {
      const updatedItem = await apiPut<InventoryItemData>(`/inventory/${editingItem.id}`, payload);
      setInventory(prevInventory => 
        prevInventory.map(invItem => 
          invItem.id === updatedItem.id ? { ...updatedItem, category: editingItem.category } : invItem
        )
      );
      setIsEditDialogOpen(false);
      setEditingItem(null);
      toast({
        title: "Ingredient updated",
        description: `${updatedItem.name} has been updated.`
      });
    } catch (error: any) {
      console.error("Failed to update ingredient:", error);
      toast({
        title: "Error updating ingredient",
        description: error.data?.message || "Could not update the item.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleScanReceipt = () => {
    toast({
      title: "Receipt scanning",
      description: "This feature is not yet implemented."
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading your inventory...</p>
      </div>
    );
  }
  
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
                      type="number" // Use number type for better UX, state is string
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
                      <SelectTrigger><SelectValue placeholder="Select unit" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="g">grams (g)</SelectItem>
                        <SelectItem value="kg">kilograms (kg)</SelectItem>
                        <SelectItem value="ml">milliliters (ml)</SelectItem>
                        <SelectItem value="l">liters (l)</SelectItem>
                        <SelectItem value="pcs">pieces (pcs)</SelectItem>
                        <SelectItem value="tbsp">tablespoon (tbsp)</SelectItem>
                        <SelectItem value="tsp">teaspoon (tsp)</SelectItem>
                        <SelectItem value="oz">ounces (oz)</SelectItem>
                        <SelectItem value="lb">pounds (lb)</SelectItem>
                        <SelectItem value="cup">cup</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Category (for filtering)</Label>
                  <Select 
                    value={newIngredient.category} 
                    onValueChange={(value) => setNewIngredient({...newIngredient, category: value})}
                  >
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
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
                        className={cn("justify-start text-left font-normal", !newIngredient.expiryDate && "text-muted-foreground")}
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
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={isSubmitting}>Cancel</Button>
                <Button onClick={handleAddIngredient} className="bg-kitchen-green hover:bg-kitchen-green/90" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add to Inventory
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={handleScanReceipt}><Upload className="mr-2 h-4 w-4" /> Scan Receipt</Button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <Tabs defaultValue="all" className="w-full">
          <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
            <TabsList className="mb-4 md:mb-0">
              <TabsTrigger value="all" onClick={() => setExpiringOnly(false)}>All Ingredients</TabsTrigger>
              <TabsTrigger value="expiring" onClick={() => setExpiringOnly(true)}>Expiring Soon</TabsTrigger>
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
                <SelectTrigger className="w-[150px]"><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>
                  {ingredientCategories.map((category) => ( <SelectItem key={category} value={category}>{category}</SelectItem> ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <TabsContent value={expiringOnly ? "expiring" : "all"} className="mt-0">
            {filteredInventory.length > 0 ? (
              <div className="space-y-2">
                {filteredInventory.map((ingredient) => (
                  <IngredientItem
                    key={ingredient.id}
                    // Adapt data for IngredientItem. Ideally, IngredientItem is updated.
                    ingredient={{
                      ...ingredient,
                      quantity: String(ingredient.quantity), 
                      expiryDate: ingredient.expiryDate || undefined,
                      // Ensure 'category' is available if IngredientItem expects it
                      category: ingredient.category || "Pantry", 
                    }}
                    inInventory={true} 
                    onRemove={() => handleRemoveIngredient(ingredient.id)}
                    onEdit={() => openEditDialog(ingredient)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-muted-foreground mb-4">
                  {expiringOnly ? "No expiring ingredients found." : (searchQuery || selectedCategory !== "All" ? "No ingredients match your filters." : "Your inventory is empty.")}
                </p>
                {(searchQuery || selectedCategory !== "All" || expiringOnly) && (
                  <Button 
                    variant="outline" 
                    onClick={() => { setSearchQuery(""); setSelectedCategory("All"); setExpiringOnly(false); }}
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      {editingItem && (
        <Dialog open={isEditDialogOpen} onOpenChange={(open) => { setIsEditDialogOpen(open); if (!open) setEditingItem(null); }}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Ingredient: {editingItem.name}</DialogTitle>
                <DialogDescription>Update the details of your ingredient.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-name">Name</Label>
                  <Input 
                    id="edit-name" 
                    value={editingItem.name}
                    onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-quantity">Quantity</Label>
                    <Input 
                      id="edit-quantity" 
                      type="number"
                      value={editingItem.quantity}
                      onChange={(e) => setEditingItem({...editingItem, quantity: e.target.value})} 
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-unit">Unit</Label>
                    <Select 
                      value={editingItem.unit}
                      onValueChange={(value) => setEditingItem({...editingItem, unit: value})}
                    >
                      <SelectTrigger><SelectValue placeholder="Select unit" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="g">grams (g)</SelectItem>
                        <SelectItem value="kg">kilograms (kg)</SelectItem>
                        <SelectItem value="ml">milliliters (ml)</SelectItem>
                        <SelectItem value="l">liters (l)</SelectItem>
                        <SelectItem value="pcs">pieces (pcs)</SelectItem>
                        <SelectItem value="tbsp">tablespoon (tbsp)</SelectItem>
                        <SelectItem value="tsp">teaspoon (tsp)</SelectItem>
                        <SelectItem value="oz">ounces (oz)</SelectItem>
                        <SelectItem value="lb">pounds (lb)</SelectItem>
                        <SelectItem value="cup">cup</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-category">Category (for filtering)</Label>
                  <Select 
                    value={editingItem.category} 
                    onValueChange={(value) => setEditingItem({...editingItem, category: value})}
                  >
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      {ingredientCategories.slice(1).map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-expiry">Expiry date (optional)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn("justify-start text-left font-normal", !editingItem.expiryDate && "text-muted-foreground")}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {editingItem.expiryDate ? format(editingItem.expiryDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={editingItem.expiryDate}
                        onSelect={(date) => setEditingItem(prev => prev ? {...prev, expiryDate: date || undefined} : null)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setIsEditDialogOpen(false); setEditingItem(null); }} disabled={isSubmitting}>Cancel</Button>
                <Button onClick={handleUpdateIngredient} className="bg-kitchen-green hover:bg-kitchen-green/90" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
        </Dialog>
      )}

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Ingredient Tips</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-muted rounded-lg p-4">
            <h3 className="font-semibold mb-2">Storage Tips</h3>
            <p className="text-sm text-muted-foreground">Store leafy greens with a paper towel to absorb moisture.</p>
          </div>
          <div className="bg-muted rounded-lg p-4">
            <h3 className="font-semibold mb-2">Expiry Alerts</h3>
            <p className="text-sm text-muted-foreground">Keep an eye on expiry dates to reduce food waste.</p>
          </div>
          <div className="bg-muted rounded-lg p-4">
            <h3 className="font-semibold mb-2">Smart Shopping</h3>
            <p className="text-sm text-muted-foreground">Use your inventory to plan meals and shop smarter.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
