import { faFileLines, faGraduationCap } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Link } from 'react-router-dom'
import LoginForm from '../components/forms/LoginForm.tsx'

export default function LoginPage() {
  return (
    <main className="grid min-h-screen bg-neutral-50 lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden bg-green-950 px-12 py-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div
          className="absolute -right-28 -top-28 h-80 w-80 rounded-full border border-white/10"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-36 -left-24 h-96 w-96 rounded-full bg-white/5"
          aria-hidden="true"
        />

        <div className="relative flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-green-950 shadow-sm">
            <FontAwesomeIcon icon={faGraduationCap} />
          </div>
          <div>
            <p className="text-sm font-medium text-green-100">Sistema de</p>
            <p className="font-semibold">Acompanhamento de Estágio</p>
          </div>
        </div>

        <div className="relative max-w-xl pb-10">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-green-200">
            Gestão acadêmica
          </p>
          <h1 className="text-4xl font-semibold leading-tight xl:text-5xl">
            Acompanhe cada etapa do estágio em um só lugar.
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-8 text-green-100/80">
            Documentos, avaliações e acompanhamento organizados para alunos, supervisores e professores.
          </p>
        </div>

        <p className="relative text-sm text-green-100/60">
         v1.0.0
        </p>
      </section>

      <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-950 text-white">
              <FontAwesomeIcon icon={faGraduationCap} />
            </div>
            <p className="font-semibold text-green-950">Acompanhamento de Estágio</p>
          </div>

          <LoginForm />

          <p className="mt-6 text-center text-sm text-neutral-600">
            Ainda não possui uma conta?{' '}
            <Link
              to="/cadastro"
              className="font-semibold text-green-900 underline-offset-4 hover:underline"
            >
              Cadastre-se
            </Link>
          </p>
        </div>
      </section>
    </main>
  )
}
