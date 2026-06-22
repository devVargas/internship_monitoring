from django.contrib import admin
from apps.students.models import StudentProfile

@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "matriculation",
        "course",
        "phone_number",
        "created_at",
        "updated_at",
    )
    search_fields = (
        "user__username",
        "user__first_name",
        "user__last_name",
        "user__email",
        "matriculation",
        "course",
    )
    readonly_fields = ("created_at", "updated_at")
