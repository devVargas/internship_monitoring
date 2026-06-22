from django.contrib.auth.models import Group, Permission
from django.core.management.base import BaseCommand

from apps.accounts.constants import DEFAULT_GROUPS, GROUP_COORDINATOR, GROUP_PROFESSOR, GROUP_STUDENT


def get_permissions(app_label: str, codenames: list[str]):
    return Permission.objects.filter(
        content_type__app_label=app_label,
        codename__in=codenames,
    )


class Command(BaseCommand):
    help = f"start seed_initial_data"

    def handle(self, *args, **options):  # noqa: ARG002
        groups = {}

        for group_name in DEFAULT_GROUPS:
            group, created = Group.objects.get_or_create(name=group_name)
            groups[group_name] = group
            status = "criado" if created else "já existia"
            self.stdout.write(self.style.SUCCESS(f"Grupo {group_name}: {status}"))

        student_profile_permissions_for_student = get_permissions(
            "students",
            [
                "view_studentprofile",
                "change_studentprofile",
            ],
        )

        student_profile_permissions_for_professor = get_permissions(
            "students",
            [
                "view_studentprofile",
            ],
        )

        student_profile_permissions_for_coordinator = get_permissions(
            "students",
            [
                "add_studentprofile",
                "change_studentprofile",
                "delete_studentprofile",
                "view_studentprofile",
            ],
        )

        user_permissions_for_professor = get_permissions(
            "auth",
            [
                "add_user",
                "view_user",
            ],
        )

        user_permissions_for_coordinator = get_permissions(
            "auth",
            [
                "add_user",
                "change_user",
                "view_user",
            ],
        )

        groups[GROUP_STUDENT].permissions.set(student_profile_permissions_for_student)
        groups[GROUP_PROFESSOR].permissions.set(
            list(student_profile_permissions_for_professor) + list(user_permissions_for_professor)
        )
        groups[GROUP_COORDINATOR].permissions.set(
            list(student_profile_permissions_for_coordinator) + list(user_permissions_for_coordinator)
        )

        self.stdout.write(self.style.SUCCESS("finish"))
