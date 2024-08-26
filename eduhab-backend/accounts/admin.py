from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, UserType
from notes.models import Note 

admin.site.register(UserType)

class NoteInline(admin.StackedInline):
    model = Note
    extra = 0  # No extra forms unless needed
    can_delete = True
    fields = ['title', 'content', 'created_at']
    readonly_fields = ['created_at']
    verbose_name_plural = 'user notes'  # Optional: to rename the section
    
    def get_extra(self, request, obj=None, **kwargs):
        if obj:
            count = obj.notes.count()  # Count the notes related to this user
            if count == 0:
                self.extra = 1  # Show an empty form when no notes exist
                return 1
        self.extra = 0  # Otherwise, do not show an extra form
        return 0

class CustomUserAdmin(UserAdmin):
    inlines = [NoteInline] 
    model = User
    fieldsets = UserAdmin.fieldsets + (
        (None, {'fields': ('user_types',)}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        (None, {'fields': ('user_types',)}),
    )
    filter_horizontal = ('user_types',)  # This makes it easier to select multiple types
    
try:
    admin.site.unregister(User)
except admin.sites.NotRegistered:
    pass

admin.site.register(User, CustomUserAdmin)
