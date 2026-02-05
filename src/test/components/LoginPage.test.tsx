import { describe, it, expect, vi, beforeAll, afterEach, afterAll } from 'vitest'
import userEvent from '@testing-library/user-event'
import { screen, waitFor } from '@testing-library/react'
import LoginPage from '@/pages/LoginPage'
import { renderWithProviders } from '../utils'
import { server } from '../mocks/server'
import { http, HttpResponse } from 'msw'

describe('LoginPage', () => {
  beforeAll(() => server.listen())
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())

  it('renders form fields and submit button', () => {
    renderWithProviders(<LoginPage />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument()
  })

  it('shows error on failed login', async () => {
    // override the login handler to return 401
    server.use(
      http.post('http://127.0.0.1:8000/api/auth/login', () =>
        HttpResponse.json({ error: 'Bad credentials' }, { status: 401 })
      )
    )
    renderWithProviders(<LoginPage />)
    await userEvent.type(screen.getByLabelText(/email/i), 'foo@example.com')
    await userEvent.type(screen.getByLabelText(/password/i), 'wrongpassword')
    await userEvent.click(screen.getByRole('button', { name: /login/i }))

    await waitFor(() =>
      expect(screen.getByText(/bad credentials/i)).toBeInTheDocument()
    )
  })

  it('redirects on successful login', async () => {
    // the default mock returns a 200 with a token
    renderWithProviders(<LoginPage />)
    await userEvent.type(screen.getByLabelText(/email/i), 'foo@example.com')
    await userEvent.type(screen.getByLabelText(/password/i), 'correctpassword')
    await userEvent.click(screen.getByRole('button', { name: /login/i }))

    // since AuthProvider + react-router are in the wrapper,
    // you’d assert that the URL changed or that a Profile element appears
    // e.g. waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/profile'))
  })
})