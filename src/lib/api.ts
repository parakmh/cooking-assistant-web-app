const getApiBaseUrl = () => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  if (!baseUrl) {
    console.error("VITE_API_BASE_URL is not defined in .env file");
    return "http://127.0.0.1:8000/api"
  }
  return baseUrl;
};

import { 
  sanitizeRecipe, 
  sanitizeInventoryItem, 
  sanitizeUserProfile 
} from './sanitize';
import { ApiError, ApiErrorResponse } from './errors';

export const getToken = (): string | null => {
  return localStorage.getItem('authToken');
};

export const setToken = (token: string): void => {
  localStorage.setItem('authToken', token);
};

export const getRefreshToken = (): string | null => {
  return localStorage.getItem('refreshToken');
};

export const setRefreshToken = (token: string): void => {
  localStorage.setItem('refreshToken', token);
};

export const removeToken = (): void => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('refreshToken');
};

// Token validation utility
export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  } catch (error) {
    console.error('Error parsing token:', error);
    return true; // Assume expired if we can't parse it
  }
};

// Check if token will expire soon (within 5 minutes)
export const willTokenExpireSoon = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    const fiveMinutes = 5 * 60;
    return payload.exp < (currentTime + fiveMinutes);
  } catch (error) {
    return true;
  }
};

// Refresh token utility
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
};

const addRefreshSubscriber = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

export const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = getRefreshToken();
  
  if (!refreshToken) {
    console.warn('No refresh token available');
    return null;
  }

  if (isRefreshing) {
    // Wait for the ongoing refresh to complete
    return new Promise((resolve) => {
      addRefreshSubscriber((token: string) => {
        resolve(token);
      });
    });
  }

  isRefreshing = true;

  try {
    const response = await fetch(`${getApiBaseUrl()}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const data = await response.json();
    const newAccessToken = data.access;
    
    setToken(newAccessToken);
    isRefreshing = false;
    onRefreshed(newAccessToken);
    
    return newAccessToken;
  } catch (error) {
    console.error('Error refreshing token:', error);
    isRefreshing = false;
    removeToken();
    window.dispatchEvent(new CustomEvent('auth:logout', { 
      detail: { reason: 'refresh_failed' } 
    }));
    return null;
  }
};

// Enhanced token getter that checks expiration and auto-refreshes
export const getValidToken = async (): Promise<string | null> => {
  const token = getToken();
  if (!token) return null;
  
  if (isTokenExpired(token)) {
    console.warn('Token expired, attempting refresh');
    return await refreshAccessToken();
  }
  
  // Auto-refresh if token expires soon
  if (willTokenExpireSoon(token)) {
    console.log('Token expiring soon, refreshing proactively');
    const newToken = await refreshAccessToken();
    return newToken || token; // Return new token or keep using current if refresh fails
  }
  
  return token;
};

// Synchronous version for immediate checks (doesn't auto-refresh)
export const getValidTokenSync = (): string | null => {
  const token = getToken();
  if (!token || isTokenExpired(token)) {
    return null;
  }
  return token;
};

interface ApiCallOptions extends RequestInit {
  needsAuth?: boolean;
  isFormData?: boolean;
}

export const apiCall = async <T = any>(
  endpoint: string,
  options: ApiCallOptions = {}
): Promise<T> => {
  const { needsAuth = true, isFormData = false, ...fetchOptions } = options;
  const headers = new Headers(fetchOptions.headers || {});

  if (!isFormData) {
    headers.append('Content-Type', 'application/json');
  }
  headers.append('Accept', 'application/json');

  if (needsAuth) {
    const token = await getValidToken(); // Use enhanced token getter with auto-refresh
    if (token) {
      headers.append('Authorization', `Bearer ${token}`);
    } else {
      // Handle cases where auth is needed but token is not available or expired
      console.warn(`Valid auth token not found for protected route: ${endpoint}`);
      // Don't proceed with the request if no valid token for protected routes
      throw { 
        status: 401, 
        data: { message: 'Authentication required' }, 
        response: null 
      };
    }
  }

  const response = await fetch(`${getApiBaseUrl()}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    let errorData: ApiErrorResponse;
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = { error: response.statusText || 'Request failed' };
    }
    
    // Handle 401 Unauthorized - token expired or invalid
    if (response.status === 401 && needsAuth) {
      console.warn('Token expired or unauthorized, clearing auth state');
      removeToken();
      // Trigger global logout by dispatching a custom event
      window.dispatchEvent(new CustomEvent('auth:logout', { 
        detail: { reason: 'token_expired' } 
      }));
    }
    
    // Throw structured ApiError
    throw new ApiError(
      errorData.error || 'Request failed',
      response.status,
      errorData.code,
      errorData.details
    );
  }

  // Handle cases where response might be empty (e.g., 204 No Content)
  if (response.status === 204) {
    return undefined as T;
  }
  
  const text = await response.text();
  try {
    return JSON.parse(text) as T;
  } catch (e) {
    // If response is not JSON, return as text (or handle as needed)
    console.warn("API response was not valid JSON, returning as text:", text);
    return text as unknown as T;
  }
};

export const getBackendDomain = (): string => {
  const apiBaseUrl = getApiBaseUrl(); // e.g., http://127.0.0.1:8000/api
  try {
    const url = new URL(apiBaseUrl);
    return url.origin; // e.g., http://127.0.0.1:8000
  } catch (error) {
    console.error("Error parsing VITE_API_BASE_URL to get origin:", error);
    // Fallback for the default scenario
    if (apiBaseUrl.includes("127.0.0.1:8000/api")) {
        return "http://127.0.0.1:8000";
    }
    // Attempt to remove '/api' if present, as a more general fallback
    if (apiBaseUrl.endsWith('/api')) {
      return apiBaseUrl.slice(0, -4);
    }
    // If VITE_API_BASE_URL is just the domain, or if parsing fails unexpectedly
    return apiBaseUrl.replace(/\/api$/, ''); // Corrected regex
  }
};

// Example helper functions for common methods
export const apiGet = <T = any>(endpoint: string, needsAuth: boolean = true) =>
  apiCall<T>(endpoint, { method: 'GET', needsAuth });

export const apiPost = <T = any>(endpoint: string, body: any, needsAuth: boolean = true, isFormData: boolean = false) =>
  apiCall<T>(endpoint, { method: 'POST', body: isFormData ? body : JSON.stringify(body), needsAuth, isFormData });

export const apiPut = <T = any>(endpoint: string, body: any, needsAuth: boolean = true, isFormData: boolean = false) =>
  apiCall<T>(endpoint, { method: 'PUT', body: isFormData ? body : JSON.stringify(body), needsAuth, isFormData });

export const apiPatch = <T = any>(endpoint: string, body: any, needsAuth: boolean = true, isFormData: boolean = false) =>
  apiCall<T>(endpoint, { method: 'PATCH', body: isFormData ? body : JSON.stringify(body), needsAuth, isFormData });

export const apiDelete = <T = any>(endpoint: string, needsAuth: boolean = true) =>
  apiCall<T>(endpoint, { method: 'DELETE', needsAuth });

export interface UserProfileData {
  dietaryPreferences: string[];
  allergies: string[];
  cookingExpertise: string; // Beginner, Intermediate, Advanced
  cuisinePreferences: string[];
  bio?: string;
  profilePicture?: string; // URL
  kitchenEquipment: string[];
  notifyExpiringIngredients: boolean;
  notifyWeeklyMealPlan: boolean;
  notifyNewRecipes: boolean;
  notifyCookingTips: boolean;
  mealPlanFrequency: string;
}

export interface UserData {
  userId: string;
  username: string;
  email: string;
  profile: UserProfileData;
}

export interface InventoryItemData {
  id: string;
  name: string;
  quantity?: number | null; // Optional for staples, backend expects float
  unit?: string | null; // Optional for staples
  expiryDate?: string | null; // ISO date string (YYYY-MM-DD)
  category?: string; // Frontend-specific for now
  addedDate?: string; // ISO datetime string from backend
  itemType?: 'tracked' | 'staple'; // Type of inventory item
}

export interface RecipeSuggestion {
  id: string;
  title: string;
  description?: string;
  mealType: string[];
  cuisine: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  difficulty?: "easy" | "medium" | "hard"; // Optional - not all recipe sources provide this
  averageRating?: number;
  ratingsCount?: number;
  imageUrl?: string;
  ingredients: { name: string; quantity: string; unit: string }[];
  instructions?: string[];
  kitchenEquipmentNeeded?: string[];
  tags?: string[];
}

// Receipt scanning interfaces
export interface ReceiptItem {
  name: string;
  quantity: number | string;
  unit: string;
  category?: string;
}

export interface ReceiptScanResponse {
  detected_items: ReceiptItem[];
  confidence: 'high' | 'medium' | 'low';
  notes?: string;
  message?: string;
  error?: string;
}

export interface BulkAddResponse {
  created_items: InventoryItemData[];
  success_count: number;
  total_count: number;
  errors?: string[];
  message: string;
}

// Receipt scanning API functions
export const scanReceipt = async (imageFile: File): Promise<ReceiptScanResponse> => {
  const formData = new FormData();
  formData.append('image', imageFile);
  
  return apiPost<ReceiptScanResponse>('/inventory/scan-receipt', formData, true, true);
};

export const bulkAddInventoryItems = async (items: ReceiptItem[]): Promise<BulkAddResponse> => {
  return apiPost<BulkAddResponse>('/inventory/bulk-add', { items });
};

/**
 * SANITIZED API WRAPPERS
 * These functions automatically sanitize responses to prevent XSS attacks
 */

/**
 * Fetch and sanitize a single recipe
 */
export const getSafeRecipe = async (recipeId: string): Promise<RecipeSuggestion> => {
  const recipe = await apiGet<RecipeSuggestion>(`/recipes/${recipeId}`);
  return sanitizeRecipe(recipe);
};

/**
 * Fetch and sanitize recipe search results
 */
export const getSafeRecipes = async (queryString: string): Promise<any> => {
  const response = await apiGet<any>(`/recipes?${queryString}`);
  
  // Sanitize all recipes in the response
  if (response.results && Array.isArray(response.results)) {
    response.results = response.results.map(sanitizeRecipe);
  }
  
  if (response.suggestedForYou && Array.isArray(response.suggestedForYou)) {
    response.suggestedForYou = response.suggestedForYou.map(sanitizeRecipe);
  }
  
  return response;
};

/**
 * Fetch and sanitize user profile
 */
export const getSafeUserProfile = async (): Promise<UserData> => {
  const userData = await apiGet<UserData>('/auth/me');
  
  if (userData.profile) {
    userData.profile = sanitizeUserProfile(userData.profile);
  }
  
  // Sanitize username and email (although these should be safe from backend)
  if (userData.username) {
    userData.username = sanitizeUserProfile({ username: userData.username }).username;
  }
  
  return userData;
};

/**
 * Fetch and sanitize inventory items
 */
export const getSafeInventory = async (): Promise<{ items: InventoryItemData[] }> => {
  const response = await apiGet<{ items: InventoryItemData[] }>('/inventory');
  
  if (response.items && Array.isArray(response.items)) {
    response.items = response.items.map(sanitizeInventoryItem);
  }
  
  return response;
};

/**
 * Add inventory item and sanitize response
 */
export const addSafeInventoryItem = async (item: Partial<InventoryItemData>): Promise<InventoryItemData> => {
  const addedItem = await apiPost<InventoryItemData>('/inventory', item);
  return sanitizeInventoryItem(addedItem);
};

/**
 * Update inventory item and sanitize response
 */
export const updateSafeInventoryItem = async (
  id: string, 
  item: Partial<InventoryItemData>
): Promise<InventoryItemData> => {
  const updatedItem = await apiPut<InventoryItemData>(`/inventory/${id}`, item);
  return sanitizeInventoryItem(updatedItem);
};

/**
 * Toggle inventory item between tracked and staple
 */
export const toggleStapleStatus = async (id: string): Promise<InventoryItemData> => {
  const response = await apiPatch<InventoryItemData>(`/inventory/${id}/toggle-staple`, {});
  return sanitizeInventoryItem(response);
};

/**
 * Get all favorite recipes for the authenticated user
 */
export const getFavoriteRecipes = async (): Promise<{ favorites: Array<{ id: string; recipe: RecipeSuggestion; createdAt: string }> }> => {
  const response = await apiGet<{ favorites: Array<{ id: string; recipe: RecipeSuggestion; createdAt: string }> }>('/recipes/favorites/list');
  
  // Sanitize all recipe data
  if (response.favorites && Array.isArray(response.favorites)) {
    response.favorites = response.favorites.map(fav => ({
      ...fav,
      recipe: sanitizeRecipe(fav.recipe)
    }));
  }
  
  return response;
};

/**
 * Toggle favorite status of a recipe (add or remove from favorites)
 * Handles both local recipes and external recipes from embeddings service
 */
export const toggleRecipeFavorite = async (recipeId: string, recipeData?: RecipeSuggestion): Promise<{ isFavorite: boolean; message: string }> => {
  // For external recipes (from embeddings), send recipe data to cache it
  const payload = recipeData ? { recipe_data: recipeData } : {};
  return await apiPost<{ isFavorite: boolean; message: string }>(`/recipes/${recipeId}/favorite`, payload);
};

/**
 * Check if a recipe is favorited by the authenticated user
 */
export const checkRecipeFavorite = async (recipeId: string): Promise<{ isFavorite: boolean }> => {
  return await apiGet<{ isFavorite: boolean }>(`/recipes/${recipeId}/is-favorite`);
};
