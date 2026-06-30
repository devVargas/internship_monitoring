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
    <div className="p-6 bg-green-900 min-h-screen">
      <Table
        columns={columns}
        data={students}
        isLoading={isLoading}
        error={error}
        emptyMessage="Nenhum aluno encontrado"
      />
    </div>
  )
}
