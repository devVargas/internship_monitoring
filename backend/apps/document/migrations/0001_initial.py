import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ("accounts", "0001_initial"),
        ("students", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="Document",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "document_type",
                    models.CharField(
                        choices=[
                            ("mandatory_internship", "Mandatory internship"),
                            (
                                "non_mandatory_internship_credit",
                                "Non-mandatory internship credit",
                            ),
                            (
                                "professional_practice_credit",
                                "Professional practice credit",
                            ),
                            ("supervisor_evaluation", "Supervisor evaluation"),
                        ],
                        max_length=60,
                    ),
                ),
                ("student_name", models.CharField(max_length=150)),
                ("student_email", models.EmailField(max_length=254)),
                ("student_registration_number", models.CharField(max_length=50)),
                ("student_course", models.CharField(max_length=150)),
                ("student_campus", models.CharField(max_length=150)),
                ("coordinator_name", models.CharField(blank=True, max_length=150)),
                ("company", models.CharField(max_length=150)),
                ("city", models.CharField(max_length=150)),
                ("document_date", models.DateField()),
                (
                    "attachment",
                    models.FileField(
                        blank=True,
                        null=True,
                        upload_to="documents/attachments/",
                    ),
                ),
                ("form_data", models.JSONField(blank=True, default=dict)),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("submitted", "Submitted"),
                            ("waiting_supervisor", "Waiting supervisor"),
                            ("in_review", "In review"),
                            ("adjustment_requested", "Adjustment requested"),
                            ("approved", "Approved"),
                            ("rejected", "Rejected"),
                            ("cancelled", "Cancelled"),
                        ],
                        default="submitted",
                        max_length=40,
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "related_document",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name="related_documents",
                        to="documents.document",
                    ),
                ),
                (
                    "student",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name="documents",
                        to="students.studentprofile",
                    ),
                ),
                (
                    "supervisor",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name="documents",
                        to="accounts.supervisorprofile",
                    ),
                ),
            ],
            options={
                "verbose_name": "Document",
                "verbose_name_plural": "Documents",
                "ordering": ["-created_at"],
                "permissions": [
                    ("review_document", "Can review document"),
                    ("approve_document", "Can approve document"),
                    ("reject_document", "Can reject document"),
                ],
            },
        ),
    ]
