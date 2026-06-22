from django.contrib import admin
from .models import Documents


class DocActivityInline(admin.TabularInline):
    from apps.doc_activity.models import DocActivity
    model = DocActivity
    extra = 0
    readonly_fields = ["doc_activity_id", "server_timestamp", "last_update", "alter_by_user"]
    fields = ["status", "description", "alter_by_user", "server_timestamp", "is_enabled"]


@admin.register(Documents)
class DocumentsAdmin(admin.ModelAdmin):
    list_display = ["documents_id", "name", "student", "status", "is_enabled", "server_timestamp"]
    search_fields = ["name", "description", "student__name"]
    list_filter = ["status", "is_enabled", "server_timestamp"]
    readonly_fields = ["documents_id", "server_timestamp", "last_update"]
    inlines = [DocActivityInline]
