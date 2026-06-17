from django.contrib import admin

from .models import Student


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ["id", "registration_number", "name", "email", "phone"]
    search_fields = ["registration_number", "name", "email"]
