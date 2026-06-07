from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StudentViewSet, DocumentsViewSet, DocActivityViewSet

router = DefaultRouter()
router.register(r'students', StudentViewSet)
router.register(r'documents', DocumentsViewSet)
router.register(r'doc-activities', DocActivityViewSet)

urlpatterns = [
    path('', include(router.urls)),
]