import { faUser } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import DashboardLayout from '../components/layout/DashboardLayout.tsx'
import UserProfileForm from '../components/forms/UserProfileForm.tsx'
import Button from '../components/ui/Button.tsx'
import { useUserProfile } from '../hooks/useUserProfile.ts'
import type { UserProfile } from '../api/profile.ts'

function getRoleLabel(profile: UserProfile): string {
  if (profile.is_superuser) {
    return 'Master'
  }

  if (profile.groups.includes('Coordinator')) {
    return 'Coordenador'
  }

  if (profile.groups.includes('Teacher')) {
    return 'Professor'
  }

  if (profile.groups.includes('Supervisor')) {
    return 'Supervisor'
  }

  if (profile.groups.includes('Student')) {
    return 'Aluno'
  }

  return 'Usuário'
}

function getInitials(profile: UserProfile): string {
  const initials = `${profile.first_name.charAt(0)}${profile.last_name.charAt(0)}`
    .trim()
    .toUpperCase()

  return initials || profile.email.charAt(0).toUpperCase()
}

export default function UserProfilePage() {
  const {
    profile,
    isLoading,
    isSaving,
    error,
    reload,
    updateProfile,
  } = useUserProfile()

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-72 items-center justify-center">
          <p className="text-sm text-neutral-600">Carregando perfil...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (!profile) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-xl rounded-2xl border border-red-200 bg-white p-6 text-center shadow-sm">
          <FontAwesomeIcon
            icon={faUser}
            className="text-3xl text-red-700"
          />

          <h1 className="mt-4 text-xl font-semibold text-neutral-950">
            Não foi possível carregar o perfil
          </h1>

          <p className="mt-2 text-sm text-neutral-600">
            {error ?? 'Tente novamente.'}
          </p>

          <Button
            type="button"
            className="mt-5"
            onClick={() => {
              void reload()
            }}
          >
            Tentar novamente
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl">
        <header className="mb-6">
          <p className="text-sm font-semibold text-green-800">Minha conta</p>

          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-neutral-950">
            Meu perfil
          </h1>

          <p className="mt-2 text-neutral-600">
            Consulte e atualize seus dados pessoais.
          </p>
        </header>

        <section className="mb-6 flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-green-100 text-lg font-semibold text-green-950">
            {getInitials(profile)}
          </div>

          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold text-neutral-950">
              {[profile.first_name, profile.last_name]
                .filter(Boolean)
                .join(' ') || profile.email}
            </h2>

            <p className="truncate text-sm text-neutral-600">
              {profile.email}
            </p>

            <span className="mt-2 inline-flex rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-900">
              {getRoleLabel(profile)}
            </span>
          </div>
        </section>

        <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
          <UserProfileForm
            profile={profile}
            isSaving={isSaving}
            requestError={error}
            onSave={updateProfile}
          />
        </section>
      </div>
    </DashboardLayout>
  )
}
