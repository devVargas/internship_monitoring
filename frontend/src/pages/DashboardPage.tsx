import {
  faClockRotateLeft,
  faFileLines,
  faUser,
  faUserPlus,
  faUsers,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Link } from 'react-router-dom'
import DashboardLayout from '../components/layout/DashboardLayout.tsx'

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <header className="mb-8">
        <p className="text-sm font-semibold text-green-800">Painel inicial</p>

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
          <Link
            to="/cadastro-academico"
            className="rounded-2xl border border-green-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-green-700 hover:shadow-md"
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

          <Link
            to="/alunos"
            className="rounded-2xl border border-green-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-green-700 hover:shadow-md"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-950">
              <FontAwesomeIcon icon={faUsers} />
            </div>

            <h3 className="mt-4 font-semibold text-neutral-950">Alunos</h3>

            <p className="mt-1 text-sm leading-6 text-neutral-600">
              Consulte os alunos cadastrados no sistema.
            </p>

            <p className="mt-4 text-sm font-semibold text-green-800">
              Acessar
            </p>
          </Link>

          <Link
            to="/perfil"
            className="rounded-2xl border border-green-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-green-700 hover:shadow-md"
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

          <button
            type="button"
            disabled
            className="cursor-not-allowed rounded-2xl border border-neutral-200 bg-white p-5 text-left opacity-70 shadow-sm"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-100 text-neutral-500">
              <FontAwesomeIcon icon={faFileLines} />
            </div>

            <h3 className="mt-4 font-semibold text-neutral-800">
              Documentos
            </h3>
            <p className="mt-1 text-sm leading-6 text-neutral-500">
              Análise e acompanhamento de documentos enviados.
            </p>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-neutral-400">
              Em breve
            </p>
          </button>

          <button
            type="button"
            disabled
            className="cursor-not-allowed rounded-2xl border border-neutral-200 bg-white p-5 text-left opacity-70 shadow-sm"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-100 text-neutral-500">
              <FontAwesomeIcon icon={faClockRotateLeft} />
            </div>

            <h3 className="mt-4 font-semibold text-neutral-800">
              Linha do tempo
            </h3>
            <p className="mt-1 text-sm leading-6 text-neutral-500">
              Histórico completo das etapas do documento.
            </p>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-neutral-400">
              Em breve
            </p>
          </button>
        </div>
      </section>
    </DashboardLayout>
  )
}
