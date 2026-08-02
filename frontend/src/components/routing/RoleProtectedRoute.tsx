import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.ts'

type RoleProtectedRouteProps = {
  children: ReactNode
  allowedGroups: readonly string[]
}

export default function RoleProtectedRoute({children, allowedGroups}: RoleProtectedRouteProps) {
  const { isAuthenticated, isCheckingSession, user } = useAuth()

  if (isCheckingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <p className="text-sm text-neutral-600">
          Verificando acesso...
        </p>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  const belongsToAllowedGroup =
    user.groups.some((group) =>
      allowedGroups.includes(group),
    )

  const hasAccess =
    user.is_superuser || belongsToAllowedGroup

  if (!hasAccess) {
    return <Navigate to="/" replace />
  }

  return children
}