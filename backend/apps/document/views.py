from django.db.models import Q
from django.utils import timezone
from drf_spectacular.utils import extend_schema
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import NotFound, PermissionDenied, ValidationError
from rest_framework.response import Response

from apps.accounts.constants import GROUP_COORDINATOR, GROUP_PROFESSOR, GROUP_SUPERVISOR
from apps.accounts.models import SupervisorProfile
from apps.doc_activity.models import DocumentActivityAction
from apps.doc_activity.services import register_activity
from apps.document.models import Document, DocumentStatus, DocumentType
from apps.document.serializers import (
    DocumentRequiredCommentSerializer,
    DocumentReviewActionSerializer,
    DocumentReviewListSerializer,
    DocumentSerializer,
    DocumentWriteSerializer,
)
from apps.document.services import set_document_status


class DocumentViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ["get", "post", "put", "delete"]

    def get_serializer_class(self):
        if self.action in ["create", "update"]:
            return DocumentWriteSerializer

        if self.action == "review_queue":
            return DocumentReviewListSerializer

        return DocumentSerializer

    def get_queryset(self):
        user = self.request.user
        queryset = Document.objects.select_related(
            "student",
            "student__user",
            "supervisor",
            "supervisor__user",
            "reviewed_by",
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
            description="Documento criado.",
        )

    def create_student_document(self, serializer, supervisor_id, related_document):
        user = self.request.user

        try:
            student = user.student_profile
        except AttributeError as exc:
            raise NotFound("The logged user does not have a student profile.") from exc

        supervisor = self.get_supervisor(supervisor_id)
        initial_status = (
            DocumentStatus.WAITING_SUPERVISOR if supervisor else DocumentStatus.SUBMITTED
        )

        return serializer.save(
            student=student,
            supervisor=supervisor,
            related_document=related_document,
            status=initial_status,
            student_name=user.get_full_name(),
            student_email=user.email,
            student_registration_number=student.registration_number,
            student_course=student.course,
            student_campus=student.campus,
            document_date=timezone.now().date(),
        )

    def create_supervisor_document(self, serializer, related_document):
        if not related_document:
            raise ValidationError(
                {
                    "related_document_id": (
                        "Supervisor evaluation must be linked to another document."
                    )
                }
            )

        try:
            supervisor = self.request.user.supervisor_profile
        except AttributeError as exc:
            raise PermissionDenied("The logged user does not have a supervisor profile.") from exc

        if related_document.supervisor_id != supervisor.id:
            raise PermissionDenied("This document is not assigned to this supervisor.")

        related_document.status = DocumentStatus.SUBMITTED
        related_document.save()

        return serializer.save(
            student=related_document.student,
            supervisor=supervisor,
            related_document=related_document,
            status=DocumentStatus.SUBMITTED,
            student_name=related_document.student_name,
            student_email=related_document.student_email,
            student_registration_number=related_document.student_registration_number,
            student_course=related_document.student_course,
            student_campus=related_document.student_campus,
            company=related_document.company,
            document_date=timezone.now().date(),
        )

    def perform_update(self, serializer):
        document = serializer.instance
        user = self.request.user

        self.validate_update_permission(document, user)

        supervisor_id = serializer.validated_data.pop("supervisor_id", None)
        related_document_id = serializer.validated_data.pop("related_document_id", None)
        supervisor = (
            self.get_supervisor(supervisor_id) if supervisor_id is not None else document.supervisor
        )
        related_document = (
            self.get_related_document(related_document_id)
            if related_document_id is not None
            else document.related_document
        )
        document = serializer.save(
            supervisor=supervisor,
            related_document=related_document,
        )

        register_activity(
            document=document,
            action=DocumentActivityAction.UPDATED,
            user=user,
            description="Documento atualizado.",
        )

        if document.status == DocumentStatus.ADJUSTMENT_REQUESTED:
            document.reviewed_by = None
            document.save(update_fields=["reviewed_by"])
            set_document_status(
                document=document,
                status=DocumentStatus.SUBMITTED,
                user=user,
                description="Documento reenviado após os ajustes.",
            )

    def validate_update_permission(self, document, user):
        if user.is_staff or user.is_superuser:
            return

        if document.status in [
            DocumentStatus.APPROVED,
            DocumentStatus.REJECTED,
            DocumentStatus.CANCELLED,
        ]:
            raise PermissionDenied("Document cannot be edited in this status.")

        if document.document_type == DocumentType.SUPERVISOR_EVALUATION:
            try:
                supervisor = user.supervisor_profile
            except AttributeError as exc:
                raise PermissionDenied(
                    "The logged user does not have a supervisor profile."
                ) from exc

            if document.supervisor_id != supervisor.id:
                raise PermissionDenied("Only the assigned supervisor can edit this document.")
            return

        if document.student.user_id != user.id:
            raise PermissionDenied("Only the student owner can edit this document.")

    def destroy(self, request, *args, **kwargs):
        document = self.get_object()

        if (
            not request.user.is_staff
            and not request.user.is_superuser
            and document.student.user_id != request.user.id
        ):
            raise PermissionDenied("Only the student owner can cancel this document.")

        set_document_status(
            document=document,
            status=DocumentStatus.CANCELLED,
            user=request.user,
            description="Documento cancelado.",
        )
        return Response(status=status.HTTP_204_NO_CONTENT)

    @extend_schema(responses=DocumentReviewListSerializer(many=True))
    @action(detail=False, methods=["get"], url_path="review-queue")
    def review_queue(self, request):
        self.check_document_permission("document.review_document")

        queryset = self.get_queryset().exclude(
            status__in=[
                DocumentStatus.WAITING_SUPERVISOR,
                DocumentStatus.CANCELLED,
            ]
        )

        requested_status = request.query_params.get("status", "").strip()
        document_type = request.query_params.get("document_type", "").strip()
        search = request.query_params.get("search", "").strip()

        if requested_status:
            if requested_status not in DocumentStatus.values:
                raise ValidationError({"status": "Status inválido."})
            queryset = queryset.filter(status=requested_status)

        if document_type:
            if document_type not in DocumentType.values:
                raise ValidationError({"document_type": "Tipo de documento inválido."})
            queryset = queryset.filter(document_type=document_type)

        if search:
            queryset = queryset.filter(
                Q(student_name__icontains=search)
                | Q(student_registration_number__icontains=search)
                | Q(company__icontains=search)
            )

        serializer = DocumentReviewListSerializer(
            queryset.order_by("-updated_at"),
            many=True,
            context={"request": request},
        )
        return Response(serializer.data)

    @extend_schema(request=None, responses=DocumentSerializer)
    @action(detail=True, methods=["post"])
    def review(self, request, pk=None):
        self.check_document_permission("document.review_document")
        document = self.get_object()

        if document.status != DocumentStatus.SUBMITTED:
            raise ValidationError("Somente documentos enviados podem iniciar uma revisão.")

        if document.reviewed_by_id and document.reviewed_by_id != request.user.id:
            reviewer_name = document.reviewed_by.get_full_name() or document.reviewed_by.email
            raise ValidationError(f"Este documento já está em revisão por {reviewer_name}.")

        document.reviewed_by = request.user
        document.save(update_fields=["reviewed_by"])

        set_document_status(
            document=document,
            status=DocumentStatus.IN_REVIEW,
            user=request.user,
            description="Revisão iniciada.",
        )
        return Response(DocumentSerializer(document, context={"request": request}).data)

    @extend_schema(
        request=DocumentReviewActionSerializer,
        responses=DocumentSerializer,
    )
    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        self.check_document_permission("document.approve_document")
        document = self.get_object()
        self.validate_review_decision(document, request.user)

        serializer = DocumentReviewActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        comment = serializer.validated_data.get("comment", "").strip()

        if document.supervisor_id and document.document_type != DocumentType.SUPERVISOR_EVALUATION:
            has_approved_supervisor_document = document.related_documents.filter(
                document_type=DocumentType.SUPERVISOR_EVALUATION,
                status=DocumentStatus.APPROVED,
            ).exists()

            if not has_approved_supervisor_document:
                raise ValidationError(
                    "Supervisor evaluation must be approved before approving this document."
                )

        description = "Documento aprovado."
        if comment:
            description = f"Documento aprovado. Observação: {comment}"

        set_document_status(
            document=document,
            status=DocumentStatus.APPROVED,
            user=request.user,
            description=description,
        )
        return Response(DocumentSerializer(document, context={"request": request}).data)

    @extend_schema(
        request=DocumentRequiredCommentSerializer,
        responses=DocumentSerializer,
    )
    @action(detail=True, methods=["post"], url_path="request-adjustment")
    def request_adjustment(self, request, pk=None):
        self.check_document_permission("document.review_document")
        document = self.get_object()
        self.validate_review_decision(document, request.user)

        serializer = DocumentRequiredCommentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        comment = serializer.validated_data["comment"].strip()

        set_document_status(
            document=document,
            status=DocumentStatus.ADJUSTMENT_REQUESTED,
            user=request.user,
            description=f"Ajustes solicitados: {comment}",
        )
        return Response(DocumentSerializer(document, context={"request": request}).data)

    @extend_schema(
        request=DocumentRequiredCommentSerializer,
        responses=DocumentSerializer,
    )
    @action(detail=True, methods=["post"])
    def reject(self, request, pk=None):
        self.check_document_permission("document.reject_document")
        document = self.get_object()
        self.validate_review_decision(document, request.user)

        serializer = DocumentRequiredCommentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        comment = serializer.validated_data["comment"].strip()

        set_document_status(
            document=document,
            status=DocumentStatus.REJECTED,
            user=request.user,
            description=f"Documento rejeitado: {comment}",
        )
        return Response(DocumentSerializer(document, context={"request": request}).data)

    def validate_review_decision(self, document, user):
        if document.status != DocumentStatus.IN_REVIEW:
            raise ValidationError(
                "O documento precisa estar em revisão antes de receber uma decisão."
            )

        if document.reviewed_by_id != user.id and not user.is_superuser:
            raise PermissionDenied("Somente o responsável pela revisão pode concluir esta análise.")

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
