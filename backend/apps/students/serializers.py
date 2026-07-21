from django.contrib.auth import get_user_model
from rest_framework import serializers
from apps.students.models import StudentProfile

User = get_user_model()

class StudentUserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            "email",
            "first_name",
            "last_name",
            "full_name",
        )
        read_only_fields = fields

    def get_full_name(self, obj):
        return obj.get_full_name()


class StudentProfileSerializer(serializers.ModelSerializer):
    user = StudentUserSerializer(read_only=True)

    class Meta:
        model = StudentProfile
        fields = (
            "id",
            "user",
            "registration_number",
            "course",
            "campus",
            "phone_number",
        )
        read_only_fields = ("id", "user", "created_at", "updated_at")