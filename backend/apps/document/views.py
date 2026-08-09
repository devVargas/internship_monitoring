from django.contrib.auth import get_user_model
from django.db import transaction
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
    DocumentAdvisorAssignmentSerializer,
    DocumentRequiredCommentSerializer,
    DocumentReviewActionSerializer,
    DocumentReviewListSerializer,
    DocumentSerializer,
    DocumentWriteSerializer,
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
        )

        if user.is_superuser:
            return queryset.all()

        # A coordenação acompanha o fluxo inteiro e pode visualizar todos os
        # documentos, inclusive para corrigir a atribuição de orientador.
        if user.groups.filter(name=GROUP_COORDINATOR).exists():
            return queryset.all()

        # Professor só recebe estágio obrigatório quando foi designado como
        # orientador. Rascunhos ainda pertencem somente ao aluno.
        if user.groups.filter(name=GROUP_PROFESSOR).exists():
            return queryset.filter(
                document_type=DocumentType.MANDATORY_INTERNSHIP,
                advisor=user,
            ).exclude(
                status__in=[
                    DocumentStatus.DRAFT,
                    DocumentStatus.WAITING_SUPERVISOR,
                    DocumentStatus.CANCELLED,
                ]
            )

        if user.groups.filter(name=GROUP_SUPERVISOR).exists():
            return queryset.filter(supervisor__user=user).exclude(
                status=DocumentStatus.DRAFT,
                document_type__in=[
                    DocumentType.MANDATORY_INTERNSHIP,
                    DocumentType.NON_MANDATORY_INTERNSHIP_CREDIT,
                    DocumentType.PROFESSIONAL_PRACTICE_CREDIT,
                ],
            )

        return queryset.filter(student__user=user)

    @transaction.atomic
    def perform_create(self, serializer):
        save_as_draft = serializer.validated_data.pop("save_as_draft", False)
        supervisor_id = serializer.validated_data.pop("supervisor_id", None)
        advisor_id = serializer.validated_data.pop("advisor_id", None)
        related_document_id = serializer.validated_data.pop("related_document_id", None)
        related_document = self.get_related_document(related_document_id)
        document_type = serializer.validated_data.get("document_type")

        if document_type == DocumentType.SUPERVISOR_EVALUATION:
            document = self.create_supervisor_document(
                serializer,
                related_document,
                save_as_draft=save_as_draft,
            )
        else:
            document = self.create_student_document(
                serializer,
                supervisor_id,
                advisor_id,
                related_document,
                save_as_draft=save_as_draft,
            )

        register_activity(
            document=document,
            action=DocumentActivityAction.CREATED,
            user=self.request.user,
            description=(
                "Rascunho criado."
                if document.status == DocumentStatus.DRAFT
                else "Documento criado."
            ),
        )

    def create_student_document(
        self,
        serializer,
        supervisor_id,
        advisor_id,
        related_document,
        *,
        save_as_draft,
    ):
        user = self.request.user

        try:
            student = user.student_profile
        except AttributeError as exc:
            raise NotFound("The logged user does not have a student profile.") from exc

        supervisor = self.get_supervisor(supervisor_id)
        advisor = self.get_advisor(advisor_id)
        form_data = dict(serializer.validated_data.get("form_data", {}))
        status_value = (
            DocumentStatus.DRAFT
            if save_as_draft
            else self.get_submission_status(supervisor)
        )

        student_snapshot = self.build_student_snapshot(
            student=student,
            form_data=form_data,
        )

        return serializer.save(
            student=student,
            supervisor=supervisor,
            advisor=advisor,
            related_document=related_document,
            status=status_value,
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
        *,
        save_as_draft,
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
            status=(
                DocumentStatus.DRAFT
                if save_as_draft
                else DocumentStatus.SUBMITTED
            ),
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

        if not save_as_draft:
            self.release_related_document_after_supervisor_evaluation(
                related_document,
            )

        return document

    @transaction.atomic
    def perform_update(self, serializer):
        document = serializer.instance
        user = self.request.user
        previous_status = document.status

        self.validate_update_permission(document, user)

        save_as_draft = serializer.validated_data.pop("save_as_draft", False)
        supervisor_id = serializer.validated_data.pop("supervisor_id", None)
        advisor_id = serializer.validated_data.pop("advisor_id", None)
        related_document_id = serializer.validated_data.pop("related_document_id", None)

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
                can_student_change_draft_advisor = (
                    previous_status == DocumentStatus.DRAFT
                    and document.student.user_id == user.id
                )
                if not can_student_change_draft_advisor and not self.can_manage_advisor(user):
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
            description=(
                "Rascunho salvo."
                if previous_status == DocumentStatus.DRAFT and save_as_draft
                else "Documento atualizado."
            ),
        )

        if previous_status == DocumentStatus.DRAFT and not save_as_draft:
            document.document_date = timezone.localdate()
            document.save(update_fields=["document_date"])

            if document.document_type == DocumentType.SUPERVISOR_EVALUATION:
                set_document_status(
                    document=document,
                    status=DocumentStatus.SUBMITTED,
                    user=user,
                    description="Ficha de avaliação enviada.",
                )
                if related_document:
                    self.release_related_document_after_supervisor_evaluation(
                        related_document,
                    )
            else:
                set_document_status(
                    document=document,
                    status=self.get_submission_status(document.supervisor),
                    user=user,
                    description="Documento enviado.",
                )

        elif (
            previous_status == DocumentStatus.ADJUSTMENT_REQUESTED
            and not save_as_draft
        ):
            document.reviewed_by = None
            document.save(update_fields=["reviewed_by"])
            set_document_status(
                document=document,
                status=DocumentStatus.SUBMITTED,
                user=user,
                description="Documento reenviado após os ajustes.",
            )

    def validate_update_permission(self, document, user):
        if user.is_superuser:
            return

        if document.status not in {
            DocumentStatus.DRAFT,
            DocumentStatus.ADJUSTMENT_REQUESTED,
        }:
            raise PermissionDenied(
                "Somente rascunhos ou documentos com ajustes solicitados podem ser editados."
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
            status__in=[
                DocumentStatus.DRAFT,
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
            DocumentStatus.DRAFT,
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
            return Response(DocumentSerializer(document, context={"request": request}).data)

        old_advisor = document.advisor
        old_name = (
            old_advisor.get_full_name() or old_advisor.email
            if old_advisor
            else "não definido"
        )
        new_name = advisor.get_full_name() or advisor.email

        document.advisor = advisor
        document.reviewed_by = None

        # Se a troca acontece com uma revisão em andamento, o documento volta
        # para a fila do novo orientador. Nos demais estados apenas limpamos um
        # revisor antigo, preservando o estágio atual do fluxo.
        if document.status == DocumentStatus.IN_REVIEW:
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

        if (
            document.document_type == DocumentType.MANDATORY_INTERNSHIP
            and document.supervisor_id
        ):
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
    def get_submission_status(supervisor):
        return (
            DocumentStatus.WAITING_SUPERVISOR
            if supervisor
            else DocumentStatus.SUBMITTED
        )

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

    def release_related_document_after_supervisor_evaluation(self, related_document):
        set_document_status(
            document=related_document,
            status=DocumentStatus.SUBMITTED,
            user=self.request.user,
            description="Ficha de avaliação enviada pelo supervisor.",
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
