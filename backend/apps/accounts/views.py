from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from apps.accounts.permissions import CanCreateUser
from apps.accounts.serializers import (
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

    def get(self, request):
        return Response(UserSerializer(request.user).data)

class StudentRegistrationView(generics.CreateAPIView):
    serializer_class = StudentRegistrationSerializer
    permission_classes = [permissions.AllowAny]

class ProfessorRegistrationView(generics.CreateAPIView):
    serializer_class = ProfessorRegistrationSerializer
    permission_classes = [CanCreateUser]

class SupervisorRegistrationView(generics.CreateAPIView):
    serializer_class = SupervisorRegistrationSerializer
    permission_classes = [CanCreateUser]
