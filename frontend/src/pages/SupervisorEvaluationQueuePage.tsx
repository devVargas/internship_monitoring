import { faClipboardCheck } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import DocumentStatusBadge from '../components/documents/DocumentStatusBadge.tsx'
import DashboardLayout from '../components/layout/DashboardLayout.tsx'
import { useSupervisorEvaluationQueue } from '../hooks/useSupervisorEvaluationQueue.ts'
import {
  DOCUMENT_TYPE_LABELS,
  formatDate,
} from '../utils/documents.ts'

export default function SupervisorEvaluationQueuePage() {
  const { documents, isLoading, error } =
    useSupervisorEvaluationQueue()

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl">
        <header className="mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-950">
              <FontAwesomeIcon icon={faClipboardCheck} />
            </div>

            <div>
              <h1 className="text-2xl font-semibold text-neutral-950">
                Avaliações pendentes
              </h1>

              <p className="mt-1 text-neutral-600">
                Consulte os alunos que selecionaram você como supervisor.
              </p>
            </div>
          </div>
        </header>

        <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
          {isLoading && (
            <p className="p-10 text-center text-neutral-500">
              Carregando avaliações...
            </p>
          )}

          {error && (
            <div
              role="alert"
              className="m-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700"
            >
              {error}
            </div>
          )}

          {!isLoading && !error && documents.length === 0 && (
            <div className="p-10 text-center">
              <p className="font-medium text-neutral-800">
                Nenhuma avaliação pendente.
              </p>

              <p className="mt-1 text-sm text-neutral-500">
                Os alunos que selecionarem você como supervisor aparecerão aqui.
              </p>
            </div>
          )}

          {!isLoading && !error && documents.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Aluno
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Documento
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Empresa
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Status
                    </th>

                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Ação
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-neutral-200">
                  {documents.map((document) => (
                    <tr
                      key={document.id}
                      className="hover:bg-neutral-50"
                    >
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-neutral-900">
                          {document.studentName}
                        </p>

                        <p className="mt-1 text-xs text-neutral-500">
                          {document.studentRegistrationNumber}
                          {' · '}
                          {document.studentCourse}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <p className="text-sm text-neutral-800">
                          {DOCUMENT_TYPE_LABELS[document.documentType]}
                        </p>

                        <p className="mt-1 text-xs text-neutral-500">
                          {formatDate(document.documentDate)}
                        </p>
                      </td>

                      <td className="px-6 py-4 text-sm text-neutral-600">
                        {document.company}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4">
                        <DocumentStatusBadge status={document.status} />
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <button
                          type="button"
                          disabled
                          className="cursor-not-allowed rounded-lg bg-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-500"
                        >
                          Acessar avaliação
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  )
}