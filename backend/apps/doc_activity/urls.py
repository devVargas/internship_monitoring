from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.doc_activity.views import DocumentActivityViewSet

router = DefaultRouter()
router.register("document-activities", DocumentActivityViewSet, basename="document-activities")

urlpatterns = [
    path("", include(router.urls)),
]
