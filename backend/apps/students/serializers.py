from django.contrib.auth import get_user_model
from rest_framework import serializers
from apps.students.models import StudentProfile

User = get_user_model()

class StudentUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "email",
            "first_name",
            "last_name",
        )
        read_only_fields = fields


class StudentProfileSerializer(serializers.ModelSerializer):
    user = StudentUserSerializer(read_only=True)

    class Meta:
        model = StudentProfile
        fields = (
            "user",
            "registration_number",
            "course",
            "campus",
            "phone_number",
        )
