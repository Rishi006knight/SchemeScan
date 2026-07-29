from django.contrib import admin
from .models import Scheme, SchemeRule

class SchemeRuleInline(admin.StackedInline):
    model = SchemeRule
    can_delete = False

@admin.register(Scheme)
class SchemeAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'state_applicable', 'is_active', 'deadline')
    list_filter = ('category', 'state_applicable', 'is_active')
    search_fields = ('name', 'description')
    inlines = [SchemeRuleInline]
