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
    display_name = serializers.SerializerMethodField()
    email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = SupervisorProfile
        fields = (
            "id",
            "full_name",
            "display_name",
            "email",
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
        )
        read_only_fields = fields

    def get_full_name(self, obj):
        return obj.user.get_full_name() or obj.user.email

    def get_display_name(self, obj):
        full_name = self._display_case(self.get_full_name(obj))
        company_name = self._display_case(obj.company_name)
        return f"{full_name} [{company_name}]"

    @staticmethod
    def _display_case(value):
        small_words = {"da", "das", "de", "do", "dos", "e"}
        words = " ".join(value.split()).split(" ")
        formatted = []

        for index, word in enumerate(words):
            lower = word.lower()

            if index > 0 and lower in small_words:
                formatted.append(lower)
            elif word.isupper() and len(word) <= 5:
                formatted.append(word)
            elif word.islower() or word.isupper():
                formatted.append(lower[:1].upper() + lower[1:])
            else:
                formatted.append(word[:1].upper() + word[1:])

        return " ".join(formatted)


class CoordinatorUserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ("id", "full_name")
        read_only_fields = fields

    def get_full_name(self, obj):
        return obj.get_full_name()


class AcademicAdvisorSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()
    display_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ("id", "full_name", "email", "role", "display_name")
        read_only_fields = fields

    def get_full_name(self, obj):
        return obj.get_full_name() or obj.email

    def get_role(self, obj):
        group_names = set(obj.groups.values_list("name", flat=True))
        if "Coordinator" in group_names:
            return "Coordinator"
        return "Teacher"

    def get_display_name(self, obj):
        role_label = "Coordenador(a)" if self.get_role(obj) == "Coordinator" else "Professor(a)"
        return f"{self.get_full_name(obj)} [{role_label}]"


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
