import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { apiCall, apiGet } from '@/lib/api';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

// Mock window.dispatchEvent
const dispatchEventMock = vi.fn();

// Create a test server
const server = setupServer();

describe('API Call 401 Error Handling', () => {
  beforeAll(() => {
    server.listen();
  });

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

    // Mock console methods
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});

    // Reset server handlers
    server.resetHandlers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  afterAll(() => {
    server.close();
  });



  it('should not trigger logout on 401 for non-authenticated endpoints', async () => {
    // Setup server to return 401
    server.use(
      http.post('http://127.0.0.1:8000/api/auth/login', () => {
        return HttpResponse.json(
          { message: 'Invalid credentials' },
          { status: 401 }
        );
      })
    );

    try {
      await apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@test.com', password: 'wrong' }),
        needsAuth: false
      });
      expect.fail('API call should have thrown an error');
    } catch (error: any) {
      expect(error.status).toBe(401);
    }

    // Verify that logout was NOT triggered (since needsAuth was false)
    expect(localStorageMock.removeItem).not.toHaveBeenCalled();
    expect(dispatchEventMock).not.toHaveBeenCalled();
  });

  it('should handle successful API calls without triggering logout', async () => {
    server.use(
      http.get('http://127.0.0.1:8000/api/test-endpoint', () => {
        return HttpResponse.json({ success: true });
      })
    );

    // Create a valid token (not expired)
    const validToken = (() => {
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payload = btoa(JSON.stringify({ 
        user_id: 1, 
        exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
      }));
      const signature = 'mock-signature';
      return `${header}.${payload}.${signature}`;
    })();
    
    localStorageMock.getItem.mockReturnValue(validToken);

    const result = await apiGet('/test-endpoint');

    expect(result).toEqual({ success: true });
    expect(localStorageMock.removeItem).not.toHaveBeenCalled();
    expect(dispatchEventMock).not.toHaveBeenCalled();
  });

  it('should throw error when no valid token for protected routes', async () => {
    localStorageMock.getItem.mockReturnValue(null);

    try {
      await apiGet('/protected-endpoint');
      expect.fail('API call should have thrown an error');
    } catch (error: any) {
      expect(error.status).toBe(401);
      expect(error.data.message).toBe('Authentication required');
    }

    expect(console.warn).toHaveBeenCalledWith(
      'Valid auth token not found for protected route: /protected-endpoint'
    );
  });
});
