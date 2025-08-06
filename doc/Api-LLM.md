# Cooking Assistant LLM API

This document defines the API endpoint for generating new recipes using an LLM and the prompt patterns to ensure the LLM responds in the expected JSON format.

## 1. Endpoint: GET /api/recipes

Retrieves 3 new, LLM-enhanced recipes based on 3 source recipes fetched from the RAG database and user query parameters.

### Request

Query Parameters (all optional, but at least one should be provided):

- `ingredients` (string): comma-separated list of ingredients in the user's inventory.
- `mealType` (string): e.g., `breakfast`, `lunch`, `dinner`, `snack`.
- `dietaryRestrictions` (string): comma-separated list, e.g., `vegetarian`, `gluten-free`.
- `equipment` (string): comma-separated list of kitchen equipment available.
- `limit` (integer, optional, default 3): number of recipes to return.

Headers:
- `Authorization: Bearer <JWT>` (protected endpoint)

### Response (200 OK)

```json
{
  "recipes": [
    {
      "id": "string",                // unique recipe identifier
      "title": "string",
      "ingredients": [                // normalized list of ingredients
        { "name": "string", "quantity": number, "unit": "string" }
      ],
      "instructions": [               // step-by-step instructions
        { "step": number, "description": "string" }
      ]
    }
  ]
}
```

Error responses mirror standard patterns (`400 Bad Request`, `401 Unauthorized`, `500 Internal Server Error`).

## 2. LLM Integration

When processing `/api/recipes`, the backend will:

1. Query the RAG database to retrieve 3 source recipes matching the user query.
2. Call the LLM API with a structured prompt to rewrite and extend these recipes into a final JSON response.

### 2.1 System Prompt (always included)

```
You are a professional cooking assistant. Always respond in valid JSON following the schema:
{
  "recipes": [
    {
      "id": "string",
      "title": "string",
      "ingredients": [ { "name": "string", "quantity": number, "unit": "string" } ],
      "instructions": [ { "step": number, "description": "string" } ]
    }
  ]
}
```

### 2.2 User Prompt (dynamically constructed)

```text
Here are 3 source recipes fetched from the knowledge base:

Recipe 1:
<raw recipe text or structured representation>

Recipe 2:
<raw recipe text or structured representation>

Recipe 3:
<raw recipe text or structured representation>

Please create 3 brand-new recipes. For each one, choose an imaginative title, normalize and consolidate the ingredient lists (name, quantity, unit), and write detailed, step-by-step instructions numbered sequentially. Do not hallucinate ingredients or steps! Base your output only on the provided recipes! Return the results strictly in the JSON format defined by the system prompt.
```

*Template variables:*
- `<raw recipe text or structured representation>`: pass the text or JSON of each recipe as returned by the RAG query.

---

*Example call payload to LLM API (pseudocode):*

```json
{
  "model": "gpt-4",
  "temperature": 0.7,
  "messages": [
    { "role": "system", "content": "<System Prompt>" },
    { "role": "user", "content": "<User Prompt>" }
  ]
}
```

# LLM API Documentation

This document describes the API for the LLM service, which is responsible for generating new recipes based on provided examples.

## Endpoint: Generate Recipes

Generates 3 new recipes using an LLM (gemma) based on 3 input recipes.

- **URL**: `/api/llm/generate-recipes`
- **Method**: `POST`
- **Content-Type**: `application/json`

### Request Body

The request body must be a JSON object with the following structure:

```json
{
  "recipes": [
    {
      "title": "string",
      "ingredients": [
        {"name": "string", "quantity": "string | number", "unit": "string"}
      ],
      "instructions": ["string"],
      "prep_time_minutes": "integer",
      "cook_time_minutes": "integer",
      "servings": "integer",
      "meal_type": ["string"],
      "kitchen_equipment": ["string"]
    }
    // Exactly 3 recipe objects
  ],
  "target_cuisine": "string | null", // Optional: e.g., "Italian", "Mexican"
  "dietary_restrictions": ["string"] // Optional: e.g., ["vegetarian", "gluten-free"]
}
```

**Field Descriptions:**

*   `recipes`: An array containing exactly three recipe objects that will serve as inspiration.
    *   `title`: The title of the recipe.
    *   `ingredients`: An array of ingredient objects.
        *   `name`: Name of the ingredient.
        *   `quantity`: Quantity of the ingredient.
        *   `unit`: Unit for the quantity (e.g., "cup", "grams", "tbsp").
    *   `instructions`: An array of strings, where each string is a step in the cooking instructions.
    *   `prep_time_minutes`: Preparation time in minutes (integer).
    *   `cook_time_minutes`: Cooking time in minutes (integer).
    *   `servings`: Number of servings the recipe makes (integer).
    *   `meal_type`: An array of strings describing the meal type (e.g., `["dinner", "main course"]`).
    *   `kitchen_equipment`: An array of strings listing necessary kitchen equipment (e.g., `["oven", "blender"]`).
*   `target_cuisine` (optional): A string specifying a desired cuisine style for the generated recipes.
*   `dietary_restrictions` (optional): An array of strings specifying dietary restrictions for the generated recipes.

### Success Response (200 OK)

The response body will be a JSON object containing the generated recipes:

```json
{
  "generated_recipes": [
    {
      "title": "string",
      "ingredients": [
        {"name": "string", "quantity": "string | number", "unit": "string"}
      ],
      "instructions": ["string"],
      "prep_time_minutes": "integer",
      "cook_time_minutes": "integer",
      "servings": "integer",
      "meal_type": ["string"],
      "kitchen_equipment": ["string"],
      "notes": "string | null" // Optional notes from the LLM
    }
    // Exactly 3 generated recipe objects
  ]
}
```

**Field Descriptions:**

*   `generated_recipes`: An array containing exactly three new recipe objects generated by the LLM.
    *   Each recipe object follows the same structure as the input recipes, with an additional optional `notes` field for any comments from the LLM.

### Error Responses

*   **400 Bad Request**: If the request body is malformed or missing required fields.
    ```json
    {
      "error": "Invalid request payload",
      "details": "Specific error message"
    }
    ```
*   **500 Internal Server Error**: If an error occurs while communicating with the LLM or processing the request.
    ```json
    {
      "error": "LLM service error",
      "details": "Specific error message"
    }
    ```

## LLM Prompting Strategy

To ensure the LLM generates recipes in the correct format and adheres to the task, the following prompting strategy is used:

### System Prompt / Instructions for LLM

This prompt is sent to the LLM to define its role and the expected output format.

```text
You are a helpful cooking assistant. Your task is to generate 3 new, creative, and delicious recipes based on the provided example recipes. The example recipes are real and well-tested. Use them as inspiration for ingredients, cooking styles, and techniques, but create entirely new recipes. Do NOT simply copy or slightly modify the example recipes. The new recipes should be distinct from each other and from the examples.

Ensure your response is a single, valid JSON object. The root of the object should be a key named `generated_recipes`, which is an array of 3 recipe objects. Each recipe object MUST have the following structure:
`title`: string (The name of the recipe)
`ingredients`: array of objects, where each object has `name` (string), `quantity` (string or number), and `unit` (string).
`instructions`: array of strings (Step-by-step cooking instructions).
`prep_time_minutes`: integer (Preparation time in minutes).
`cook_time_minutes`: integer (Cooking time in minutes).
`servings`: integer (Number of servings).
`meal_type`: array of strings (e.g., ["dinner", "main course"]).
`kitchen_equipment`: array of strings (e.g., ["oven", "mixing bowl"]).
`notes`: string (Optional: any brief notes about the recipe, its inspiration, or serving suggestions).

Adhere strictly to this JSON format. Do not add any text before or after the JSON object.
```

### User Input Prompt (Example Structure to be built by the backend)

This prompt is constructed by the LLM API backend using the input recipes. The placeholders `{{...}}` will be filled with actual data.

```text
Here are 3 recipes for inspiration:

Recipe 1:
Title: {{recipes[0].title}}
Ingredients: {{recipes[0].ingredients_json_string}}
Instructions:
{{recipes[0].instructions_newline_separated}}
Prep Time: {{recipes[0].prep_time_minutes}} minutes
Cook Time: {{recipes[0].cook_time_minutes}} minutes
Servings: {{recipes[0].servings}}
Meal Types: {{recipes[0].meal_type_comma_separated}}
Kitchen Equipment: {{recipes[0].kitchen_equipment_comma_separated}}

Recipe 2:
Title: {{recipes[1].title}}
Ingredients: {{recipes[1].ingredients_json_string}}
Instructions:
{{recipes[1].instructions_newline_separated}}
Prep Time: {{recipes[1].prep_time_minutes}} minutes
Cook Time: {{recipes[1].cook_time_minutes}} minutes
Servings: {{recipes[1].servings}}
Meal Types: {{recipes[1].meal_type_comma_separated}}
Kitchen Equipment: {{recipes[1].kitchen_equipment_comma_separated}}

Recipe 3:
Title: {{recipes[2].title}}
Ingredients: {{recipes[2].ingredients_json_string}}
Instructions:
{{recipes[2].instructions_newline_separated}}
Prep Time: {{recipes[2].prep_time_minutes}} minutes
Cook Time: {{recipes[2].cook_time_minutes}} minutes
Servings: {{recipes[2].servings}}
Meal Types: {{recipes[2].meal_type_comma_separated}}
Kitchen Equipment: {{recipes[2].kitchen_equipment_comma_separated}}

{{#if target_cuisine}}
Please try to make the new recipes in the style of {{target_cuisine}} cuisine.
{{/if}}
{{#if dietary_restrictions}}
Please ensure the new recipes adhere to the following dietary restrictions: {{dietary_restrictions_comma_separated}}.
{{/if}}

Now, generate 3 new and distinct recipes based on these examples, following the JSON output format specified in your instructions.
```
