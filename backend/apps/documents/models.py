from django.conf import settings
from django.db import models


class Documents(models.Model):
    class Status(models.IntegerChoices):
        PENDING = 0, "Pendente"
        ACTIVE = 1, "Ativo"
        FINISHED = 2, "Finalizado"
        CANCELLED = 3, "Cancelado"

    documents_id = models.AutoField(primary_key=True)

    student = models.ForeignKey(
        "students.Student",
        on_delete=models.PROTECT,
        related_name="documents",
        null=True,
        blank=True,
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        db_column="UserID",
        related_name="documents",
        null=False,
    )

    user_admin = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        db_column="UserAdminID",
        related_name="admin_documents",
        null=False,
    )

    name = models.CharField(max_length=128)
    description = models.CharField(max_length=512)
    status = models.IntegerField(choices=Status.choices, default=Status.PENDING)
    server_timestamp = models.DateTimeField(auto_now_add=True)
    date_begin = models.DateTimeField(null=True, blank=True)
    date_end = models.DateTimeField(null=True, blank=True)
    is_enabled = models.BooleanField(default=True)
    last_update = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "Documents"
        verbose_name = "Document"
        verbose_name_plural = "Documents"

    def __str__(self):
        return self.name
