import { faGraduationCap } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Link } from 'react-router-dom'
import StudentForm from '../components/forms/StudentForm.tsx'

export default function RegisterStudentPage() {
  return (
    <main className="min-h-screen bg-green-950 px-5 py-10 sm:px-8">
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-6 flex items-center justify-between gap-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-green-950">
              <FontAwesomeIcon icon={faGraduationCap} />
            </div>
            <p className="font-semibold">Acompanhamento de Estágio</p>
          </div>

          <Link
            to="/login"
            className="text-sm font-medium text-green-100 underline-offset-4 hover:underline"
          >
            Voltar ao login
          </Link>
        </div>

        <section className="rounded-2xl bg-white p-6 shadow-xl sm:p-8">
          <div className="mb-7">
            <h1 className="text-2xl font-semibold text-neutral-950">Cadastro de aluno</h1>
            <p className="mt-2 text-neutral-600">Preencha seus dados para criar uma conta.</p>
          </div>

          <StudentForm />
        </section>
      </div>
    </main>
  )
}
