from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DocActivityViewSet

router = DefaultRouter()
router.register(r"doc-activities", DocActivityViewSet, basename="docactivity")

urlpatterns = [
    path("", include(router.urls)),
]
