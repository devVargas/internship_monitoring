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

type APIContextValue = {
  auth: AuthState
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

  const value = useMemo<APIContextValue>(
    () => ({
      auth: {
        isAuthenticated,
        login,
        logout,
      },
    }),
    [isAuthenticated, login, logout],
  )

  return <APIContext.Provider value={value}>{children}</APIContext.Provider>
}
