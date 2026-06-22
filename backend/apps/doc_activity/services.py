from .models import DocActivity


def register_activity(document, status, description, user):
    """Registra uma nova atividade para um documento."""
    return DocActivity.objects.create(
        document=document,
        status=status,
        description=description,
        alter_by_user=user,
        is_enabled=True,
    )
