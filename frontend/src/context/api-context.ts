import { createContext, useContext } from 'react'
import type { CurrentUser } from '../api/auth.ts'
import type { HttpClient } from '../api/http.ts'

export type AuthState = {
  isAuthenticated: boolean
  isCheckingSession: boolean
  user: CurrentUser | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

export type APIContextValue = {
  auth: AuthState
  fetchWithAuth: HttpClient
}

export class AuthError extends Error {
  constructor() {
    super('Usuário não autenticado')
    this.name = 'AuthError'
  }
}

export const APIContext =
  createContext<APIContextValue | null>(null)

export function useAPI(): APIContextValue {
  const context = useContext(APIContext)

  if (!context) {
    throw new Error(
      'useAPI deve ser usado dentro de APIProvider',
    )
  }

  return context
}