# AI Context & Development Guidelines

This file provides AI coding assistants (like GitHub Copilot) with essential context about the KitchenAI Assistant project.

## 📋 Quick Overview

**KitchenAI Assistant** is a full-stack cooking assistant application that helps users:
- Manage their kitchen inventory
- Discover recipes based on available ingredients
- Get AI-powered personalized recipe recommendations
- Track dietary preferences and allergies
- Rate and review recipes

## 🏗️ Multi-Project Structure

This workspace contains multiple related projects:

### Main Projects (Read these instructions!)
1. **cooking-assistant-web-app** (Frontend) → [Copilot Instructions](.github/copilot-instructions.md)
   - React + TypeScript + Vite
   - shadcn/ui + Tailwind CSS
   - React Router + React Query

2. **cooking-assistant-backend** (Backend) → [Copilot Instructions](../cooking-assistant-backend/.github/copilot-instructions.md)
   - Django + Django REST Framework
   - PostgreSQL database
   - JWT authentication

### Supporting Projects (External dependencies)
3. **cooking-assistant-llm** - LLM service emulator
4. **cooking-assistant-receipt-recognition-llm** - Receipt OCR service emulator
5. **cooking-assistant-android-app** - Mobile app (Capacitor wrapper)

## 🤖 For AI Assistants

### Before Writing Code:

1. **Identify the project**: Which folder are you working in?
   - Frontend? Read: `/cooking-assistant-web-app/.github/copilot-instructions.md`
   - Backend? Read: `/cooking-assistant-backend/.github/copilot-instructions.md`

2. **Understand the context**:
   - Frontend uses TypeScript, React, Tailwind CSS
   - Backend uses Python, Django, PostgreSQL
   - Communication via REST API with JWT auth

3. **Follow established patterns**:
   - Check existing files for code style
   - Use the same naming conventions
   - Follow the architectural patterns already in place

### Code Style Summary

**Frontend (TypeScript/React):**
```typescript
// ✅ Functional components with TypeScript
export const MyComponent = ({ prop }: MyComponentProps) => {
  // Use hooks, destructure props, Tailwind CSS
};
```

**Backend (Python/Django):**
```python
# ✅ PEP 8, snake_case, Django patterns
class MyView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        # Validate, process, return Response
        pass
```

### Key Resources

- **API Documentation**: `doc/Api.md` - Complete API endpoint reference
- **System Architecture**: `doc/System-Architecture.md` - High-level system design
- **Frontend Copilot Instructions**: `.github/copilot-instructions.md` - Detailed frontend guide
- **Backend Copilot Instructions**: `../cooking-assistant-backend/.github/copilot-instructions.md` - Detailed backend guide

## 🎯 Common Tasks Guide

### Adding a New Feature

**Full-Stack Feature (e.g., "Add recipe collections")**:

1. **Backend First**:
   - Create model in `backend/api/models.py`
   - Create serializer in `backend/api/serializers.py`
   - Create view in `backend/api/views.py`
   - Add URL route in `backend/api/urls.py`
   - Run migrations: `python manage.py makemigrations && python manage.py migrate`

2. **Frontend Second**:
   - Create TypeScript interfaces/types
   - Create API service functions
   - Create React components
   - Add routes if needed
   - Style with Tailwind CSS

### Adding a UI Component

**Frontend Only**:

1. Check if shadcn/ui has the component: `npx shadcn@latest add [component]`
2. Create custom component in `src/components/`
3. Use TypeScript interfaces for props
4. Apply Tailwind CSS classes
5. Export and use in pages

### Adding an API Endpoint

**Backend Only**:

1. Create/update serializer
2. Create view (APIView or generic view)
3. Add URL pattern
4. Test with Django shell or API client
5. Update `doc/Api.md` documentation

## 📊 Data Flow

```
User Action (Frontend)
    ↓
React Component
    ↓
API Call (fetch with JWT token)
    ↓
Django View (validates token, permissions)
    ↓
Serializer (validates data)
    ↓
Model/Database Operation
    ↓
Serializer (formats response)
    ↓
JSON Response
    ↓
React Component (updates UI)
```

## 🔐 Authentication Flow

1. User logs in → `POST /api/auth/login`
2. Backend validates credentials → Returns JWT token
3. Frontend stores token in `localStorage`
4. All protected API calls include: `Authorization: Bearer <token>`
5. Backend validates token on each request

## 📁 File Organization

### Frontend Structure
```
src/
├── components/     # Reusable UI components
│   ├── ui/        # shadcn/ui auto-generated
│   └── *.tsx      # Custom components
├── pages/         # Route/page components
├── contexts/      # React Context (auth, etc.)
├── hooks/         # Custom React hooks
└── lib/           # Utilities, helpers
```

### Backend Structure
```
api/
├── models.py      # Database models
├── serializers.py # DRF serializers
├── views.py       # API views/endpoints
├── urls.py        # URL routing
└── migrations/    # Database migrations
```

## 🎨 Styling Guidelines

- **Use Tailwind CSS** utility classes (no custom CSS unless necessary)
- **Use shadcn/ui** components for consistent UI
- **Mobile-first** responsive design
- **Follow design system** in `tailwind.config.ts`

## ⚡ Performance Tips

- **Frontend**: Use React Query for caching, lazy load routes
- **Backend**: Use `select_related()`, `prefetch_related()` for queries
- **API**: Implement pagination for large datasets
- **Images**: Optimize and use appropriate formats

## 🔒 Security Reminders

- Never commit `.env` files
- Validate all user inputs (frontend AND backend)
- Use parameterized queries (Django ORM does this)
- Sanitize data before display (React does this)
- Use HTTPS in production
- Keep dependencies updated

## 📚 External References

- **React**: https://react.dev/
- **TypeScript**: https://www.typescriptlang.org/
- **Tailwind CSS**: https://tailwindcss.com/
- **shadcn/ui**: https://ui.shadcn.com/
- **Django**: https://docs.djangoproject.com/
- **DRF**: https://www.django-rest-framework.org/

## 🤝 Contributing Pattern

When making changes:
1. Understand the existing architecture
2. Follow established code patterns
3. Maintain consistency with existing code style
4. Test changes thoroughly
5. Update documentation if needed

---

**For detailed development guidelines, see project-specific Copilot instructions:**
- Frontend: [.github/copilot-instructions.md](.github/copilot-instructions.md)
- Backend: [../cooking-assistant-backend/.github/copilot-instructions.md](../cooking-assistant-backend/.github/copilot-instructions.md)
