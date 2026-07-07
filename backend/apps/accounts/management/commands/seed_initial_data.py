from django.contrib.auth.models import Group, Permission, User
from django.core.management.base import BaseCommand

from apps.accounts.constants import (
    DEFAULT_GROUPS,
    GROUP_COORDINATOR,
    GROUP_PROFESSOR,
    GROUP_STUDENT,
    GROUP_SUPERVISOR,
)

from apps.students.models import StudentProfile

STUDENTS_DATA = [
    {"username": "aluno.01", "first_name": "Ana", "last_name": "Silva", "email": "ana.silva@example.com", "registration_number": "2024001", "course": "Engenharia de Software", "campus": "Sapucaia", "phone_number": "(11) 99999-0001"},
    {"username": "aluno.02", "first_name": "Bruno", "last_name": "Costa", "email": "bruno.costa@example.com", "registration_number": "2024002", "course": "Ciência da Computação", "campus": "Sapucaia", "phone_number": "(21) 99999-0002"},
    {"username": "aluno.03", "first_name": "Carla", "last_name": "Pereira", "email": "carla.pereira@example.com", "registration_number": "2024003", "course": "Sistemas de Informação", "campus": "Sapucaia", "phone_number": "(31) 99999-0003"},
    {"username": "aluno.04", "first_name": "Daniel", "last_name": "Oliveira", "email": "daniel.oliveira@example.com", "registration_number": "2024004", "course": "Análise e Desenvolvimento de Sistemas", "campus": "Sapucaia", "phone_number": "(41) 99999-0004"},
    {"username": "aluno.05", "first_name": "Elena", "last_name": "Santos", "email": "elena.santos@example.com", "registration_number": "2024005", "course": "Engenharia de Software", "campus": "Sapucaia", "phone_number": "(51) 99999-0005"},
    {"username": "aluno.06", "first_name": "Felipe", "last_name": "Lima", "email": "felipe.lima@example.com", "registration_number": "2024006", "course": "Redes de Computadores", "campus": "Sapucaia", "phone_number": "(61) 99999-0006"},
    {"username": "aluno.07", "first_name": "Gabriela", "last_name": "Almeida", "email": "gabriela.almeida@example.com", "registration_number": "2024007", "course": "Ciência da Computação", "campus": "Sapucaia", "phone_number": "(71) 99999-0007"},
    {"username": "aluno.08", "first_name": "Henrique", "last_name": "Souza", "email": "henrique.souza@example.com", "registration_number": "2024008", "course": "Banco de Dados", "campus": "Sapucaia", "phone_number": "(81) 99999-0008"},
    {"username": "aluno.09", "first_name": "Isabela", "last_name": "Martins", "email": "isabela.martins@example.com", "registration_number": "2024009", "course": "Segurança da Informação", "campus": "Sapucaia", "phone_number": "(91) 99999-0009"},
    {"username": "aluno.10", "first_name": "João", "last_name": "Barbosa", "email": "joao.barbosa@example.com", "registration_number": "2024010", "course": "Inteligência Artificial", "campus": "Sapucaia", "phone_number": "(85) 99999-0010"},
]

DEFAULT_PASSWORD = "senha123"


def get_permissions(app_label: str, codenames: list[str]):
    return Permission.objects.filter(
        content_type__app_label=app_label,
        codename__in=codenames,
    )


class Command(BaseCommand):
    help = "seed initial data (groups, permissions and test students)"

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
                "document",
                [
                    "add_document",
                    "change_document",
                    "view_document",
                ],
            )
        )

        supervisor_permissions = list(
            get_permissions(
                "document",
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
                "document",
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
                "document",
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

        student_group = groups[GROUP_STUDENT]

        for data in STUDENTS_DATA:
            user, user_created = User.objects.get_or_create(
                username=data["username"],
                defaults={
                    "first_name": data["first_name"],
                    "last_name": data["last_name"],
                    "email": data["email"],
                },
            )
            if user_created:
                user.set_password(DEFAULT_PASSWORD)
                user.save()
                user.groups.add(student_group)
                StudentProfile.objects.create(
                    user=user,
                    registration_number=data["registration_number"],
                    course=data["course"],
                    campus=data["campus"],
                    phone_number=data["phone_number"],
                )
