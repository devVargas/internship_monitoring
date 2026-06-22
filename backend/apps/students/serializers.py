from django.contrib.auth import get_user_model
from rest_framework import serializers
from apps.students.models import StudentProfile

class StudentUserSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source="get_full_name", read_only=True)

    class Meta:
        model = get_user_model()
        fields = (
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "full_name",
        )
        read_only_fields = ("id", "username", "full_name")


class StudentProfileSerializer(serializers.ModelSerializer):
    user = StudentUserSerializer(read_only=True)

    class Meta:
        model = StudentProfile
        fields = (
            "id",
            "user",
            "registration_number",
            "course",
            "phone_number",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "user", "created_at", "updated_at")
