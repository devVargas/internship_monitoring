import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import DocumentForm from '../components/forms/DocumentForm.tsx'
import DashboardLayout from '../components/layout/DashboardLayout.tsx'

export default function RegisterDocumentPage() {
  const params = useParams()
  const rawRelatedDocumentId = params['related-document-id']
  const rawDocumentId = params['document-id']
  const relatedDocumentId = useMemo(() => {
    if (rawRelatedDocumentId === undefined) return undefined
    const parsed = Number(rawRelatedDocumentId)
    return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined
  }, [rawRelatedDocumentId])

  const documentId = useMemo(() => {
    if (rawDocumentId === undefined) return undefined
    const parsed = Number(rawDocumentId)
    return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined
  }, [rawDocumentId])
  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl">
        <header className="mb-6">
          <p className="text-sm font-semibold text-green-800">Documentos</p>

          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-neutral-950">
            Enviar documento
          </h1>

          <p className="mt-2 text-neutral-600">
            Preencha os dados abaixo para enviar um documento.
          </p>
        </header>

        <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
          <DocumentForm documentId={documentId} relatedDocumentId={relatedDocumentId} />
        </section>
      </div>
    </DashboardLayout>
  )
}
