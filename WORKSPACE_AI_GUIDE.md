# Workspace Guide

**5 Projects**: web-app (React), backend (Django), recipe-embeddings, receipt-recognition, android-app

## Quick Navigation

**Frontend**: `cooking-assistant-web-app/` → [AI Context](AI_CONTEXT.md) | [Details](.github/copilot-instructions.md)
**Backend**: `cooking-assistant-backend/` → [AI Context](../cooking-assistant-backend/AI_CONTEXT.md) | [Details](../cooking-assistant-backend/.github/copilot-instructions.md)

## Architecture

```
User → Frontend (React) → Backend (Django) → PostgreSQL
                              ↓
                          Recipe Embeddings Service (port 8008)
                            ↓ pgvector
                          Recipe Database (2.2M recipes)
                          
                          Receipt OCR (port 8009)
```

## Quick Start

**Frontend**: `cd cooking-assistant-web-app && npm install && npm run dev`
**Backend**: `cd cooking-assistant-backend && python manage.py runserver`

**Docs**: See `cooking-assistant-web-app/doc/` for API specs and architecture.
