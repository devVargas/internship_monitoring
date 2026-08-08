from django.conf import settings
from django.db import models


class SupervisorProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="supervisor_profile",
    )

    # Dados profissionais do supervisor.
    phone_number = models.CharField(max_length=30)
    job_title = models.CharField(max_length=150)
    professional_registration = models.CharField(max_length=100, blank=True)

    # Dados da empresa/concedente usados como padrão nos formulários.
    company_name = models.CharField(max_length=150)
    company_document = models.CharField(max_length=20)
    company_professional_registration = models.CharField(max_length=100, blank=True)
    company_zip_code = models.CharField(max_length=9)
    company_address = models.CharField(max_length=255)
    company_address_number = models.CharField(max_length=20)
    company_address_complement = models.CharField(max_length=150, blank=True)
    company_neighborhood = models.CharField(max_length=150)
    company_city = models.CharField(max_length=150)
    company_state = models.CharField(max_length=2)
    company_email = models.EmailField()
    company_phone_number = models.CharField(max_length=30)
    company_business_activity = models.CharField(max_length=150)
    company_business_activity_other = models.CharField(max_length=150, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["company_name", "user__first_name", "user__last_name"]
