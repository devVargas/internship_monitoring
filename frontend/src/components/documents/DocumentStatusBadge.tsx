import type { DocumentStatus } from '../../api/documents.ts'
import { DOCUMENT_STATUS_LABELS } from '../../utils/documents.ts'

type DocumentStatusBadgeProps = {
  status: DocumentStatus
}

const STATUS_CLASSES: Record<DocumentStatus, string> = {
  awaiting_signature: 'bg-purple-50 text-purple-700 ring-purple-200',
  signed: 'bg-green-50 text-green-700 ring-green-200',
  waiting_supervisor: 'bg-neutral-100 text-neutral-600 ring-neutral-200',
  waiting_student_confirmation: 'bg-blue-50 text-blue-700 ring-blue-200',
  submitted: 'bg-blue-50 text-blue-700 ring-blue-200',
  in_review: 'bg-amber-50 text-amber-800 ring-amber-200',
  adjustment_requested: 'bg-orange-50 text-orange-700 ring-orange-200',
  approved: 'bg-green-50 text-green-700 ring-green-200',
  rejected: 'bg-red-50 text-red-700 ring-red-200',
  cancelled: 'bg-neutral-100 text-neutral-500 ring-neutral-200',
}

export default function DocumentStatusBadge({
  status,
}: DocumentStatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${STATUS_CLASSES[status]}`}
    >
      {DOCUMENT_STATUS_LABELS[status]}
    </span>
  )
}
