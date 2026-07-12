import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { getCurrentUserRequest } from '../../api/auth.ts'
import { useAPI } from '../../context/api-context.ts'
import { useAuth } from '../../hooks/useAuth.ts'

type RoleProtectedRouteProps = {
  children: ReactNode
  allowedGroups: readonly string[]
}

export default function RoleProtectedRoute({
  children,
  allowedGroups,
}: RoleProtectedRouteProps) {
  const { isAuthenticated } = useAuth()
  const { fetchWithAuth } = useAPI()
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      return
    }

    let cancelled = false

    async function checkAccess() {
      try {
        const user = await getCurrentUserRequest(fetchWithAuth)
        const belongsToAllowedGroup = user.groups.some((group) =>
          allowedGroups.includes(group),
        )

        if (!cancelled) {
          setHasAccess(user.is_superuser || belongsToAllowedGroup)
        }
      } catch {
        if (!cancelled) {
          setHasAccess(false)
        }
      }
    }

    void checkAccess()

    return () => {
      cancelled = true
    }
  }, [allowedGroups, fetchWithAuth, isAuthenticated])

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (hasAccess === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <p className="text-sm text-neutral-600">Verificando acesso...</p>
      </div>
    )
  }

  if (!hasAccess) {
    return <Navigate to="/" replace />
  }

  return children
}
