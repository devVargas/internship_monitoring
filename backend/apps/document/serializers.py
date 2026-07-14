from rest_framework import serializers

from apps.doc_activity.serializers import DocumentActivitySerializer
from apps.document.models import Document, DocumentType


class DocumentWriteSerializer(serializers.ModelSerializer):
    supervisor_id = serializers.IntegerField(required=False, allow_null=True)
    related_document_id = serializers.IntegerField(required=False, allow_null=True)

    class Meta:
        model = Document
        fields = (
            "document_type",
            "supervisor_id",
            "related_document_id",
            "student_name",
            "student_email",
            "student_registration_number",
            "student_course",
            "student_campus",
            "coordinator_name",
            "company",
            "city",
            "document_date",
            "attachment",
            "form_data",
        )

    def validate(self, attrs):
        document_type = attrs.get("document_type")
        related_document_id = attrs.get("related_document_id")

        if document_type == DocumentType.SUPERVISOR_EVALUATION and not related_document_id:
            raise serializers.ValidationError(
                {
                    "related_document_id": (
                        "Supervisor evaluation must be linked to another document."
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
