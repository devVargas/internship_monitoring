from rest_framework import serializers

from apps.doc_activity.serializers import DocumentActivitySerializer
from apps.document.models import Document, DocumentType


class DocumentWriteSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)
    supervisor_id = serializers.IntegerField(required=False, allow_null=True)
    advisor_id = serializers.IntegerField(required=False, allow_null=True)
    related_document_id = serializers.IntegerField(required=False, allow_null=True)
    company = serializers.CharField(required=False, allow_blank=True)
    city = serializers.CharField(required=False, allow_blank=True)
    form_data = serializers.JSONField(required=True)
    save_as_draft = serializers.BooleanField(write_only=True, required=False, default=False)

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
            "attachment",
            "form_data",
            "save_as_draft",
        )

    def validate(self, attrs):
        document_type = attrs.get(
            "document_type",
            self.instance.document_type if self.instance else None,
        )
        related_document_id = attrs.get(
            "related_document_id",
            self.instance.related_document_id if self.instance else None,
        )
        save_as_draft = attrs.get("save_as_draft", False)

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

        # Rascunhos podem ser incompletos. As regras obrigatórias só são
        # aplicadas quando o documento é efetivamente enviado.
        if save_as_draft:
            return attrs

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

        current_attachment = self.instance.attachment if self.instance else None
        if not is_supervisor_eval and not attrs.get("attachment") and not current_attachment:
            raise serializers.ValidationError(
                {"attachment": "Attachment is required for this document type."}
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
            "attachment",
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

    def get_document_type_display(self, obj):
        return obj.get_document_type_display()

    def get_status_display(self, obj):
        return obj.get_status_display()
