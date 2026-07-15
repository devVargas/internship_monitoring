from drf_spectacular.utils import extend_schema
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from apps.accounts.permissions import (
    CanCreateCoordinator,
    CanCreateProfessor,
)
from apps.accounts.profile_serializers import UserProfileSerializer
from apps.accounts.serializers import (
    CoordinatorRegistrationSerializer,
    CustomTokenObtainPairSerializer,
    ProfessorRegistrationSerializer,
    StudentRegistrationSerializer,
    SupervisorRegistrationSerializer,
)

class LoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(responses=UserProfileSerializer)
    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)

    @extend_schema(
        request=UserProfileSerializer,
        responses=UserProfileSerializer,
    )
    def patch(self, request):
        serializer = UserProfileSerializer(
            request.user,
            data=request.data,
            partial=True,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data)

class StudentRegistrationView(generics.CreateAPIView):
    serializer_class = StudentRegistrationSerializer
    permission_classes = [permissions.AllowAny]

class SupervisorRegistrationView(generics.CreateAPIView):
    serializer_class = SupervisorRegistrationSerializer
    permission_classes = [permissions.AllowAny]

class ProfessorRegistrationView(generics.CreateAPIView):
    serializer_class = ProfessorRegistrationSerializer
    permission_classes = [CanCreateProfessor]

class CoordinatorRegistrationView(generics.CreateAPIView):
    serializer_class = CoordinatorRegistrationSerializer
    permission_classes = [CanCreateCoordinator]
