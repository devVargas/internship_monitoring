from django.contrib.auth import get_user_model
from drf_spectacular.utils import extend_schema
from rest_framework import permissions, viewsets
from rest_framework.exceptions import NotFound
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.constants import (
    GROUP_COORDINATOR,
    GROUP_PROFESSOR,
    GROUP_STUDENT,
    GROUP_SUPERVISOR,
)
from apps.accounts.models import SupervisorProfile
from apps.students.models import StudentProfile
from apps.students.serializers import (
    AcademicAdvisorSerializer,
    CoordinatorUserSerializer,
    StudentProfileSerializer,
    SupervisorUserSerializer,
)

User = get_user_model()


class SupervisorsListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(responses=SupervisorUserSerializer(many=True))
    def get(self, request):
        supervisors = SupervisorProfile.objects.filter(
            user__groups__name=GROUP_SUPERVISOR,
        ).select_related("user")
        serializer = SupervisorUserSerializer(supervisors, many=True)
        return Response(serializer.data)


class CoordinatorsListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(responses=CoordinatorUserSerializer(many=True))
    def get(self, request):
        coordinators = User.objects.filter(
            groups__name=GROUP_COORDINATOR,
            is_active=True,
        ).distinct().order_by("first_name", "last_name", "email")
        serializer = CoordinatorUserSerializer(coordinators, many=True)
        return Response(serializer.data)


class AcademicAdvisorsListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(responses=AcademicAdvisorSerializer(many=True))
    def get(self, request):
        advisors = User.objects.filter(
            groups__name__in=[GROUP_PROFESSOR, GROUP_COORDINATOR],
            is_active=True,
        ).distinct().prefetch_related("groups").order_by(
            "first_name",
            "last_name",
            "email",
        )
        serializer = AcademicAdvisorSerializer(advisors, many=True)
        return Response(serializer.data)


class StudentProfileViewSet(viewsets.ModelViewSet):
    serializer_class = StudentProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ["get", "put"]

    def get_queryset(self):
        user = self.request.user
        queryset = StudentProfile.objects.select_related("user")

        if user.is_staff or user.is_superuser:
            return queryset.all()

        if user.groups.filter(name__in=[GROUP_PROFESSOR, GROUP_COORDINATOR]).exists():
            return queryset.all()

        if user.groups.filter(name=GROUP_STUDENT).exists():
            return queryset.filter(user=user)

        return queryset.none()


class MyStudentProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(responses=StudentProfileSerializer)
    def get(self, request):
        try:
            profile = request.user.student_profile
        except StudentProfile.DoesNotExist as exc:
            raise NotFound("O usuário logado não possui perfil de estudante.") from exc

        serializer = StudentProfileSerializer(profile)
        return Response(serializer.data)
