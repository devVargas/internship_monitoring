import { useEffect, useState, type ChangeEvent } from 'react'
import type { AcademicUserType, CurrentUser } from '../api/auth.ts'
import { getCurrentUserRequest } from '../api/auth.ts'
import AcademicUserForm from '../components/forms/AcademicUserForm.tsx'
import DashboardLayout from '../components/layout/DashboardLayout.tsx'
import { useAPI } from '../context/api-context.ts'
import { getErrorMessage } from '../utils/errors.ts'

export default function RegisterAcademicUserPage() {
  const { fetchWithAuth } = useAPI()
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [userType, setUserType] = useState<AcademicUserType>('professor')
  const [isLoadingUser, setIsLoadingUser] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadCurrentUser() {
      try {
        const user = await getCurrentUserRequest(fetchWithAuth)

        if (!cancelled) {
          setCurrentUser(user)
        }
      } catch (requestError) {
        if (!cancelled) {
          setLoadError(
            getErrorMessage(requestError, 'Não foi possível carregar suas permissões'),
          )
        }
      } finally {
        if (!cancelled) {
          setIsLoadingUser(false)
        }
      }
    }

    void loadCurrentUser()

    return () => {
      cancelled = true
    }
  }, [fetchWithAuth])

  function handleUserTypeChange(event: ChangeEvent<HTMLSelectElement>) {
    const selectedType = event.target.value

    if (selectedType === 'professor' || selectedType === 'coordinator') {
      setUserType(selectedType)
    }
  }

  const canCreateCoordinator = Boolean(
    currentUser?.is_superuser || currentUser?.groups.includes('Coordinator'),
  )

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl">
        <header className="mb-6">
          <p className="text-sm font-semibold text-green-800">Gestão acadêmica</p>

          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-neutral-950">
            Cadastrar usuário acadêmico
          </h1>

          <p className="mt-2 text-neutral-600">
            Cadastre professores e coordenadores.
          </p>
        </header>

        <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
          {isLoadingUser && (
            <p className="text-sm text-neutral-600">Carregando permissões...</p>
          )}

          {loadError && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {loadError}
            </div>
          )}

          {!isLoadingUser && !loadError && (
            <>
              {canCreateCoordinator && (
                <div className="mb-6">
                  <label
                    htmlFor="academicUserType"
                    className="mb-1.5 block text-sm font-medium text-neutral-800"
                  >
                    Tipo de usuário <span className="text-red-600">*</span>
                  </label>

                  <select
                    id="academicUserType"
                    value={userType}
                    onChange={handleUserTypeChange}
                    className="w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-3 text-neutral-900 outline-none transition hover:border-neutral-400 focus:border-green-800 focus:ring-4 focus:ring-green-100"
                  >
                    <option value="professor">Professor</option>
                    <option value="coordinator">Coordenador</option>
                  </select>
                </div>
              )}

              {!canCreateCoordinator && (
                <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900">
                  Você possui permissão para cadastrar coordenador.
                </div>
              )}

              <AcademicUserForm userType={userType} />
            </>
          )}
        </section>
      </div>
    </DashboardLayout>
  )
}
