from celery import shared_task
from django.core.files.base import ContentFile
from django.utils import timezone

from apps.document.models import Document, PdfGenerationStatus
from apps.document.pdf_generator import build_pdf_filename, render_document_pdf


@shared_task
def generate_document_pdf(document_id: int) -> None:
    try:
        document = (
            Document.objects.select_related(
                "advisor",
                "supervisor__user",
                "related_document__advisor",
                "related_document__supervisor__user",
            )
            .get(pk=document_id)
        )
    except Document.DoesNotExist:
        return

    document.pdf_generation_status = PdfGenerationStatus.PROCESSING
    document.pdf_generation_error = ""
    document.save(update_fields=["pdf_generation_status", "pdf_generation_error", "updated_at"])

    try:
        pdf_bytes = render_document_pdf(document)
        filename = build_pdf_filename(document)

        if document.generated_pdf:
            document.generated_pdf.delete(save=False)

        document.generated_pdf.save(
            filename,
            ContentFile(pdf_bytes),
            save=False,
        )
        document.pdf_generation_status = PdfGenerationStatus.READY
        document.pdf_generation_error = ""
        document.pdf_generated_at = timezone.now()
        document.save(
            update_fields=[
                "generated_pdf",
                "pdf_generation_status",
                "pdf_generation_error",
                "pdf_generated_at",
                "updated_at",
            ]
        )
    except Exception as exc:
        document.pdf_generation_status = PdfGenerationStatus.FAILED
        document.pdf_generation_error = str(exc)[:2000]
        document.pdf_generated_at = None
        document.save(
            update_fields=[
                "pdf_generation_status",
                "pdf_generation_error",
                "pdf_generated_at",
                "updated_at",
            ]
        )
        raise
