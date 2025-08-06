import { useState, KeyboardEvent, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiGet, apiPost, apiDelete, InventoryItemData, UserData } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast"; // Ensure useToast is imported
import { format } from "date-fns"; // For formatting date
import { cn } from "@/lib/utils"; // For conditional classes
import { Calendar } from "@/components/ui/calendar"; // Calendar component
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"; // Popover components
import { Label } from "@/components/ui/label"; // Label component
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"; // Dialog components
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"; // Tabs components
import IngredientItem from "@/components/IngredientItem"; // IngredientItem component
import IngredientTag from "@/components/IngredientTag"; // IngredientTag component
import KitchenEquipmentSelector from "@/components/KitchenEquipmentSelector"; // KitchenEquipmentSelector component
import MealTypeSelector from "@/components/MealTypeSelector"; // MealTypeSelector component
import CookingTimeSelector from "@/components/CookingTimeSelector"; // CookingTimeSelector component
import { CalendarIcon, Clock, Plus, Search, Upload, Loader2, ChefHat, Sparkles } from "lucide-react"; // Icons
import { useAuth } from "@/contexts/AuthContext"; // Import useAuth


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
  { id: "airfryer", name: "Air Fryer" },
  { id: "stove", name: "Stove" },
  { id: "oven", name: "Oven" },
  // Assuming you might want to add more that correspond to the selector's capabilities
  // For now, these are the ones defined in KitchenEquipmentSelector.tsx
  // Add other equipment if they are also managed by KitchenEquipmentSelector
  // For example, if Blender, Food Processor etc. were to be added to KitchenEquipmentSelector:
  // { id: "blender", name: "Blender" },
  // { id: "foodprocessor", name: "Food Processor" },
  // { id: "standmixer", name: "Stand Mixer" },
  // { id: "pressurecooker", name: "Pressure Cooker" },
  // { id: "slowcooker", name: "Slow Cooker" },
  // { id: "deepfryer", name: "Deep Fryer" },
  // { id: "grill", name: "Grill" },
  // { id: "microwave", name: "Microwave" },
];

const Index = () => {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const [inventory, setInventory] = useState<InventoryItemData[]>([]); // Use InventoryItemData type
  const [isLoadingInventory, setIsLoadingInventory] = useState(true); // Added loading state for inventory
  const [isSubmittingIngredient, setIsSubmittingIngredient] = useState(false); // Added for add ingredient loading
  const [isGeneratingRecipes, setIsGeneratingRecipes] = useState(false); // Added for recipe generation loading
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [expiringOnly, setExpiringOnly] = useState(false);
  
  // Recipe generation form state
  const [ingredientInput, setIngredientInput] = useState("");
  const [ingredientTags, setIngredientTags] = useState<string[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [cookingTime, setCookingTime] = useState("any");
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>(kitchenEquipment.map(tool => tool.id));
  const [mealType, setMealType] = useState("");
  const [selectedDietaryPreferences, setSelectedDietaryPreferences] = useState<string[]>([]);
  const navigate = useNavigate();
  
  // New ingredient form state
  const [newIngredient, setNewIngredient] = useState({
    name: "",
    quantity: "",
    unit: "pcs",
    category: "Vegetables",
    expiryDate: undefined as Date | undefined
  });

  // Fetch inventory from backend - only when authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoadingInventory(false);
      setInventory([]);
      return;
    }

    const fetchInventory = async () => {
      setIsLoadingInventory(true);
      try {
        const data = await apiGet<{items: InventoryItemData[]}>("/inventory");
        setInventory(data.items || []);
      } catch (error: any) {
        console.error("Failed to fetch inventory for landing page:", error);
        toast({
          title: "Error fetching ingredients",
          description: error.data?.message || "Could not load your ingredients for the landing page.",
          variant: "destructive",
        });
        setInventory([]); // Set to empty array on error
      } finally {
        setIsLoadingInventory(false);
      }
    };
    fetchInventory();
  }, [toast, isAuthenticated]);

  // Fetch user profile to pre-select dietary preferences
  useEffect(() => {
    if (!isAuthenticated) {
      setSelectedDietaryPreferences([]);
      return;
    }

    const fetchUserProfile = async () => {
      try {
        const userData = await apiGet<any>("/auth/me");
        console.log("User profile data:", userData); // Debug log
        
        // Handle both camelCase and snake_case from backend
        const dietaryPrefs = userData.profile?.dietaryPreferences || userData.profile?.dietary_preferences || [];
        console.log("Dietary preferences found:", dietaryPrefs); // Debug log
        
        if (dietaryPrefs.length > 0) {
          setSelectedDietaryPreferences(dietaryPrefs);
        }
      } catch (error: any) {
        console.error("Failed to fetch user profile:", error);
        // Don't show toast for this as it's not critical
      }
    };
    fetchUserProfile();
  }, [isAuthenticated]);
  
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

  const handleRemoveIngredient = async (id: string) => {
    // Optimistically update UI
    const originalInventory = [...inventory];
    setInventory(inventory.filter(item => item.id !== id));

    try {
      await apiDelete(`/inventory/${id}`);
      toast({
        title: "Ingredient removed",
        description: "Item has been removed from your inventory.",
      });
      // No need to setInventory again if API call is successful, UI is already updated
    } catch (error: any) {
      // Revert UI change if API call fails
      setInventory(originalInventory);
      console.error("Failed to remove ingredient:", error);
      toast({
        title: "Error removing ingredient",
        description: error.data?.message || "Could not remove item. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleAddIngredient = async () => {
    if (!newIngredient.name || !newIngredient.quantity) {
      toast({
        title: "Missing information",
        description: "Please fill in name and quantity.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmittingIngredient(true);

    const payload = {
      name: newIngredient.name,
      quantity: parseFloat(newIngredient.quantity) || 0,
      unit: newIngredient.unit,
      category: newIngredient.category,
      expiryDate: newIngredient.expiryDate ? format(newIngredient.expiryDate, "yyyy-MM-dd") : null
    };
    
    try {
      const addedItem = await apiPost<InventoryItemData>("/inventory", payload);
      setInventory(prevInventory => [...prevInventory, addedItem]);
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
        description: `${addedItem.name} has been added to your inventory.`
      });
    } catch (error: any) {
      console.error("Failed to add ingredient:", error);
      toast({
        title: "Error adding ingredient",
        description: error.data?.message || "Could not add item. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingIngredient(false);
    }
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
  
  const handleGenerateRecipes = async () => { 
    setIsGeneratingRecipes(true);
    
    // apiParams is what we intend to send to the backend.
    // Optional fields to be omitted are set to 'undefined'.
    const apiParams: Record<string, string | number | boolean | undefined> = {
      ingredients: ingredientTags.length > 0 ? ingredientTags.join(',') : "",
      mealType: mealType || "", 
      maxPrepTime: cookingTime || "any",
      kitchenEquipment: selectedEquipment.length > 0 ? selectedEquipment.join(',') : "",
      dietaryRestrictions: selectedDietaryPreferences.length > 0 ? selectedDietaryPreferences.join(',') : "",
      page: 1,
      limit: 10,
    };

    const definedParams = Object.fromEntries(
      Object.entries(apiParams).filter(([, value]) => value !== undefined)
    );

    const queryString = new URLSearchParams(
      definedParams as Record<string, string> 
    ).toString();
    
    try {
      // Call GET /api/recipes endpoint
      const response = await apiGet<any>(`/recipes?${queryString}`); 
      
      toast({
        title: "Recipe Search Complete",
        description: "Successfully fetched recipes based on your criteria.",
      });
      
      navigate("/recipes/results", { state: { queryParams: apiParams, results: response } });
      
      // Reset form
      setIngredientInput("");
      setIngredientTags([]);
      setSelectedIngredients([]);
      setCookingTime("any");
      setSelectedEquipment(kitchenEquipment.map(tool => tool.id)); // Reset equipment selector
      setMealType("");
      // Don't reset dietary preferences as they should persist from user profile

    } catch (error: any) {
      console.error("Failed to fetch recipes:", error);
      toast({
        title: "Error Fetching Recipes",
        description: error.data?.message || "Could not fetch recipes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingRecipes(false);
    }
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
      <section className="relative bg-gradient-to-br from-green-600 via-green-700 to-green-800 text-white py-20">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1495195134817-aeb325a55b65?auto=format&fit=crop&w=1920&h=600&q=80')] bg-cover bg-center opacity-15"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 to-green-800/30"></div>
        <div className="kitchen-container relative z-10">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <h1 className="text-5xl font-bold mb-6 text-white drop-shadow-lg">Your AI-powered kitchen companion</h1>
            <p className="text-xl mb-8 text-green-100 max-w-2xl mx-auto drop-shadow-sm">
              Enter your ingredients and preferences, and let AI create the perfect recipe for you
            </p>
            
            {/* Recipe Generation Form */}
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl ring-1 ring-white/20 space-y-10 text-left border border-white/30">

              {/* Section 1: Ingredients */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 border-2 border-green-700 rounded-full flex items-center justify-center text-green-700 font-bold shadow-lg bg-white/90">1</div>
                  <h3 className="text-xl font-semibold text-slate-900">What do you have?</h3>
                </div>
                <div className="relative">
                  {/* Beautiful gradient background container */}
                  <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-green-50 p-6 rounded-2xl shadow-sm backdrop-blur-sm">
                    {/* Search icon and input container */}
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                        <ChefHat className="h-5 w-5 text-green-600" />
                      </div>
                      <Input 
                        placeholder="Add ingredients..."
                        value={ingredientInput}
                        onChange={(e) => setIngredientInput(e.target.value)}
                        onKeyDown={handleIngredientInputKeyDown}
                        className="w-full bg-white/90 backdrop-blur-sm text-slate-900 placeholder-slate-400 focus:ring-0 border-green-200 focus:border-green-200 text-base pl-12 pr-4 py-4 shadow-sm rounded-xl transition-all duration-200 focus:shadow-md relative focus:outline-none"
                      />
                    </div>
                  </div>
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
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 border-2 border-green-700 rounded-full flex items-center justify-center text-green-700 font-bold shadow-lg bg-white/90">2</div>
                  <h3 className="text-xl font-semibold text-slate-900">Your Preferences</h3>
                </div>
                <div className="grid grid-cols-1 gap-6 bg-green-50/70 p-6 rounded-xl border border-green-200">
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-slate-700 block text-center">Cooking Time</label>
                    <CookingTimeSelector
                      selectedCookingTime={cookingTime}
                      onCookingTimeChange={setCookingTime}
                    />
                  </div>
                  <div className="space-y-3">
                    <MealTypeSelector
                      selectedMealType={mealType}
                      onMealTypeChange={setMealType}
                      selectedDietaryPreferences={selectedDietaryPreferences}
                      onDietaryPreferencesChange={setSelectedDietaryPreferences}
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Kitchen Equipment */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 border-2 border-green-700 rounded-full flex items-center justify-center text-green-700 font-bold shadow-lg bg-white/90">3</div>
                  <h3 className="text-xl font-semibold text-slate-900">Kitchen Equipment</h3>
                </div>
                <div className="bg-green-50/70 p-6 rounded-xl border border-green-200">
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-slate-700 block text-center">Available Equipment</label>
                    <KitchenEquipmentSelector
                      selectedEquipment={selectedEquipment}
                      onEquipmentChange={setSelectedEquipment}
                    />
                  </div>
                </div>
              </div>
              
              {/* Generate Button */}
              <div className="flex justify-center pt-6">
                <Button 
                  onClick={handleGenerateRecipes}
                  disabled={isGeneratingRecipes}
                  className="bg-green-700 hover:bg-green-800 active:bg-green-800 text-white font-semibold py-4 px-10 text-lg rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300 ease-out focus:ring-4 focus:ring-green-700/30 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none min-w-[280px]"
                >
                  {isGeneratingRecipes ? (
                    <>
                      <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                      Finding Perfect Recipes...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-3 h-6 w-6" />
                      Generate My Recipe!
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Inventory Section - Only show if authenticated */}
      {isAuthenticated && (
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
                <Button className="bg-green-700 hover:bg-green-800 active:bg-green-800 text-white shadow-lg">
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
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={isSubmittingIngredient} className="border-gray-400 bg-white text-gray-700 hover:bg-gray-400 hover:text-white active:bg-gray-400 active:text-white">
                    Cancel
                  </Button>
                  <Button onClick={handleAddIngredient} disabled={isSubmittingIngredient} className="bg-green-700 hover:bg-green-800 active:bg-green-800 text-white">
                    {isSubmittingIngredient ? "Adding..." : "Add to Inventory"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <Button variant="outline" onClick={handleScanReceipt} className="border-green-700 bg-white text-green-700 hover:bg-green-700 hover:text-white active:bg-green-700 active:text-white shadow-lg">
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
              {isLoadingInventory ? (
                <div className="text-center py-10">
                  <p className="text-muted-foreground mb-4">Loading your ingredients...</p>
                </div>
              ) : filteredInventory.length > 0 ? (
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {filteredInventory.map((ingredient) => (
                    <IngredientItem
                      key={ingredient.id}
                      ingredient={{
                        ...ingredient,
                        quantity: String(ingredient.quantity),
                        category: ingredient.category || "Pantry", // Ensure category is always provided
                      }}
                      inInventory={true}
                      onRemove={() => handleRemoveIngredient(ingredient.id)}
                      onSelect={() => handleToggleIngredient(ingredient.id)}
                      selected={selectedIngredients.includes(ingredient.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-muted-foreground mb-4">
                    {expiringOnly ? "No expiring ingredients found." : (searchQuery || selectedCategory !== "All" ? "No ingredients match your filters." : "Your inventory is empty. Add some ingredients!")}
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
            
            <TabsContent value="expiring" className="mt-0">
              {isLoadingInventory ? (
                 <div className="text-center py-10">
                   <p className="text-muted-foreground mb-4">Loading your ingredients...</p>
                 </div>
              ) : filteredInventory.filter(item => { // Ensure we only show expiring items here
                return item.expiryDate && new Date(item.expiryDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
              }).length > 0 ? (
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {filteredInventory.filter(item => {
                     return item.expiryDate && new Date(item.expiryDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
                  }).map((ingredient) => (
                    <IngredientItem
                      key={ingredient.id}
                      ingredient={{
                        ...ingredient,
                        quantity: String(ingredient.quantity),
                        category: ingredient.category || "Pantry", // Ensure category is always provided
                      }}
                      inInventory={true}
                      onRemove={() => handleRemoveIngredient(ingredient.id)}
                      onSelect={() => handleToggleIngredient(ingredient.id)}
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
            <div className="bg-white rounded-xl p-6 shadow-sm border border-green-200 hover:shadow-md transition-shadow">
              <h3 className="font-semibold mb-2 text-green-700">Storage Tips</h3>
              <p className="text-sm text-slate-600">
                Store leafy greens with a paper towel to absorb moisture and keep them fresh longer.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-green-200 hover:shadow-md transition-shadow">
              <h3 className="font-semibold mb-2 text-green-700">Expiry Alerts</h3>
              <p className="text-sm text-slate-600">
                Receive notifications when your ingredients are about to expire to reduce food waste.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-green-200 hover:shadow-md transition-shadow">
              <h3 className="font-semibold mb-2 text-green-700">Recipe Generation</h3>
              <p className="text-sm text-slate-600">
                Check ingredients above to automatically add them to your recipe generation form.
              </p>
            </div>
          </div>
        </div>
      </section>
      )}
      
      {/* AI Features Section */}
      <section className="py-16 bg-gradient-to-br from-green-50 to-green-100">
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
                    <div className="mr-3 mt-1 h-5 w-5 flex items-center justify-center rounded-full bg-green-700 text-white">
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Button asChild className="bg-green-700 hover:bg-green-800 active:bg-green-800 text-white shadow-lg">
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
                <div className="mt-2 text-green-700 font-medium">Chicken & Rice Stir-fry</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Loading Dialog */}
      <Dialog open={isGeneratingRecipes} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md border-0 bg-gradient-to-br from-kitchen-green/10 to-kitchen-orange/10 backdrop-blur-sm">
          <DialogHeader className="text-center pb-0">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-kitchen-green to-kitchen-orange bg-clip-text text-transparent">
              Creating Your Perfect Recipe
            </DialogTitle>
            <DialogDescription className="text-muted-foreground mt-2">
              Our AI is analyzing your ingredients and preferences...
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center justify-center py-8">
            {/* Animated cooking elements */}
            <div className="relative mb-6">
              {/* Main spinner */}
              <div className="relative">
                <Loader2 className="h-16 w-16 animate-spin text-kitchen-orange" />
                {/* Inner sparkle effect */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="h-8 w-8 text-kitchen-green animate-pulse" />
                </div>
              </div>
              
              {/* Floating ingredients animation */}
              <div className="absolute -top-4 -left-4 w-4 h-4 bg-kitchen-green rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
              <div className="absolute -top-2 -right-6 w-3 h-3 bg-kitchen-orange rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
              <div className="absolute -bottom-4 -right-2 w-5 h-5 bg-kitchen-teal rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
              <div className="absolute -bottom-2 -left-6 w-2 h-2 bg-kitchen-green rounded-full animate-bounce" style={{ animationDelay: '1.5s' }}></div>
            </div>

            {/* Loading progress indicator */}
            <div className="w-full max-w-xs mx-auto mb-4">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-kitchen-green to-kitchen-orange rounded-full animate-pulse"></div>
              </div>
            </div>

            {/* Loading messages */}
            <div className="text-center space-y-2">
              <p className="text-lg font-semibold text-kitchen-dark">
                Analyzing ingredients...
              </p>
              <p className="text-sm text-muted-foreground animate-pulse">
                This usually takes just a few seconds
              </p>
            </div>

            {/* Recipe generation steps */}
            <div className="mt-6 space-y-2 text-sm text-muted-foreground text-center">
              <div className="flex items-center justify-center space-x-2 opacity-100">
                <div className="w-2 h-2 bg-kitchen-green rounded-full animate-ping"></div>
                <span>Matching with recipe database</span>
              </div>
              <div className="flex items-center justify-center space-x-2 opacity-75">
                <div className="w-2 h-2 bg-kitchen-orange rounded-full"></div>
                <span>Calculating nutrition values</span>
              </div>
              <div className="flex items-center justify-center space-x-2 opacity-50">
                <div className="w-2 h-2 bg-kitchen-teal rounded-full"></div>
                <span>Personalizing recommendations</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
