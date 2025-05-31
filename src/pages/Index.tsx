import { useState, KeyboardEvent } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Plus, Upload, Trash, X, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import IngredientItem from "@/components/IngredientItem";
import IngredientTag from "@/components/IngredientTag";
import MealTypeSelector from "@/components/MealTypeSelector";
import KitchenEquipmentSelector from "@/components/KitchenEquipmentSelector";
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

// Mock kitchen equipment
const kitchenEquipment = [
  { id: "1", name: "Blender" },
  { id: "2", name: "Food Processor" },
  { id: "3", name: "Stand Mixer" },
  { id: "4", name: "Pressure Cooker" },
  { id: "5", name: "Air Fryer" },
  { id: "6", name: "Slow Cooker" },
  { id: "7", name: "Deep Fryer" },
  { id: "8", name: "Grill" },
  { id: "9", name: "Microwave" },
];

const Index = () => {
  const { toast } = useToast();
  const [inventory, setInventory] = useState(mockInventory);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [expiringOnly, setExpiringOnly] = useState(false);
  
  // Recipe generation form state
  const [ingredientInput, setIngredientInput] = useState("");
  const [ingredientTags, setIngredientTags] = useState<string[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [isQuickCooking, setIsQuickCooking] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [mealType, setMealType] = useState("");
  
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
  
  const handleIngredientInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const ingredient = ingredientInput.trim();
      if (ingredient && !ingredientTags.includes(ingredient)) {
        setIngredientTags([...ingredientTags, ingredient]);
        setIngredientInput("");
      }
    }
  };

  const removeIngredientTag = (ingredient: string) => {
    setIngredientTags(ingredientTags.filter(tag => tag !== ingredient));
  };

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
  
  const handleToggleIngredient = (id: string) => {
    const ingredient = inventory.find(item => item.id === id);
    if (!ingredient) return;
    
    setSelectedIngredients(prev => {
      if (prev.includes(id)) {
        // Remove ingredient from selection and from tags
        setIngredientTags(tags => tags.filter(tag => tag.toLowerCase() !== ingredient.name.toLowerCase()));
        return prev.filter(i => i !== id);
      } else {
        // Add ingredient to selection and to tags
        if (!ingredientTags.some(tag => tag.toLowerCase() === ingredient.name.toLowerCase())) {
          setIngredientTags(prev => [...prev, ingredient.name]);
        }
        return [...prev, id];
      }
    });
  };
  
  const handleGenerateRecipes = () => {
    const ingredientsList = ingredientTags.length > 0 ? `${ingredientTags.length} ingredients` : "no specific ingredients";
    const equipmentInfo = selectedEquipment.length > 0 
      ? `using ${selectedEquipment.join(', ')}`
      : "with any kitchen equipment";
    const timeInfo = isQuickCooking ? "quick cooking time" : "any cooking time";
    const mealInfo = mealType ? `for ${mealType}` : "for any meal type";
    
    const message = `Generated recipes with ${ingredientsList}, ${equipmentInfo}, ${timeInfo}, ${mealInfo}`;
    
    toast({
      title: "Recipes generated",
      description: message,
    });
    
    // Reset form
    setIngredientInput("");
    setIngredientTags([]);
    setSelectedIngredients([]);
    setIsQuickCooking(false);
    setSelectedEquipment([]);
    setMealType("");
  };
  
  const handleScanReceipt = () => {
    toast({
      title: "Receipt scanning",
      description: "This feature would scan your receipt to add items automatically"
    });
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-kitchen-green text-white py-16">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1495195134817-aeb325a55b65?auto=format&fit=crop&w=1920&h=600&q=80')] bg-cover bg-center opacity-20"></div>
        <div className="kitchen-container relative z-10">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <h1 className="text-4xl font-bold mb-6">Your AI-powered kitchen companion</h1>
            <p className="text-xl mb-8">
              Enter your ingredients and preferences, and let AI create the perfect recipe for you
            </p>
            
            {/* Recipe Generation Form */}
            <div className="bg-kitchen-green/25 backdrop-blur-lg rounded-2xl p-8 shadow-2xl ring-1 ring-white/30 space-y-8 text-left">

              {/* Section 1: Ingredients */}
              <div className="bg-black/5 p-4 rounded-lg space-y-4">
                <h3 className="text-xl font-semibold text-white">1. What do you have?</h3>
                <div className="bg-black/5 p-4 rounded-lg">
                  <Input 
                    placeholder="Type ingredient and press Enter or comma..."
                    value={ingredientInput}
                    onChange={(e) => setIngredientInput(e.target.value)}
                    onKeyDown={handleIngredientInputKeyDown}
                    className="bg-white/95 text-kitchen-dark placeholder-gray-500 focus:ring-2 focus:ring-kitchen-orange"
                  />
                  {ingredientTags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {ingredientTags.map((ingredient, index) => (
                        <IngredientTag
                          key={index}
                          ingredient={ingredient}
                          onRemove={() => removeIngredientTag(ingredient)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Section 2: Preferences */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white">2. Your Preferences</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-black/5 p-4 rounded-lg">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white block">Cooking Time</label>
                    <Button
                      variant={isQuickCooking ? "secondary" : "outline"}
                      onClick={() => setIsQuickCooking(!isQuickCooking)}
                      className="w-full bg-white/95 text-kitchen-dark hover:bg-white/90 border-white/40 hover:border-white/60 focus:ring-2 focus:ring-kitchen-orange"
                    >
                      {isQuickCooking ? "Quick (< 30 mins)" : "Any cooking time"}
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white block">Meal Type</label>
                    <MealTypeSelector
                      selectedMealType={mealType}
                      onMealTypeChange={setMealType}
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Kitchen Tools */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white">3. Kitchen Tools (Optional)</h3>
                <div className="bg-black/5 p-4 rounded-lg">
                  <KitchenEquipmentSelector
                    selectedEquipment={selectedEquipment}
                    onEquipmentChange={setSelectedEquipment}
                  />
                </div>
              </div>
              
              {/* Generate Button */}
              <Button 
                onClick={handleGenerateRecipes}
                className="w-full bg-kitchen-orange hover:bg-kitchen-orange/90 text-white font-bold py-4 text-xl rounded-lg shadow-xl transform hover:scale-105 transition-transform duration-150 ease-in-out focus:ring-4 focus:ring-kitchen-orange/50"
              >
                Find My Perfect Recipe!
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Inventory Section */}
      <section className="py-12 kitchen-container">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h2 className="text-3xl font-bold">Your Ingredients</h2>
            <p className="text-muted-foreground">
              Check ingredients to add them to your recipe generation
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
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {filteredInventory.map((ingredient) => (
                    <IngredientItem
                      key={ingredient.id}
                      ingredient={ingredient}
                      inInventory={true}
                      onRemove={handleRemoveIngredient}
                      onSelect={handleToggleIngredient}
                      selected={selectedIngredients.includes(ingredient.id)}
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
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {filteredInventory.map((ingredient) => (
                    <IngredientItem
                      key={ingredient.id}
                      ingredient={ingredient}
                      inInventory={true}
                      onRemove={handleRemoveIngredient}
                      onSelect={handleToggleIngredient}
                      selected={selectedIngredients.includes(ingredient.id)}
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
              <h3 className="font-semibold mb-2">Recipe Generation</h3>
              <p className="text-sm text-muted-foreground">
                Check ingredients above to automatically add them to your recipe generation form.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* AI Features Section */}
      <section className="py-12 bg-kitchen-light">
        <div className="kitchen-container">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl font-bold mb-4">Cook Smarter with AI Recipe Generation</h2>
              <p className="mb-6 text-muted-foreground">
                Our AI-powered kitchen assistant creates personalized recipes based on your ingredients and preferences:
              </p>
              <ul className="space-y-4">
                {[
                  "Generate recipes from ingredients you already have",
                  "Get personalized suggestions based on your preferences",
                  "Specify cooking time, meal type, and equipment constraints",
                  "Save your favorite generated recipes for future use",
                  "Manage your kitchen inventory and reduce waste"
                ].map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <div className="mr-3 mt-1 h-5 w-5 flex items-center justify-center rounded-full bg-kitchen-green text-white">
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Button asChild className="bg-kitchen-green hover:bg-kitchen-green/90">
                  <Link to="/recipes">View Recipe History</Link>
                </Button>
              </div>
            </div>
            <div className="hidden md:block relative">
              <img
                src="https://images.unsplash.com/photo-1493770348161-369560ae357d?auto=format&fit=crop&w=800&h=600&q=80"
                alt="AI Kitchen Assistant"
                className="rounded-lg shadow-xl"
              />
              <div className="absolute -bottom-5 -left-5 bg-white p-4 rounded-lg shadow-lg">
                <div className="text-sm font-semibold mb-1">AI Recipe Generation</div>
                <div className="text-xs text-muted-foreground">Based on your ingredients</div>
                <div className="mt-2 text-kitchen-green font-medium">Chicken & Rice Stir-fry</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
