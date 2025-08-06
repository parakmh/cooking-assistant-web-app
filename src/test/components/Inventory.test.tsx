import { describe, it, expect, vi, beforeAll, afterEach, afterAll, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import { screen, waitFor } from '@testing-library/react'
import Inventory from '@/pages/Inventory'
import { renderWithProviders } from '../utils'
import { server } from '../mocks/server'
import { http, HttpResponse } from 'msw'

// Helper to create a valid JWT token for testing
const createValidToken = () => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({ 
    user_id: 1, 
    exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
  }));
  const signature = 'mock-signature';
  return `${header}.${payload}.${signature}`;
};

describe('Inventory Page', () => {
  beforeAll(() => server.listen())
  
  beforeEach(() => {
    // Mock localStorage with a valid auth token for each test
    const mockToken = createValidToken();
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn().mockReturnValue(mockToken),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      },
      writable: true,
    });
  });

  afterEach(() => {
    server.resetHandlers();
    vi.restoreAllMocks();
  });

  afterAll(() => server.close())

  it('renders inventory page and items', async () => {
    renderWithProviders(<Inventory />)
    expect(await screen.findByText(/tomatoes/i)).toBeInTheDocument()
    expect(screen.getByText(/milk/i)).toBeInTheDocument()
    expect(screen.getByText(/chicken breast/i)).toBeInTheDocument()
  })

  it('shows empty state when no items', async () => {
    server.use(
      http.get('http://127.0.0.1:8000/api/inventory', () =>
        HttpResponse.json({ items: [] })
      )
    )
    renderWithProviders(<Inventory />)
    expect(await screen.findByText(/your inventory is empty/i)).toBeInTheDocument()
  })

  it('allows searching inventory items', async () => {
    renderWithProviders(<Inventory />)
    await screen.findByText(/tomatoes/i)
    const searchInput = screen.getByPlaceholderText(/search ingredients/i)
    await userEvent.type(searchInput, 'milk')
    expect(screen.getByText(/milk/i)).toBeInTheDocument()
    expect(screen.queryByText(/tomatoes/i)).not.toBeInTheDocument()
  })

  it('opens add ingredient dialog', async () => {
    renderWithProviders(<Inventory />)
    await screen.findByText(/add ingredient/i)
    const addButton = screen.getByText(/add ingredient/i)
    await userEvent.click(addButton)
    expect(screen.getByText(/add new ingredient/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/quantity/i)).toBeInTheDocument()
  })

  it.skip('shows error on API failure', async () => {
    server.use(
      http.get('http://127.0.0.1:8000/api/inventory', () =>
        HttpResponse.json({ message: 'Server error' }, { status: 500 })
      )
    )
    renderWithProviders(<Inventory />)
    // Check for the toast title (robust to portals)
    expect(
      await screen.findByText(
        (content) => /error fetching inventory/i.test(content),
        { exact: false }
      )
    ).toBeInTheDocument()
    // Optionally, also check for the error description
    expect(
      await screen.findByText(
        (content) => /server error/i.test(content),
        { exact: false }
      )
    ).toBeInTheDocument()
  })
})
