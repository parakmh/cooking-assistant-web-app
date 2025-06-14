import { describe, it, expect, vi, beforeAll, afterEach, afterAll } from 'vitest'
import userEvent from '@testing-library/user-event'
import { screen, waitFor } from '@testing-library/react'
import RegistrationPage from '@/pages/RegistrationPage'
import { renderWithProviders } from '../utils'
import { server } from '../mocks/server'
import { http, HttpResponse } from 'msw'

// Mock navigate to test redirection
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

describe('RegistrationPage', () => {
  beforeAll(() => server.listen())
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())

  it('renders all form fields and submit button', () => {
    renderWithProviders(<RegistrationPage />)
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument()
  })

  it('shows error if passwords do not match', async () => {
    renderWithProviders(<RegistrationPage />)
    await userEvent.type(screen.getByLabelText(/username/i), 'testuser')
    await userEvent.type(screen.getByLabelText(/^email$/i), 'test@example.com')
    await userEvent.type(screen.getByLabelText(/^password$/i), 'password123')
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'different')
    await userEvent.click(screen.getByRole('button', { name: /register/i }))
    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument()
  })

  it('shows error on failed registration', async () => {
    server.use(
      http.post('http://127.0.0.1:8000/api/auth/register', () =>
        HttpResponse.json({ message: 'Email already exists' }, { status: 400 })
      )
    )
    renderWithProviders(<RegistrationPage />)
    await userEvent.type(screen.getByLabelText(/username/i), 'testuser')
    await userEvent.type(screen.getByLabelText(/^email$/i), 'test@example.com')
    await userEvent.type(screen.getByLabelText(/^password$/i), 'password123')
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'password123')
    await userEvent.click(screen.getByRole('button', { name: /register/i }))
    expect(await screen.findByText(/email already exists/i)).toBeInTheDocument()
  })

  it('shows success message on successful registration', async () => {
    renderWithProviders(<RegistrationPage />)
    await userEvent.type(screen.getByLabelText(/username/i), 'testuser')
    await userEvent.type(screen.getByLabelText(/^email$/i), 'test@example.com')
    await userEvent.type(screen.getByLabelText(/^password$/i), 'password123')
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'password123')
    await userEvent.click(screen.getByRole('button', { name: /register/i }))
    expect(await screen.findByText(/registration successful/i)).toBeInTheDocument()
  })
})
