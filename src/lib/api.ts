const getApiBaseUrl = () => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  if (!baseUrl) {
    console.error("VITE_API_BASE_URL is not defined in .env file");
    return "http://127.0.0.1:5000/api"; // Fallback, though it should be set
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
    const token = getToken();
    if (token) {
      headers.append('Authorization', `Bearer ${token}`);
    } else {
      // Handle cases where auth is needed but token is not available
      // For now, let it proceed, backend will return 401
      console.warn(`Auth token not found for protected route: ${endpoint}`);
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
    // You might want to customize error handling, e.g., redirect on 401
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
