from drf_spectacular.utils import extend_schema
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from apps.accounts.permissions import (
    CanCreateCoordinator,
    CanCreateProfessor,
)
from apps.accounts.serializers import (
    CoordinatorRegistrationSerializer,
    CustomTokenObtainPairSerializer,
    ProfessorRegistrationSerializer,
    StudentRegistrationSerializer,
    SupervisorRegistrationSerializer,
    UserSerializer,
)

class LoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(responses=UserSerializer)
    def get(self, request):
        return Response(UserSerializer(request.user).data)

class StudentRegistrationView(generics.CreateAPIView):
    serializer_class = StudentRegistrationSerializer
    permission_classes = [permissions.AllowAny]

class ProfessorRegistrationView(generics.CreateAPIView):
    serializer_class = ProfessorRegistrationSerializer
    permission_classes = [CanCreateProfessor]

class CoordinatorRegistrationView(generics.CreateAPIView):
    serializer_class = CoordinatorRegistrationSerializer
    permission_classes = [CanCreateCoordinator]

class SupervisorRegistrationView(generics.CreateAPIView):
    serializer_class = SupervisorRegistrationSerializer
    permission_classes = [permissions.AllowAny]
