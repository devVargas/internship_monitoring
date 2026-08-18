from rest_framework.permissions import BasePermission


def belongs_to_group(user, group_name):
    return user.groups.filter(name=group_name).exists()

class CanCreateProfessor(BasePermission):
    message = "You do not have permission to register teachers."

    def has_permission(self, request, view):
        user = request.user

        if not user or not user.is_authenticated:
            return False

        if user.is_superuser:
            return True

        return user.groups.filter(
            name="Coordinator",
        ).exists()

class CanCreateCoordinator(BasePermission):
    message = "You do not have permission to register coordinators."

    def has_permission(self, request, view):
        user = request.user

        if not user or not user.is_authenticated:
            return False

        if user.is_superuser:
            return True

        return user.groups.filter(
            name="Coordinator",
        ).exists()