from django.contrib.auth import get_user_model
from django.db import transaction
from rest_framework import serializers

from apps.accounts.models import SupervisorProfile
from apps.accounts.validators import validate_company_document
from apps.students.models import StudentProfile
from apps.students.serializers import (
    BrazilianStateField,
    validate_phone,
    validate_zip_code,
)

User = get_user_model()


class UserProfileSerializer(serializers.Serializer):
    email = serializers.EmailField()
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(
        max_length=150,
        required=False,
        allow_blank=True,
    )
    groups = serializers.SerializerMethodField()
    is_staff = serializers.BooleanField(read_only=True)
    is_superuser = serializers.BooleanField(read_only=True)

    # Student profile fields.
    registration_number = serializers.CharField(
        max_length=50,
        required=False,
        allow_blank=True,
    )
    course = serializers.CharField(
        max_length=150,
        required=False,
        allow_blank=True,
    )
    campus = serializers.CharField(
        max_length=150,
        required=False,
        allow_blank=True,
    )
    phone_number = serializers.CharField(
        max_length=30,
        validators=[validate_phone],
        required=False,
        allow_blank=True,
    )
    mobile_number = serializers.CharField(
        max_length=30,
        validators=[validate_phone],
        required=False,
        allow_blank=True,
    )
    zip_code = serializers.CharField(
        max_length=9,
        validators=[validate_zip_code],
        required=False,
        allow_blank=True,
    )
    address = serializers.CharField(
        max_length=255,
        required=False,
        allow_blank=True,
    )
    address_number = serializers.CharField(
        max_length=20,
        required=False,
        allow_blank=True,
    )
    address_complement = serializers.CharField(
        max_length=150,
        required=False,
        allow_blank=True,
    )
    neighborhood = serializers.CharField(
        max_length=150,
        required=False,
        allow_blank=True,
    )
    city = serializers.CharField(
        max_length=150,
        required=False,
        allow_blank=True,
    )
    state = BrazilianStateField(
        required=False,
        allow_blank=True,
    )

    # Supervisor profile fields.
    job_title = serializers.CharField(
        max_length=150,
        required=False,
        allow_blank=True,
    )
    professional_registration = serializers.CharField(
        max_length=100,
        required=False,
        allow_blank=True,
    )
    company_name = serializers.CharField(
        max_length=150,
        required=False,
        allow_blank=True,
    )
    company_document = serializers.CharField(
        max_length=20,
        validators=[validate_company_document],
        required=False,
        allow_blank=True,
    )
    company_professional_registration = serializers.CharField(
        max_length=100,
        required=False,
        allow_blank=True,
    )
    company_zip_code = serializers.CharField(
        max_length=9,
        validators=[validate_zip_code],
        required=False,
        allow_blank=True,
    )
    company_address = serializers.CharField(
        max_length=255,
        required=False,
        allow_blank=True,
    )
    company_address_number = serializers.CharField(
        max_length=20,
        required=False,
        allow_blank=True,
    )
    company_address_complement = serializers.CharField(
        max_length=150,
        required=False,
        allow_blank=True,
    )
    company_neighborhood = serializers.CharField(
        max_length=150,
        required=False,
        allow_blank=True,
    )
    company_city = serializers.CharField(
        max_length=150,
        required=False,
        allow_blank=True,
    )
    company_state = BrazilianStateField(
        required=False,
        allow_blank=True,
    )
    company_email = serializers.EmailField(
        required=False,
        allow_blank=True,
    )
    company_phone_number = serializers.CharField(
        max_length=30,
        validators=[validate_phone],
        required=False,
        allow_blank=True,
    )
    company_business_activity = serializers.CharField(
        max_length=150,
        required=False,
        allow_blank=True,
    )
    company_business_activity_other = serializers.CharField(
        max_length=150,
        required=False,
        allow_blank=True,
    )

    def get_groups(self, user):
        return list(user.groups.values_list("name", flat=True))

    def validate_email(self, value):
        email = value.lower().strip()
        users = User.objects.exclude(pk=self.instance.pk)

        if users.filter(email__iexact=email).exists():
            raise serializers.ValidationError(
                "Já existe um usuário com este e-mail."
            )

        if users.filter(username__iexact=email).exists():
            raise serializers.ValidationError(
                "Já existe um usuário com este e-mail."
            )

        return email

    def validate_registration_number(self, value):
        registration_number = value.strip()

        if not registration_number:
            return registration_number

        profiles = StudentProfile.objects.exclude(user=self.instance)

        if profiles.filter(
            registration_number=registration_number
        ).exists():
            raise serializers.ValidationError(
                "Já existe um aluno com esta matrícula."
            )

        return registration_number

    def validate(self, attrs):
        errors = {}
        student_profile = self._get_student_profile(self.instance)
        supervisor_profile = self._get_supervisor_profile(self.instance)

        if student_profile:
            for field in (
                "registration_number",
                "course",
                "campus",
                "mobile_number",
                "zip_code",
                "address",
                "address_number",
                "neighborhood",
                "city",
                "state",
            ):
                self._require_if_provided(attrs, errors, field)

        if supervisor_profile:
            for field in (
                "phone_number",
                "job_title",
                "company_name",
                "company_document",
                "company_zip_code",
                "company_address",
                "company_address_number",
                "company_neighborhood",
                "company_city",
                "company_state",
                "company_email",
                "company_phone_number",
                "company_business_activity",
            ):
                self._require_if_provided(attrs, errors, field)

            business_activity = attrs.get(
                "company_business_activity",
                supervisor_profile.company_business_activity,
            )
            business_activity_other = attrs.get(
                "company_business_activity_other",
                supervisor_profile.company_business_activity_other,
            )

            if (
                business_activity == "Outro"
                and not business_activity_other.strip()
            ):
                errors["company_business_activity_other"] = (
                    "Informe o ramo de atividade da empresa."
                )

        if errors:
            raise serializers.ValidationError(errors)

        return attrs

    @transaction.atomic
    def update(self, user, validated_data):
        old_email = user.email
        email = validated_data.pop("email", None)
        fields_to_update = []

        if email is not None:
            if user.username.lower() == old_email.lower():
                user.username = email
                fields_to_update.append("username")

            user.email = email
            fields_to_update.append("email")

        for field in ("first_name", "last_name"):
            if field in validated_data:
                setattr(user, field, validated_data.pop(field).strip())
                fields_to_update.append(field)

        if fields_to_update:
            user.save(update_fields=fields_to_update)

        student_profile = self._get_student_profile(user)

        if student_profile:
            self._update_profile(
                student_profile,
                validated_data,
                (
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
                ),
            )

        supervisor_profile = self._get_supervisor_profile(user)

        if supervisor_profile:
            self._update_profile(
                supervisor_profile,
                validated_data,
                (
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
                ),
            )

        return user

    def to_representation(self, user):
        data = {
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "groups": self.get_groups(user),
            "is_staff": user.is_staff,
            "is_superuser": user.is_superuser,
            "registration_number": "",
            "course": "",
            "campus": "",
            "phone_number": "",
            "mobile_number": "",
            "zip_code": "",
            "address": "",
            "address_number": "",
            "address_complement": "",
            "neighborhood": "",
            "city": "",
            "state": "",
            "job_title": "",
            "professional_registration": "",
            "company_name": "",
            "company_document": "",
            "company_professional_registration": "",
            "company_zip_code": "",
            "company_address": "",
            "company_address_number": "",
            "company_address_complement": "",
            "company_neighborhood": "",
            "company_city": "",
            "company_state": "",
            "company_email": "",
            "company_phone_number": "",
            "company_business_activity": "",
            "company_business_activity_other": "",
        }

        student_profile = self._get_student_profile(user)

        if student_profile:
            data.update(
                {
                    "registration_number": (
                        student_profile.registration_number
                    ),
                    "course": student_profile.course,
                    "campus": student_profile.campus,
                    "phone_number": student_profile.phone_number,
                    "mobile_number": student_profile.mobile_number,
                    "zip_code": student_profile.zip_code,
                    "address": student_profile.address,
                    "address_number": student_profile.address_number,
                    "address_complement": student_profile.address_complement,
                    "neighborhood": student_profile.neighborhood,
                    "city": student_profile.city,
                    "state": student_profile.state,
                }
            )

        supervisor_profile = self._get_supervisor_profile(user)

        if supervisor_profile:
            data.update(
                {
                    "phone_number": supervisor_profile.phone_number,
                    "job_title": supervisor_profile.job_title,
                    "professional_registration": (
                        supervisor_profile.professional_registration
                    ),
                    "company_name": supervisor_profile.company_name,
                    "company_document": supervisor_profile.company_document,
                    "company_professional_registration": (
                        supervisor_profile.company_professional_registration
                    ),
                    "company_zip_code": supervisor_profile.company_zip_code,
                    "company_address": supervisor_profile.company_address,
                    "company_address_number": (
                        supervisor_profile.company_address_number
                    ),
                    "company_address_complement": (
                        supervisor_profile.company_address_complement
                    ),
                    "company_neighborhood": (
                        supervisor_profile.company_neighborhood
                    ),
                    "company_city": supervisor_profile.company_city,
                    "company_state": supervisor_profile.company_state,
                    "company_email": supervisor_profile.company_email,
                    "company_phone_number": (
                        supervisor_profile.company_phone_number
                    ),
                    "company_business_activity": (
                        supervisor_profile.company_business_activity
                    ),
                    "company_business_activity_other": (
                        supervisor_profile.company_business_activity_other
                    ),
                }
            )

        return data

    @staticmethod
    def _get_student_profile(user):
        try:
            return user.student_profile
        except StudentProfile.DoesNotExist:
            return None

    @staticmethod
    def _get_supervisor_profile(user):
        try:
            return user.supervisor_profile
        except SupervisorProfile.DoesNotExist:
            return None

    @staticmethod
    def _require_if_provided(attrs, errors, field):
        if field in attrs and not attrs[field].strip():
            errors[field] = "Campo obrigatório."

    @staticmethod
    def _update_profile(profile, data, fields):
        fields_to_update = []

        for field in fields:
            if field in data:
                value = data[field]

                if isinstance(value, str):
                    value = value.strip()

                setattr(profile, field, value)
                fields_to_update.append(field)

        if fields_to_update:
            profile.save(update_fields=fields_to_update)
