import ProfessorBar from '../ui/ProfessorBar.tsx'
import Table from '../ui/Table.tsx'
import type { Column } from '../ui/Table.tsx'
import { useStudents } from '../../hooks/useStudents.ts'
import type { Student } from '../../hooks/useStudents.ts'

const columns: Column<Student>[] = [
  { key: 'name', header: 'Nome' },
  { key: 'email', header: 'E-mail' },
]

export default function StudentsTable() {
  const { students, isLoading, error } = useStudents()

  return (
    <div className="flex min-h-screen">
      <ProfessorBar />
      <div className="flex-1 p-6 bg-green-900">
        <Table
          columns={columns}
          data={students}
          isLoading={isLoading}
          error={error}
          emptyMessage="Nenhum aluno encontrado"
        />
      </div>
    </div>
  )
}
