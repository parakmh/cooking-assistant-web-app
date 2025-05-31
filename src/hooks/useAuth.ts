import { useState, useEffect, useCallback } from 'react';
import { getToken, removeToken, setToken as storeToken } from '../lib/api';

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
    const token = getToken();
    if (token) {
      // Here you might want to validate the token with the backend
      // For now, we'll assume if a token exists, it's valid
      setAuthState({ isAuthenticated: true, isLoading: false });
    } else {
      setAuthState({ isAuthenticated: false, isLoading: false });
    }
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
