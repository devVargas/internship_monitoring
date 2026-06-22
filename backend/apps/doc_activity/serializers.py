from rest_framework import serializers
from .models import DocActivity


class DocActivitySerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = DocActivity
        fields = "__all__"
        read_only_fields = ["doc_activity_id", "server_timestamp", "last_update", "alter_by_user"]
