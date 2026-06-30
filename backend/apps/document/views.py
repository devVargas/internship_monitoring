from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import NotFound, PermissionDenied, ValidationError
from rest_framework.response import Response
from apps.accounts.constants import GROUP_COORDINATOR, GROUP_PROFESSOR, GROUP_SUPERVISOR
from apps.accounts.models import SupervisorProfile
from apps.doc_activity.models import DocumentActivityAction
from apps.doc_activity.services import register_activity
from apps.document.models import Document, DocumentStatus, DocumentType
from apps.document.serializers import DocumentSerializer, DocumentWriteSerializer
from apps.document.services import set_document_status

class DocumentViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ["get", "post", "put", "delete"]

    def get_serializer_class(self):
        if self.action in ["create", "update"]:
            return DocumentWriteSerializer
        return DocumentSerializer

    def get_queryset(self):
        user = self.request.user
        queryset = Document.objects.select_related(
            "student",
            "student__user",
            "supervisor",
            "supervisor__user",
            "related_document",
        ).prefetch_related(
            "activities",
            "activities__performed_by",
        )

        if user.is_superuser:
            return queryset.all()

        if user.groups.filter(name__in=[GROUP_PROFESSOR, GROUP_COORDINATOR]).exists():
            return queryset.all()

        if user.groups.filter(name=GROUP_SUPERVISOR).exists():
            return queryset.filter(supervisor__user=user)

        return queryset.filter(student__user=user)

    def perform_create(self, serializer):
        supervisor_id = serializer.validated_data.pop("supervisor_id", None)
        related_document_id = serializer.validated_data.pop("related_document_id", None)
        related_document = self.get_related_document(related_document_id)
        document_type = serializer.validated_data.get("document_type")

        if document_type == DocumentType.SUPERVISOR_EVALUATION:
            document = self.create_supervisor_document(serializer, related_document)
        else:
            document = self.create_student_document(serializer, supervisor_id, related_document)

        register_activity(
            document=document,
            action=DocumentActivityAction.CREATED,
            user=self.request.user,
            description="Document created.",
        )

    def create_student_document(self, serializer, supervisor_id, related_document):
        try:
            student = self.request.user.student_profile
        except AttributeError as exc:
            raise NotFound("The logged user does not have a student profile.") from exc

        supervisor = self.get_supervisor(supervisor_id)
        initial_status = DocumentStatus.WAITING_SUPERVISOR if supervisor else DocumentStatus.SUBMITTED

        return serializer.save(
            student=student,
            supervisor=supervisor,
            related_document=related_document,
            status=initial_status,
        )

    def create_supervisor_document(self, serializer, related_document):
        if not related_document:
            raise ValidationError({"related_document_id": "Supervisor evaluation must be linked to another document."})

        try:
            supervisor = self.request.user.supervisor_profile
        except AttributeError as exc:
            raise PermissionDenied("The logged user does not have a supervisor profile.") from exc

        if related_document.supervisor_id != supervisor.id:
            raise PermissionDenied("This document is not assigned to this supervisor.")

        return serializer.save(
            student=related_document.student,
            supervisor=supervisor,
            related_document=related_document,
            status=DocumentStatus.SUBMITTED,
        )

    def perform_update(self, serializer):
        document = serializer.instance
        user = self.request.user

        self.validate_update_permission(document, user)

        supervisor_id = serializer.validated_data.pop("supervisor_id", None)
        related_document_id = serializer.validated_data.pop("related_document_id", None)
        supervisor = self.get_supervisor(supervisor_id) if supervisor_id is not None else document.supervisor
        related_document = (
            self.get_related_document(related_document_id)
            if related_document_id is not None
            else document.related_document
        )
        document = serializer.save(supervisor=supervisor, related_document=related_document)

        register_activity(
            document=document,
            action=DocumentActivityAction.UPDATED,
            user=user,
            description="Document updated.",
        )

    def validate_update_permission(self, document, user):
        if user.is_staff or user.is_superuser:
            return

        if document.status in [DocumentStatus.APPROVED, DocumentStatus.REJECTED, DocumentStatus.CANCELLED]:
            raise PermissionDenied("Document cannot be edited in this status.")

        if document.document_type == DocumentType.SUPERVISOR_EVALUATION:
            try:
                supervisor = user.supervisor_profile
            except AttributeError as exc:
                raise PermissionDenied("The logged user does not have a supervisor profile.") from exc

            if document.supervisor_id != supervisor.id:
                raise PermissionDenied("Only the assigned supervisor can edit this document.")
            return

        if document.student.user_id != user.id:
            raise PermissionDenied("Only the student owner can edit this document.")

    def destroy(self, request, *args, **kwargs):
        document = self.get_object()

        if not request.user.is_staff and not request.user.is_superuser and document.student.user_id != request.user.id:
            raise PermissionDenied("Only the student owner can cancel this document.")

        set_document_status(
            document=document,
            status=DocumentStatus.CANCELLED,
            user=request.user,
            description="Document cancelled.",
        )
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=["post"])
    def review(self, request, pk=None):
        self.check_document_permission("documents.review_document")
        document = self.get_object()
        set_document_status(
            document=document,
            status=DocumentStatus.IN_REVIEW,
            user=request.user,
            description="Document marked as in review.",
        )
        return Response(DocumentSerializer(document, context={"request": request}).data)

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        self.check_document_permission("documents.approve_document")
        document = self.get_object()

        if document.supervisor_id and document.document_type != DocumentType.SUPERVISOR_EVALUATION:
            has_approved_supervisor_document = document.related_documents.filter(
                document_type=DocumentType.SUPERVISOR_EVALUATION,
                status=DocumentStatus.APPROVED,
            ).exists()

            if not has_approved_supervisor_document:
                raise ValidationError("Supervisor evaluation must be approved before approving this document.")

        set_document_status(
            document=document,
            status=DocumentStatus.APPROVED,
            user=request.user,
            description="Document approved.",
        )
        return Response(DocumentSerializer(document, context={"request": request}).data)

    @action(detail=True, methods=["post"])
    def reject(self, request, pk=None):
        self.check_document_permission("documents.reject_document")
        document = self.get_object()
        set_document_status(
            document=document,
            status=DocumentStatus.REJECTED,
            user=request.user,
            description="Document rejected.",
        )
        return Response(DocumentSerializer(document, context={"request": request}).data)

    def get_supervisor(self, supervisor_id):
        if not supervisor_id:
            return None

        try:
            return SupervisorProfile.objects.get(id=supervisor_id)
        except SupervisorProfile.DoesNotExist as exc:
            raise ValidationError({"supervisor_id": "Supervisor not found."}) from exc

    def get_related_document(self, related_document_id):
        if not related_document_id:
            return None

        try:
            return Document.objects.get(id=related_document_id)
        except Document.DoesNotExist as exc:
            raise ValidationError({"related_document_id": "Related document not found."}) from exc

    def check_document_permission(self, permission):
        user = self.request.user

        if user.is_superuser:
            return

        if not user.has_perm(permission):
            raise PermissionDenied("User does not have permission to perform this action.")
