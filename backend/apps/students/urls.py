from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.students.views import CoordinatorsListView, MyStudentProfileView, StudentProfileViewSet, SupervisorsListView

router = DefaultRouter()
router.register("students", StudentProfileViewSet, basename="students")

urlpatterns = [
    path("students/supervisors/", SupervisorsListView.as_view()),
    path("students/coordinators/", CoordinatorsListView.as_view()),
    path("students/me/", MyStudentProfileView.as_view()),
    path("", include(router.urls)),
]
