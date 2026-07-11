import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { loginRequest, refreshAccessTokenRequest } from '../api/auth.ts'
import type { HttpClient } from '../api/http.ts'
import { APIContext, AuthError, type APIContextValue } from './api-context.ts'

const ACCESS_TOKEN_KEY = 'accessToken'
const REFRESH_TOKEN_KEY = 'refreshToken'

type APIProviderProps = {
  children: ReactNode
}

function withAuthorization(token: string, init?: RequestInit): Headers {
  const headers = new Headers(init?.headers)
  headers.set('Authorization', `Bearer ${token}`)

  if (init?.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  return headers
}

export function APIProvider({ children }: APIProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(() =>
    Boolean(localStorage.getItem(ACCESS_TOKEN_KEY)),
  )

  const logout = useCallback(() => {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    setIsAuthenticated(false)
  }, [])

  const login = useCallback(async (username: string, password: string): Promise<void> => {
    const tokens = await loginRequest(username, password)

    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access)
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh)
    setIsAuthenticated(true)
  }, [])

  const fetchWithAuth = useCallback<HttpClient>(
    async (input, init) => {
      const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY)

      if (!accessToken) {
        throw new AuthError()
      }

      const response = await fetch(input, {
        ...init,
        headers: withAuthorization(accessToken, init),
      })

      if (response.status !== 401) {
        return response
      }

      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)

      if (!refreshToken) {
        logout()
        throw new AuthError()
      }

      try {
        const newAccessToken = await refreshAccessTokenRequest(refreshToken)

        localStorage.setItem(ACCESS_TOKEN_KEY, newAccessToken)

        return await fetch(input, {
          ...init,
          headers: withAuthorization(newAccessToken, init),
        })
      } catch {
        logout()
        throw new AuthError()
      }
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
    [fetchWithAuth, isAuthenticated, login, logout],
  )

  return <APIContext.Provider value={value}>{children}</APIContext.Provider>
}
