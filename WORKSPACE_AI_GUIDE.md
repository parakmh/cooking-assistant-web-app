# 🤖 AI Assistant Guide - KitchenAI Workspace

> **Purpose**: This file helps GitHub Copilot and other AI assistants understand your multi-project workspace structure and provide better code suggestions.

## 📂 Workspace Structure

This VS Code workspace contains **5 related projects** for the KitchenAI Assistant application:

```
parakmh/
├── cooking-assistant-web-app/          ⭐ MAIN: React Frontend
├── cooking-assistant-backend/          ⭐ MAIN: Django Backend  
├── cooking-assistant-llm/              🔧 LLM Service Emulator
├── cooking-assistant-receipt-recognition-llm/  🔧 OCR Service Emulator
└── cooking-assistant-android-app/      📱 Mobile App Wrapper
```

## 🎯 Quick Navigation for AI

### Working on Frontend? → Read This
📁 **Project**: `cooking-assistant-web-app/`
📖 **AI Context**: [cooking-assistant-web-app/AI_CONTEXT.md](cooking-assistant-web-app/AI_CONTEXT.md)
📘 **Detailed Guide**: [cooking-assistant-web-app/.github/copilot-instructions.md](cooking-assistant-web-app/.github/copilot-instructions.md)

**Tech Stack**: React 18, TypeScript, Vite, shadcn/ui, Tailwind CSS, React Router, React Query

### Working on Backend? → Read This
📁 **Project**: `cooking-assistant-backend/`
📖 **AI Context**: [cooking-assistant-backend/AI_CONTEXT.md](cooking-assistant-backend/AI_CONTEXT.md)
📘 **Detailed Guide**: [cooking-assistant-backend/.github/copilot-instructions.md](cooking-assistant-backend/.github/copilot-instructions.md)

**Tech Stack**: Django 4.2+, Django REST Framework, PostgreSQL, JWT Authentication

### Working on Full-Stack Feature?
1. Start with **Backend**: Create models, serializers, views, URLs
2. Then **Frontend**: Create components, add API calls, style with Tailwind
3. **Reference**: [cooking-assistant-web-app/doc/Api.md](cooking-assistant-web-app/doc/Api.md) for API contracts

## 📋 Project Details

### ⭐ Main Projects (Focus Here)

#### 1. Frontend: `cooking-assistant-web-app/`
- **Purpose**: React-based web interface for users
- **Key Features**: Recipe search, inventory management, user profiles, AI recipe suggestions
- **Dev Server**: `http://localhost:5173`
- **Entry Point**: `src/main.tsx`
- **Routing**: `src/App.tsx`
- **Components**: `src/components/`, `src/pages/`

#### 2. Backend: `cooking-assistant-backend/`
- **Purpose**: REST API server and database management
- **Key Features**: User auth (JWT), CRUD APIs, LLM integration
- **Dev Server**: `http://127.0.0.1:8000`
- **Models**: `api/models.py`
- **Views**: `api/views.py`
- **URLs**: `api/urls.py`

### 🔧 Supporting Projects (External Dependencies)

#### 3. LLM Service: `cooking-assistant-llm/`
- **Purpose**: Emulates AI recipe generation service
- **Port**: 8001
- **Note**: Don't modify unless working on LLM integration
- **Real Usage**: Backend calls this service for recipe suggestions

#### 4. Receipt Recognition: `cooking-assistant-receipt-recognition-llm/`
- **Purpose**: Emulates OCR for receipt scanning
- **Port**: 8002
- **Note**: Don't modify unless working on receipt feature
- **Real Usage**: Backend calls this for image-to-text conversion

#### 5. Mobile App: `cooking-assistant-android-app/`
- **Purpose**: Capacitor wrapper for mobile deployment
- **Note**: Changes to web-app automatically apply here
- **Don't modify** unless working on mobile-specific features

## 🏗️ System Architecture

```
┌─────────────────────┐
│   User Browser      │
│   (localhost:5173)  │
└──────────┬──────────┘
           │ HTTP/REST
           ▼
┌─────────────────────┐     ┌──────────────────┐
│  React Frontend     │────▶│  Django Backend  │
│  (TypeScript)       │◀────│  (Python)        │
│                     │     │  (port 8000)     │
└─────────────────────┘     └────────┬─────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    ▼                ▼                ▼
            ┌──────────────┐ ┌─────────────┐ ┌──────────────┐
            │  PostgreSQL  │ │ LLM Service │ │ Receipt OCR  │
            │   Database   │ │  (port 8001)│ │  (port 8002) │
            └──────────────┘ └─────────────┘ └──────────────┘
```

## 💡 How to Use These Files

### For GitHub Copilot / AI Assistants

VS Code and GitHub Copilot automatically use `.github/copilot-instructions.md` files to provide better context-aware suggestions.

**Files Created:**
1. `cooking-assistant-web-app/.github/copilot-instructions.md` - Frontend guide
2. `cooking-assistant-backend/.github/copilot-instructions.md` - Backend guide
3. `cooking-assistant-web-app/AI_CONTEXT.md` - Frontend quick reference
4. `cooking-assistant-backend/AI_CONTEXT.md` - Backend quick reference
5. This file - Workspace overview

### For Developers

**When asking AI for help:**
- Mention which project you're in
- Reference the relevant AI_CONTEXT.md or copilot-instructions.md
- Example: "Using the patterns in copilot-instructions.md, create a new API endpoint for..."

**When onboarding:**
- Read `AI_CONTEXT.md` for quick overview
- Read `.github/copilot-instructions.md` for detailed guidelines

## 🎨 Code Style Quick Reference

### Frontend (TypeScript/React)
```typescript
// ✅ PascalCase for components
export const RecipeCard = ({ recipe }: RecipeCardProps) => {
  // Tailwind CSS classes
  return <div className="flex items-center gap-4">...</div>;
};

// ✅ camelCase for hooks
export const useAuth = () => { ... };

// ✅ Interfaces for props
interface RecipeCardProps {
  recipe: Recipe;
  onFavorite?: () => void;
}
```

### Backend (Python/Django)
```python
# ✅ snake_case for everything
class RecipeListView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = RecipeSerializer
    
    def get_queryset(self):
        return Recipe.objects.filter(user=self.request.user)
```

## 🔗 Cross-Project Communication

### API Communication Flow
1. **Frontend** makes HTTP request with JWT token
2. **Backend** validates token, processes request
3. **Backend** may call LLM/OCR services
4. **Backend** returns JSON response
5. **Frontend** updates UI

### Data Flow Example: "Add Recipe to Favorites"
```
User clicks "Favorite" button
  ↓
React component calls API
  ↓
POST /api/recipes/{id}/favorite
  Authorization: Bearer <jwt-token>
  ↓
Django view validates token & user
  ↓
Create Favorite record in database
  ↓
Return success response
  ↓
React updates UI with success message
```

## 📚 Key Documentation

### Must-Read Files
- **API Specification**: `cooking-assistant-web-app/doc/Api.md`
- **System Architecture**: `cooking-assistant-web-app/doc/System-Architecture.md`
- **Frontend Guide**: `cooking-assistant-web-app/.github/copilot-instructions.md`
- **Backend Guide**: `cooking-assistant-backend/.github/copilot-instructions.md`

### Configuration Files
- **Frontend**: `package.json`, `vite.config.ts`, `tailwind.config.ts`, `tsconfig.json`
- **Backend**: `requirements.txt`, `settings.py`, `.env` (not in git)

## 🚀 Quick Start Commands

### Frontend Development
```bash
cd cooking-assistant-web-app
npm install
npm run dev  # Starts on http://localhost:5173
```

### Backend Development
```bash
cd cooking-assistant-backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver  # Starts on http://127.0.0.1:8000
```

### External Services (if needed)
```bash
# LLM Service
cd cooking-assistant-llm
python main.py  # Port 8001

# Receipt OCR
cd cooking-assistant-receipt-recognition-llm
python main.py  # Port 8002
```

## 🎯 Common Tasks for AI

### "Add a new API endpoint"
1. Check: `cooking-assistant-backend/`
2. Read: Backend copilot-instructions.md
3. Pattern: Create serializer → view → URL route
4. Update: `doc/Api.md` documentation

### "Create a new React component"
1. Check: `cooking-assistant-web-app/src/components/`
2. Read: Frontend copilot-instructions.md
3. Pattern: TypeScript interface → functional component → Tailwind styling
4. Use: shadcn/ui components where appropriate

### "Add a new database model"
1. Check: `cooking-assistant-backend/api/models.py`
2. Pattern: Model → Serializer → View → URL
3. Run: `python manage.py makemigrations && python manage.py migrate`
4. Update: Frontend TypeScript interfaces

### "Modify existing feature"
1. Identify: Frontend or Backend (or both)?
2. Find: Existing code with search/grep
3. Follow: Existing patterns in that file
4. Test: Both API and UI if full-stack change

## ⚠️ Important Notes

### Security
- Never commit `.env` files
- Always validate user inputs (both frontend and backend)
- Use JWT tokens for authentication
- Backend validates all permissions

### Performance
- Frontend: Use React Query for caching
- Backend: Use `select_related()` for queries
- Optimize images and assets
- Lazy load routes when appropriate

### Testing
- Frontend: Vitest + React Testing Library
- Backend: Django TestCase / APITestCase
- Manual: Test APIs with curl or Postman

## 🤝 AI Assistant Checklist

When generating code, ensure:
- [ ] Identified correct project (frontend/backend)
- [ ] Read relevant copilot-instructions.md
- [ ] Followed code style guidelines
- [ ] Used existing patterns in codebase
- [ ] Added proper error handling
- [ ] Considered security implications
- [ ] Maintained type safety (TypeScript/Python types)
- [ ] Used appropriate libraries (shadcn/ui, Django ORM)

## 📞 Need More Help?

- **Frontend Details**: [cooking-assistant-web-app/.github/copilot-instructions.md](cooking-assistant-web-app/.github/copilot-instructions.md)
- **Backend Details**: [cooking-assistant-backend/.github/copilot-instructions.md](cooking-assistant-backend/.github/copilot-instructions.md)
- **API Reference**: [cooking-assistant-web-app/doc/Api.md](cooking-assistant-web-app/doc/Api.md)
- **Architecture**: [cooking-assistant-web-app/doc/System-Architecture.md](cooking-assistant-web-app/doc/System-Architecture.md)

---

**Remember**: Always check which project folder you're in before making changes!
