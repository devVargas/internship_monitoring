from rest_framework import viewsets, permissions, status
from rest_framework.response import Response

from .models import Documents
from .serializers import DocumentsSerializer, DocumentsWriteSerializer
from .services import create_document, disable_document
from apps.core.permissions import IsOwnerOrAdmin


class DocumentsViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return DocumentsWriteSerializer
        return DocumentsSerializer

    def get_queryset(self):
        user = self.request.user
        qs = Documents.objects.select_related("student", "user", "user_admin").prefetch_related("activities")
        if user.is_staff:
            return qs
        return qs.filter(user=user, is_enabled=True)

    def perform_create(self, serializer):
        data = serializer.validated_data
        create_document(
            user=self.request.user,
            user_admin=data.get("user_admin"),
            name=data.get("name"),
            description=data.get("description"),
            student=data.get("student"),
            date_begin=data.get("date_begin"),
            date_end=data.get("date_end"),
        )

    def destroy(self, request, *args, **kwargs):
        document = self.get_object()
        disable_document(document)
        return Response(status=status.HTTP_204_NO_CONTENT)
