# KitchenAI Assistant - Frontend Development Guide

**AI Instructions**: Keep responses concise. Don't create verbose .md files. Important docs go in `doc/` folder only.

## Project Context

This is the **React/TypeScript frontend** for KitchenAI Assistant, a cooking assistant web application that helps users manage kitchen inventory, discover recipes, and get AI-powered cooking recommendations.

### Related Projects
- **Backend API**: `../cooking-assistant-backend` - Django REST Framework
- **LLM Service**: `../cooking-assistant-llm` - LLM emulator service
- **Receipt Recognition**: `../cooking-assistant-receipt-recognition-llm` - OCR emulator
- **Mobile App**: `../cooking-assistant-android-app` - Capacitor wrapper

## Technology Stack

- **Framework**: React 18.3+ with TypeScript 5.5+
- **Build Tool**: Vite 5.4+
- **Routing**: React Router v6
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Styling**: Tailwind CSS 3.4+ with custom config
- **State Management**: 
  - React Query (@tanstack/react-query) for server state
  - React Context for auth state
- **Form Handling**: React Hook Form with Zod validation
- **HTTP**: Native Fetch API
- **Testing**: Vitest + React Testing Library

## Code Style & Conventions

### TypeScript Guidelines

```typescript
// ✅ DO: Use interfaces for object shapes
interface RecipeCardProps {
  recipe: Recipe;
  onFavorite?: () => void;
}

// ✅ DO: Use type for unions/intersections
type Status = 'idle' | 'loading' | 'success' | 'error';

// ✅ DO: Destructure props in function signature
export const RecipeCard = ({ recipe, onFavorite }: RecipeCardProps) => {
  // Component logic
};

// ✅ DO: Use optional chaining and nullish coalescing
const userName = user?.profile?.name ?? 'Guest';

// ❌ DON'T: Use 'any' type (unless absolutely necessary)
// ❌ DON'T: Use default exports for components
// ❌ DON'T: Use 'var' keyword
```

### React Component Structure

```typescript
// Standard component file structure:

// 1. Imports (React, external libs, local components, utils, types)
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';
import type { Recipe } from '@/types';

// 2. Types/Interfaces
interface MyComponentProps {
  // props definition
}

// 3. Component
export const MyComponent = ({ prop1, prop2 }: MyComponentProps) => {
  // 3.1. Hooks (state, effects, custom hooks)
  const [state, setState] = useState('');
  
  // 3.2. Event handlers
  const handleClick = () => {
    // logic
  };
  
  // 3.3. Render helpers (if needed)
  const renderContent = () => {
    // complex render logic
  };
  
  // 3.4. Return JSX
  return (
    <div className="container">
      {/* JSX */}
    </div>
  );
};

// 4. Helper functions or constants (if file-specific)
```

### File Organization

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components (auto-generated)
│   ├── forms/          # Form-specific components
│   └── *.tsx           # Feature components
├── pages/              # Route/page components
├── contexts/           # React Context providers
├── hooks/              # Custom React hooks
├── lib/                # Utility functions, helpers
├── types/              # TypeScript type definitions (if needed)
└── test/               # Test utilities and setup
```

### Naming Conventions

- **Components**: PascalCase (e.g., `RecipeCard.tsx`, `InventoryList.tsx`)
- **Hooks**: camelCase with 'use' prefix (e.g., `useAuth.ts`, `useRecipes.ts`)
- **Utilities**: camelCase (e.g., `formatDate.ts`, `apiClient.ts`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)
- **CSS Classes**: Tailwind utility classes (lowercase, hyphens)

### Tailwind CSS Usage

```tsx
// ✅ DO: Use Tailwind utility classes
<div className="flex items-center gap-4 p-6 rounded-lg shadow-md">

// ✅ DO: Use clsx/cn for conditional classes
import { cn } from '@/lib/utils';
<div className={cn(
  "base-classes",
  isActive && "active-classes",
  variant === "primary" && "primary-classes"
)}>

// ✅ DO: Follow mobile-first responsive design
<div className="w-full md:w-1/2 lg:w-1/3">

// ❌ DON'T: Write custom CSS unless absolutely necessary
// ❌ DON'T: Use inline styles (use Tailwind instead)
```

### State Management Patterns

```typescript
// ✅ Local component state for UI-only state
const [isOpen, setIsOpen] = useState(false);

// ✅ React Query for server state
const { data: recipes, isLoading, error } = useQuery({
  queryKey: ['recipes', filters],
  queryFn: () => fetchRecipes(filters)
});

// ✅ Context for global app state (auth, theme)
const { user, login, logout } = useAuth();

// ❌ DON'T: Use Context for frequently changing data
// ❌ DON'T: Mix server state with local state unnecessarily
```

## API Integration

### Base Configuration

```typescript
// API base URL (from environment or default)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

// Authentication token from localStorage
const token = localStorage.getItem('authToken');
```

### API Call Pattern

```typescript
// Standard authenticated API call
const fetchData = async () => {
  const token = localStorage.getItem('authToken');
  
  const response = await fetch(`${API_BASE_URL}/api/endpoint`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'API request failed');
  }
  
  return await response.json();
};
```

### Error Handling

```typescript
// Use try-catch with user-friendly error messages
import { toast } from 'sonner';

try {
  const data = await fetchData();
  toast.success('Operation successful');
} catch (error) {
  console.error('Error:', error);
  toast.error(error instanceof Error ? error.message : 'Something went wrong');
}
```

## Key Features & Patterns

### Authentication Flow

1. User logs in via `/login` → token received from backend
2. Token stored in `localStorage`
3. `AuthContext` provides auth state to all components
4. `ProtectedRoute` component guards protected pages
5. Token included in all API requests to protected endpoints

### Form Handling

```typescript
// Use React Hook Form with Zod validation
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(formSchema)
});
```

### Routing Structure

- `/` - Home page with recipe search
- `/login` - Login page (public)
- `/register` - Registration page (public)
- `/profile` - User profile (protected)
- `/inventory` - Inventory management (protected)
- `/recipes` - Recipe history/favorites
- `/recipes/:id` - Recipe details
- `/recipes/results` - Recipe search results

## Common Data Types

```typescript
interface User {
  userId: string;
  username: string;
  email: string;
  profile?: UserProfile;
}

interface UserProfile {
  dietaryPreferences: string[];
  allergies: string[];
  cookingExpertise: string;
  cuisinePreferences: string[];
  bio?: string;
  profilePicture?: string;
  kitchenEquipment: string[];
}

interface Recipe {
  id: string;
  name: string;
  description: string;
  mealType: string[];
  cuisine: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  difficulty: string;
  averageRating: number;
  ratingsCount: number;
  imageUrl: string;
  ingredients: Ingredient[];
  instructions: string[];
  kitchenEquipmentNeeded: string[];
  tags: string[];
}

interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  expiryDate?: string;
  category: string;
}
```

## Development Workflow

### Starting Development Server
```bash
npm run dev
# Runs on http://localhost:5173
```

### Building for Production
```bash
npm run build
# Output in dist/
```

### Code Quality
```bash
npm run lint  # ESLint check
```

## Best Practices

### Component Design
- Keep components under 300 lines
- Extract reusable logic into custom hooks
- Use composition over prop drilling
- Prefer controlled components for forms
- Handle loading and error states explicitly

### Performance
- Use React.memo() for expensive components (sparingly)
- Lazy load routes with React.lazy()
- Optimize images (use appropriate formats and sizes)
- Avoid unnecessary re-renders (proper dependency arrays)

### Accessibility
- Use semantic HTML elements
- Include proper ARIA labels
- Ensure keyboard navigation works
- Maintain sufficient color contrast
- Test with screen readers when possible

### Security
- Never store sensitive data in localStorage without encryption
- Sanitize user inputs (especially from forms)
- Validate data on both client and server
- Use HTTPS in production
- Implement proper CORS policies

## shadcn/ui Components

This project uses shadcn/ui. Components are in `src/components/ui/`.

### Adding New Components
```bash
npx shadcn@latest add [component-name]
```

### Common Components Used
- Button, Card, Input, Label, Textarea
- Dialog, Sheet, Popover
- Select, Checkbox, Switch
- Toast (via sonner), Alert
- Tabs, Accordion, Separator

## Debugging Tips

1. **API Issues**: Check browser Network tab for request/response
2. **Auth Issues**: Verify token in localStorage and Authorization header
3. **Routing Issues**: Check React Router DevTools
4. **State Issues**: Use React DevTools to inspect component state
5. **Build Issues**: Clear `node_modules` and `dist`, reinstall dependencies

## When Generating Code

### Checklist
- [ ] Follow TypeScript best practices (no `any`, proper types)
- [ ] Use functional components with hooks
- [ ] Apply Tailwind CSS for styling
- [ ] Handle loading and error states
- [ ] Include proper TypeScript interfaces
- [ ] Use shadcn/ui components where appropriate
- [ ] Follow existing patterns in the codebase
- [ ] Add error handling with user-friendly messages
- [ ] Consider responsive design (mobile-first)
- [ ] Ensure accessibility (semantic HTML, ARIA labels)

### Example: Creating a New Component

```typescript
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { Recipe } from '@/types';

interface RecipeCardProps {
  recipe: Recipe;
  onFavorite?: (recipeId: string) => void;
}

export const RecipeCard = ({ recipe, onFavorite }: RecipeCardProps) => {
  const [isFavorited, setIsFavorited] = useState(false);

  const handleFavorite = async () => {
    try {
      await onFavorite?.(recipe.id);
      setIsFavorited(true);
      toast.success('Recipe added to favorites');
    } catch (error) {
      toast.error('Failed to add to favorites');
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle>{recipe.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{recipe.description}</p>
        <Button onClick={handleFavorite} variant="outline" className="mt-4">
          {isFavorited ? 'Favorited' : 'Add to Favorites'}
        </Button>
      </CardContent>
    </Card>
  );
};
```

## Quick Reference

- **API Docs**: See `doc/Api.md`
- **Architecture**: See `doc/System-Architecture.md`
- **Tailwind Config**: `tailwind.config.ts`
- **Path Alias**: `@/` maps to `src/`
- **Backend URL**: Default `http://127.0.0.1:8000`
