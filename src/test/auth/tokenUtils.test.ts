import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  getToken, 
  setToken, 
  removeToken, 
  isTokenExpired, 
  getValidToken 
} from '@/lib/api';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

// Mock window.dispatchEvent
const dispatchEventMock = vi.fn();

// Helper to create a JWT token with custom expiration
const createMockToken = (expiresInSeconds: number) => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({ 
    user_id: 1, 
    exp: Math.floor(Date.now() / 1000) + expiresInSeconds 
  }));
  const signature = 'mock-signature';
  return `${header}.${payload}.${signature}`;
};

describe('Authentication Token Utilities', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
    
    // Mock window.dispatchEvent
    Object.defineProperty(window, 'dispatchEvent', {
      value: dispatchEventMock,
      writable: true,
    });

    // Mock console methods to avoid noise in tests
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getToken', () => {
    it('should return token from localStorage', () => {
      const mockToken = 'mock-token';
      localStorageMock.getItem.mockReturnValue(mockToken);

      const result = getToken();

      expect(localStorageMock.getItem).toHaveBeenCalledWith('authToken');
      expect(result).toBe(mockToken);
    });

    it('should return null when no token exists', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = getToken();

      expect(result).toBeNull();
    });
  });

  describe('setToken', () => {
    it('should store token in localStorage', () => {
      const mockToken = 'mock-token';

      setToken(mockToken);

      expect(localStorageMock.setItem).toHaveBeenCalledWith('authToken', mockToken);
    });
  });

  describe('removeToken', () => {
    it('should remove token from localStorage', () => {
      removeToken();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('authToken');
    });
  });

  describe('isTokenExpired', () => {
    it('should return false for valid token', () => {
      const validToken = createMockToken(3600); // 1 hour from now

      const result = isTokenExpired(validToken);

      expect(result).toBe(false);
    });

    it('should return true for expired token', () => {
      const expiredToken = createMockToken(-3600); // 1 hour ago

      const result = isTokenExpired(expiredToken);

      expect(result).toBe(true);
    });

    it('should return true for malformed token', () => {
      const malformedToken = 'invalid.token';

      const result = isTokenExpired(malformedToken);

      expect(result).toBe(true);
      expect(console.error).toHaveBeenCalled();
    });

    it('should return true for token with invalid payload', () => {
      const invalidPayloadToken = 'header.invalid-base64.signature';

      const result = isTokenExpired(invalidPayloadToken);

      expect(result).toBe(true);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('getValidToken', () => {
    it('should return token when valid', () => {
      const validToken = createMockToken(3600);
      localStorageMock.getItem.mockReturnValue(validToken);

      const result = getValidToken();

      expect(result).toBe(validToken);
      expect(dispatchEventMock).not.toHaveBeenCalled();
    });

    it('should return null when no token exists', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = getValidToken();

      expect(result).toBeNull();
      expect(dispatchEventMock).not.toHaveBeenCalled();
    });

    it('should remove expired token and trigger logout event', () => {
      const expiredToken = createMockToken(-3600);
      localStorageMock.getItem.mockReturnValue(expiredToken);

      const result = getValidToken();

      expect(result).toBeNull();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('authToken');
      expect(dispatchEventMock).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'auth:logout',
          detail: { reason: 'token_expired_on_check' }
        })
      );
      expect(console.warn).toHaveBeenCalledWith('Token expired, removing from storage');
    });

    it('should handle malformed token gracefully', () => {
      const malformedToken = 'invalid-token';
      localStorageMock.getItem.mockReturnValue(malformedToken);

      const result = getValidToken();

      expect(result).toBeNull();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('authToken');
      expect(dispatchEventMock).toHaveBeenCalled();
    });
  });
});
