from django.contrib.auth import get_user_model
from django.db import transaction
from django.db.models import Q
from django.http import FileResponse
from django.utils import timezone
from drf_spectacular.utils import extend_schema
from rest_framework import parsers, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import NotFound, PermissionDenied, ValidationError
from rest_framework.response import Response

from apps.accounts.constants import GROUP_COORDINATOR, GROUP_PROFESSOR, GROUP_SUPERVISOR
from apps.accounts.models import SupervisorProfile
from apps.doc_activity.models import DocumentActivityAction
from apps.doc_activity.services import register_activity
from apps.document.models import Document, DocumentStatus, DocumentType, PdfGenerationStatus
from apps.document.pdf_generation import queue_document_pdf
from apps.document.serializers import (
    DocumentAdvisorAssignmentSerializer,
    DocumentRequiredCommentSerializer,
    DocumentReviewActionSerializer,
    DocumentReviewListSerializer,
    DocumentSerializer,
    DocumentWriteSerializer,
    SignedDocumentUploadSerializer,
)
from apps.document.services import set_document_status

User = get_user_model()


class DocumentViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ["get", "post", "put", "delete"]

    def get_serializer_class(self):
        if self.action in ["create", "update"]:
            return DocumentWriteSerializer

        if self.action == "review_queue":
            return DocumentReviewListSerializer

        if self.action == "assign_advisor":
            return DocumentAdvisorAssignmentSerializer

        return DocumentSerializer

    def get_queryset(self):
        user = self.request.user
        queryset = Document.objects.select_related(
            "student",
            "student__user",
            "supervisor",
            "supervisor__user",
            "advisor",
            "reviewed_by",
            "related_document",
        ).prefetch_related(
            "activities",
            "activities__performed_by",
            "related_documents",
        )

        if user.is_superuser:
            return queryset.all()

        # A coordenação acompanha o fluxo inteiro e pode visualizar todos os
        # documentos, inclusive para corrigir a atribuição de orientador.
        if user.groups.filter(name=GROUP_COORDINATOR).exists():
            return queryset.all()

        # Professor acessa apenas o estágio obrigatório atribuído a ele e a
        # respectiva ficha de avaliação assinada. Os estados anteriores ao
        # envio final do aluno continuam invisíveis para o orientador.
        if user.groups.filter(name=GROUP_PROFESSOR).exists():
            reviewable_statuses = [
                DocumentStatus.SUBMITTED,
                DocumentStatus.IN_REVIEW,
                DocumentStatus.ADJUSTMENT_REQUESTED,
                DocumentStatus.APPROVED,
                DocumentStatus.REJECTED,
            ]
            return queryset.filter(
                Q(
                    document_type=DocumentType.MANDATORY_INTERNSHIP,
                    advisor=user,
                    status__in=reviewable_statuses,
                )
                | Q(
                    document_type=DocumentType.SUPERVISOR_EVALUATION,
                    related_document__advisor=user,
                    related_document__status__in=reviewable_statuses,
                )
            ).distinct()

        if user.groups.filter(name=GROUP_SUPERVISOR).exists():
            return queryset.filter(supervisor__user=user)

        return queryset.filter(student__user=user)

    @transaction.atomic
    def perform_create(self, serializer):
        supervisor_id = serializer.validated_data.pop("supervisor_id", None)
        advisor_id = serializer.validated_data.pop("advisor_id", None)
        related_document_id = serializer.validated_data.pop("related_document_id", None)
        related_document = self.get_related_document(related_document_id)
        document_type = serializer.validated_data.get("document_type")

        if document_type == DocumentType.SUPERVISOR_EVALUATION:
            document = self.create_supervisor_document(
                serializer,
                related_document,
            )
        else:
            document = self.create_student_document(
                serializer,
                supervisor_id,
                advisor_id,
                related_document,
            )

        register_activity(
            document=document,
            action=DocumentActivityAction.CREATED,
            user=self.request.user,
            description="Documento criado.",
        )
        queue_document_pdf(document)

    def create_student_document(
        self,
        serializer,
        supervisor_id,
        advisor_id,
        related_document,
    ):
        user = self.request.user

        try:
            student = user.student_profile
        except AttributeError as exc:
            raise NotFound("The logged user does not have a student profile.") from exc

        supervisor = self.get_supervisor(supervisor_id)
        advisor = self.get_advisor(advisor_id)
        form_data = dict(serializer.validated_data.get("form_data", {}))

        student_snapshot = self.build_student_snapshot(
            student=student,
            form_data=form_data,
        )

        return serializer.save(
            student=student,
            supervisor=supervisor,
            advisor=advisor,
            related_document=related_document,
            status=DocumentStatus.AWAITING_SIGNATURE,
            student_name=student_snapshot["name"],
            student_email=student_snapshot["email"],
            student_registration_number=student_snapshot["registration_number"],
            student_course=student_snapshot["course"],
            student_campus=student_snapshot["campus"],
            student_snapshot=student_snapshot,
            company=serializer.validated_data.get("company", ""),
            city=serializer.validated_data.get("city", ""),
            document_date=timezone.localdate(),
        )

    def create_supervisor_document(
        self,
        serializer,
        related_document,
    ):
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
            raise PermissionDenied(
                "The logged user does not have a supervisor profile."
            ) from exc

        related_document = Document.objects.select_for_update().get(
            pk=related_document.pk
        )

        if related_document.supervisor_id != supervisor.id:
            raise PermissionDenied(
                "This document is not assigned to this supervisor."
            )

        if related_document.status != DocumentStatus.WAITING_SUPERVISOR:
            raise ValidationError(
                {
                    "related_document_id": (
                        "This document is no longer waiting for "
                        "a supervisor evaluation."
                    )
                }
            )

        if related_document.related_documents.filter(
            document_type=DocumentType.SUPERVISOR_EVALUATION,
        ).exists():
            raise ValidationError(
                {
                    "related_document_id": (
                        "A supervisor evaluation already exists "
                        "for this document."
                    )
                }
            )

        form_data = dict(serializer.validated_data.get("form_data", {}))
        form_data["registroConselhoSupervisor"] = (
            supervisor.professional_registration
        )

        document = serializer.save(
            student=related_document.student,
            supervisor=supervisor,
            advisor=related_document.advisor,
            related_document=related_document,
            status=DocumentStatus.AWAITING_SIGNATURE,
            student_name=related_document.student_name,
            student_email=related_document.student_email,
            student_registration_number=(
                related_document.student_registration_number
            ),
            student_course=related_document.student_course,
            student_campus=related_document.student_campus,
            student_snapshot=related_document.student_snapshot,
            company=related_document.company,
            city=supervisor.company_city,
            form_data=form_data,
            document_date=timezone.localdate(),
        )

        return document

    @transaction.atomic
    def perform_update(self, serializer):
        document = serializer.instance
        user = self.request.user
        previous_status = document.status

        self.validate_update_permission(document, user)

        supervisor_id = serializer.validated_data.pop("supervisor_id", None)
        advisor_id = serializer.validated_data.pop("advisor_id", None)
        related_document_id = serializer.validated_data.pop("related_document_id", None)

        new_attachment = serializer.validated_data.get("attachment", None)
        if new_attachment and document.attachment:
            document.attachment.delete(save=False)

        supervisor = (
            self.get_supervisor(supervisor_id)
            if supervisor_id is not None
            else document.supervisor
        )
        related_document = (
            self.get_related_document(related_document_id)
            if related_document_id is not None
            else document.related_document
        )

        advisor = document.advisor
        if advisor_id is not None:
            requested_advisor = self.get_advisor(advisor_id)
            if requested_advisor != document.advisor:
                if not self.can_manage_advisor(user):
                    raise PermissionDenied(
                        "Somente a coordenação pode alterar o orientador após o envio."
                    )
                advisor = requested_advisor

        save_kwargs = {
            "supervisor": supervisor,
            "advisor": advisor,
            "related_document": related_document,
        }

        if document.document_type != DocumentType.SUPERVISOR_EVALUATION:
            form_data = dict(serializer.validated_data.get("form_data", {}))
            student_snapshot = self.build_student_snapshot(
                student=document.student,
                form_data=form_data,
                previous_snapshot=document.student_snapshot,
            )
            save_kwargs.update(
                student_name=student_snapshot["name"],
                student_email=student_snapshot["email"],
                student_registration_number=student_snapshot["registration_number"],
                student_course=student_snapshot["course"],
                student_campus=student_snapshot["campus"],
                student_snapshot=student_snapshot,
            )
        elif supervisor is not None:
            form_data = dict(serializer.validated_data.get("form_data", {}))
            form_data["registroConselhoSupervisor"] = (
                supervisor.professional_registration
            )
            save_kwargs.update(
                advisor=(related_document.advisor if related_document else advisor),
                city=supervisor.company_city,
                form_data=form_data,
                student_snapshot=(
                    related_document.student_snapshot
                    if related_document
                    else document.student_snapshot
                ),
            )

        document = serializer.save(**save_kwargs)

        register_activity(
            document=document,
            action=DocumentActivityAction.UPDATED,
            user=user,
            description="Documento atualizado.",
        )

        if previous_status == DocumentStatus.ADJUSTMENT_REQUESTED:
            self.clear_document_signature(document)
            document.reviewed_by = None
            document.save(update_fields=["reviewed_by", "updated_at"])
            set_document_status(
                document=document,
                status=DocumentStatus.AWAITING_SIGNATURE,
                user=user,
                description=(
                    "Ajustes salvos. Gere e assine novamente o PDF antes de "
                    "reenviar o documento."
                ),
            )

        queue_document_pdf(document)

    def validate_update_permission(self, document, user):
        if user.is_superuser:
            return

        if document.status != DocumentStatus.ADJUSTMENT_REQUESTED:
            raise PermissionDenied(
                "Somente documentos com ajustes solicitados podem ser editados."
            )

        if document.document_type == DocumentType.SUPERVISOR_EVALUATION:
            try:
                supervisor = user.supervisor_profile
            except AttributeError as exc:
                raise PermissionDenied(
                    "The logged user does not have a supervisor profile."
                ) from exc

            if document.supervisor_id != supervisor.id:
                raise PermissionDenied(
                    "Only the assigned supervisor can edit this document."
                )

            return

        if document.student.user_id != user.id:
            raise PermissionDenied(
                "Only the student owner can edit this document."
            )

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
            document_type=DocumentType.SUPERVISOR_EVALUATION,
        ).exclude(
            status__in=[
                DocumentStatus.AWAITING_SIGNATURE,
                DocumentStatus.WAITING_SUPERVISOR,
                DocumentStatus.WAITING_STUDENT_CONFIRMATION,
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
        self.validate_can_review_document(document, request.user)

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
        request=DocumentAdvisorAssignmentSerializer,
        responses=DocumentSerializer,
    )
    @action(detail=True, methods=["post"], url_path="assign-advisor")
    def assign_advisor(self, request, pk=None):
        if not self.can_manage_advisor(request.user):
            raise PermissionDenied("Somente a coordenação pode alterar o orientador.")

        document = self.get_object()
        if document.document_type not in {
            DocumentType.MANDATORY_INTERNSHIP,
            DocumentType.NON_MANDATORY_INTERNSHIP_CREDIT,
        }:
            raise ValidationError(
                "Este tipo de documento não utiliza orientador acadêmico."
            )

        if document.status in {
            DocumentStatus.APPROVED,
            DocumentStatus.REJECTED,
            DocumentStatus.CANCELLED,
        }:
            raise ValidationError(
                "O orientador não pode ser alterado neste estado do documento."
            )

        serializer = DocumentAdvisorAssignmentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        advisor = self.get_advisor(serializer.validated_data["advisor_id"])

        if document.advisor_id == advisor.id:
            return Response(
                DocumentSerializer(document, context={"request": request}).data
            )

        old_advisor = document.advisor
        old_name = (
            old_advisor.get_full_name() or old_advisor.email
            if old_advisor
            else "não definido"
        )
        new_name = advisor.get_full_name() or advisor.email
        had_signature = bool(document.attachment and document.signed_at)

        document.advisor = advisor
        document.reviewed_by = None

        # Trocar o orientador altera conteúdo do PDF. Se o aluno já tinha
        # assinado, aquela assinatura não pode representar o novo arquivo.
        if had_signature:
            self.clear_document_signature(document)
            document.status = DocumentStatus.AWAITING_SIGNATURE
            document.save(
                update_fields=[
                    "advisor",
                    "reviewed_by",
                    "status",
                    "updated_at",
                ]
            )
            register_activity(
                document=document,
                action=DocumentActivityAction.AWAITING_SIGNATURE,
                user=request.user,
                description=(
                    f"Orientador alterado de {old_name} para {new_name}. "
                    "O PDF foi atualizado e precisa ser assinado novamente pelo aluno."
                ),
            )
        elif document.status == DocumentStatus.IN_REVIEW:
            document.status = DocumentStatus.SUBMITTED
            document.save(
                update_fields=[
                    "advisor",
                    "reviewed_by",
                    "status",
                    "updated_at",
                ]
            )
            register_activity(
                document=document,
                action=DocumentActivityAction.SUBMITTED,
                user=request.user,
                description=(
                    f"Orientador alterado de {old_name} para {new_name}. "
                    "Documento devolvido para a fila de revisão."
                ),
            )
        else:
            document.save(
                update_fields=["advisor", "reviewed_by", "updated_at"]
            )
            register_activity(
                document=document,
                action=DocumentActivityAction.UPDATED,
                user=request.user,
                description=f"Orientador alterado de {old_name} para {new_name}.",
            )

        queue_document_pdf(document)
        return Response(
            DocumentSerializer(document, context={"request": request}).data
        )

    @action(detail=True, methods=["get"], url_path="pdf-status")
    def pdf_status(self, request, pk=None):
        document = self.get_object()
        return Response(
            {
                "status": document.pdf_generation_status,
                "error": document.pdf_generation_error,
                "generated_at": document.pdf_generated_at,
            }
        )

    @action(detail=True, methods=["post"], url_path="generate-pdf")
    def generate_pdf(self, request, pk=None):
        document = self.get_object()
        if document.status == DocumentStatus.CANCELLED:
            raise ValidationError("Documento cancelado não pode gerar um novo PDF.")

        queue_document_pdf(document)
        return Response(
            DocumentSerializer(document, context={"request": request}).data,
            status=status.HTTP_202_ACCEPTED,
        )

    @action(detail=True, methods=["get"], url_path="generated-pdf")
    def generated_pdf(self, request, pk=None):
        document = self.get_object()
        if (
            document.pdf_generation_status != PdfGenerationStatus.READY
            or not document.generated_pdf
        ):
            raise ValidationError("O PDF ainda não está disponível.")

        document.generated_pdf.open("rb")
        return FileResponse(
            document.generated_pdf.file,
            content_type="application/pdf",
            as_attachment=False,
            filename=document.generated_pdf.name.rsplit("/", 1)[-1],
        )

    @extend_schema(
        request=SignedDocumentUploadSerializer,
        responses=DocumentSerializer,
    )
    @action(
        detail=True,
        methods=["post"],
        url_path="upload-signed-pdf",
        parser_classes=[parsers.MultiPartParser, parsers.FormParser],
    )
    @transaction.atomic
    def upload_signed_pdf(self, request, pk=None):
        document = self.get_object()
        self.validate_can_sign_document(document, request.user)

        if document.status != DocumentStatus.AWAITING_SIGNATURE:
            raise ValidationError(
                "Este documento não está aguardando assinatura."
            )

        if (
            document.pdf_generation_status != PdfGenerationStatus.READY
            or not document.generated_pdf
        ):
            raise ValidationError(
                "Aguarde a geração do PDF antes de enviar a versão assinada."
            )

        serializer = SignedDocumentUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        if document.attachment:
            document.attachment.delete(save=False)

        document.attachment = serializer.validated_data["signed_pdf"]
        document.signature_method = serializer.validated_data["signature_method"]
        document.signed_at = timezone.now()
        document.save(
            update_fields=[
                "attachment",
                "signature_method",
                "signed_at",
                "updated_at",
            ]
        )

        register_activity(
            document=document,
            action=DocumentActivityAction.SIGNED,
            user=request.user,
            description="PDF assinado enviado ao sistema.",
        )

        self.advance_after_signature(document, request.user)
        document.refresh_from_db()
        return Response(
            DocumentSerializer(document, context={"request": request}).data
        )

    @action(detail=True, methods=["get"], url_path="signed-pdf")
    def signed_pdf(self, request, pk=None):
        document = self.get_object()
        if not document.attachment or not document.signed_at:
            raise ValidationError("O PDF assinado ainda não está disponível.")

        document.attachment.open("rb")
        return FileResponse(
            document.attachment.file,
            content_type="application/pdf",
            as_attachment=False,
            filename=document.attachment.name.rsplit("/", 1)[-1],
        )

    @action(detail=True, methods=["post"], url_path="final-submit")
    @transaction.atomic
    def final_submit(self, request, pk=None):
        document = self.get_object()

        if document.document_type != DocumentType.MANDATORY_INTERNSHIP:
            raise ValidationError(
                "A confirmação final do aluno é usada apenas no estágio obrigatório."
            )

        if not request.user.is_superuser and document.student.user_id != request.user.id:
            raise PermissionDenied(
                "Somente o aluno responsável pode enviar o documento para revisão."
            )

        if document.status != DocumentStatus.WAITING_STUDENT_CONFIRMATION:
            raise ValidationError(
                "O documento ainda não está aguardando a confirmação final do aluno."
            )

        if not document.attachment or not document.signed_at:
            raise ValidationError("O relatório do aluno precisa estar assinado.")

        evaluation = self.get_signed_supervisor_evaluation(document)
        if evaluation is None:
            raise ValidationError(
                "A ficha de avaliação assinada pelo supervisor ainda não está disponível."
            )

        document.reviewed_by = None
        document.save(update_fields=["reviewed_by", "updated_at"])
        set_document_status(
            document=document,
            status=DocumentStatus.SUBMITTED,
            user=request.user,
            description=(
                "Aluno conferiu o relatório e a avaliação do supervisor e "
                "enviou o processo para revisão acadêmica."
            ),
        )
        return Response(
            DocumentSerializer(document, context={"request": request}).data
        )

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

        if (
            document.document_type == DocumentType.MANDATORY_INTERNSHIP
            and document.supervisor_id
        ):
            has_signed_supervisor_document = document.related_documents.filter(
                document_type=DocumentType.SUPERVISOR_EVALUATION,
                signed_at__isnull=False,
                attachment__isnull=False,
            ).exclude(attachment="").exists()

            if not has_signed_supervisor_document:
                raise ValidationError(
                    "A ficha de avaliação assinada pelo supervisor é obrigatória."
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
        self.validate_can_review_document(document, user)

        if document.status != DocumentStatus.IN_REVIEW:
            raise ValidationError(
                "O documento precisa estar em revisão antes de receber uma decisão."
            )

        if document.reviewed_by_id != user.id and not user.is_superuser:
            raise PermissionDenied("Somente o responsável pela revisão pode concluir esta análise.")

    def validate_can_review_document(self, document, user):
        if user.is_superuser:
            return

        is_coordinator = user.groups.filter(name=GROUP_COORDINATOR).exists()
        is_professor = user.groups.filter(name=GROUP_PROFESSOR).exists()

        if document.document_type == DocumentType.MANDATORY_INTERNSHIP:
            if not (is_professor or is_coordinator):
                raise PermissionDenied(
                    "Somente um orientador acadêmico pode revisar este estágio."
                )
            if document.advisor_id != user.id:
                raise PermissionDenied(
                    "Somente o orientador designado pode revisar este estágio."
                )
            return

        if not is_coordinator:
            raise PermissionDenied(
                "Somente a coordenação pode revisar este tipo de documento."
            )

    def get_supervisor(self, supervisor_id):
        if not supervisor_id:
            return None

        try:
            return SupervisorProfile.objects.get(id=supervisor_id)
        except SupervisorProfile.DoesNotExist as exc:
            raise ValidationError({"supervisor_id": "Supervisor not found."}) from exc

    def get_advisor(self, advisor_id):
        if not advisor_id:
            return None

        try:
            return User.objects.filter(
                id=advisor_id,
                is_active=True,
                groups__name__in=[GROUP_PROFESSOR, GROUP_COORDINATOR],
            ).distinct().get()
        except User.DoesNotExist as exc:
            raise ValidationError(
                {"advisor_id": "Orientador não encontrado ou sem perfil acadêmico válido."}
            ) from exc

    def get_related_document(self, related_document_id):
        if not related_document_id:
            return None

        try:
            return Document.objects.get(id=related_document_id)
        except Document.DoesNotExist as exc:
            raise ValidationError({"related_document_id": "Related document not found."}) from exc

    @staticmethod
    def build_student_snapshot(student, form_data, previous_snapshot=None):
        user = student.user
        previous = previous_snapshot or {}

        def value(form_key, snapshot_key, profile_value):
            # Se o campo pertence a este formulário, até um valor vazio é uma
            # decisão do usuário e deve substituir o snapshot anterior.
            if form_key in form_data:
                return form_data.get(form_key) or ""
            if snapshot_key in previous:
                return previous.get(snapshot_key, "")
            return profile_value

        return {
            "name": value("nomeAluno", "name", user.get_full_name()),
            "email": value("emailAluno", "email", user.email),
            "registration_number": value(
                "matriculaAluno",
                "registration_number",
                student.registration_number,
            ),
            "course": value("cursoAluno", "course", student.course),
            "campus": value("campusAluno", "campus", student.campus),
            "phone_number": value(
                "telefoneAluno",
                "phone_number",
                student.phone_number,
            ),
            "mobile_number": value(
                "celularAluno",
                "mobile_number",
                student.mobile_number,
            ),
            "zip_code": value("cepAluno", "zip_code", student.zip_code),
            "address": value("enderecoAluno", "address", student.address),
            "address_number": value(
                "numeroEnderecoAluno",
                "address_number",
                student.address_number,
            ),
            "address_complement": value(
                "complementoEnderecoAluno",
                "address_complement",
                student.address_complement,
            ),
            "neighborhood": value(
                "bairroAluno",
                "neighborhood",
                student.neighborhood,
            ),
            "city": value("cidadeAluno", "city", student.city),
            "state": value("ufAluno", "state", student.state),
        }

    def validate_can_sign_document(self, document, user):
        if user.is_superuser:
            return

        if document.document_type == DocumentType.SUPERVISOR_EVALUATION:
            if not document.supervisor or document.supervisor.user_id != user.id:
                raise PermissionDenied(
                    "Somente o supervisor responsável pode assinar esta avaliação."
                )
            return

        if document.student.user_id != user.id:
            raise PermissionDenied(
                "Somente o aluno responsável pode assinar este documento."
            )

    @staticmethod
    def get_signed_supervisor_evaluation(document):
        return (
            document.related_documents.filter(
                document_type=DocumentType.SUPERVISOR_EVALUATION,
                signed_at__isnull=False,
                attachment__isnull=False,
            )
            .exclude(attachment="")
            .order_by("-id")
            .first()
        )

    def advance_after_signature(self, document, user):
        if document.document_type == DocumentType.SUPERVISOR_EVALUATION:
            set_document_status(
                document=document,
                status=DocumentStatus.SIGNED,
                user=user,
                description="Ficha de avaliação assinada pelo supervisor.",
            )

            related_document = Document.objects.select_for_update().get(
                pk=document.related_document_id
            )
            set_document_status(
                document=related_document,
                status=DocumentStatus.WAITING_STUDENT_CONFIRMATION,
                user=user,
                description=(
                    "Avaliação do supervisor recebida. Aguardando o aluno "
                    "conferir os documentos e enviar para revisão acadêmica."
                ),
            )
            return

        if document.document_type == DocumentType.MANDATORY_INTERNSHIP:
            if self.get_signed_supervisor_evaluation(document):
                next_status = DocumentStatus.WAITING_STUDENT_CONFIRMATION
                description = (
                    "Relatório assinado. A avaliação do supervisor já está disponível; "
                    "aguardando confirmação final do aluno."
                )
            else:
                next_status = DocumentStatus.WAITING_SUPERVISOR
                description = (
                    "Relatório assinado pelo aluno e encaminhado ao supervisor "
                    "para avaliação."
                )

            set_document_status(
                document=document,
                status=next_status,
                user=user,
                description=description,
            )
            return

        set_document_status(
            document=document,
            status=DocumentStatus.SUBMITTED,
            user=user,
            description="Documento assinado e enviado para revisão da coordenação.",
        )

    @staticmethod
    def clear_document_signature(document):
        if document.attachment:
            document.attachment.delete(save=False)

        document.attachment = None
        document.signature_method = ""
        document.signed_at = None
        document.save(
            update_fields=[
                "attachment",
                "signature_method",
                "signed_at",
                "updated_at",
            ]
        )

    @staticmethod
    def can_manage_advisor(user):
        return bool(
            user.is_superuser
            or user.groups.filter(name=GROUP_COORDINATOR).exists()
        )

    def check_document_permission(self, permission):
        user = self.request.user

        if user.is_superuser:
            return

        if not user.has_perm(permission):
            raise PermissionDenied("User does not have permission to perform this action.")
