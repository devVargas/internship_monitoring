from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.db import transaction
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from apps.accounts.constants import GROUP_PROFESSOR, GROUP_STUDENT
from apps.students.models import StudentProfile

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    groups = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            "email",
            "first_name",
            "last_name",
            "groups",
            "is_staff",
        )
        read_only_fields = fields

    def get_groups(self, obj):
        return list(obj.groups.values_list("name", flat=True))


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data["user"] = UserSerializer(self.user).data
        return data


class StudentRegistrationSerializer(serializers.Serializer):
    email = serializers.EmailField()
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, min_length=8)
    registration_number = serializers.CharField(max_length=50)
    course = serializers.CharField(max_length=150)
    phone_number = serializers.CharField(max_length=30, required=False, allow_blank=True)

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Já existe um usuário com este e-mail.")
        return value

    def validate_registration_number(self, value):
        if StudentProfile.objects.filter(registration_number=value).exists():
            raise serializers.ValidationError("Já existe um estudante com esta matrícula.")
        return value

    @transaction.atomic
    def create(self, validated_data):
        registration_number = validated_data.pop("registration_number")
        course = validated_data.pop("course")
        phone_number = validated_data.pop("phone_number", "")
        password = validated_data.pop("password")

        email = validated_data["email"]

        user = User.objects.create_user(
            username=email,
            password=password,
            **validated_data,
        )

        student_group, _ = Group.objects.get_or_create(name=GROUP_STUDENT)
        user.groups.add(student_group)

        StudentProfile.objects.create(
            user=user,
            registration_number=registration_number,
            course=course,
            phone_number=phone_number,
        )

        return user

    def to_representation(self, instance):
        return UserSerializer(instance).data


class ProfessorRegistrationSerializer(serializers.Serializer):
    email = serializers.EmailField()
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, min_length=8)

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Já existe um usuário com este e-mail.")
        return value

    @transaction.atomic
    def create(self, validated_data):
        password = validated_data.pop("password")
        email = validated_data["email"]

        user = User.objects.create_user(
            username=email,
            password=password,
            **validated_data,
        )

        user.is_staff = True
        user.save(update_fields=["is_staff"])

        professor_group, _ = Group.objects.get_or_create(name=GROUP_PROFESSOR)
        user.groups.add(professor_group)

        return user

    def to_representation(self, instance):
        return UserSerializer(instance).data