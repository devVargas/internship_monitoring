import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  getCurrentUserRequest,
  loginRequest,
  refreshAccessTokenRequest,
  type CurrentUser,
} from '../api/auth.ts'
import type { HttpClient } from '../api/http.ts'
import {
  APIContext,
  AuthError,
  type APIContextValue,
} from './api-context.ts'

const ACCESS_TOKEN_KEY = 'accessToken'
const REFRESH_TOKEN_KEY = 'refreshToken'

type APIProviderProps = {
  children: ReactNode
}

function clearStoredTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

function withAuthorization(
  token: string,
  init?: RequestInit,
): Headers {
  const headers = new Headers(init?.headers)

  headers.set('Authorization', `Bearer ${token}`)

  if (
    init?.body &&
    !headers.has('Content-Type') &&
    !(init.body instanceof FormData)
  ) {
    headers.set('Content-Type', 'application/json')
  }

  return headers
}

export function APIProvider({children}: APIProviderProps) {
  const [user, setUser] =
    useState<CurrentUser | null>(null)

  const [isCheckingSession, setIsCheckingSession] =
    useState(true)

  const refreshPromiseRef =
    useRef<Promise<string> | null>(null)

  const restoreSessionPromiseRef =
    useRef<Promise<CurrentUser | null> | null>(null)

  const logout = useCallback(() => {
    clearStoredTokens()
    setUser(null)
  }, [])

  const renewAccessToken =
    useCallback(async (): Promise<string> => {
      if (refreshPromiseRef.current) {
        return refreshPromiseRef.current
      }

      const refreshToken =
        localStorage.getItem(REFRESH_TOKEN_KEY)

      if (!refreshToken) {
        throw new AuthError()
      }

      const refreshPromise =
        refreshAccessTokenRequest(refreshToken)
          .then((newAccessToken) => {
            localStorage.setItem(
              ACCESS_TOKEN_KEY,
              newAccessToken,
            )

            return newAccessToken
          })
          .finally(() => {
            refreshPromiseRef.current = null
          })

      refreshPromiseRef.current = refreshPromise

      return refreshPromise
    }, [])

  const fetchWithAuth = useCallback<HttpClient>(
    async (input, init) => {
      let accessToken =
        localStorage.getItem(ACCESS_TOKEN_KEY)

      if (!accessToken) {
        try {
          accessToken = await renewAccessToken()
        } catch {
          logout()
          throw new AuthError()
        }
      }

      let response = await fetch(input, {
        ...init,
        headers: withAuthorization(accessToken, init),
      })

      if (response.status !== 401) {
        return response
      }

      try {
        accessToken = await renewAccessToken()

        response = await fetch(input, {
          ...init,
          headers: withAuthorization(accessToken, init),
        })

        if (response.status === 401) {
          logout()
          throw new AuthError()
        }

        return response
      } catch (error) {
        logout()

        if (error instanceof AuthError) {
          throw error
        }

        throw new AuthError()
      }
    },
    [logout, renewAccessToken],
  )

  const login = useCallback(
    async (
      username: string,
      password: string,
    ): Promise<void> => {
      const tokens = await loginRequest(
        username,
        password,
      )

      localStorage.setItem(
        ACCESS_TOKEN_KEY,
        tokens.access,
      )

      localStorage.setItem(
        REFRESH_TOKEN_KEY,
        tokens.refresh,
      )

      try {
        const currentUser =
          await getCurrentUserRequest(fetchWithAuth)

        setUser(currentUser)
      } catch (error) {
        clearStoredTokens()
        setUser(null)
        throw error
      }
    },
    [fetchWithAuth],
  )

  const restoreSession =
    useCallback(async (): Promise<CurrentUser | null> => {
      const accessToken =
        localStorage.getItem(ACCESS_TOKEN_KEY)

      const refreshToken =
        localStorage.getItem(REFRESH_TOKEN_KEY)

      if (!accessToken && !refreshToken) {
        return null
      }

      try {
        return await getCurrentUserRequest(
          fetchWithAuth,
        )
      } catch {
        clearStoredTokens()
        return null
      }
    }, [fetchWithAuth])

  useEffect(() => {
    let active = true

    if (!restoreSessionPromiseRef.current) {
      restoreSessionPromiseRef.current =
        restoreSession()
    }

    void restoreSessionPromiseRef.current
      .then((currentUser) => {
        if (active) {
          setUser(currentUser)
        }
      })
      .finally(() => {
        if (active) {
          setIsCheckingSession(false)
        }
      })

    return () => {
      active = false
    }
  }, [restoreSession])

  const value = useMemo<APIContextValue>(
    () => ({
      auth: {
        isAuthenticated: user !== null,
        isCheckingSession,
        user,
        login,
        logout,
      },
      fetchWithAuth,
    }),
    [
      fetchWithAuth,
      isCheckingSession,
      login,
      logout,
      user,
    ],
  )

  return (
    <APIContext.Provider value={value}>
      {isCheckingSession ? (
        <div className="flex min-h-screen items-center justify-center bg-neutral-50">
          <p className="text-sm text-neutral-600">
            Verificando sessão...
          </p>
        </div>
      ) : (
        children
      )}
    </APIContext.Provider>
  )
}