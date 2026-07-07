from rest_framework import serializers
from apps.doc_activity.models import DocumentActivity

class DocumentActivitySerializer(serializers.ModelSerializer):
    performed_by_name = serializers.SerializerMethodField()

    class Meta:
        model = DocumentActivity
        fields = (
            "id",
            "document",
            "action",
            "description",
            "performed_by_name",
            "created_at",
        )
        read_only_fields = fields

    def get_performed_by_name(self, obj):
        return obj.performed_by.get_full_name() or obj.performed_by.email
