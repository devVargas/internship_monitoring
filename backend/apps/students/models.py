from django.conf import settings
from django.db import models


class Student(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="student_profile",
    )
    registration_number = models.CharField(max_length=40, unique=True)
    name = models.CharField(max_length=255)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=30, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class Documents(models.Model):
    documents_id = models.AutoField(primary_key=True)

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        db_column='UserID',
        related_name='documents',
        null=False
    )

    user_admin = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        db_column='UserAdminID',
        related_name='admin_documents',
        null=False
    )

    name = models.CharField(max_length=128, null=False)

    description = models.CharField(max_length=512, null=False)

    status = models.IntegerField(null=False)

    server_timestamp = models.DateTimeField(auto_now_add=True, null=False)

    date_begin = models.DateTimeField(null=True, blank=True)

    date_end = models.DateTimeField(null=True, blank=True)

    is_enabled = models.IntegerField(null=False)

    last_update = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'Documents'
        verbose_name = 'Document'
        verbose_name_plural = 'Documents'

    def __str__(self):
        return self.name


class DocActivity(models.Model):
    doc_activity_id = models.AutoField(primary_key=True)

    document = models.ForeignKey(
        Documents,
        on_delete=models.PROTECT,
        db_column='DocumentsID',
        null=False
    )

    status = models.IntegerField(null=False)

    description = models.CharField(max_length=512, null=False)

    alter_by_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        db_column='AlterByUserID',
        null=False
    )

    server_timestamp = models.DateTimeField(auto_now_add=True, null=False)

    last_update = models.DateTimeField(null=True, blank=True)

    is_enabled = models.IntegerField(null=False)

    class Meta:
        db_table = 'DocActivity'
        verbose_name = 'Doc Activity'
        verbose_name_plural = 'Doc Activities'

    def __str__(self):
        return f"DocActivity {self.doc_activity_id} - Status {self.status}"