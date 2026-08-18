from rest_framework import permissions, viewsets

from apps.accounts.constants import GROUP_COORDINATOR, GROUP_PROFESSOR, GROUP_SUPERVISOR
from apps.doc_activity.models import DocumentActivity
from apps.doc_activity.serializers import DocumentActivitySerializer


class DocumentActivityViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = DocumentActivitySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = DocumentActivity.objects.select_related(
            "document",
            "document__student",
            "document__student__user",
            "document__supervisor",
            "document__supervisor__user",
            "performed_by",
        )

        document_id = self.request.query_params.get("document_id")

        if document_id:
            queryset = queryset.filter(document_id=document_id)

        if user.is_staff or user.is_superuser:
            return queryset

        if user.groups.filter(name__in=[GROUP_PROFESSOR, GROUP_COORDINATOR]).exists():
            return queryset

        if user.groups.filter(name=GROUP_SUPERVISOR).exists():
            return queryset.filter(document__supervisor__user=user)

        return queryset.filter(document__student__user=user)
