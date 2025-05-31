# Cooking Assistant API Documentation

## 1. Overview

This document outlines the API endpoints for the Cooking Assistant web application. The API provides functionalities for user management, inventory tracking, recipe discovery, and personalized recommendations.

## 2. Authentication

Authentication is handled via JWT (JSON Web Tokens). A token is issued upon successful login/registration and must be included in the `Authorization` header for protected endpoints as a Bearer token.

`Authorization: Bearer <YOUR_JWT_TOKEN>`

### Protected vs. Non-Protected Endpoints

*   **Protected Endpoints:** These endpoints require a valid JWT in the `Authorization` header. They are used for actions that are specific to a logged-in user, such as accessing or modifying their profile, inventory, or personal recipe suggestions. If a valid token is not provided, the server will respond with a `401 Unauthorized` error.
*   **Non-Protected (Public) Endpoints:** These endpoints can be accessed without any authentication token. Examples include general recipe searches or fetching static data like cuisine types.

### Server-Side Validation for Protected Endpoints

When a request is made to a protected endpoint, the server performs the following validation steps:
1.  **Token Presence:** Checks if the `Authorization` header is present and contains a `Bearer` token.
2.  **Token Validity:** Verifies the JWT\'s signature (to ensure it hasn\'t been tampered with and was issued by this server) and checks other standard claims like expiration (`exp`).
3.  **Token Expiration:** Confirms that the token has not expired.
4.  **User Identification & Authorization:** If the token is valid and not expired, the server decodes it to extract user-identifying information (e.g., `userId`, `username`) embedded within its claims. This `userId` is then used to:
    *   Identify which user is making the request. For example, on a `GET /api/users/profile` request, the server uses this `userId` to fetch the profile data for that specific user.
    *   Authorize the user for the requested resource or action, if further permission checks are needed beyond simple authentication.

If any of these checks fail (e.g., token missing, invalid signature, expired, user not found or not authorized), the server denies access and returns an appropriate error response (e.g., `401 Unauthorized`, `403 Forbidden`).

### Endpoints

#### `POST /api/auth/register`
Registers a new user.
*   **Request Body:**
    ```json
    {
      "username": "string",
      "email": "string (email format)",
      "password": "string (min 8 characters)"
    }
    ```
*   **Response (201 Created):**
    ```json
    {
      "userId": "string",
      "username": "string",
      "email": "string",
      "message": "User registered successfully"
    }
    ```
*   **Response (400 Bad Request):** Invalid input, email/username already exists.
*   **Response (500 Internal Server Error):** Server error.

#### `POST /api/auth/login`
Logs in an existing user.
*   **Request Body:**
    ```json
    {
      "email": "string",
      "password": "string"
    }
    ```
*   **Response (200 OK):**
    ```json
    {
      "token": "string (JWT)",
      "userId": "string",
      "username": "string",
      "email": "string"
    }
    ```
*   **Response (401 Unauthorized):** Invalid credentials.
*   **Response (500 Internal Server Error):** Server error.

#### `POST /api/auth/logout` (Protected)
Logs out the currently authenticated user (invalidates token if server-side session/token management is used).
*   **Response (200 OK):**
    ```json
    {
      "message": "Logged out successfully"
    }
    ```
*   **Response (401 Unauthorized):** No active session or invalid token.

#### `GET /api/auth/me` (Protected)
Retrieves the profile of the currently authenticated user.
*   **Response (200 OK):**
    ```json
    {
      "userId": "string",
      "username": "string",
      "email": "string",
      "profile": {
        "dietaryPreferences": ["string"],
        "allergies": ["string"],
        "cookingExpertise": "string", // e.g., "Beginner", "Intermediate", "Advanced"
        "cuisinePreferences": ["string"], // e.g., ["Italian", "Mexican"]
        "bio": "string (optional, user's short biography)",
        "profilePicture": "string (URL to png/jpg image, optional)",
        "kitchenEquipment": ["string"] // e.g., ["oven", "microwave", "blender"]
      }
    }
    ```
*   **Response (401 Unauthorized):** Invalid/missing token.
*   **Response (404 Not Found):** User profile not found.

## 3. User Profile API (Protected)

Endpoints for managing user-specific information like dietary preferences, allergies, and kitchen equipment. All endpoints require authentication.

#### `GET /api/users/profile`
Retrieves the current user's profile.
*   **Response (200 OK):**
    ```json
    {
      "dietaryPreferences": ["string"],
      "allergies": ["string"],
      "cookingExpertise": "string", // e.g., "Beginner", "Intermediate", "Advanced"
      "cuisinePreferences": ["string"], // e.g., ["Italian", "Mexican"]
      "bio": "string (optional, user's short biography)",
      "profilePicture": "string (URL to png/jpg image, optional)",
      "kitchenEquipment": ["string"] // e.g., ["oven", "microwave", "blender"]
    }
    ```
*   **Response (404 Not Found):** Profile not found.

#### `PUT /api/users/profile`
Updates the current user's profile.
*   **Request Body:**
    ```json
    {
      "dietaryPreferences": ["string"], // e.g., ["vegetarian", "gluten-free"]
      "allergies": ["string"], // e.g., ["nuts", "dairy"]
      "cookingExpertise": "string (optional)", // e.g., "Beginner", "Intermediate", "Advanced"
      "cuisinePreferences": ["string (optional)"], // e.g., ["Italian", "Mexican"]
      "bio": "string (optional)",
      "profilePicture": "string (URL to png/jpg image, optional)",
      "kitchenEquipment": ["string (optional)"] // e.g., ["oven", "microwave", "blender"]
    }
    ```
*   **Response (200 OK):**
    ```json
    {
      "message": "Profile updated successfully",
      "profile": {
        "dietaryPreferences": ["string"],
        "allergies": ["string"],
        "cookingExpertise": "string",
        "cuisinePreferences": ["string"],
        "bio": "string",
        "profilePicture": "string",
        "kitchenEquipment": ["string"]
      }
    }
    ```
*   **Response (400 Bad Request):** Invalid input.

## 4. Inventory API (Protected)

Endpoints for managing the user's kitchen inventory. All endpoints require authentication.

#### `GET /api/inventory`
Retrieves all items in the user's inventory.
*   **Query Parameters:**
    *   `page` (number, optional): For pagination.
    *   `limit` (number, optional): Items per page.
    *   `sortBy` (string, optional): Field to sort by (e.g., `name`, `expiryDate`, `category`).
    *   `sortOrder` (string, optional): `asc` or `desc`.
*   **Response (200 OK):**
    ```json
    {
      "items": [
        {
          "id": "string",
          "name": "string",
          "quantity": "number",
          "unit": "string (e.g., 'grams', 'ml', 'pcs')",
          "expiryDate": "string (ISO 8601 Date)",
          "addedDate": "string (ISO 8601 DateTime)",
          "category": "string"
        }
      ],
      "pagination": {
        "currentPage": "number",
        "totalPages": "number",
        "totalItems": "number"
      }
    }
    ```

#### `POST /api/inventory`
Adds a new item to the user's inventory.
*   **Request Body:**
    ```json
    {
      "name": "string",
      "quantity": "number",
      "unit": "string",
      "expiryDate": "string (ISO 8601 Date, optional)",
      "category": "string (optional, defaults to 'Pantry')"
    }
    ```
*   **Response (201 Created):**
    ```json
    {
      "id": "string",
      "name": "string",
      "quantity": "number",
      "unit": "string",
      "expiryDate": "string",
      "addedDate": "string",
      "category": "string"
    }
    ```
*   **Response (400 Bad Request):** Invalid input.

#### `PUT /api/inventory/{itemId}`
Updates an existing item in the inventory.
*   **Path Parameters:**
    *   `itemId` (string): The ID of the inventory item to update.
*   **Request Body:**
    ```json
    {
      "name": "string (optional)",
      "quantity": "number (optional)",
      "unit": "string (optional)",
      "expiryDate": "string (ISO 8601 Date, optional)",
      "category": "string (optional)"
    }
    ```
*   **Response (200 OK):**
    ```json
    {
      "id": "string",
      "name": "string",
      "quantity": "number",
      "unit": "string",
      "expiryDate": "string",
      "addedDate": "string",
      "category": "string"
    }
    ```
*   **Response (400 Bad Request):** Invalid input.
*   **Response (404 Not Found):** Item not found.

#### `DELETE /api/inventory/{itemId}`
Removes an item from the inventory.
*   **Path Parameters:**
    *   `itemId` (string): The ID of the inventory item to delete.
*   **Response (200 OK):**
    ```json
    {
      "message": "Item removed successfully"
    }
    ```
*   **Response (404 Not Found):** Item not found.

## 5. Recipes API

Endpoints for discovering and managing recipes. Some endpoints may be public, while others (like rating or saving recipes) require authentication.

#### `GET /api/recipes`
Searches and filters recipes.
*   **Query Parameters (all optional):**
    *   `ingredients` (string array): Comma-separated list of ingredient names to include.
    *   `excludeIngredients` (string array): Comma-separated list of ingredient names to exclude. (Expandable feature)
    *   `kitchenEquipment` (string array): Comma-separated list of equipment IDs, e.g. "airfryer", "oven", "stove".
    *   `mealType` (string): Filter by a single meal type, e.g., "Breakfast", "Lunch", "Dinner", "Snack", "Dessert".
    *   `cuisine` (string array): Comma-separated list of cuisine types, e.g., "Italian", "Mexican", "Indian". (Expandable feature)
    *   `difficulty` (string): e.g., "Easy", "Medium", "Hard". (Future)
    *   `maxPrepTime` (string): Filter by preparation time. Expected values: "quick" (e.g., under 30 minutes) or "any time".
    *   `minRating` (number): Minimum average rating (1-5). (Future)
    *   `sortBy` (string): e.g., `rating`, `prepTime`, `name`.
    *   `sortOrder` (string): `asc` or `desc`.
    *   `page` (number): For pagination.
    *   `limit` (number): Items per page.
*   **Response (200 OK):**
  ```json
  {
    "recipes": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "mealType": ["string"],
      "cuisine": "string",
      "prepTimeMinutes": "number",
      "cookTimeMinutes": "number",
      "servings": "number",
      "difficulty": "string",
      "averageRating": "number",
      "ratingsCount": "number",
      "imageUrl": "string",
      "ingredients": [
      { "name": "string", "quantity": "string", "unit": "string", "notes": "string (optional)" }
      ],
      "instructions": [
      "string (step 1)",
      "string (step 2)"
      ],
      "kitchenEquipmentNeeded": ["string"],
      "tags": ["string"],
    }
    ],
    "pagination": {
    "currentPage": "number",
    "totalPages": "number",
    "totalItems": "number"
    }
  }
  ```

#### `GET /api/recipes/{recipeId}`
Retrieves details for a specific recipe.
*   **Path Parameters:**
    *   `recipeId` (string): The ID of the recipe.
*   **Response (200 OK):**
    ```json
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "mealType": ["string"],
      "cuisine": "string",
      "prepTimeMinutes": "number",
      "cookTimeMinutes": "number",
      "servings": "number",
      "difficulty": "string",
      "averageRating": "number",
      "ratingsCount": "number",
      "imageUrl": "string",
      "ingredients": [
        { "name": "string", "quantity": "string", "unit": "string", "notes": "string (optional)" }
      ],
      "instructions": [
        "string (step 1)",
        "string (step 2)"
      ],
      "kitchenEquipmentNeeded": ["string"],
      "tags": ["string"],
      "author": { // Optional, if recipes are user-submitted
        "userId": "string",
        "username": "string"
      },
      "createdAt": "string (ISO 8601 DateTime)",
      "updatedAt": "string (ISO 8601 DateTime)"
    }
    ```
*   **Response (404 Not Found):** Recipe not found.

#### `POST /api/recipes/{recipeId}/rate` (Protected)
Allows an authenticated user to rate a recipe.
*   **Path Parameters:**
    *   `recipeId` (string): The ID of the recipe to rate.
*   **Request Body:**
    ```json
    {
      "rating": "number (1-5)"
    }
    ```
*   **Response (200 OK):**
    ```json
    {
      "message": "Recipe rated successfully",
      "newAverageRating": "number"
    }
    ```
*   **Response (400 Bad Request):** Invalid rating value.
*   **Response (404 Not Found):** Recipe not found.

#### `GET /api/recipes/suggestions` (Protected)
Gets recipe suggestions based on the user's inventory, profile (preferences, allergies), and possibly past interactions.
*   **Query Parameters (optional):**
    *   `limit` (number): Number of suggestions to return.
    *   `useInventory` (boolean): Prioritize recipes using available inventory items.
*   **Response (200 OK):**
    ```json
    {
      "suggestions": [
        // Array of recipe objects, similar to GET /api/recipes
      ]
    }
    ```

## 6. Static Data API (Public)

Endpoints to fetch lists of predefined data like meal types, cuisines, common ingredients for autocompletion, or kitchen equipment. These can help populate selectors in the UI.

#### `GET /api/meal-types`
*   **Response (200 OK):**
    ```json
    {
      "mealTypes": ["Breakfast", "Lunch", "Dinner", "Snack", "Dessert", "Appetizer"]
    }
    ```

#### `GET /api/cuisines`
*   **Response (200 OK):**
    ```json
    {
      "cuisines": ["Italian", "Mexican", "Chinese", "Indian", "French", "Japanese", "Thai", "Mediterranean"]
    }
    ```

#### `GET /api/ingredients/common`
(I am not sure why it suggested that one)

Provides a list of common ingredients for typeaheads or selectors.
*   **Query Parameters (optional):**
    *   `q` (string): Search term to filter ingredients by name.
    *   `limit` (number): Max number of results to return.
*   **Response (200 OK):**
    ```json
    {
      "ingredients": [
        { "id": "string", "name": "string" },
        // ...
      ]
    }
    ```

#### `GET /api/kitchen-equipment`
*   **Response (200 OK):**
    ```json
    {
      "equipment": ["Oven", "Microwave", "Blender", "Food Processor", "Stand Mixer", "Grill"]
    }
    ```

## 7. Error Responses

Standard error responses will follow this format:

*   **400 Bad Request:**
    ```json
    {
      "error": "Bad Request",
      "message": "Invalid input provided.",
      "details": [ // Optional, for specific field errors
        { "field": "fieldName", "message": "Error description" }
      ]
    }
    ```
*   **401 Unauthorized:**
    ```json
    {
      "error": "Unauthorized",
      "message": "Authentication token is missing or invalid."
    }
    ```
*   **403 Forbidden:**
    ```json
    {
      "error": "Forbidden",
      "message": "You do not have permission to access this resource."
    }
    ```
*   **404 Not Found:**
    ```json
    {
      "error": "Not Found",
      "message": "The requested resource was not found."
    }
    ```
*   **500 Internal Server Error:**
    ```json
    {
      "error": "Internal Server Error",
      "message": "An unexpected error occurred on the server."
    }
    ```