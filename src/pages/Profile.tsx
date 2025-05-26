
import { useState } from "react";
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { User, Bell, Clock, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("preferences");
  
  // Mock user data
  const [user, setUser] = useState({
    name: "Alex Johnson",
    email: "alex.johnson@example.com",
    profilePicture: "https://api.dicebear.com/7.x/adventurer/svg?seed=Alex",
    bio: "Food enthusiast who loves experimenting with new flavors. Always looking for quick and healthy recipes.",
    dietaryPreferences: {
      vegetarian: false,
      vegan: false,
      glutenFree: true,
      dairyFree: false,
      nutFree: false,
      lowCarb: true
    },
    allergens: ["Peanuts"],
    cookingLevel: "intermediate",
    cuisinePreferences: ["Italian", "Thai", "Mexican"],
    notifications: {
      expiringIngredients: true,
      weeklyMealPlan: true,
      newRecipes: false,
      cookingTips: true
    },
    mealPlanFrequency: "weekly"
  });
  
  const handleSaveProfile = () => {
    toast({
      title: "Profile updated",
      description: "Your profile has been saved successfully",
    });
  };
  
  const handleToggleDietaryPreference = (preference: keyof typeof user.dietaryPreferences) => {
    setUser({
      ...user,
      dietaryPreferences: {
        ...user.dietaryPreferences,
        [preference]: !user.dietaryPreferences[preference]
      }
    });
  };
  
  const handleToggleNotification = (notificationType: keyof typeof user.notifications) => {
    setUser({
      ...user,
      notifications: {
        ...user.notifications,
        [notificationType]: !user.notifications[notificationType]
      }
    });
  };
  
  return (
    <div className="kitchen-container">
      <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Sidebar */}
        <Card className="md:col-span-1">
          <CardHeader>
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 rounded-full overflow-hidden mb-4">
                <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
              </div>
              <CardTitle>{user.name}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center text-sm text-muted-foreground mb-4">
              {user.bio}
            </div>
            <Separator className="my-4" />
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="mr-4 p-2 rounded-full bg-primary/10">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Cooking Level</p>
                  <p className="text-xs text-muted-foreground capitalize">{user.cookingLevel}</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="mr-4 p-2 rounded-full bg-primary/10">
                  <Bell className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Notifications</p>
                  <p className="text-xs text-muted-foreground">{Object.values(user.notifications).filter(Boolean).length} enabled</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="mr-4 p-2 rounded-full bg-primary/10">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Meal Planning</p>
                  <p className="text-xs text-muted-foreground capitalize">{user.mealPlanFrequency}</p>
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
                  <CardTitle>Dietary Preferences</CardTitle>
                  <CardDescription>
                    Let us know your dietary preferences to get tailored recipe suggestions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(user.dietaryPreferences).map(([key, value]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`diet-${key}`} 
                          checked={value} 
                          onCheckedChange={() => handleToggleDietaryPreference(key as keyof typeof user.dietaryPreferences)}
                        />
                        <label 
                          htmlFor={`diet-${key}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </label>
                      </div>
                    ))}
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div>
                    <Label htmlFor="allergens">Allergens</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {["Peanuts", "Tree nuts", "Dairy", "Eggs", "Wheat", "Soy", "Fish", "Shellfish"].map(allergen => (
                        <div
                          key={allergen}
                          className={`rounded-full px-3 py-1 text-xs cursor-pointer transition-colors ${
                            user.allergens.includes(allergen) 
                              ? "bg-destructive text-destructive-foreground" 
                              : "bg-muted hover:bg-muted/80"
                          }`}
                          onClick={() => {
                            if (user.allergens.includes(allergen)) {
                              setUser({
                                ...user, 
                                allergens: user.allergens.filter(a => a !== allergen)
                              });
                            } else {
                              setUser({...user, allergens: [...user.allergens, allergen]});
                            }
                          }}
                        >
                          {allergen}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="cookingLevel">Cooking Expertise</Label>
                    <Select 
                      value={user.cookingLevel} 
                      onValueChange={(value) => setUser({...user, cookingLevel: value})}
                    >
                      <SelectTrigger className="w-full mt-2">
                        <SelectValue placeholder="Select your cooking level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner - I'm learning the basics</SelectItem>
                        <SelectItem value="intermediate">Intermediate - I can follow recipes well</SelectItem>
                        <SelectItem value="advanced">Advanced - I can improvise and create recipes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Cuisine Preferences</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {["Italian", "Mexican", "Thai", "Indian", "Japanese", "Mediterranean", "Chinese", "French", "American"].map(cuisine => (
                        <div 
                          key={cuisine}
                          className={`rounded-md px-3 py-2 text-sm text-center cursor-pointer transition-colors ${
                            user.cuisinePreferences.includes(cuisine)
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted hover:bg-muted/80"
                          }`}
                          onClick={() => {
                            if (user.cuisinePreferences.includes(cuisine)) {
                              setUser({
                                ...user,
                                cuisinePreferences: user.cuisinePreferences.filter(c => c !== cuisine)
                              });
                            } else {
                              setUser({
                                ...user,
                                cuisinePreferences: [...user.cuisinePreferences, cuisine]
                              });
                            }
                          }}
                        >
                          {cuisine}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleSaveProfile}>Save Preferences</Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="account" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>
                    Update your account information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name" 
                      value={user.name} 
                      onChange={(e) => setUser({...user, name: e.target.value})} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={user.email} 
                      onChange={(e) => setUser({...user, email: e.target.value})} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea 
                      id="bio" 
                      value={user.bio} 
                      onChange={(e) => setUser({...user, bio: e.target.value})} 
                      rows={4}
                    />
                    <p className="text-sm text-muted-foreground">
                      Tell us a bit about yourself and your cooking interests
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="profile-picture">Profile Picture</Label>
                    <div className="flex items-center gap-4">
                      <img 
                        src={user.profilePicture} 
                        alt="Current profile" 
                        className="w-16 h-16 rounded-full object-cover" 
                      />
                      <Button variant="outline">Change Picture</Button>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline">Cancel</Button>
                  <Button onClick={handleSaveProfile}>Save Changes</Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Password</CardTitle>
                  <CardDescription>
                    Update your password
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input id="current-password" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input id="new-password" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input id="confirm-password" type="password" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button>Change Password</Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                  <CardDescription>
                    Customize when and how you receive notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="expiring-ingredients" className="text-base">Expiring Ingredients</Label>
                        <p className="text-sm text-muted-foreground">
                          Get notified when ingredients are about to expire
                        </p>
                      </div>
                      <Switch 
                        id="expiring-ingredients" 
                        checked={user.notifications.expiringIngredients}
                        onCheckedChange={() => handleToggleNotification('expiringIngredients')}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="weekly-meal-plan" className="text-base">Weekly Meal Plan</Label>
                        <p className="text-sm text-muted-foreground">
                          Get your weekly meal plan suggestions
                        </p>
                      </div>
                      <Switch 
                        id="weekly-meal-plan" 
                        checked={user.notifications.weeklyMealPlan}
                        onCheckedChange={() => handleToggleNotification('weeklyMealPlan')}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="new-recipes" className="text-base">New Recipes</Label>
                        <p className="text-sm text-muted-foreground">
                          Get notified about new recipes that match your preferences
                        </p>
                      </div>
                      <Switch 
                        id="new-recipes" 
                        checked={user.notifications.newRecipes}
                        onCheckedChange={() => handleToggleNotification('newRecipes')}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="cooking-tips" className="text-base">Cooking Tips</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive cooking tips and tricks
                        </p>
                      </div>
                      <Switch 
                        id="cooking-tips" 
                        checked={user.notifications.cookingTips}
                        onCheckedChange={() => handleToggleNotification('cookingTips')}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="meal-plan-frequency">Meal Plan Frequency</Label>
                    <Select 
                      value={user.mealPlanFrequency} 
                      onValueChange={(value) => setUser({...user, mealPlanFrequency: value})}
                    >
                      <SelectTrigger className="w-full mt-2">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleSaveProfile}>Save Notification Settings</Button>
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
