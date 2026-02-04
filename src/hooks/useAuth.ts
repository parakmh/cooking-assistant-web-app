import { useState, useEffect, useCallback } from 'react';
import { getToken, getValidTokenSync, removeToken, setToken as storeToken, setRefreshToken } from '../lib/api';

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
    // Use synchronous check on mount (async refresh happens in API calls)
    const token = getValidTokenSync();
    if (token) {
      setAuthState({ isAuthenticated: true, isLoading: false });
    } else {
      setAuthState({ isAuthenticated: false, isLoading: false });
    }

    // Set up periodic token refresh check (every 2 minutes)
    const refreshInterval = setInterval(async () => {
      const currentToken = getToken();
      if (currentToken) {
        const { getValidToken } = await import('../lib/api');
        await getValidToken(); // This will auto-refresh if needed
      }
    }, 2 * 60 * 1000); // 2 minutes

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
      clearInterval(refreshInterval);
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
  const loginWithToken = useCallback((accessToken: string, refreshToken?: string) => {
    storeToken(accessToken);
    if (refreshToken) {
      setRefreshToken(refreshToken);
    }
    setAuthState({ isAuthenticated: true, isLoading: false });
  }, []);


  return { ...authState, login, logout, loginWithToken };
};
