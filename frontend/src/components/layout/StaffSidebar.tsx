import {
  faArrowRightFromBracket,
  faHouse,
  faUserPlus,
  faUsers,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.ts'

const NAV_ITEMS = [
  { to: '/', label: 'Início', icon: faHouse },
  { to: '/cadastro-usuario', label: 'Cadastrar usuário', icon: faUserPlus },
  { to: '/alunos', label: 'Alunos', icon: faUsers },
]

function getLinkClass(isActive: boolean): string {
  const base = 'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition'

  return isActive
    ? `${base} bg-green-900 text-white`
    : `${base} text-neutral-700 hover:bg-green-50 hover:text-green-950`
}

export default function StaffSidebar() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <aside className="flex w-full flex-col border-b border-neutral-200 bg-white p-4 md:min-h-screen md:w-64 md:border-b-0 md:border-r">
      <p className="px-3 py-2 text-sm font-semibold text-green-950">Acompanhamento de Estágio</p>

      <nav className="mt-4 flex gap-2 overflow-x-auto md:flex-col">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => getLinkClass(isActive)}
          >
            <FontAwesomeIcon icon={item.icon} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <button
        type="button"
        onClick={handleLogout}
        className="mt-4 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-50 md:mt-auto"
      >
        <FontAwesomeIcon icon={faArrowRightFromBracket} />
        Sair
      </button>
    </aside>
  )
}
