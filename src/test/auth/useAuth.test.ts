import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuth } from '@/hooks/useAuth';

// Mock the api module
vi.mock('@/lib/api', () => ({
  getToken: vi.fn(),
  getValidToken: vi.fn(),
  getValidTokenSync: vi.fn(),
  removeToken: vi.fn(),
  setToken: vi.fn(),
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

// Mock window methods
const addEventListenerMock = vi.fn();
const removeEventListenerMock = vi.fn();

// Import mocked functions
import { getToken, getValidToken, getValidTokenSync, removeToken, setToken } from '@/lib/api';

describe('useAuth Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    // Mock window event listeners
    Object.defineProperty(window, 'addEventListener', {
      value: addEventListenerMock,
      writable: true,
    });
    
    Object.defineProperty(window, 'removeEventListener', {
      value: removeEventListenerMock,
      writable: true,
    });

    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/profile',
        href: '',
      },
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });



  it('should set authenticated when token exists', async () => {
    vi.mocked(getValidTokenSync).mockReturnValue('mock-token');

    const { result } = renderHook(() => useAuth());

    // Wait for useEffect to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  it('should set unauthenticated when no token exists', async () => {
    vi.mocked(getValidTokenSync).mockReturnValue(null);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it('should register global logout event listener', () => {
    vi.mocked(getValidTokenSync).mockReturnValue('mock-token');

    renderHook(() => useAuth());

    expect(addEventListenerMock).toHaveBeenCalledWith(
      'auth:logout',
      expect.any(Function)
    );
  });

  it('should handle global logout event', async () => {
    vi.mocked(getValidTokenSync).mockReturnValue('mock-token');

    const { result } = renderHook(() => useAuth());

    // Wait for initial auth state
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.isAuthenticated).toBe(true);

    // Simulate global logout event
    const logoutEvent = new CustomEvent('auth:logout', {
      detail: { reason: 'token_expired' }
    });

    // Get the event handler that was registered
    const eventHandler = addEventListenerMock.mock.calls.find(
      call => call[0] === 'auth:logout'
    )?.[1];

    expect(eventHandler).toBeDefined();

    // Trigger the event handler
    await act(async () => {
      eventHandler(logoutEvent);
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it('should redirect to home on logout when not on home/login page', async () => {
    vi.mocked(getValidTokenSync).mockReturnValue('mock-token');
    
    // Mock being on a protected page
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/profile',
        href: '',
      },
      writable: true,
    });

    renderHook(() => useAuth());

    // Get the event handler
    const eventHandler = addEventListenerMock.mock.calls.find(
      call => call[0] === 'auth:logout'
    )?.[1];

    const logoutEvent = new CustomEvent('auth:logout', {
      detail: { reason: 'token_expired' }
    });

    await act(async () => {
      eventHandler(logoutEvent);
    });

    expect(window.location.href).toBe('/');
  });

  it('should not redirect when already on home or login page', async () => {
    vi.mocked(getValidTokenSync).mockReturnValue('mock-token');
    
    // Mock being on home page
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/',
        href: '',
      },
      writable: true,
    });

    renderHook(() => useAuth());

    const eventHandler = addEventListenerMock.mock.calls.find(
      call => call[0] === 'auth:logout'
    )?.[1];

    const logoutEvent = new CustomEvent('auth:logout', {
      detail: { reason: 'token_expired' }
    });

    const originalHref = window.location.href;

    await act(async () => {
      eventHandler(logoutEvent);
    });

    expect(window.location.href).toBe(originalHref);
  });

  it('should provide login function', async () => {
    vi.mocked(getValidTokenSync).mockReturnValue(null);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      result.current.login();
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  it('should provide logout function', async () => {
    vi.mocked(getValidTokenSync).mockReturnValue('mock-token');

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.isAuthenticated).toBe(true);

    await act(async () => {
      result.current.logout();
    });

    expect(removeToken).toHaveBeenCalled();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it('should provide loginWithToken function', async () => {
    vi.mocked(getValidTokenSync).mockReturnValue(null);

    const { result } = renderHook(() => useAuth());

    const mockToken = 'new-mock-token';

    await act(async () => {
      result.current.loginWithToken(mockToken);
    });

    expect(setToken).toHaveBeenCalledWith(mockToken);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  it('should cleanup event listener on unmount', () => {
    vi.mocked(getValidTokenSync).mockReturnValue('mock-token');

    const { unmount } = renderHook(() => useAuth());

    unmount();

    expect(removeEventListenerMock).toHaveBeenCalledWith(
      'auth:logout',
      expect.any(Function)
    );
  });
});
