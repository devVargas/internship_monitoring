import {
  faClockRotateLeft,
  faClipboardCheck,
  faFileCirclePlus,
  faUser,
  faUserPlus,
  faUsers,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Link } from 'react-router-dom'
import DashboardLayout from '../components/layout/DashboardLayout.tsx'
import { useCurrentUser } from '../hooks/useCurrentUser.ts'

const CARD_CLASS =
  'rounded-2xl border border-green-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-green-700 hover:shadow-md'

export default function DashboardPage() {
  const { user } = useCurrentUser()

  const isSuperuser = user?.is_superuser === true
  const isStudent =
    user?.groups.includes('Student') === true

  const canAccessAcademic =
    isSuperuser ||
    user?.groups.includes('Teacher') === true ||
    user?.groups.includes('Coordinator') === true

  const canManageAcademicUsers =
    isSuperuser ||
    user?.groups.includes('Coordinator') === true

  const canAccessStudentFeatures =
    isSuperuser || isStudent

  const canAccessSupervisorEvaluations =
    isSuperuser ||
    user?.groups.includes('Supervisor') === true

  return (
    <DashboardLayout>
      <header className="mb-8">
        <p className="text-sm font-semibold text-green-800">
          Painel inicial
        </p>

        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-neutral-950">
          Bem-vindo ao sistema
        </h1>

        <p className="mt-2 max-w-2xl text-neutral-600">
          Utilize o menu lateral para acessar as funcionalidades disponíveis.
        </p>
      </header>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-neutral-900">
          Acesso rápido
        </h2>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {canAccessAcademic && (
            <Link
              to="/revisao-documentos"
              className={CARD_CLASS}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-950">
                <FontAwesomeIcon icon={faClipboardCheck} />
              </div>

              <h3 className="mt-4 font-semibold text-neutral-950">
                Revisão de documentos
              </h3>

              <p className="mt-1 text-sm leading-6 text-neutral-600">
                Analise documentos enviados e registre a decisão.
              </p>

              <p className="mt-4 text-sm font-semibold text-green-800">
                Acessar
              </p>
            </Link>
          )}

          {canManageAcademicUsers && (
            <Link
              to="/cadastro-academico"
              className={CARD_CLASS}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-950">
                <FontAwesomeIcon icon={faUserPlus} />
              </div>

              <h3 className="mt-4 font-semibold text-neutral-950">
                Cadastrar equipe acadêmica
              </h3>

              <p className="mt-1 text-sm leading-6 text-neutral-600">
                Adicione professores e coordenadores ao sistema.
              </p>

              <p className="mt-4 text-sm font-semibold text-green-800">
                Acessar
              </p>
            </Link>
          )}

          {canAccessAcademic && (
            <Link
              to="/alunos"
              className={CARD_CLASS}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-950">
                <FontAwesomeIcon icon={faUsers} />
              </div>

              <h3 className="mt-4 font-semibold text-neutral-950">
                Alunos
              </h3>

              <p className="mt-1 text-sm leading-6 text-neutral-600">
                Consulte os alunos cadastrados no sistema.
              </p>

              <p className="mt-4 text-sm font-semibold text-green-800">
                Acessar
              </p>
            </Link>
          )}

          {canAccessStudentFeatures && (
            <Link
              to="/enviar-documento"
              className={CARD_CLASS}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-950">
                <FontAwesomeIcon
                  icon={faFileCirclePlus}
                />
              </div>

              <h3 className="mt-4 font-semibold text-neutral-950">
                Novo documento
              </h3>

              <p className="mt-1 text-sm leading-6 text-neutral-600">
                Preencha e envie um novo documento de estágio.
              </p>

              <p className="mt-4 text-sm font-semibold text-green-800">
                Acessar
              </p>
            </Link>
          )}

          {canAccessStudentFeatures && (
            <Link
              to="/historico-documentos"
              className={CARD_CLASS}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-950">
                <FontAwesomeIcon
                  icon={faClockRotateLeft}
                />
              </div>

              <h3 className="mt-4 font-semibold text-neutral-950">
                Meus documentos
              </h3>

              <p className="mt-1 text-sm leading-6 text-neutral-600">
                Assine, acompanhe pendências e consulte o histórico dos seus documentos.
              </p>

              <p className="mt-4 text-sm font-semibold text-green-800">
                Acessar
              </p>
            </Link>
          )}

          {canAccessSupervisorEvaluations && (
            <Link
              to="/avaliacoes-pendentes"
              className={CARD_CLASS}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-950">
                <FontAwesomeIcon icon={faClipboardCheck} />
              </div>

              <h3 className="mt-4 font-semibold text-neutral-950">
                Avaliações pendentes
              </h3>

              <p className="mt-1 text-sm leading-6 text-neutral-600">
                Consulte os alunos que aguardam sua avaliação.
              </p>

              <p className="mt-4 text-sm font-semibold text-green-800">
                Acessar
              </p>
            </Link>
          )}

          <Link
            to="/perfil"
            className={CARD_CLASS}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-950">
              <FontAwesomeIcon icon={faUser} />
            </div>

            <h3 className="mt-4 font-semibold text-neutral-950">
              Meu perfil
            </h3>

            <p className="mt-1 text-sm leading-6 text-neutral-600">
              Consulte e atualize seus dados pessoais.
            </p>

            <p className="mt-4 text-sm font-semibold text-green-800">
              Acessar
            </p>
          </Link>
        </div>
      </section>
    </DashboardLayout>
  )
}