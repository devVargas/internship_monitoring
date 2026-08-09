from django.conf import settings
from django.db import models


class DocumentType(models.TextChoices):
    MANDATORY_INTERNSHIP = ("mandatory_internship",)
    NON_MANDATORY_INTERNSHIP_CREDIT = ("non_mandatory_internship_credit",)
    PROFESSIONAL_PRACTICE_CREDIT = ("professional_practice_credit",)
    SUPERVISOR_EVALUATION = ("supervisor_evaluation",)


class DocumentStatus(models.TextChoices):
    AWAITING_SIGNATURE = ("awaiting_signature",)
    SIGNED = ("signed",)
    WAITING_SUPERVISOR = ("waiting_supervisor",)
    WAITING_STUDENT_CONFIRMATION = ("waiting_student_confirmation",)
    SUBMITTED = ("submitted",)
    IN_REVIEW = ("in_review",)
    ADJUSTMENT_REQUESTED = ("adjustment_requested",)
    APPROVED = ("approved",)
    REJECTED = ("rejected",)
    CANCELLED = ("cancelled",)


class SignatureMethod(models.TextChoices):
    GOVBR = ("govbr", "GOV.BR")
    MANUAL = ("manual", "Assinatura à mão")


class PdfGenerationStatus(models.TextChoices):
    NOT_GENERATED = ("not_generated",)
    PENDING = ("pending",)
    PROCESSING = ("processing",)
    READY = ("ready",)
    FAILED = ("failed",)


class Document(models.Model):
    student = models.ForeignKey(
        "students.StudentProfile",
        on_delete=models.PROTECT,
        related_name="documents",
    )
    supervisor = models.ForeignKey(
        "accounts.SupervisorProfile",
        on_delete=models.PROTECT,
        related_name="documents",
        null=True,
        blank=True,
    )
    advisor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="advised_documents",
        null=True,
        blank=True,
    )
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="reviewed_documents",
        null=True,
        blank=True,
    )
    related_document = models.ForeignKey(
        "self",
        on_delete=models.PROTECT,
        related_name="related_documents",
        null=True,
        blank=True,
    )
    document_type = models.CharField(
        max_length=60,
        choices=DocumentType.choices,
    )
    student_name = models.CharField(max_length=150)
    student_email = models.EmailField()
    student_registration_number = models.CharField(max_length=50)
    student_course = models.CharField(max_length=150)
    student_campus = models.CharField(max_length=150)
    student_snapshot = models.JSONField(default=dict, blank=True)
    coordinator_name = models.CharField(max_length=150, blank=True)
    company = models.CharField(max_length=150)
    city = models.CharField(max_length=150)
    document_date = models.DateField()
    attachment = models.FileField(
        upload_to="documents/signed/",
        null=True,
        blank=True,
    )
    signature_method = models.CharField(
        max_length=20,
        choices=SignatureMethod.choices,
        blank=True,
        default="",
    )
    signed_at = models.DateTimeField(null=True, blank=True)
    generated_pdf = models.FileField(
        upload_to="documents/generated/",
        null=True,
        blank=True,
    )
    pdf_generation_status = models.CharField(
        max_length=20,
        choices=PdfGenerationStatus.choices,
        default=PdfGenerationStatus.NOT_GENERATED,
    )
    pdf_generation_error = models.TextField(blank=True)
    pdf_generated_at = models.DateTimeField(null=True, blank=True)
    form_data = models.JSONField(default=dict, blank=True)
    status = models.CharField(
        max_length=40,
        choices=DocumentStatus.choices,
        default=DocumentStatus.AWAITING_SIGNATURE,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        permissions = [
            ("review_document", "Can review document"),
            ("approve_document", "Can approve document"),
            ("reject_document", "Can reject document"),
        ]
