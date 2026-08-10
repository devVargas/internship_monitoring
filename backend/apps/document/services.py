from apps.doc_activity.models import DocumentActivityAction
from apps.doc_activity.services import register_activity
from apps.document.models import DocumentStatus


def set_document_status(document, status, user, description=""):
    document.status = status
    document.save(update_fields=["status", "updated_at"])

    action_by_status = {
        DocumentStatus.AWAITING_SIGNATURE: DocumentActivityAction.AWAITING_SIGNATURE,
        DocumentStatus.WAITING_SUPERVISOR: DocumentActivityAction.WAITING_SUPERVISOR,
        DocumentStatus.WAITING_STUDENT_CONFIRMATION: (
            DocumentActivityAction.WAITING_STUDENT_CONFIRMATION
        ),
        DocumentStatus.SUBMITTED: DocumentActivityAction.SUBMITTED,
        DocumentStatus.IN_REVIEW: DocumentActivityAction.IN_REVIEW,
        DocumentStatus.ADJUSTMENT_REQUESTED: DocumentActivityAction.ADJUSTMENT_REQUESTED,
        DocumentStatus.APPROVED: DocumentActivityAction.APPROVED,
        DocumentStatus.REJECTED: DocumentActivityAction.REJECTED,
        DocumentStatus.CANCELLED: DocumentActivityAction.CANCELLED,
    }

    action = action_by_status.get(status)

    if action:
        register_activity(
            document=document,
            action=action,
            user=user,
            description=description,
        )

    return document
