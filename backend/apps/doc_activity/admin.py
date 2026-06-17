from django.contrib import admin
from .models import DocActivity


@admin.register(DocActivity)
class DocActivityAdmin(admin.ModelAdmin):
    list_display = ["doc_activity_id", "document", "status", "alter_by_user", "server_timestamp", "is_enabled"]
    search_fields = ["description", "document__name"]
    list_filter = ["status", "is_enabled", "server_timestamp"]
    readonly_fields = ["doc_activity_id", "server_timestamp", "last_update"]
