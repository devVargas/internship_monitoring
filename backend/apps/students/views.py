from rest_framework import viewsets, permissions
from .models import Student, Documents, DocActivity
from .serializers import StudentSerializer, DocumentsSerializer, DocActivitySerializer


class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    permission_classes = [permissions.IsAuthenticated]


class DocumentsViewSet(viewsets.ModelViewSet):
    queryset = Documents.objects.all()
    serializer_class = DocumentsSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Retorna apenas documents do usuário autenticado
        # Admins veem todos
        user = self.request.user
        if user.is_staff:
            return Documents.objects.all()
        return Documents.objects.filter(user=user, is_enabled=1)


class DocActivityViewSet(viewsets.ModelViewSet):
    queryset = DocActivity.objects.all()
    serializer_class = DocActivitySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Filtra activities pelo document_id se passado como query param
        queryset = DocActivity.objects.filter(is_enabled=1)
        document_id = self.request.query_params.get('document_id')
        if document_id:
            queryset = queryset.filter(document__documents_id=document_id)
        return queryset

    def perform_create(self, serializer):
        # Preenche alter_by_user automaticamente com o usuário logado
        serializer.save(alter_by_user=self.request.user)