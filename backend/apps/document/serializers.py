from rest_framework import serializers

from apps.doc_activity.serializers import DocumentActivitySerializer
from apps.document.models import Document, DocumentType, SignatureMethod


class DocumentWriteSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)
    supervisor_id = serializers.IntegerField(required=False, allow_null=True)
    advisor_id = serializers.IntegerField(required=False, allow_null=True)
    related_document_id = serializers.IntegerField(required=False, allow_null=True)
    company = serializers.CharField(required=False, allow_blank=True)
    city = serializers.CharField(required=False, allow_blank=True)
    form_data = serializers.JSONField(required=True)
    attachment = serializers.FileField(required=False, allow_null=True)

    class Meta:
        model = Document
        fields = (
            "id",
            "document_type",
            "supervisor_id",
            "advisor_id",
            "related_document_id",
            "coordinator_name",
            "company",
            "city",
            "form_data",
            "attachment",
        )

    def validate_attachment(self, value):
        if value is None:
            return value

        if value.size > 25 * 1024 * 1024:
            raise serializers.ValidationError(
                "O arquivo anexo deve ter no máximo 25 MB."
            )

        if not value.name.lower().endswith(".pdf"):
            raise serializers.ValidationError(
                "Envie o arquivo anexo em formato PDF."
            )

        header = value.read(5)
        value.seek(0)
        if header != b"%PDF-":
            raise serializers.ValidationError(
                "O arquivo anexo enviado não é um PDF válido."
            )

        return value

    def validate(self, attrs):
        document_type = attrs.get(
            "document_type",
            self.instance.document_type if self.instance else None,
        )
        related_document_id = attrs.get(
            "related_document_id",
            self.instance.related_document_id if self.instance else None,
        )

        if self.instance and document_type != self.instance.document_type:
            raise serializers.ValidationError(
                {
                    "document_type": (
                        "O tipo do documento não pode ser alterado durante a edição."
                    )
                }
            )

        if document_type == DocumentType.SUPERVISOR_EVALUATION and not related_document_id:
            raise serializers.ValidationError(
                {
                    "related_document_id": (
                        "Supervisor evaluation must be linked to another document."
                    )
                }
            )

        is_supervisor_eval = document_type == DocumentType.SUPERVISOR_EVALUATION

        if not is_supervisor_eval and related_document_id:
            raise serializers.ValidationError(
                {
                    "related_document_id": (
                        "Only supervisor evaluations can be linked "
                        "to another document."
                    )
                }
            )

        supervisor_id = attrs.get(
            "supervisor_id",
            self.instance.supervisor_id if self.instance else None,
        )
        advisor_id = attrs.get(
            "advisor_id",
            self.instance.advisor_id if self.instance else None,
        )
        company = attrs.get(
            "company",
            self.instance.company if self.instance else "",
        )
        coordinator_name = attrs.get(
            "coordinator_name",
            self.instance.coordinator_name if self.instance else "",
        )

        if document_type in (
            DocumentType.MANDATORY_INTERNSHIP,
            DocumentType.NON_MANDATORY_INTERNSHIP_CREDIT,
            DocumentType.PROFESSIONAL_PRACTICE_CREDIT,
        ) and not supervisor_id:
            raise serializers.ValidationError(
                {"supervisor_id": "Supervisor is required for this document type."}
            )

        if document_type == DocumentType.MANDATORY_INTERNSHIP and not advisor_id:
            raise serializers.ValidationError(
                {"advisor_id": "Informe o orientador responsável pelo estágio."}
            )

        if not is_supervisor_eval and not company:
            raise serializers.ValidationError(
                {"company": "Company is required for this document type."}
            )

        if (
            document_type == DocumentType.NON_MANDATORY_INTERNSHIP_CREDIT
            and not coordinator_name
        ):
            raise serializers.ValidationError(
                {
                    "coordinator_name": (
                        "Coordinator name is required for this document type."
                    )
                }
            )

        return attrs


class SignedDocumentUploadSerializer(serializers.Serializer):
    signature_method = serializers.ChoiceField(choices=SignatureMethod.choices)
    signed_pdf = serializers.FileField()

    def validate_signed_pdf(self, value):
        if value.size > 25 * 1024 * 1024:
            raise serializers.ValidationError("O PDF assinado deve ter no máximo 25 MB.")

        if not value.name.lower().endswith(".pdf"):
            raise serializers.ValidationError("Envie o documento assinado em formato PDF.")

        header = value.read(5)
        value.seek(0)
        if header != b"%PDF-":
            raise serializers.ValidationError("O arquivo enviado não é um PDF válido.")

        return value


class DocumentAdvisorAssignmentSerializer(serializers.Serializer):
    advisor_id = serializers.IntegerField(required=True)


class DocumentReviewActionSerializer(serializers.Serializer):
    comment = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=2000,
    )


class DocumentRequiredCommentSerializer(serializers.Serializer):
    comment = serializers.CharField(
        required=True,
        allow_blank=False,
        max_length=2000,
    )


class DocumentReviewListSerializer(serializers.ModelSerializer):
    document_type_display = serializers.SerializerMethodField()
    status_display = serializers.SerializerMethodField()
    reviewer_name = serializers.SerializerMethodField()
    advisor_name = serializers.SerializerMethodField()

    class Meta:
        model = Document
        fields = (
            "id",
            "document_type",
            "document_type_display",
            "student_name",
            "student_registration_number",
            "student_course",
            "company",
            "document_date",
            "status",
            "status_display",
            "advisor_name",
            "reviewer_name",
            "updated_at",
        )
        read_only_fields = fields

    def get_document_type_display(self, obj):
        return obj.get_document_type_display()

    def get_status_display(self, obj):
        return obj.get_status_display()

    def get_reviewer_name(self, obj):
        if not obj.reviewed_by:
            return None

        return obj.reviewed_by.get_full_name() or obj.reviewed_by.email

    def get_advisor_name(self, obj):
        if not obj.advisor:
            return None

        return obj.advisor.get_full_name() or obj.advisor.email


class DocumentSerializer(serializers.ModelSerializer):
    supervisor_id = serializers.IntegerField(read_only=True)
    supervisor_name = serializers.SerializerMethodField()
    supervisor_email = serializers.SerializerMethodField()
    supervisor_company = serializers.SerializerMethodField()
    advisor_id = serializers.IntegerField(read_only=True)
    advisor_name = serializers.SerializerMethodField()
    advisor_email = serializers.SerializerMethodField()
    reviewer_name = serializers.SerializerMethodField()
    reviewer_email = serializers.SerializerMethodField()
    document_type_display = serializers.SerializerMethodField()
    status_display = serializers.SerializerMethodField()
    activities = DocumentActivitySerializer(many=True, read_only=True)
    signed_pdf_available = serializers.SerializerMethodField()
    supervisor_evaluation_id = serializers.SerializerMethodField()
    supervisor_evaluation_signed = serializers.SerializerMethodField()

    class Meta:
        model = Document
        fields = (
            "id",
            "document_type",
            "document_type_display",
            "student_name",
            "student_email",
            "student_registration_number",
            "student_course",
            "student_campus",
            "student_snapshot",
            "supervisor_id",
            "supervisor_name",
            "supervisor_email",
            "supervisor_company",
            "advisor_id",
            "advisor_name",
            "advisor_email",
            "reviewer_name",
            "reviewer_email",
            "related_document",
            "coordinator_name",
            "company",
            "city",
            "document_date",
            "signed_pdf_available",
            "signature_method",
            "signed_at",
            "supervisor_evaluation_id",
            "supervisor_evaluation_signed",
            "generated_pdf",
            "pdf_generation_status",
            "pdf_generation_error",
            "pdf_generated_at",
            "form_data",
            "status",
            "status_display",
            "activities",
            "created_at",
            "updated_at",
        )
        read_only_fields = fields

    def get_supervisor_name(self, obj):
        if not obj.supervisor:
            return None

        return obj.supervisor.user.get_full_name() or obj.supervisor.user.email

    def get_supervisor_email(self, obj):
        if not obj.supervisor:
            return None

        return obj.supervisor.user.email

    def get_supervisor_company(self, obj):
        if not obj.supervisor:
            return None

        return obj.supervisor.company_name

    def get_advisor_name(self, obj):
        if not obj.advisor:
            return None

        return obj.advisor.get_full_name() or obj.advisor.email

    def get_advisor_email(self, obj):
        if not obj.advisor:
            return None

        return obj.advisor.email

    def get_reviewer_name(self, obj):
        if not obj.reviewed_by:
            return None

        return obj.reviewed_by.get_full_name() or obj.reviewed_by.email

    def get_reviewer_email(self, obj):
        if not obj.reviewed_by:
            return None

        return obj.reviewed_by.email

    def get_signed_pdf_available(self, obj):
        return bool(obj.attachment and obj.signed_at)

    def _get_supervisor_evaluation(self, obj):
        if obj.document_type != DocumentType.MANDATORY_INTERNSHIP:
            return None

        evaluations = [
            related
            for related in obj.related_documents.all()
            if related.document_type == DocumentType.SUPERVISOR_EVALUATION
        ]
        if not evaluations:
            return None

        return max(evaluations, key=lambda item: item.id)

    def get_supervisor_evaluation_id(self, obj):
        evaluation = self._get_supervisor_evaluation(obj)
        return evaluation.id if evaluation else None

    def get_supervisor_evaluation_signed(self, obj):
        evaluation = self._get_supervisor_evaluation(obj)
        return bool(evaluation and evaluation.attachment and evaluation.signed_at)

    def get_document_type_display(self, obj):
        return obj.get_document_type_display()

    def get_status_display(self, obj):
        return obj.get_status_display()
