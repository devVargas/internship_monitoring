from django.contrib.auth.models import Group, Permission, User
from django.core.management.base import BaseCommand

from apps.accounts.constants import DEFAULT_GROUPS, GROUP_COORDINATOR, GROUP_PROFESSOR, GROUP_STUDENT
from apps.students.models import StudentProfile

STUDENTS_DATA = [
    {"username": "aluno.01", "first_name": "Ana", "last_name": "Silva", "email": "ana.silva@example.com", "matriculation": "2024001", "course": "Engenharia de Software", "phone_number": "(11) 99999-0001"},
    {"username": "aluno.02", "first_name": "Bruno", "last_name": "Costa", "email": "bruno.costa@example.com", "matriculation": "2024002", "course": "Ciência da Computação", "phone_number": "(21) 99999-0002"},
    {"username": "aluno.03", "first_name": "Carla", "last_name": "Pereira", "email": "carla.pereira@example.com", "matriculation": "2024003", "course": "Sistemas de Informação", "phone_number": "(31) 99999-0003"},
    {"username": "aluno.04", "first_name": "Daniel", "last_name": "Oliveira", "email": "daniel.oliveira@example.com", "matriculation": "2024004", "course": "Análise e Desenvolvimento de Sistemas", "phone_number": "(41) 99999-0004"},
    {"username": "aluno.05", "first_name": "Elena", "last_name": "Santos", "email": "elena.santos@example.com", "matriculation": "2024005", "course": "Engenharia de Software", "phone_number": "(51) 99999-0005"},
    {"username": "aluno.06", "first_name": "Felipe", "last_name": "Lima", "email": "felipe.lima@example.com", "matriculation": "2024006", "course": "Redes de Computadores", "phone_number": "(61) 99999-0006"},
    {"username": "aluno.07", "first_name": "Gabriela", "last_name": "Almeida", "email": "gabriela.almeida@example.com", "matriculation": "2024007", "course": "Ciência da Computação", "phone_number": "(71) 99999-0007"},
    {"username": "aluno.08", "first_name": "Henrique", "last_name": "Souza", "email": "henrique.souza@example.com", "matriculation": "2024008", "course": "Banco de Dados", "phone_number": "(81) 99999-0008"},
    {"username": "aluno.09", "first_name": "Isabela", "last_name": "Martins", "email": "isabela.martins@example.com", "matriculation": "2024009", "course": "Segurança da Informação", "phone_number": "(91) 99999-0009"},
    {"username": "aluno.10", "first_name": "João", "last_name": "Barbosa", "email": "joao.barbosa@example.com", "matriculation": "2024010", "course": "Inteligência Artificial", "phone_number": "(85) 99999-0010"},
]

DEFAULT_PASSWORD = "senha123"


def get_permissions(app_label: str, codenames: list[str]):
    return Permission.objects.filter(
        content_type__app_label=app_label,
        codename__in=codenames,
    )


class Command(BaseCommand):
    help = "seed initial data (groups, permissions and test students)"

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
                    matriculation=data["matriculation"],
                    course=data["course"],
                    phone_number=data["phone_number"],
                )
                self.stdout.write(self.style.SUCCESS(f"Aluno {data['username']}: criado"))
            else:
                self.stdout.write(self.style.WARNING(f"Aluno {data['username']}: já existia"))

        self.stdout.write(self.style.SUCCESS("Seed concluído"))
