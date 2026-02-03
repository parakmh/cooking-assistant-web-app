# KitchenAI Assistant

A full-stack cooking assistant web application that helps users manage their kitchen inventory, discover recipes, and get AI-powered personalized cooking recommendations.

## 🤖 AI Development Support

This project includes comprehensive AI context files to help GitHub Copilot and AI assistants provide better code suggestions:

- **[AI_CONTEXT.md](AI_CONTEXT.md)** - Quick reference for project structure and patterns
- **[.github/copilot-instructions.md](.github/copilot-instructions.md)** - Detailed frontend development guide (auto-read by Copilot)
- **[WORKSPACE_AI_GUIDE.md](WORKSPACE_AI_GUIDE.md)** - Multi-project workspace overview
- **[AI_FILES_SUMMARY.md](AI_FILES_SUMMARY.md)** - Explanation of all AI context files

These files help AI assistants understand:
✅ Your code style and conventions  
✅ Technology stack and architecture  
✅ Common patterns and best practices  
✅ How frontend and backend communicate  

**New to the project?** Start with [AI_CONTEXT.md](AI_CONTEXT.md) for a quick overview.

## 🚀 How can I edit this code?

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## 🛠️ What technologies are used for this project?

This project is built with:

- **Vite** - Fast build tool and dev server
- **TypeScript** - Type-safe JavaScript
- **React 18** - UI library with hooks
- **shadcn/ui** - Beautiful, accessible components
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **React Query** - Server state management
- **React Hook Form + Zod** - Form handling and validation

## 📁 Project Structure

```
src/
├── components/     # Reusable UI components
│   ├── ui/        # shadcn/ui components
│   └── forms/     # Form components
├── pages/         # Route/page components
├── contexts/      # React Context providers
├── hooks/         # Custom React hooks
└── lib/           # Utility functions
```

## 📚 Documentation

- **[API Documentation](doc/Api.md)** - Complete API endpoint reference
- **[System Architecture](doc/System-Architecture.md)** - High-level system design
- **[Frontend Guide](.github/copilot-instructions.md)** - Detailed development guide

## 🔗 Related Projects

This is part of a multi-project workspace:
- **cooking-assistant-backend** - Django REST API backend
- **cooking-assistant-llm** - LLM service emulator
- **cooking-assistant-receipt-recognition-llm** - OCR service emulator
- **cooking-assistant-android-app** - Mobile app wrapper

See [WORKSPACE_AI_GUIDE.md](WORKSPACE_AI_GUIDE.md) for the complete system overview.