import { useEffect, useState, type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { getCurrentUserRequest } from '../../api/auth.ts'
import { useAPI } from '../../context/api-context.ts'
import { useAuth } from '../../hooks/useAuth.ts'

const ALLOWED_GROUPS = ['Teacher', 'Supervisor', 'Coordinator']

type StaffRouteProps = {
  children: ReactNode
}

export default function StaffRoute({ children }: StaffRouteProps) {
  const { isAuthenticated } = useAuth()
  const { fetchWithAuth } = useAPI()
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      return undefined
    }

    let isCancelled = false

    async function checkAccess(): Promise<void> {
      try {
        const user = await getCurrentUserRequest(fetchWithAuth)
        const belongsToAllowedGroup = user.groups.some((group) => ALLOWED_GROUPS.includes(group))

        if (!isCancelled) {
          setHasAccess(user.is_superuser || belongsToAllowedGroup)
        }
      } catch {
        if (!isCancelled) {
          setHasAccess(false)
        }
      }
    }

    void checkAccess()

    return () => {
      isCancelled = true
    }
  }, [fetchWithAuth, isAuthenticated])

  if (!isAuthenticated || hasAccess === false) {
    return <Navigate to="/login" replace />
  }

  if (hasAccess === null) {
    return (
      <div className="flex min-h-screen items-center justify-center text-neutral-600">
        Verificando acesso...
      </div>
    )
  }

  return children
}
