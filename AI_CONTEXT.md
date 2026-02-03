# AI Context - Frontend

**Quick Reference**: React/TypeScript frontend for cooking assistant app.

**Tech**: React 18, TypeScript, Vite, shadcn/ui, Tailwind CSS

**Details**: See [.github/copilot-instructions.md](.github/copilot-instructions.md)

## Quick Patterns

**Component**:
```typescript
export const MyComponent = ({ prop }: MyComponentProps) => {
  return <div className="flex items-center">...</div>;
};
```

**API Call**:
```typescript
const token = localStorage.getItem('authToken');
const response = await fetch(`${API_BASE_URL}/api/endpoint`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

**Form**:
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
```
