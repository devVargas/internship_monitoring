import { Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { useAuth } from '../hooks/useAuth.ts'
import { useAPI } from '../context/APIProvider.tsx'

export default function StaffRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  const { fetchWithAuth } = useAPI()
  const [isStaff, setIsStaff] = useState<boolean | null>(null)

  useEffect(() => {
    let cancelled = false

    async function checkStaff() {
      try {
        const response = await fetchWithAuth('/api/auth/me/')
        const data = await response.json()
        if (!cancelled) setIsStaff(data.is_staff === true)
      } catch {
        if (!cancelled) setIsStaff(false)
      }
    }

    checkStaff()
    return () => { cancelled = true }
  }, [fetchWithAuth])

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (isStaff === null) {
    return null
  }

  if (!isStaff) {
    return <Navigate to="/login" replace />
  }

  return children
}
