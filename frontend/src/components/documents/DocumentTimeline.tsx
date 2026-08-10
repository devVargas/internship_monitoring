import {
  faBan,
  faCircleCheck,
  faCircleXmark,
  faFileLines,
  faMagnifyingGlass,
  faPaperPlane,
  faPen,
  faRotate,
  faUserClock,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import type { DocumentActivity } from '../../api/documents.ts'
import { formatDateTime } from '../../utils/documents.ts'

type DocumentTimelineProps = {
  activities: DocumentActivity[]
}

type ActivityPresentation = {
  label: string
  icon: IconDefinition
  iconClass: string
}

function getActivityPresentation(action: string): ActivityPresentation {
  switch (action) {
    case 'created':
      return {
        label: 'Documento criado',
        icon: faFileLines,
        iconClass: 'bg-blue-100 text-blue-700',
      }
    case 'updated':
      return {
        label: 'Documento atualizado',
        icon: faPen,
        iconClass: 'bg-blue-100 text-blue-700',
      }
    case 'awaiting_signature':
      return {
        label: 'Aguardando assinatura',
        icon: faPen,
        iconClass: 'bg-purple-100 text-purple-700',
      }
    case 'signed':
      return {
        label: 'Documento assinado',
        icon: faCircleCheck,
        iconClass: 'bg-green-100 text-green-700',
      }
    case 'waiting_student_confirmation':
      return {
        label: 'Aguardando confirmação do aluno',
        icon: faUserClock,
        iconClass: 'bg-blue-100 text-blue-700',
      }
    case 'submitted':
      return {
        label: 'Documento enviado',
        icon: faPaperPlane,
        iconClass: 'bg-indigo-100 text-indigo-700',
      }
    case 'waiting_supervisor':
      return {
        label: 'Aguardando supervisor',
        icon: faUserClock,
        iconClass: 'bg-neutral-100 text-neutral-600',
      }
    case 'in_review':
      return {
        label: 'Revisão iniciada',
        icon: faMagnifyingGlass,
        iconClass: 'bg-amber-100 text-amber-800',
      }
    case 'adjustment_requested':
      return {
        label: 'Ajustes solicitados',
        icon: faRotate,
        iconClass: 'bg-orange-100 text-orange-700',
      }
    case 'approved':
      return {
        label: 'Documento aprovado',
        icon: faCircleCheck,
        iconClass: 'bg-green-100 text-green-700',
      }
    case 'rejected':
      return {
        label: 'Documento rejeitado',
        icon: faCircleXmark,
        iconClass: 'bg-red-100 text-red-700',
      }
    case 'cancelled':
      return {
        label: 'Documento cancelado',
        icon: faBan,
        iconClass: 'bg-neutral-100 text-neutral-500',
      }
    default:
      return {
        label: 'Movimentação registrada',
        icon: faFileLines,
        iconClass: 'bg-neutral-100 text-neutral-600',
      }
  }
}

export default function DocumentTimeline({ activities }: DocumentTimelineProps) {
  if (activities.length === 0) {
    return (
      <p className="mt-5 text-sm text-neutral-500">
        Nenhuma movimentação foi registrada para este documento.
      </p>
    )
  }

  const orderedActivities = [...activities].sort(
    (first, second) => new Date(first.createdAt).getTime() - new Date(second.createdAt).getTime(),
  )

  return (
    <ol className="relative ml-5 mt-6 border-l border-neutral-200">
      {orderedActivities.map((activity, index) => {
        const presentation = getActivityPresentation(activity.action)
        const isLast = index === orderedActivities.length - 1

        return (
          <li key={activity.id} className={isLast ? 'relative ml-7' : 'relative mb-7 ml-7'}>
            <span
              className={`absolute -left-11 flex h-8 w-8 items-center justify-center rounded-full ring-4 ring-white ${presentation.iconClass}`}
            >
              <FontAwesomeIcon icon={presentation.icon} className="text-sm" />
            </span>

            <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <div>
                <h3 className="font-semibold text-neutral-900">{presentation.label}</h3>

                {activity.description && (
                  <p className="mt-1 text-sm leading-6 text-neutral-600">{activity.description}</p>
                )}

                <p className="mt-1 text-xs text-neutral-500">
                  Responsável: {activity.performedByName}
                </p>
              </div>

              <time className="shrink-0 text-xs text-neutral-500">
                {formatDateTime(activity.createdAt)}
              </time>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
