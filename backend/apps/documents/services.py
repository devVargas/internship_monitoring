from .models import Documents


def create_document(user, user_admin, name, description, student=None, date_begin=None, date_end=None):
    """Cria um Document. O registro de DocActivity é feito no signal ou na view."""
    document = Documents.objects.create(
        user=user,
        user_admin=user_admin,
        student=student,
        name=name,
        description=description,
        status=Documents.Status.PENDING,
        date_begin=date_begin,
        date_end=date_end,
        is_enabled=True,
    )
    return document


def update_document_status(document, new_status):
    """Atualiza o status de um Document."""
    document.status = new_status
    document.save(update_fields=["status", "last_update"])
    return document


def disable_document(document):
    """Desativa um Document (soft delete)."""
    document.is_enabled = False
    document.save(update_fields=["is_enabled", "last_update"])
    return document
