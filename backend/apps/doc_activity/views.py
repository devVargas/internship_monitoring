from rest_framework import viewsets, permissions
from .models import DocActivity
from .serializers import DocActivitySerializer
from apps.core.permissions import IsDocumentOwnerOrAdmin


class DocActivityViewSet(viewsets.ModelViewSet):
    serializer_class = DocActivitySerializer
    permission_classes = [permissions.IsAuthenticated, IsDocumentOwnerOrAdmin]

    def get_queryset(self):
        queryset = DocActivity.objects.select_related("document", "alter_by_user").filter(is_enabled=True)
        document_id = self.request.query_params.get("document_id")
        if document_id:
            queryset = queryset.filter(document__documents_id=document_id)
        if not self.request.user.is_staff:
            queryset = queryset.filter(document__user=self.request.user)
        return queryset

    def perform_create(self, serializer):
        serializer.save(alter_by_user=self.request.user)
