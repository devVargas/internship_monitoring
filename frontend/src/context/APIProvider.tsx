import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { loginRequest } from '../api/auth.ts'

type AuthState = {
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

export class AuthError extends Error {
  constructor() {
    super('Not authenticated')
    this.name = 'AuthError'
  }
}

type APIContextValue = {
  auth: AuthState
  fetchWithAuth: (input: RequestInfo, init?: RequestInit) => Promise<Response>
}

const APIContext = createContext<APIContextValue | null>(null)

export function useAPI() {
  const context = useContext(APIContext)
  if (!context) {
    throw new Error('useAPI must be used within APIProvider')
  }
  return context
}

export function APIProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!localStorage.getItem('accessToken'),
  )

  const login = useCallback(async (username: string, password: string) => {
    const data = await loginRequest(username, password)
    localStorage.setItem('accessToken', data.access)
    localStorage.setItem('refreshToken', data.refresh)
    setIsAuthenticated(true)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    setIsAuthenticated(false)
  }, [])

  const fetchWithAuth = useCallback(
    async (input: RequestInfo, init?: RequestInit) => {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        throw new AuthError()
      }

      const headers = new Headers(init?.headers)
      headers.set('Authorization', `Bearer ${token}`)
      if (!headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json')
      }

      const response = await fetch(input, { ...init, headers })

      if (response.status === 401) {
        logout()
        throw new AuthError()
      }

      return response
    },
    [logout],
  )

  const value = useMemo<APIContextValue>(
    () => ({
      auth: {
        isAuthenticated,
        login,
        logout,
      },
      fetchWithAuth,
    }),
    [isAuthenticated, login, logout, fetchWithAuth],
  )

  return <APIContext.Provider value={value}>{children}</APIContext.Provider>
}
