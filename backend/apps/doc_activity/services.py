from apps.doc_activity.models import DocumentActivity

def register_activity(document, action, user, description=""):
    return DocumentActivity.objects.create(
        document=document,
        action=action,
        description=description,
        performed_by=user,
    )
