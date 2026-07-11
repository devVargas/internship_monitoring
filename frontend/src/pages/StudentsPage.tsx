import StaffPageLayout from '../components/layout/StaffPageLayout.tsx'
import { useStudents } from '../hooks/useStudents.ts'

export default function StudentsPage() {
  const { students, isLoading, error } = useStudents()

  return (
    <StaffPageLayout>
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-neutral-950">Alunos</h1>
          <p className="mt-2 text-neutral-600">Consulte os alunos cadastrados no sistema.</p>
        </div>

        <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
          {isLoading && <p className="p-8 text-center text-neutral-500">Carregando...</p>}

          {error && (
            <div className="m-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
              {error}
            </div>
          )}

          {!isLoading && !error && students.length === 0 && (
            <p className="p-8 text-center text-neutral-500">Nenhum aluno encontrado.</p>
          )}

          {!isLoading && !error && students.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Nome
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Matrícula
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Curso
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-neutral-50">
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-neutral-900">
                        {student.name}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-neutral-600">
                        {student.email}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-neutral-600">
                        {student.registrationNumber}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-neutral-600">
                        {student.course}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </StaffPageLayout>
  )
}
