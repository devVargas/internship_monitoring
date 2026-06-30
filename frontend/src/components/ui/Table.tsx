export type Column<T> = {
  key: keyof T
  header: string
}

type TableProps<T> = {
  columns: Column<T>[]
  data: T[]
  isLoading?: boolean
  error?: string | null
  emptyMessage?: string
}

export default function Table<T extends Record<string, unknown>>({
  columns,
  data,
  isLoading,
  error,
  emptyMessage = 'Nenhum registro encontrado',
}: TableProps<T>) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <p className="text-gray-500 font-outfit">Carregando...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 border border-red-200 p-4">
        <p className="text-red-700 font-outfit">{error}</p>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="flex justify-center py-8">
        <p className="text-gray-400 font-outfit">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 font-outfit"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className="hover:bg-gray-100 transition-colors"
            >
              {columns.map((col) => (
                <td
                  key={String(col.key)}
                  className="px-6 py-4 whitespace-nowrap text-sm text-left text-gray-900 font-outfit"
                >
                  {String(row[col.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
