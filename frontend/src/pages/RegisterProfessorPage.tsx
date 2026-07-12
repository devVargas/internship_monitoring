import ProfessorForm from '../components/forms/ProfessorForm.tsx'
import DashboardLayout from '../components/layout/DashboardLayout.tsx'

export default function RegisterProfessorPage() {
  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-neutral-950">
            Cadastro de professor
          </h1>

          <p className="mt-2 text-neutral-600">
            Preencha os dados para cadastrar um novo professor.
          </p>
        </header>

        <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
          <ProfessorForm />
        </section>
      </div>
    </DashboardLayout>
  )
}