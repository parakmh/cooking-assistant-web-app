import { useState, useEffect, useCallback } from 'react';
import { getToken, getValidToken, removeToken, setToken as storeToken } from '../lib/api';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  // user: UserData | null; // We can add user data here later if needed
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    // user: null,
  });

  useEffect(() => {
    // Use getValidToken which checks expiration and automatically cleans up expired tokens
    const token = getValidToken();
    if (token) {
      setAuthState({ isAuthenticated: true, isLoading: false });
    } else {
      setAuthState({ isAuthenticated: false, isLoading: false });
    }

    // Listen for global logout events (e.g., from expired tokens in API calls)
    const handleGlobalLogout = (event: CustomEvent) => {
      console.log('Global logout triggered:', event.detail?.reason || 'unknown');
      setAuthState({ isAuthenticated: false, isLoading: false });
      
      // Redirect to landing page immediately
      if (window.location.pathname !== '/' && window.location.pathname !== '/login') {
        window.location.href = '/';
      }
    };

    window.addEventListener('auth:logout', handleGlobalLogout as EventListener);
    
    return () => {
      window.removeEventListener('auth:logout', handleGlobalLogout as EventListener);
    };
  }, []);

  const login = useCallback(() => {
    // The token is set by LoginPage, here we just update the auth state
    setAuthState({ isAuthenticated: true, isLoading: false });
     // Potentially fetch user data here and set it
  }, []);

  const logout = useCallback(() => {
    removeToken();
    setAuthState({ isAuthenticated: false, isLoading: false });
    // Navigate to login or home page can be handled in the component calling logout
  }, []);
  
  // This can be used if login itself returns the token
  const loginWithToken = useCallback((token: string) => {
    storeToken(token);
    setAuthState({ isAuthenticated: true, isLoading: false });
  }, []);


  return { ...authState, login, logout, loginWithToken };
};
