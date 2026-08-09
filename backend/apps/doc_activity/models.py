from django.conf import settings
from django.db import models


class DocumentActivityAction(models.TextChoices):
    CREATED = "created",
    UPDATED = "updated",
    AWAITING_SIGNATURE = "awaiting_signature",
    SIGNED = "signed",
    WAITING_SUPERVISOR = "waiting_supervisor",
    WAITING_STUDENT_CONFIRMATION = "waiting_student_confirmation",
    SUBMITTED = "submitted",
    IN_REVIEW = "in_review",
    ADJUSTMENT_REQUESTED = "adjustment_requested",
    APPROVED = "approved",
    REJECTED = "rejected",
    CANCELLED = "cancelled",


class DocumentActivity(models.Model):
    document = models.ForeignKey(
        "document.Document",
        on_delete=models.CASCADE,
        related_name="activities",
    )
    action = models.CharField(max_length=40, choices=DocumentActivityAction.choices)
    description = models.TextField(blank=True)
    performed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="document_activities",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
