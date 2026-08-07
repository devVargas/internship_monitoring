import re

from django.contrib.auth import get_user_model
from rest_framework import serializers

from apps.accounts.models import SupervisorProfile
from apps.students.models import StudentProfile

User = get_user_model()

BRAZILIAN_STATES = {
    "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
    "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
    "RS", "RO", "RR", "SC", "SP", "SE", "TO",
}


def validate_brazilian_state(value):
    normalized_value = value.strip().upper()

    if normalized_value and normalized_value not in BRAZILIAN_STATES:
        raise serializers.ValidationError("Informe uma UF válida.")

    return normalized_value


def validate_phone(value):
    normalized_value = value.strip()
    digits = re.sub(r"\D", "", normalized_value)

    if normalized_value and len(digits) not in {10, 11}:
        raise serializers.ValidationError("Informe um telefone válido com DDD.")

    return normalized_value


def validate_zip_code(value):
    normalized_value = value.strip()
    digits = re.sub(r"\D", "", normalized_value)

    if normalized_value and len(digits) != 8:
        raise serializers.ValidationError("Informe um CEP válido.")

    return normalized_value


class BrazilianStateField(serializers.CharField):
    def __init__(self, **kwargs):
        validators = list(kwargs.pop("validators", []))
        validators.append(validate_brazilian_state)
        super().__init__(max_length=2, validators=validators, **kwargs)

    def to_internal_value(self, data):
        return super().to_internal_value(data).upper()


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


class SupervisorUserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = SupervisorProfile
        fields = ("id", "full_name")
        read_only_fields = fields

    def get_full_name(self, obj):
        return obj.user.get_full_name()


class CoordinatorUserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ("id", "full_name")
        read_only_fields = fields

    def get_full_name(self, obj):
        return obj.get_full_name()


class StudentProfileSerializer(serializers.ModelSerializer):
    user = StudentUserSerializer(read_only=True)
    phone_number = serializers.CharField(
        max_length=30,
        validators=[validate_phone],
        allow_blank=True,
        required=False,
    )
    mobile_number = serializers.CharField(
        max_length=30,
        validators=[validate_phone],
        allow_blank=True,
        required=False,
    )
    zip_code = serializers.CharField(
        max_length=9,
        validators=[validate_zip_code],
        allow_blank=True,
        required=False,
    )
    state = BrazilianStateField(
        allow_blank=True,
        required=False,
    )

    class Meta:
        model = StudentProfile
        fields = (
            "id",
            "user",
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
        )
        read_only_fields = ("id", "user", "created_at", "updated_at")
