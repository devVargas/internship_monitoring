from django.contrib.auth.models import Group, Permission
from django.core.management.base import BaseCommand

from apps.accounts.constants import (
    DEFAULT_GROUPS,
    GROUP_COORDINATOR,
    GROUP_PROFESSOR,
    GROUP_STUDENT,
    GROUP_SUPERVISOR,
)


def get_permissions(app_label: str, codenames: list[str]):
    return Permission.objects.filter(
        content_type__app_label=app_label,
        codename__in=codenames,
    )


class Command(BaseCommand):
    help = f"start seed_initial_data"

    def handle(self, *args, **options):
        groups = {}

        for group_name in DEFAULT_GROUPS:
            group, created = Group.objects.get_or_create(name=group_name)
            groups[group_name] = group
            status = "created" if created else "already existed"
            self.stdout.write(self.style.SUCCESS(f"Group {group_name}: {status}"))

        student_permissions = list(
            get_permissions(
                "students",
                [
                    "view_studentprofile",
                    "change_studentprofile",
                ],
            )
        ) + list(
            get_permissions(
                "documents",
                [
                    "add_document",
                    "change_document",
                    "view_document",
                ],
            )
        )

        supervisor_permissions = list(
            get_permissions(
                "documents",
                [
                    "add_document",
                    "change_document",
                    "view_document",
                ],
            )
        )

        professor_permissions = list(
            get_permissions(
                "students",
                [
                    "view_studentprofile",
                ],
            )
        ) + list(
            get_permissions(
                "documents",
                [
                    "view_document",
                    "review_document",
                    "approve_document",
                    "reject_document",
                ],
            )
        )

        coordinator_permissions = list(
            get_permissions(
                "students",
                [
                    "add_studentprofile",
                    "change_studentprofile",
                    "delete_studentprofile",
                    "view_studentprofile",
                ],
            )
        ) + list(
            get_permissions(
                "documents",
                [
                    "add_document",
                    "change_document",
                    "delete_document",
                    "view_document",
                    "review_document",
                    "approve_document",
                    "reject_document",
                ],
            )
        ) + list(
            get_permissions(
                "auth",
                [
                    "add_user",
                    "change_user",
                    "view_user",
                ],
            )
        )

        groups[GROUP_STUDENT].permissions.set(student_permissions)
        groups[GROUP_SUPERVISOR].permissions.set(supervisor_permissions)
        groups[GROUP_PROFESSOR].permissions.set(professor_permissions)
        groups[GROUP_COORDINATOR].permissions.set(coordinator_permissions)

        self.stdout.write(self.style.SUCCESS("Initial permissions configured."))
