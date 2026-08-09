from django.db import transaction

from apps.document.models import Document, PdfGenerationStatus


def queue_document_pdf(document: Document) -> None:
    document.pdf_generation_status = PdfGenerationStatus.PENDING
    document.pdf_generation_error = ""
    document.pdf_generated_at = None
    document.save(
        update_fields=[
            "pdf_generation_status",
            "pdf_generation_error",
            "pdf_generated_at",
            "updated_at",
        ]
    )

    document_id = document.pk

    def enqueue() -> None:
        from apps.document.tasks import generate_document_pdf

        try:
            generate_document_pdf.delay(document_id)
        except Exception as exc:
            Document.objects.filter(pk=document_id).update(
                pdf_generation_status=PdfGenerationStatus.FAILED,
                pdf_generation_error=(
                    f"Não foi possível enviar o PDF para a fila: {exc}"[:2000]
                ),
                pdf_generated_at=None,
            )

    transaction.on_commit(enqueue)
