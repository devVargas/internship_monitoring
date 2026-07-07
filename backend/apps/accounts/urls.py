from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from apps.accounts.views import (
    LoginView,
    MeView,
    ProfessorRegistrationView,
    StudentRegistrationView,
    SupervisorRegistrationView,
)

urlpatterns = [
    path("login/", LoginView.as_view()),
    path("refresh/", TokenRefreshView.as_view()),
    path("me/", MeView.as_view(), name="me"),
    path("register/student/", StudentRegistrationView.as_view()),
    path("register/professor/", ProfessorRegistrationView.as_view()),
    path("register/supervisor/", SupervisorRegistrationView.as_view()),
]
