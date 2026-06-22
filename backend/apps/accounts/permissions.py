from rest_framework.permissions import BasePermission, DjangoModelPermissions

class DjangoModelPermissionsWithView(DjangoModelPermissions):
    perms_map = {
        "GET": ["%(app_label)s.view_%(model_name)s"],
        "OPTIONS": [],
        "HEAD": [],
        "POST": ["%(app_label)s.add_%(model_name)s"],
        "PUT": ["%(app_label)s.change_%(model_name)s"],
        "PATCH": ["%(app_label)s.change_%(model_name)s"],
        "DELETE": ["%(app_label)s.delete_%(model_name)s"],
    }

class CanCreateProfessorUser(BasePermission):
    """Permite criar professor apenas para quem possui auth.add_user."""

    def has_permission(self, request, view) -> bool:  # noqa: ARG002
        user = request.user
        if not user or not user.is_authenticated:
            return False

        if user.is_superuser:
            return True

        return user.has_perm("auth.add_user")
