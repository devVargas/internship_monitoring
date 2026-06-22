from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.students.views import MyStudentProfileView, StudentProfileViewSet

router = DefaultRouter()
router.register("students", StudentProfileViewSet, basename="students")

urlpatterns = [
    path("students/me/", MyStudentProfileView.as_view()),
    path("", include(router.urls)),
]
