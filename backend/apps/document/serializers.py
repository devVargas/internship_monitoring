from rest_framework import serializers

from apps.doc_activity.serializers import DocumentActivitySerializer
from apps.document.models import Document, DocumentType


class DocumentWriteSerializer(serializers.ModelSerializer):
    supervisor_id = serializers.IntegerField(required=False, allow_null=True)
    related_document_id = serializers.IntegerField(required=False, allow_null=True)
    company = serializers.CharField(required=False)
    form_data = serializers.JSONField(required=True)

    class Meta:
        model = Document
        fields = (
            "document_type",
            "supervisor_id",
            "related_document_id",
            "coordinator_name",
            "company",
            "city",
            "attachment",
            "form_data",
        )

    def validate(self, attrs):
        document_type = attrs.get("document_type")
        related_document_id = attrs.get("related_document_id")

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

        if document_type in (
            DocumentType.MANDATORY_INTERNSHIP,
            DocumentType.NON_MANDATORY_INTERNSHIP_CREDIT,
            DocumentType.PROFESSIONAL_PRACTICE_CREDIT,
        ) and not attrs.get("supervisor_id"):
            raise serializers.ValidationError(
                {
                    "supervisor_id": (
                        "Supervisor is required for this document type."
                    )
                }
            )

        if not is_supervisor_eval and not attrs.get("company"):
            raise serializers.ValidationError(
                {
                    "company": (
                        "Company is required for this document type."
                    )
                }
            )

        is_update = self.context.get("request") and self.context["request"].method == "PUT"

        if not is_supervisor_eval and not attrs.get("attachment") and not is_update:
            raise serializers.ValidationError(
                {
                    "attachment": (
                        "Attachment is required for this document type."
                    )
                }
            )

        if (
            document_type == DocumentType.NON_MANDATORY_INTERNSHIP_CREDIT
            and not attrs.get("coordinator_name")
        ):
            raise serializers.ValidationError(
                {
                    "coordinator_name": (
                        "Coordinator name is required for this document type."
                    )
                }
            )

        return attrs


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


class DocumentSerializer(serializers.ModelSerializer):
    supervisor_id = serializers.IntegerField(read_only=True)
    supervisor_name = serializers.SerializerMethodField()
    supervisor_email = serializers.SerializerMethodField()
    supervisor_company = serializers.SerializerMethodField()
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
            "supervisor_id",
            "supervisor_name",
            "supervisor_email",
            "supervisor_company",
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