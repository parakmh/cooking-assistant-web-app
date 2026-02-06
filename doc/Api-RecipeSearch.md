# Cooking Assistant Recipe Search API

This document defines the API endpoint for discovering recipes using semantic search over a database of 2.2 million real recipes from the RecipeNLG dataset.

## Overview

The recipe search service uses **vector embeddings and semantic similarity** to find relevant recipes from a large database of real recipes, instead of generating new recipes with an LLM. This approach provides:

- **Real, tested recipes** from the RecipeNLG dataset (2.2M recipes)
- **Cost-effective** operation ($3-30/month vs $600-3000 for LLM)
- **No hallucinations** - all recipes are real and complete
- **Fast semantic search** using pgvector with HNSW indexing
- **Embedding-based matching** using Sentence Transformers (all-MiniLM-L6-v2)

## Architecture

```
Backend API --> Recipe Search Service --> PostgreSQL + pgvector
                     (Port 8008)          (384-dim embeddings)
```

The backend calls the recipe search service, which performs vector similarity search to find recipes matching user ingredients and preferences.

## 1. Endpoint: POST /api/llm/generate-direct-recipes

Retrieves 3 relevant recipes from the RecipeNLG database based on semantic similarity to user ingredients and preferences.

**Note:** This endpoint maintains the same interface as the previous LLM service for backward compatibility, but uses semantic search instead of generation.

### Request

```http
POST http://127.0.0.1:8008/api/llm/generate-direct-recipes
Content-Type: application/json
```

**Request Body:**

```json
{
  "user_ingredients": ["chicken", "tomatoes", "basil"],
  "meal_type": "dinner",
  "dietary_restrictions": ["gluten-free"],
  "kitchen_equipment": ["oven"],
  "max_prep_time": 45,
  "target_cuisine": "Italian"
}
```

**Field Descriptions:**

- `user_ingredients` (array of strings, required): List of available ingredients
- `meal_type` (string, optional): Filter by meal type (`breakfast`, `lunch`, `dinner`, `snack`)
- `dietary_restrictions` (array of strings, optional): Filter by dietary tags (`vegetarian`, `vegan`, `gluten-free`, etc.)
- `kitchen_equipment` (array of strings, optional): Filter by required equipment (`oven`, `blender`, etc.)
- `max_prep_time` (integer, optional): Maximum preparation time in minutes
- `target_cuisine` (string, optional): Preferred cuisine style (`Italian`, `Mexican`, `Asian`, etc.)

### Response (200 OK)

```json
{
  "generated_recipes": [
    {
      "title": "Chicken Parmesan",
      "ingredients": [
        {"name": "chicken breast", "quantity": 2, "unit": "pieces"},
        {"name": "tomatoes", "quantity": 4, "unit": "medium"},
        {"name": "basil", "quantity": 0.25, "unit": "cup"}
      ],
      "instructions": [
        "Preheat oven to 375°F",
        "Season chicken with salt and pepper",
        "Bake for 25-30 minutes"
      ],
      "prep_time_minutes": 15,
      "cook_time_minutes": 30,
      "servings": 4,
      "meal_type": ["dinner"],
      "kitchen_equipment": ["oven"],
      "notes": "Source: RecipeNLG. Dietary: gluten-free"
    },
    {
      "title": "Italian Chicken Bake",
      "ingredients": [
        {"name": "chicken thighs", "quantity": 6, "unit": "pieces"},
        {"name": "cherry tomatoes", "quantity": 2, "unit": "cups"},
        {"name": "fresh basil", "quantity": 0.5, "unit": "cup"}
      ],
      "instructions": [
        "Mix ingredients in baking dish",
        "Season with herbs and olive oil",
        "Bake at 400°F for 35 minutes"
      ],
      "prep_time_minutes": 10,
      "cook_time_minutes": 35,
      "servings": 6,
      "meal_type": ["dinner", "main course"],
      "kitchen_equipment": ["oven", "baking dish"],
      "notes": "Source: RecipeNLG"
    },
    {
      "title": "Basil Chicken Skillet",
      "ingredients": [
        {"name": "chicken", "quantity": 1.5, "unit": "lbs"},
        {"name": "tomatoes", "quantity": 3, "unit": "large"},
        {"name": "basil leaves", "quantity": 1, "unit": "bunch"}
      ],
      "instructions": [
        "Heat oil in large skillet",
        "Cook chicken until golden",
        "Add tomatoes and basil, simmer"
      ],
      "prep_time_minutes": 8,
      "cook_time_minutes": 20,
      "servings": 4,
      "meal_type": ["dinner"],
      "kitchen_equipment": ["stove", "skillet"],
      "notes": "Source: RecipeNLG. Quick weeknight meal"
    }
  ]
}
```

**Response Field Descriptions:**

- `generated_recipes`: Array of 3 recipe objects (always returns exactly 3)
  - `title`: Recipe name from RecipeNLG
  - `ingredients`: Structured list with name, quantity, and unit
  - `instructions`: Step-by-step cooking instructions
  - `prep_time_minutes`: Preparation time (may be null if not available)
  - `cook_time_minutes`: Cooking time (may be null if not available)
  - `servings`: Number of servings
  - `meal_type`: Array of meal types
  - `kitchen_equipment`: Required kitchen equipment
  - `notes`: Source attribution and additional information

### Error Responses

**400 Bad Request:**
```json
{
  "error": "Invalid request payload",
  "details": "user_ingredients is required"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Recipe search service error",
  "details": "Database connection failed"
}
```

## 2. How Semantic Search Works

### 2.1 Embedding Generation

When a user provides ingredients:
1. Create search text: "Recipe with ingredients: chicken, tomatoes, basil"
2. Generate 384-dimensional embedding using Sentence Transformers (all-MiniLM-L6-v2)
3. This embedding represents the semantic meaning of the ingredient combination

### 2.2 Vector Similarity Search

The service uses PostgreSQL with pgvector extension:
```sql
SELECT *, embedding <=> query_vector AS distance
FROM recipes
WHERE meal_types @> '["dinner"]'
  AND dietary_tags @> '["gluten-free"]'
ORDER BY embedding <=> query_vector
LIMIT 50;
```

- Uses HNSW (Hierarchical Navigable Small World) index for fast approximate search
- Cosine distance determines similarity between embeddings
- Filters applied for meal type, dietary restrictions, equipment, prep time

### 2.3 Ranking and Results

- Results ordered by similarity score (lower distance = more similar)
- Top 3 most relevant recipes returned
- Each recipe includes source attribution ("Source: RecipeNLG")

## 3. Dataset Information

### RecipeNLG Dataset
- **Size**: 2,231,152 recipes
- **Source**: Gathered from various cooking websites
- **License**: Non-commercial use (research and personal use allowed)
- **Coverage**: Wide variety of cuisines, meal types, and dietary preferences
- **Quality**: Real recipes with complete ingredient lists and instructions

### Data Processing
- Recipes parsed and normalized from source dataset
- Ingredients extracted and structured
- Meal types inferred from recipe titles and context
- Dietary tags detected from ingredients (vegetarian, vegan, gluten-free, etc.)
- Kitchen equipment requirements identified
- All recipes pre-embedded using Sentence Transformers

## 4. Integration with Backend

The Django backend calls this service when:
- User requests recipe suggestions based on their inventory
- User searches for recipes with specific filters
- User requests personalized recommendations

**Backend Integration Code:**

```python
import requests

def get_recipe_suggestions(user_ingredients, user_preferences):
    """Call recipe search service for recommendations."""
    try:
        response = requests.post(
            'http://127.0.0.1:8008/api/llm/generate-direct-recipes',
            json={
                'user_ingredients': user_ingredients,
                'dietary_restrictions': user_preferences.get('dietary', []),
                'kitchen_equipment': user_preferences.get('equipment', []),
                'meal_type': user_preferences.get('meal_type'),
                'max_prep_time': user_preferences.get('max_prep_time')
            },
            timeout=30
        )
        response.raise_for_status()
        return response.json()['generated_recipes']
    except requests.exceptions.RequestException as e:
        logger.error(f"Recipe search service error: {str(e)}")
        raise
```

## 5. Service Configuration

### Environment Variables

In `cooking-assistant-recipe-embeddings/.env`:
```bash
DATABASE_URL=postgresql://user:pass@localhost:5432/recipe_embeddings_db
EMBEDDING_MODEL=all-MiniLM-L6-v2
VECTOR_DIMENSION=384
```

### Service URL

Backend `.env` configuration:
```bash
RECIPE_SEARCH_SERVICE_URL=http://127.0.0.1:8008
```

## 6. Performance Characteristics

### Search Speed
- Typical query time: 50-200ms
- HNSW index provides approximate nearest neighbor search in sub-linear time
- Database queries optimized with GIN indexes on JSON fields

### Scalability
- Handles 2.2M recipes with efficient vector search
- Can scale to 10M+ recipes with proper indexing
- Stateless service - easy to horizontally scale

### Cost Efficiency
- **Recipe Embeddings Service**: ~$3-30/month (VPS/cloud compute + storage)
- **Previously (LLM)**: $600-3000/month (API costs for generation)
- **Savings**: 95-99% reduction in operational costs

## 7. Comparison: Embeddings vs LLM

| Aspect | Recipe Embeddings | LLM Generation |
|--------|-------------------|----------------|
| **Recipes** | Real recipes from RecipeNLG | Generated/synthetic recipes |
| **Quality** | Tested recipes from cooking sites | Variable, may lack detail |
| **Hallucinations** | None - all data is real | Possible (fake ingredients, steps) |
| **Speed** | 50-200ms per query | 2-10s per query |
| **Cost** | $3-30/month | $600-3000/month |
| **Scalability** | Excellent (vector search) | Limited by API rate limits |
| **Dataset Size** | 2.2M recipes | N/A (generates on demand) |
| **Offline Operation** | Yes (self-hosted) | No (requires API) |
| **Consistency** | Deterministic | Non-deterministic |

## 8. Future Enhancements

Potential improvements to the recipe search service:

- **Hybrid Search**: Combine vector search with keyword search (BM25)
- **User Feedback**: Learn from recipe ratings and preferences
- **Personalization**: User-specific embeddings for personalized results
- **Multi-modal**: Support image-based recipe search
- **Commercial Dataset**: Migrate to Spoonacular or Edamam for commercial use
- **Caching**: Redis cache for common queries
- **Real-time Updates**: Live recipe additions from user contributions

## 9. Related Documentation

- **[Main API Documentation](Api.md)** - Backend API endpoints
- **[System Architecture](System-Architecture.md)** - Overall system design
- **[Recipe Embeddings README](../../cooking-assistant-recipe-embeddings/README.md)** - Service setup and deployment

---

**Note**: This service replaced the previous LLM-based recipe generation service (`cooking-assistant-llm`) to provide more reliable, cost-effective, and scalable recipe discovery using real recipes from RecipeNLG.
