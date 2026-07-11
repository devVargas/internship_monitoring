from django.conf import settings
from django.contrib.auth.hashers import make_password
from django.db import migrations

def create_master_user(apps, schema_editor):
    User = apps.get_model("auth", "User")

    User.objects.update_or_create(
        username=settings.MASTER_USER_USERNAME,
        defaults={
            "email": settings.MASTER_USER_EMAIL,
            "first_name": "Master",
            "last_name": "",
            "password": make_password(
                settings.MASTER_USER_PASSWORD
            ),
            "is_active": True,
            "is_staff": True,
            "is_superuser": True,
        },
    )

class Migration(migrations.Migration):
    dependencies = [
        ("accounts", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(
            create_master_user,
            migrations.RunPython.noop,
        ),
    ]