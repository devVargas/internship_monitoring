import {
  faArrowRightFromBracket,
  faClockRotateLeft,
  faFileLines,
  faHouse,
  faUser,
  faUserPlus,
  faUsers,
  faXmark,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  NavLink,
  useNavigate,
} from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.ts'

type DashboardSidebarProps = {
  isOpen: boolean
  onClose: () => void
}

const ACTIVE_ITEMS = [
  {
    to: '/',
    label: 'Início',
    icon: faHouse,
    end: true,
  },
  {
    to: '/cadastro-professor',
    label: 'Cadastrar professor',
    icon: faUserPlus,
    end: false,
  },
]

const FUTURE_ITEMS = [
  {
    label: 'Alunos',
    icon: faUsers,
  },
  {
    label: 'Documentos',
    icon: faFileLines,
  },
  {
    label: 'Linha do tempo',
    icon: faClockRotateLeft,
  },
  {
    label: 'Meu perfil',
    icon: faUser,
  },
]

function getLinkClass(isActive: boolean) {
  const baseClass = `
    flex items-center gap-3 rounded-lg
    px-3 py-2.5 text-sm font-medium
    transition
  `

  if (isActive) {
    return `
      ${baseClass}
      bg-green-900 text-white
    `
  }

  return `
    ${baseClass}
    text-neutral-700
    hover:bg-green-50 hover:text-green-950
  `
}

export default function DashboardSidebar({
  isOpen,
  onClose,
}: DashboardSidebarProps) {
  const { logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  const positionClass = isOpen
    ? 'translate-x-0'
    : '-translate-x-full'

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-50
        flex w-72 flex-col
        border-r border-neutral-200
        bg-white p-4 shadow-xl
        transition-transform duration-200

        md:static md:w-64 md:translate-x-0
        md:shadow-none

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
          className="
            flex h-9 w-9 items-center justify-center
            rounded-lg text-neutral-500
            transition hover:bg-neutral-100
            hover:text-neutral-900 md:hidden
          "
          aria-label="Fechar menu"
        >
          <FontAwesomeIcon icon={faXmark} />
        </button>
      </header>

      <nav className="mt-6 flex flex-col gap-1">
        {ACTIVE_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onClose}
            className={({ isActive }) =>
              getLinkClass(isActive)
            }
          >
            <FontAwesomeIcon
              icon={item.icon}
              className="w-4"
            />

            <span>{item.label}</span>
          </NavLink>
        ))}

        <div className="my-3 border-t border-neutral-200" />

        {FUTURE_ITEMS.map((item) => (
          <button
            key={item.label}
            type="button"
            disabled
            className="
              flex cursor-not-allowed items-center
              gap-3 rounded-lg px-3 py-2.5
              text-left text-sm font-medium
              text-neutral-400
            "
            title="Funcionalidade disponível em breve"
          >
            <FontAwesomeIcon
              icon={item.icon}
              className="w-4"
            />

            <span className="flex-1">
              {item.label}
            </span>

            <span className="text-[10px] font-semibold uppercase tracking-wide">
              Em breve
            </span>
          </button>
        ))}
      </nav>

      <button
        type="button"
        onClick={handleLogout}
        className="
          mt-auto flex items-center gap-3
          rounded-lg px-3 py-2.5
          text-sm font-medium text-red-700
          transition hover:bg-red-50
        "
      >
        <FontAwesomeIcon
          icon={faArrowRightFromBracket}
          className="w-4"
        />

        Sair
      </button>
    </aside>
  )
}