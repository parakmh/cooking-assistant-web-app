const getApiBaseUrl = () => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  if (!baseUrl) {
    console.error("VITE_API_BASE_URL is not defined in .env file");
    return "http://127.0.0.1:8000/api"
  }
  return baseUrl;
};

export const getToken = (): string | null => {
  return localStorage.getItem('authToken');
};

export const setToken = (token: string): void => {
  localStorage.setItem('authToken', token);
};

export const removeToken = (): void => {
  localStorage.removeItem('authToken');
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

// Enhanced token getter that checks expiration
export const getValidToken = (): string | null => {
  const token = getToken();
  if (!token) return null;
  
  if (isTokenExpired(token)) {
    console.warn('Token expired, removing from storage');
    removeToken();
    // Trigger global logout
    window.dispatchEvent(new CustomEvent('auth:logout', { 
      detail: { reason: 'token_expired_on_check' } 
    }));
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
    const token = getValidToken(); // Use enhanced token getter
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
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = { message: response.statusText };
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
    
    console.error('API Error:', response.status, errorData);
    throw { status: response.status, data: errorData, response };
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
  quantity: number; // Backend expects float, ensure conversion from string input
  unit: string;
  expiryDate?: string | null; // ISO date string (YYYY-MM-DD)
  category?: string; // Frontend-specific for now
  addedDate?: string; // ISO datetime string from backend
}

export interface RecipeSuggestion {
  id: string;
  name: string;
  description?: string;
  mealType: string[];
  cuisine: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  difficulty: "easy" | "medium" | "hard";
  averageRating?: number;
  ratingsCount?: number;
  imageUrl?: string;
  ingredients: { name: string; quantity: string; unit: string }[];
  instructions?: string[];
  kitchenEquipmentNeeded?: string[];
  tags?: string[];
}

export interface RecipeSuggestionsResponse {
  suggestions: RecipeSuggestion[];
  message?: string; // Optional message from backend
  userId?: string;  // Optional userId if backend includes it
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
