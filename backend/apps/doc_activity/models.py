from django.conf import settings
from django.db import models


class DocActivity(models.Model):
    class Status(models.IntegerChoices):
        CREATED = 0, "Criado"
        UPDATED = 1, "Atualizado"
        APPROVED = 2, "Aprovado"
        REJECTED = 3, "Rejeitado"

    doc_activity_id = models.AutoField(primary_key=True)

    document = models.ForeignKey(
        "documents.Documents",
        on_delete=models.PROTECT,
        db_column="DocumentsID",
        related_name="activities",
        null=False,
    )

    status = models.IntegerField(choices=Status.choices, default=Status.CREATED)
    description = models.CharField(max_length=512)

    alter_by_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        db_column="AlterByUserID",
        related_name="doc_activities",
        null=False,
    )

    server_timestamp = models.DateTimeField(auto_now_add=True)
    last_update = models.DateTimeField(auto_now=True)
    is_enabled = models.BooleanField(default=True)

    class Meta:
        db_table = "DocActivity"
        verbose_name = "Doc Activity"
        verbose_name_plural = "Doc Activities"
        ordering = ["-server_timestamp"]

    def __str__(self):
        return f"DocActivity {self.doc_activity_id} - {self.get_status_display()}"
