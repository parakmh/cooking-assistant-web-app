import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { User, Settings, Edit3, Loader2, Bell } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { getSafeUserProfile, apiPut, UserData, UserProfileData } from "@/lib/api";
import { sanitizeUserProfile } from "@/lib/sanitize";

// Define available options for multi-select fields
const ALL_DIETARY_PREFERENCES = [
  { id: "vegetarian", label: "Vegetarian" },
  { id: "vegan", label: "Vegan" },
  { id: "glutenFree", label: "Gluten-Free" },
  { id: "dairyFree", label: "Dairy-Free" },
  { id: "nutFree", label: "Nut-Free" },
  { id: "lowCarb", label: "Low Carb" },
];

const ALL_ALLERGENS = ["Peanuts", "Tree nuts", "Dairy", "Eggs", "Wheat", "Soy", "Fish", "Shellfish"];
const ALL_CUISINE_PREFERENCES = ["Italian", "Mexican", "Thai", "Indian", "Japanese", "Mediterranean", "Chinese", "French", "American"];
const ALL_KITCHEN_EQUIPMENT = ["Oven", "Microwave", "Blender", "Food Processor", "Stand Mixer", "Grill", "Air Fryer", "Instant Pot"];


const Profile = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("preferences");
  const [userData, setUserData] = useState<UserData | null>(null);
  // Initialize with default structure matching UserProfileData
  const [profileData, setProfileData] = useState<UserProfileData>({
    dietaryPreferences: [],
    allergies: [],
    cookingExpertise: "Beginner", // Default value
    cuisinePreferences: [],
    bio: "",
    profilePicture: "",
    kitchenEquipment: [],
    notifyExpiringIngredients: true,
    notifyWeeklyMealPlan: true,
    notifyNewRecipes: false,
    notifyCookingTips: true,
    mealPlanFrequency: "weekly",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // SECURITY: Using safe wrapper that sanitizes user profile data
        const data = await getSafeUserProfile();
        setUserData(data);
        // Initialize profileData from GET /auth/me (keys already camelCase)
        const profileFromBackend = data.profile || {};
        setProfileData({
          dietaryPreferences: profileFromBackend.dietary_preferences || [],
          allergies: profileFromBackend.allergies || [],
          cookingExpertise: profileFromBackend.cooking_expertise || "Beginner",
          cuisinePreferences: profileFromBackend.cuisine_preferences || [],
          bio: profileFromBackend.bio || "",
          profilePicture: profileFromBackend.profile_picture || "",
          kitchenEquipment: profileFromBackend.kitchen_equipment || [],
          notifyExpiringIngredients: profileFromBackend.notify_expiring_ingredients ?? true,
          notifyWeeklyMealPlan: profileFromBackend.notify_weekly_meal_plan ?? true,
          notifyNewRecipes: profileFromBackend.notify_new_recipes ?? false,
          notifyCookingTips: profileFromBackend.notify_cooking_tips ?? true,
          mealPlanFrequency: profileFromBackend.meal_plan_frequency || "weekly",
        });
      } catch (err: any) {
        console.error("Failed to fetch user data:", err);
        setError(err.data?.message || "Failed to load profile. Please try again.");
        toast({
          title: "Error",
          description: err.data?.message || "Could not load your profile.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, [toast]);

  const handleProfileInputChange = <K extends keyof UserProfileData>(
    field: K,
    value: UserProfileData[K]
  ) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };
  
  const handleMultiSelectChange = (field: keyof UserProfileData, value: string) => {
    setProfileData((prev: UserProfileData) => {
      const currentValues = (prev[field] as string[]) || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(item => item !== value)
        : [...currentValues, value];
      return { ...prev, [field]: newValues };
    });
  };

  const handleSavePreferences = async () => {
    setIsSaving(true);
    setError(null);
    try {
      // Map camelCase to snake_case for backend
      const snakePayload = {
        dietary_preferences: profileData.dietaryPreferences,
        allergies: profileData.allergies,
        cooking_expertise: profileData.cookingExpertise,
        cuisine_preferences: profileData.cuisinePreferences,
        bio: profileData.bio,
        profile_picture: profileData.profilePicture,
        kitchen_equipment: profileData.kitchenEquipment,
        notify_expiring_ingredients: profileData.notifyExpiringIngredients,
        notify_weekly_meal_plan: profileData.notifyWeeklyMealPlan,
        notify_new_recipes: profileData.notifyNewRecipes,
        notify_cooking_tips: profileData.notifyCookingTips,
        meal_plan_frequency: profileData.mealPlanFrequency,
      };
      // Save preferences and map response back to camelCase
      const resp = await apiPut<any>("/users/profile", snakePayload);
      
      // SECURITY: Sanitize the response from backend
      const sanitizedResp = sanitizeUserProfile(resp);
      
      setProfileData({
        dietaryPreferences: sanitizedResp.dietary_preferences || [],
        allergies: sanitizedResp.allergies || [],
        cookingExpertise: sanitizedResp.cooking_expertise || "Beginner",
        cuisinePreferences: sanitizedResp.cuisine_preferences || [],
        bio: sanitizedResp.bio || "",
        profilePicture: sanitizedResp.profile_picture || "",
        kitchenEquipment: sanitizedResp.kitchen_equipment || [],
        notifyExpiringIngredients: sanitizedResp.notify_expiring_ingredients ?? true,
        notifyWeeklyMealPlan: sanitizedResp.notify_weekly_meal_plan ?? true,
        notifyNewRecipes: sanitizedResp.notify_new_recipes ?? false,
        notifyCookingTips: resp.notify_cooking_tips ?? true,
        mealPlanFrequency: resp.meal_plan_frequency || "weekly",
      });
      toast({
        title: "Preferences Saved",
        description: "Your preferences have been updated successfully.",
      });
    } catch (err: any) {
      console.error("Failed to save preferences:", err);
      setError(err.data?.message || "Failed to save preferences.");
      toast({
        title: "Error Saving Preferences",
        description: err.data?.message || "Could not save your preferences.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleSaveAccountInfo = async () => {
    setIsSaving(true);
    setError(null);
    
    // Map camelCase to snake_case for backend
    const snakePayload = {
      bio: profileData.bio,
      profile_picture: profileData.profilePicture,
      dietary_preferences: profileData.dietaryPreferences,
      allergies: profileData.allergies,
      cooking_expertise: profileData.cookingExpertise,
      cuisine_preferences: profileData.cuisinePreferences,
      kitchen_equipment: profileData.kitchenEquipment,
      notify_expiring_ingredients: profileData.notifyExpiringIngredients,
      notify_weekly_meal_plan: profileData.notifyWeeklyMealPlan,
      notify_new_recipes: profileData.notifyNewRecipes,
      notify_cooking_tips: profileData.notifyCookingTips,
      meal_plan_frequency: profileData.mealPlanFrequency,
    };

    try {
      // Save account info and map response back to camelCase
      const resp = await apiPut<any>("/users/profile", snakePayload);
      setProfileData({
        dietaryPreferences: resp.dietary_preferences || [],
        allergies: resp.allergies || [],
        cookingExpertise: resp.cooking_expertise || "Beginner",
        cuisinePreferences: resp.cuisine_preferences || [],
        bio: resp.bio || "",
        profilePicture: resp.profile_picture || "",
        kitchenEquipment: resp.kitchen_equipment || [],
        notifyExpiringIngredients: resp.notify_expiring_ingredients ?? true,
        notifyWeeklyMealPlan: resp.notify_weekly_meal_plan ?? true,
        notifyNewRecipes: resp.notify_new_recipes ?? false,
        notifyCookingTips: resp.notify_cooking_tips ?? true,
        mealPlanFrequency: resp.meal_plan_frequency || "weekly",
      });
      toast({
        title: "Account Info Saved",
        description: "Your account information has been updated.",
      });
    } catch (err: any) {
      console.error("Failed to save account info:", err);
      setError(err.data?.message || "Failed to save account info.");
      toast({
        title: "Error Saving Account Info",
        description: err.data?.message || "Could not save account information.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setIsSaving(true);
    setError(null);
    try {
      // Map camelCase to snake_case for backend  
      const snakePayload = {
        dietary_preferences: profileData.dietaryPreferences,
        allergies: profileData.allergies,
        cooking_expertise: profileData.cookingExpertise,
        cuisine_preferences: profileData.cuisinePreferences,
        bio: profileData.bio,
        profile_picture: profileData.profilePicture,
        kitchen_equipment: profileData.kitchenEquipment,
        notify_expiring_ingredients: profileData.notifyExpiringIngredients,
        notify_weekly_meal_plan: profileData.notifyWeeklyMealPlan,
        notify_new_recipes: profileData.notifyNewRecipes,
        notify_cooking_tips: profileData.notifyCookingTips,
        meal_plan_frequency: profileData.mealPlanFrequency,
      };
      // Save notification settings and map response back to camelCase
      const resp = await apiPut<any>("/users/profile", snakePayload);
      setProfileData({
        dietaryPreferences: resp.dietary_preferences || [],
        allergies: resp.allergies || [],
        cookingExpertise: resp.cooking_expertise || "Beginner",
        cuisinePreferences: resp.cuisine_preferences || [],
        bio: resp.bio || "",
        profilePicture: resp.profile_picture || "",
        kitchenEquipment: resp.kitchen_equipment || [],
        notifyExpiringIngredients: resp.notify_expiring_ingredients ?? true,
        notifyWeeklyMealPlan: resp.notify_weekly_meal_plan ?? true,
        notifyNewRecipes: resp.notify_new_recipes ?? false,
        notifyCookingTips: resp.notify_cooking_tips ?? true,
        mealPlanFrequency: resp.meal_plan_frequency || "weekly",
      });
      toast({
        title: "Notification Settings Saved",
        description: "Your notification preferences have been updated.",
      });
    } catch (err: any) {
      console.error("Failed to save notification settings:", err);
      setError(err.data?.message || "Failed to save notification settings.");
      toast({
        title: "Error Saving Notification Settings",
        description: err.data?.message || "Could not save your notification settings.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading your profile...</p>
      </div>
    );
  }

  if (error && !userData) {
    return (
      <div className="kitchen-container text-center py-10">
        <h2 className="text-2xl font-semibold text-destructive mb-4">Error Loading Profile</h2>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }
  
  if (!userData) {
    return <div className="kitchen-container text-center py-10">Profile data not available. Please try logging in again.</div>;
  }

  return (
    <div className="kitchen-container">
      <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
      {error && !isSaving && <p className="text-red-500 bg-red-100 p-3 mb-4 rounded-md">Error: {error}</p>}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Sidebar */}
        <Card className="md:col-span-1">
          <CardHeader>
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 rounded-full overflow-hidden mb-4 bg-muted flex items-center justify-center">
                {profileData.profilePicture ? (
                  <img src={profileData.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-16 h-16 text-muted-foreground" />
                )}
              </div>
              <CardTitle>{userData.username}</CardTitle>
              <CardDescription>{userData.email}</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground mb-4 flex items-start">
              <Edit3 className="h-4 w-4 mr-2 mt-1 flex-shrink-0" />
              <span className="flex-grow">{profileData.bio || "No bio set."}</span>
            </div>
            <Separator className="my-4" />
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="mr-4 p-2 rounded-full bg-primary/10">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Cooking Level</p>
                  <p className="text-xs text-muted-foreground capitalize">{profileData.cookingExpertise}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Profile Content */}
        <div className="md:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="preferences">
                <Settings className="mr-2 h-4 w-4" />
                Preferences
              </TabsTrigger>
              <TabsTrigger value="account">
                <User className="mr-2 h-4 w-4" />
                Account
              </TabsTrigger>
              <TabsTrigger value="notifications">
                <Bell className="mr-2 h-4 w-4" />
                Notifications
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="preferences" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Dietary & Cuisine Preferences</CardTitle>
                  <CardDescription>
                    Tailor recipe suggestions to your taste and needs.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label className="text-base font-semibold">Dietary Options</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-2">
                      {ALL_DIETARY_PREFERENCES.map((pref) => (
                        <div key={pref.id} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`diet-${pref.id}`} 
                            checked={(profileData.dietaryPreferences || []).includes(pref.id)} 
                            onCheckedChange={() => handleMultiSelectChange('dietaryPreferences', pref.id)}
                          />
                          <label 
                            htmlFor={`diet-${pref.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {pref.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <Label className="text-base font-semibold">Allergens</Label>
                    <p className="text-sm text-muted-foreground mb-2">Select any ingredients you are allergic to.</p>
                    <div className="flex flex-wrap gap-2">
                      {ALL_ALLERGENS.map(allergen => (
                        <Button
                          key={allergen}
                          variant={(profileData.allergies || []).includes(allergen) ? "destructive" : "outline"}
                          size="sm"
                          onClick={() => handleMultiSelectChange('allergies', allergen)}
                        >
                          {allergen}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div>
                     <Label className="text-base font-semibold">Kitchen Equipment You Own</Label>
                     <div className="flex flex-wrap gap-2 mt-2">
                       {ALL_KITCHEN_EQUIPMENT.map(equip => (
                         <Button
                           key={equip}
                           variant={(profileData.kitchenEquipment || []).includes(equip) ? "default" : "outline"}
                           size="sm"
                           onClick={() => handleMultiSelectChange('kitchenEquipment', equip)}
                         >
                           {equip}
                         </Button>
                       ))}
                     </div>
                  </div>
                  
                  <Separator />

                  <div>
                    <Label htmlFor="cookingLevel" className="text-base font-semibold">Cooking Expertise</Label>
                    <Select 
                      value={profileData.cookingExpertise || "Beginner"} 
                      onValueChange={(value) => handleProfileInputChange('cookingExpertise', value)}
                    >
                      <SelectTrigger className="w-full mt-2">
                        <SelectValue placeholder="Select your cooking level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Beginner">Beginner - I'm learning the basics</SelectItem>
                        <SelectItem value="Intermediate">Intermediate - I can follow recipes well</SelectItem>
                        <SelectItem value="Advanced">Advanced - I can improvise and create recipes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Separator />

                  <div>
                    <Label className="text-base font-semibold">Favorite Cuisines</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                      {ALL_CUISINE_PREFERENCES.map(cuisine => (
                        <Button 
                          key={cuisine}
                          variant={(profileData.cuisinePreferences || []).includes(cuisine) ? "default" : "outline"}
                          onClick={() => handleMultiSelectChange('cuisinePreferences', cuisine)}
                          className="w-full justify-center"
                        >
                          {cuisine}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleSavePreferences} disabled={isSaving || isLoading}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Save Preferences
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="account" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>
                    Update your personal details. Username and email cannot be changed here.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username-display">Username</Label>
                    <Input 
                      id="username-display" 
                      value={userData.username} 
                      disabled
                      className="bg-muted/50"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email-display">Email Address</Label>
                    <Input 
                      id="email-display" 
                      type="email" 
                      value={userData.email} 
                      disabled
                      className="bg-muted/50"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea 
                      id="bio" 
                      value={profileData.bio || ''} 
                      onChange={(e) => handleProfileInputChange('bio', e.target.value)} 
                      rows={4}
                      placeholder="Tell us a bit about yourself and your cooking interests"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="profile-picture-url">Profile Picture URL</Label>
                    <Input 
                      id="profile-picture-url" 
                      value={profileData.profilePicture || ''} 
                      onChange={(e) => handleProfileInputChange('profilePicture', e.target.value)} 
                      placeholder="https://example.com/your-image.png"
                    />
                     <div className="flex items-center gap-4 mt-2">
                      {profileData.profilePicture ? (
                        <img 
                          src={profileData.profilePicture} 
                          alt="Current profile" 
                          className="w-16 h-16 rounded-full object-cover bg-muted" 
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                          <User className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button onClick={handleSaveAccountInfo} disabled={isSaving || isLoading}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Save Account Info
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Password</CardTitle>
                  <CardDescription>
                    Password changes are not yet implemented in this interface.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input id="current-password" type="password" disabled />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input id="new-password" type="password" disabled />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input id="confirm-password" type="password" disabled />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button disabled>Change Password</Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                  <CardDescription>
                    Customize when and how you receive notifications.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div className="flex items-center justify-between p-4 border rounded-md">
                    <div>
                      <Label htmlFor="notify-expiring-ingredients" className="font-semibold">Expiring Ingredients</Label>
                      <p className="text-sm text-muted-foreground">Get notified when ingredients are about to expire</p>
                    </div>
                    <Switch
                      id="notify-expiring-ingredients"
                      checked={profileData.notifyExpiringIngredients}
                      onCheckedChange={(checked) => handleProfileInputChange('notifyExpiringIngredients', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-md">
                    <div>
                      <Label htmlFor="notify-weekly-meal-plan" className="font-semibold">Weekly Meal Plan</Label>
                      <p className="text-sm text-muted-foreground">Get your weekly meal plan suggestions</p>
                    </div>
                    <Switch
                      id="notify-weekly-meal-plan"
                      checked={profileData.notifyWeeklyMealPlan}
                      onCheckedChange={(checked) => handleProfileInputChange('notifyWeeklyMealPlan', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-md">
                    <div>
                      <Label htmlFor="notify-new-recipes" className="font-semibold">New Recipes</Label>
                      <p className="text-sm text-muted-foreground">Get notified about new recipes that match your preferences</p>
                    </div>
                    <Switch
                      id="notify-new-recipes"
                      checked={profileData.notifyNewRecipes}
                      onCheckedChange={(checked) => handleProfileInputChange('notifyNewRecipes', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-md">
                    <div>
                      <Label htmlFor="notify-cooking-tips" className="font-semibold">Cooking Tips</Label>
                      <p className="text-sm text-muted-foreground">Receive cooking tips and tricks</p>
                    </div>
                    <Switch
                      id="notify-cooking-tips"
                      checked={profileData.notifyCookingTips}
                      onCheckedChange={(checked) => handleProfileInputChange('notifyCookingTips', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-md">
                    <div>
                      <Label htmlFor="meal-plan-frequency" className="font-semibold">Meal Plan Frequency</Label>
                    </div>
                    <Select value={profileData.mealPlanFrequency} onValueChange={(value) => handleProfileInputChange('mealPlanFrequency', value)}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                </CardContent>
                <CardFooter>
                  <Button onClick={handleSaveNotifications} disabled={isSaving || isLoading} className="w-full sm:w-auto">
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Save Notification Settings
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Profile;
