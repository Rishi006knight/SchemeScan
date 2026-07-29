from django.contrib import admin
from .models import CitizenProfile

@admin.register(CitizenProfile)
class CitizenProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'state', 'annual_income', 'occupation')
    search_fields = ('user__username', 'state', 'district')
    list_filter = ('state', 'category', 'is_rural', 'is_student')
