from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from django.views.generic import TemplateView
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path("admin/", admin.site.urls),
    # path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("api/auth/login/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    # path("api/auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),   
    # path("api/internships/", include("apps.internships.urls")),
    # path("api/documents/", include("apps.documents.urls")),
    # path("", TemplateView.as_view(template_name="index.html"), name="frontend"),
    path("api/", include("apps.students.urls")),
    path("api/", include("apps.documents.urls")),
    path("api/", include("apps.doc_activity.urls"))

]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
