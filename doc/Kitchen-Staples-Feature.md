# Kitchen Staples Feature Specification

**Status:** In Development  
**Priority:** High  
**Target Release:** v2.0  
**Created:** February 6, 2026

## Overview

Implement a "Kitchen Staples" system that allows users to designate certain ingredients as always available, automatically including them in all recipe searches without cluttering the search interface.

## Problem Statement

Users waste time adding basic ingredients (salt, pepper, oil, water, sugar) to every search. These items:
- Are present in almost all kitchens
- Don't require quantity tracking
- Shouldn't affect recipe match percentages
- Clutter the search bar unnecessarily

## Solution

Introduce two types of inventory items:
1. **Kitchen Staples** - Always available, no quantity tracking, auto-included in searches
2. **Fresh Ingredients** - Tracked with quantities, expiry dates, and counts toward recipe matches

## User Experience

### Visual Indicators

**In Recipe Results:**
- ⭐ **Gold star badge** = Kitchen staple (auto-included, always available)
- ✅ **Green checkmark** = Explicitly searched ingredient (user selected)
- ❌ **Red X** = Missing ingredient (need to buy)

**In Inventory:**
Two distinct sections with clear visual separation

**In Search:**
Staples never appear in search bar, handled automatically

### User Flow

**New User Onboarding (Future Phase):**
```
Step 1: Welcome to KitchenAI
Step 2: Select Your Kitchen Staples
  - Pre-selected defaults: salt, pepper, olive oil, water
  - Optional additions: sugar, flour, butter, etc.
  - Customize based on preferences
Step 3: Add Fresh Ingredients
Step 4: Set Dietary Preferences
```

**Existing Users:**
- Navigate to Inventory page
- See new "Kitchen Staples" section
- Can promote/demote items between sections

### Edge Cases

1. **User types staple in search bar:**
   - Show tooltip: "This is already in your kitchen staples"
   - Option to remove from staples or continue

2. **Recipe requires uncommon "staple":**
   - User can manually add to search (overrides staple status for that search)

3. **Running out of a staple:**
   - User unchecks it in inventory
   - System treats it as missing until re-checked

## Technical Specification

### Database Schema Changes

#### Backend: InventoryItem Model

```python
class InventoryItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='inventory_items')
    name = models.CharField(max_length=100)
    
    # NEW: Item type
    item_type = models.CharField(
        max_length=20,
        choices=[
            ('tracked', 'Tracked Ingredient'),
            ('staple', 'Kitchen Staple')
        ],
        default='tracked'
    )
    
    # Only for tracked items (nullable for staples)
    quantity = models.FloatField(null=True, blank=True)
    unit = models.CharField(max_length=50, null=True, blank=True)
    expiry_date = models.DateField(null=True, blank=True)
    
    added_date = models.DateTimeField(auto_now_add=True)
    category = models.CharField(max_length=50, default='General')
    
    class Meta:
        indexes = [
            models.Index(fields=['user', 'item_type'], name='inv_user_type_idx'),
            models.Index(fields=['user', 'expiry_date'], name='inv_user_expiry_idx'),
        ]
```

**Migration Required:** Yes

### API Changes

#### New/Updated Endpoints

**GET /api/inventory/**
```json
{
  "staples": [
    {
      "id": "uuid",
      "name": "Salt",
      "item_type": "staple",
      "category": "Seasoning"
    }
  ],
  "tracked": [
    {
      "id": "uuid",
      "name": "Chicken Breast",
      "item_type": "tracked",
      "quantity": 500,
      "unit": "g",
      "expiry_date": "2026-02-15",
      "category": "Protein"
    }
  ]
}
```

**POST /api/inventory/**
```json
{
  "name": "Olive Oil",
  "item_type": "staple",  // NEW FIELD
  "category": "Oils"
  // quantity, unit, expiry_date omitted for staples
}
```

**PATCH /api/inventory/{id}/toggle-staple/** (NEW)
```json
// Request
{ "make_staple": true }

// Response
{
  "id": "uuid",
  "name": "Butter",
  "item_type": "staple"
}
```

### Recipe Match Calculation Logic

#### Current (Incorrect) Behavior
```python
# Recipe: [chicken, rice, salt, pepper, paprika]
# User searches: [chicken, rice]
# Current match: 2/5 = 40% ❌ WRONG
```

#### New (Correct) Behavior
```python
# Recipe: [chicken, rice, salt, pepper, paprika]
# Staples: [salt, pepper]
# Recipe non-staples: [chicken, rice, paprika]
# User searches: [chicken, rice]
# New match: 2/3 = 67% ✅ CORRECT

def calculate_match_percentage(recipe_ingredients, search_ingredients, user_staples):
    # Filter out staples from recipe
    recipe_non_staples = [ing for ing in recipe_ingredients 
                          if not is_staple(ing, user_staples)]
    
    # Count matches
    matched = 0
    for recipe_ing in recipe_non_staples:
        for search_ing in search_ingredients:
            if fuzzy_match(search_ing, recipe_ing):
                matched += 1
                break
    
    # Calculate percentage (exclude staples from denominator)
    if not recipe_non_staples:
        return 100  # Recipe only has staples
    
    return round((matched / len(recipe_non_staples)) * 100)
```

### Ingredient Intelligence Updates

Update `ingredient_intelligence.py` to identify common staples:

```python
COMMON_STAPLES = {
    # Universal savory
    "salt", "pepper", "black pepper", "sea salt",
    "oil", "olive oil", "vegetable oil", "canola oil",
    "water",
    
    # Universal sweet
    "sugar", "white sugar", "granulated sugar",
    
    # Common baking
    "flour", "all-purpose flour",
    "baking powder", "baking soda",
    "vanilla", "vanilla extract",
    
    # Common condiments
    "vinegar", "white vinegar",
}

def is_common_staple(ingredient: str) -> bool:
    """Check if ingredient is commonly considered a kitchen staple."""
    normalized = ingredient.lower().strip()
    return normalized in COMMON_STAPLES

def is_user_staple(ingredient: str, user_staples: List[str]) -> bool:
    """Check if ingredient is in user's personal staples."""
    normalized = ingredient.lower().strip()
    return any(staple.lower().strip() == normalized for staple in user_staples)

def is_staple(ingredient: str, user_staples: List[str] = None) -> bool:
    """Check if ingredient is a staple (common or user-defined)."""
    if user_staples and is_user_staple(ingredient, user_staples):
        return True
    return is_common_staple(ingredient)
```

### Recipe Search Integration

When user performs a search:

1. Frontend sends: `["chicken", "rice", "tomatoes"]`
2. Backend:
   - Retrieves user's staples from inventory
   - Automatically adds staples to embedding search (internally)
   - Calculates match % excluding staples
   - Returns recipes with correct match percentages

**Important:** Staples are included in the semantic search but excluded from match calculation.

## Frontend Implementation

### Component Updates

#### 1. InventoryPage (Updated)

```tsx
// Two sections with distinct styling
<div className="space-y-8">
  {/* Kitchen Staples Section */}
  <section>
    <h2 className="text-2xl font-bold mb-4">
      <Star className="inline mr-2 text-yellow-500" />
      Kitchen Staples
    </h2>
    <p className="text-muted-foreground mb-4">
      Items you always have available (no quantity tracking needed)
    </p>
    <div className="grid gap-2">
      {staples.map(item => (
        <StapleCard 
          key={item.id}
          item={item}
          onToggleStaple={handleToggleStaple}
        />
      ))}
    </div>
    <Button onClick={handleAddStaple} variant="outline" className="mt-4">
      <Plus className="mr-2" /> Add Staple
    </Button>
  </section>

  {/* Tracked Ingredients Section */}
  <section>
    <h2 className="text-2xl font-bold mb-4">
      <ShoppingBasket className="inline mr-2 text-green-500" />
      Fresh Ingredients
    </h2>
    <p className="text-muted-foreground mb-4">
      Items tracked with quantities and expiry dates
    </p>
    {/* Existing inventory grid */}
  </section>
</div>
```

#### 2. RecipeCard (Updated)

Show ingredient breakdown with staple indicators:

```tsx
<div className="ingredients-preview">
  {recipe.ingredients.slice(0, 5).map(ing => (
    <Badge key={ing.name} variant={getBadgeVariant(ing)}>
      {getIngredientIcon(ing)}
      {ing.name}
    </Badge>
  ))}
</div>

function getBadgeVariant(ingredient) {
  if (ingredient.isStaple) return "staple"; // Yellow/gold
  if (ingredient.isAvailable) return "success"; // Green
  return "destructive"; // Red
}

function getIngredientIcon(ingredient) {
  if (ingredient.isStaple) return <Star className="w-3 h-3" />;
  if (ingredient.isAvailable) return <Check className="w-3 h-3" />;
  return <X className="w-3 h-3" />;
}
```

#### 3. New Component: StapleCard

```tsx
interface StapleCardProps {
  item: InventoryItem;
  onToggleStaple: (id: string) => void;
  onDelete: (id: string) => void;
}

export function StapleCard({ item, onToggleStaple, onDelete }: StapleCardProps) {
  return (
    <Card className="p-4 bg-yellow-50 border-yellow-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Star className="text-yellow-600" />
          <span className="font-medium">{item.name}</span>
          <Badge variant="outline">{item.category}</Badge>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onToggleStaple(item.id)}
            title="Convert to tracked ingredient"
          >
            <ArrowDown className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onDelete(item.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
```

### TypeScript Interfaces

```typescript
interface InventoryItem {
  id: string;
  name: string;
  itemType: 'tracked' | 'staple';
  category: string;
  
  // Only for tracked items
  quantity?: number;
  unit?: string;
  expiryDate?: string;
  
  addedDate: string;
}

interface RecipeIngredient {
  name: string;
  quantity?: string;
  unit?: string;
  isStaple: boolean;        // NEW
  isAvailable: boolean;     // From search ingredients
}

interface Recipe {
  // ... existing fields ...
  ingredients: RecipeIngredient[];
  ingredientMatchPercentage: number;  // Now correctly calculated
}
```

## Implementation Phases

### Phase 1: Backend Foundation ✅ (Current Phase)
- [ ] Update InventoryItem model with `item_type` field
- [ ] Create database migration
- [ ] Update API serializers
- [ ] Implement staple identification in ingredient_intelligence.py
- [ ] Update match calculation logic to exclude staples

### Phase 2: Frontend Inventory UI
- [ ] Split inventory page into two sections
- [ ] Create StapleCard component
- [ ] Add toggle functionality (tracked ↔ staple)
- [ ] Update add item form with type selector

### Phase 3: Recipe Display
- [ ] Update RecipeCard to show staple badges
- [ ] Update RecipeDetails ingredient list
- [ ] Add staple indicators throughout app
- [ ] Update shopping list generation (exclude staples)

### Phase 4: Search Integration
- [ ] Auto-include staples in searches (backend)
- [ ] Show "already in staples" tooltip if user types one
- [ ] Update search results with correct match %

### Phase 5: Onboarding (Future)
- [ ] Create onboarding wizard
- [ ] Pre-populate common staples
- [ ] Cuisine-based staple suggestions
- [ ] User preference integration

## Testing Plan

### Unit Tests

**Backend:**
```python
def test_staple_item_creation():
    """Test creating a staple without quantity."""
    
def test_match_calculation_excludes_staples():
    """Test that staples don't affect match percentage."""
    
def test_toggle_staple_status():
    """Test converting tracked ↔ staple."""
```

**Frontend:**
```typescript
describe('StapleCard', () => {
  it('renders staple item correctly', () => {});
  it('toggles to tracked ingredient', () => {});
  it('deletes staple', () => {});
});

describe('Match Calculation', () => {
  it('shows correct percentage excluding staples', () => {});
  it('handles recipes with only staples', () => {});
});
```

### Integration Tests

1. **Create staple → Perform search → Verify auto-inclusion**
2. **Toggle item type → Verify API response**
3. **Recipe with mixed ingredients → Verify badge display**

### User Acceptance Criteria

- [ ] User can designate items as staples
- [ ] Staples don't require quantity/expiry
- [ ] Staples auto-included in searches
- [ ] Match % correctly excludes staples
- [ ] Visual distinction is clear (⭐ vs ✅ vs ❌)
- [ ] User can convert staple ↔ tracked

## Future Enhancements

1. **Smart Staple Suggestions**
   - Analyze user's cooking patterns
   - Suggest items to promote to staples

2. **Cuisine-Based Staples**
   - Mediterranean → olive oil, lemon, oregano
   - Asian → soy sauce, rice vinegar, sesame oil
   - Baking → flour, sugar, vanilla

3. **Shared Household Staples**
   - Family accounts share staple lists
   - Reduce duplicate entries

4. **Staple Presets**
   - "Basic Kitchen"
   - "Baking Essentials"
   - "Vegetarian Kitchen"
   - "Asian Pantry"

## Success Metrics

- % of users who set up staples
- Reduction in search bar clutter
- Improvement in match percentage accuracy
- User satisfaction with inventory management

---

**Status Updates Will Be Added Here**

- 2026-02-06: Specification created, implementation starting
