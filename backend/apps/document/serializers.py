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
                {"related_document_id": "Supervisor evaluation must be linked to another document."}
            )

        return attrs

class DocumentSerializer(serializers.ModelSerializer):
    supervisor_name = serializers.SerializerMethodField()
    supervisor_email = serializers.SerializerMethodField()
    supervisor_company = serializers.SerializerMethodField()
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
