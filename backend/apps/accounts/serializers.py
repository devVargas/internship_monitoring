from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.db import transaction
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from apps.accounts.constants import (
    GROUP_COORDINATOR,
    GROUP_PROFESSOR,
    GROUP_STUDENT,
    GROUP_SUPERVISOR,
)
from apps.accounts.models import SupervisorProfile
from apps.accounts.validators import validate_company_document
from apps.students.models import StudentProfile
from apps.students.serializers import (
    BrazilianStateField,
    validate_phone,
    validate_zip_code,
)

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
            "is_superuser",
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
    last_name = serializers.CharField(
        max_length=150,
        required=False,
        allow_blank=True,
    )
    password = serializers.CharField(write_only=True, min_length=8)
    registration_number = serializers.CharField(max_length=50)
    course = serializers.CharField(max_length=150)
    campus = serializers.CharField(max_length=150)
    phone_number = serializers.CharField(
        max_length=30,
        validators=[validate_phone],
        required=False,
        allow_blank=True,
    )
    mobile_number = serializers.CharField(
        max_length=30,
        validators=[validate_phone],
    )
    zip_code = serializers.CharField(
        max_length=9,
        validators=[validate_zip_code],
    )
    address = serializers.CharField(max_length=255)
    address_number = serializers.CharField(max_length=20)
    address_complement = serializers.CharField(
        max_length=150,
        required=False,
        allow_blank=True,
    )
    neighborhood = serializers.CharField(max_length=150)
    city = serializers.CharField(max_length=150)
    state = BrazilianStateField(
    )

    def validate_email(self, value):
        normalized_email = value.lower().strip()

        if User.objects.filter(email__iexact=normalized_email).exists():
            raise serializers.ValidationError(
                "Já existe um usuário com este e-mail."
            )

        return normalized_email

    def validate_registration_number(self, value):
        normalized_registration_number = value.strip()

        if StudentProfile.objects.filter(
            registration_number=normalized_registration_number
        ).exists():
            raise serializers.ValidationError(
                "Já existe um aluno com esta matrícula."
            )

        return normalized_registration_number

    @transaction.atomic
    def create(self, validated_data):
        profile_fields = {
            "registration_number",
            "course",
            "campus",
            "phone_number",
            "mobile_number",
            "zip_code",
            "address",
            "address_number",
            "address_complement",
            "neighborhood",
            "city",
            "state",
        }
        profile_data = {
            field: validated_data.pop(field, "")
            for field in profile_fields
        }
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
            **profile_data,
        )

        return user

    def to_representation(self, instance):
        return UserSerializer(instance).data


class AcademicUserRegistrationSerializer(serializers.Serializer):
    group_name = None
    email = serializers.EmailField()
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(
        max_length=150,
        required=False,
        allow_blank=True,
    )
    password = serializers.CharField(
        write_only=True,
        min_length=8,
    )

    def validate_email(self, value):
        normalized_email = value.lower().strip()

        if User.objects.filter(email__iexact=normalized_email).exists():
            raise serializers.ValidationError(
                "Já existe um usuário com este e-mail."
            )

        return normalized_email

    @transaction.atomic
    def create(self, validated_data):
        password = validated_data.pop("password")
        email = validated_data["email"]

        user = User.objects.create_user(
            username=email,
            password=password,
            **validated_data,
        )

        group, _ = Group.objects.get_or_create(
            name=self.group_name,
        )

        user.groups.add(group)

        return user

    def to_representation(self, instance):
        return UserSerializer(instance).data


class ProfessorRegistrationSerializer(AcademicUserRegistrationSerializer):
    group_name = GROUP_PROFESSOR


class CoordinatorRegistrationSerializer(AcademicUserRegistrationSerializer):
    group_name = GROUP_COORDINATOR


class SupervisorRegistrationSerializer(serializers.Serializer):
    email = serializers.EmailField()
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(
        max_length=150,
        required=False,
        allow_blank=True,
    )
    password = serializers.CharField(write_only=True, min_length=8)

    phone_number = serializers.CharField(
        max_length=30,
        validators=[validate_phone],
    )
    job_title = serializers.CharField(max_length=150)
    professional_registration = serializers.CharField(
        max_length=100,
        required=False,
        allow_blank=True,
    )

    company_name = serializers.CharField(max_length=150)
    company_document = serializers.CharField(
        max_length=20,
        validators=[validate_company_document],
    )
    company_professional_registration = serializers.CharField(
        max_length=100,
        required=False,
        allow_blank=True,
    )
    company_zip_code = serializers.CharField(
        max_length=9,
        validators=[validate_zip_code],
    )
    company_address = serializers.CharField(max_length=255)
    company_address_number = serializers.CharField(max_length=20)
    company_address_complement = serializers.CharField(
        max_length=150,
        required=False,
        allow_blank=True,
    )
    company_neighborhood = serializers.CharField(max_length=150)
    company_city = serializers.CharField(max_length=150)
    company_state = BrazilianStateField()
    company_email = serializers.EmailField()
    company_phone_number = serializers.CharField(
        max_length=30,
        validators=[validate_phone],
    )
    company_business_activity = serializers.CharField(max_length=150)
    company_business_activity_other = serializers.CharField(
        max_length=150,
        required=False,
        allow_blank=True,
    )

    def validate_email(self, value):
        normalized_email = value.lower().strip()

        if User.objects.filter(email__iexact=normalized_email).exists():
            raise serializers.ValidationError(
                "Já existe um usuário com este e-mail."
            )

        return normalized_email

    def validate(self, attrs):
        if (
            attrs.get("company_business_activity") == "Outro"
            and not attrs.get("company_business_activity_other", "").strip()
        ):
            raise serializers.ValidationError(
                {
                    "company_business_activity_other": (
                        "Informe o ramo de atividade da empresa."
                    )
                }
            )

        return attrs

    @transaction.atomic
    def create(self, validated_data):
        profile_fields = {
            "phone_number",
            "job_title",
            "professional_registration",
            "company_name",
            "company_document",
            "company_professional_registration",
            "company_zip_code",
            "company_address",
            "company_address_number",
            "company_address_complement",
            "company_neighborhood",
            "company_city",
            "company_state",
            "company_email",
            "company_phone_number",
            "company_business_activity",
            "company_business_activity_other",
        }
        profile_data = {
            field: validated_data.pop(field, "")
            for field in profile_fields
        }
        password = validated_data.pop("password")
        email = validated_data["email"]

        user = User.objects.create_user(
            username=email,
            password=password,
            **validated_data,
        )

        supervisor_group, _ = Group.objects.get_or_create(
            name=GROUP_SUPERVISOR
        )
        user.groups.add(supervisor_group)

        SupervisorProfile.objects.create(
            user=user,
            **profile_data,
        )

        return user

    def to_representation(self, instance):
        return UserSerializer(instance).data
