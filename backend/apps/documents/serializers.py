from rest_framework import serializers
from .models import Documents


class DocumentsWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Documents
        fields = "__all__"
        read_only_fields = ["documents_id", "server_timestamp", "last_update"]


class DocumentsSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = Documents
        fields = "__all__"
        read_only_fields = ["documents_id", "server_timestamp", "last_update"]

    def to_representation(self, instance):
        from apps.doc_activity.serializers import DocActivitySerializer
        data = super().to_representation(instance)
        data["activities"] = DocActivitySerializer(
            instance.activities.filter(is_enabled=True), many=True
        ).data
        return data