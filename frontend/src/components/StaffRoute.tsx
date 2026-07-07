import { Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { useAuth } from '../hooks/useAuth.ts'
import { useAPI } from '../context/APIProvider.tsx'

const ALLOWED_GROUPS = ['Teacher', 'Supervisor', 'Coordinator']

export default function StaffRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  const { fetchWithAuth } = useAPI()
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)

  useEffect(() => {
    let cancelled = false

    async function checkAccess() {
      try {
        const response = await fetchWithAuth('/api/auth/me/')
        const data = await response.json()
        const groups: string[] = data.groups ?? []
        if (!cancelled) setHasAccess(groups.some((g) => ALLOWED_GROUPS.includes(g)))
      } catch {
        if (!cancelled) setHasAccess(false)
      }
    }

    checkAccess()
    return () => { cancelled = true }
  }, [fetchWithAuth])

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (hasAccess === null) {
    return null
  }

  if (!hasAccess) {
    return <Navigate to="/login" replace />
  }

  return children
}
