from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdminOrReadOnly(BasePermission):
    """Admins podem fazer qualquer operação; outros usuários só leitura."""

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return request.user and request.user.is_authenticated
        return request.user and request.user.is_staff


class IsOwnerOrAdmin(BasePermission):
    """Permite acesso apenas ao dono do objeto ou a admins."""

    def has_object_permission(self, request, view, obj):
        if request.user.is_staff:
            return True
        if hasattr(obj, "user"):
            return obj.user == request.user
        if hasattr(obj, "alter_by_user"):
            return obj.alter_by_user == request.user
        return False


class IsDocumentOwnerOrAdmin(BasePermission):
    """Permite acesso a DocActivity apenas se o usuário for dono do Document relacionado ou admin."""

    def has_object_permission(self, request, view, obj):
        if request.user.is_staff:
            return True
        return obj.document.user == request.user
