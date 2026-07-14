import {
  faArrowRightFromBracket,
  faClipboardCheck,
  faFileLines,
  faHouse,
  faUser,
  faUserPlus,
  faUsers,
  faXmark,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { NavLink, useNavigate } from 'react-router-dom'
import { canAccessAcademicArea } from '../../constants/roles.ts'
import { useAuth } from '../../hooks/useAuth.ts'
import { useCurrentUser } from '../../hooks/useCurrentUser.ts'

type DashboardSidebarProps = {
  isOpen: boolean
  onClose: () => void
}

type NavigationItem = {
  to: string
  label: string
  icon: typeof faHouse
  end: boolean
}

const COMMON_ITEMS: NavigationItem[] = [
  {
    to: '/',
    label: 'Início',
    icon: faHouse,
    end: true,
  },
  {
    to: '/perfil',
    label: 'Meu perfil',
    icon: faUser,
    end: false,
  },
]

const ACADEMIC_ITEMS: NavigationItem[] = [
  {
    to: '/revisao-documentos',
    label: 'Revisão de documentos',
    icon: faClipboardCheck,
    end: false,
  },
  {
    to: '/alunos',
    label: 'Alunos',
    icon: faUsers,
    end: false,
  },
  {
    to: '/cadastro-academico',
    label: 'Cadastrar equipe acadêmica',
    icon: faUserPlus,
    end: false,
  },
]

function getLinkClass(isActive: boolean): string {
  const baseClass =
    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition'

  if (isActive) {
    return `${baseClass} bg-green-900 text-white`
  }

  return `${baseClass} text-neutral-700 hover:bg-green-50 hover:text-green-950`
}

export default function DashboardSidebar({
  isOpen,
  onClose,
}: DashboardSidebarProps) {
  const { logout } = useAuth()
  const { user } = useCurrentUser()
  const navigate = useNavigate()
  const positionClass = isOpen ? 'translate-x-0' : '-translate-x-full'
  const canAccessAcademic = user ? canAccessAcademicArea(user) : false
  const navigationItems = canAccessAcademic
    ? [COMMON_ITEMS[0], ...ACADEMIC_ITEMS, COMMON_ITEMS[1]]
    : COMMON_ITEMS

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-50 flex w-72 flex-col
        border-r border-neutral-200 bg-white p-4 shadow-xl
        transition-transform duration-200
        md:static md:w-64 md:translate-x-0 md:shadow-none
        ${positionClass}
      `}
    >
      <header className="flex items-center justify-between gap-3 px-2 py-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-green-700">
            Sistema de
          </p>
          <p className="font-semibold text-green-950">
            Acompanhamento de Estágio
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900 md:hidden"
          aria-label="Fechar menu"
        >
          <FontAwesomeIcon icon={faXmark} />
        </button>
      </header>

      <nav className="mt-6 flex flex-col gap-1">
        {navigationItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onClose}
            className={({ isActive }) => getLinkClass(isActive)}
          >
            <FontAwesomeIcon icon={item.icon} className="w-4" />
            <span>{item.label}</span>
          </NavLink>
        ))}

        <div className="my-3 border-t border-neutral-200" />

        <button
          type="button"
          disabled
          className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-neutral-400"
          title="Funcionalidade disponível em breve"
        >
          <FontAwesomeIcon icon={faFileLines} className="w-4" />
          <span className="flex-1">Documentos</span>
          <span className="text-[10px] font-semibold uppercase tracking-wide">
            Em breve
          </span>
        </button>
      </nav>

      <button
        type="button"
        onClick={handleLogout}
        className="mt-auto flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-50"
      >
        <FontAwesomeIcon icon={faArrowRightFromBracket} className="w-4" />
        Sair
      </button>
    </aside>
  )
}
