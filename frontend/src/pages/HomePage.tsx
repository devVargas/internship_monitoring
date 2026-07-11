import { faArrowRightFromBracket } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button.tsx'
import { useAuth } from '../hooks/useAuth.ts'

export default function HomePage() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-5 py-10">
      <section className="w-full max-w-2xl rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wider text-green-800">
          Área autenticada
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-neutral-950">Acompanhamento de Estágio</h1>

        <Button type="button" variant="secondary" onClick={handleLogout} className="mt-7">
          <FontAwesomeIcon icon={faArrowRightFromBracket} />
          Sair
        </Button>
      </section>
    </main>
  )
}
