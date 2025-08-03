import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { apiGet, isTokenExpired, getValidToken } from '@/lib/api';

// Create a test server
const server = setupServer();

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

// Helper to create an expired JWT token
const createExpiredToken = () => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({ 
    user_id: 1, 
    exp: Math.floor(Date.now() / 1000) - 3600 // 1 hour ago
  }));
  const signature = 'mock-signature';
  return `${header}.${payload}.${signature}`;
};

// Helper to create a valid JWT token
const createValidToken = () => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({ 
    user_id: 1, 
    exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
  }));
  const signature = 'mock-signature';
  return `${header}.${payload}.${signature}`;
};

describe('Session Expiration Integration Tests', () => {
  beforeAll(() => {
    server.listen();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    // Mock console methods
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});

    server.resetHandlers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  afterAll(() => {
    server.close();
  });

  it('should detect expired tokens correctly', () => {
    const expiredToken = createExpiredToken();
    const validToken = createValidToken();

    expect(isTokenExpired(expiredToken)).toBe(true);
    expect(isTokenExpired(validToken)).toBe(false);
  });



  it('should handle successful API calls with valid tokens', async () => {
    const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent');
    
    // Setup server to return success
    server.use(
      http.get('http://127.0.0.1:8000/api/test-endpoint', () => {
        return HttpResponse.json({ success: true });
      })
    );

    const validToken = createValidToken();
    localStorageMock.getItem.mockReturnValue(validToken);

    const result = await apiGet('/test-endpoint');

    expect(result).toEqual({ success: true });
    expect(dispatchEventSpy).not.toHaveBeenCalled();
    expect(localStorageMock.removeItem).not.toHaveBeenCalled();
  });
});
