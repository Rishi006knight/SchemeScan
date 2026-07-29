from django.db import models
from django.conf import settings

class CitizenProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='profile')
    age = models.IntegerField(null=True, blank=True)
    gender = models.CharField(max_length=20, choices=[('Male', 'Male'), ('Female', 'Female'), ('Other', 'Other')], null=True, blank=True)
    state = models.CharField(max_length=100, null=True, blank=True)
    district = models.CharField(max_length=100, null=True, blank=True)
    annual_income = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    occupation = models.CharField(max_length=100, null=True, blank=True)
    education = models.CharField(max_length=100, null=True, blank=True)
    category = models.CharField(max_length=20, choices=[('SC', 'SC'), ('ST', 'ST'), ('OBC', 'OBC'), ('General', 'General')], null=True, blank=True)
    disability_status = models.BooleanField(default=False)
    marital_status = models.CharField(max_length=50, null=True, blank=True)
    family_size = models.IntegerField(null=True, blank=True)
    is_rural = models.BooleanField(default=False, help_text="True if rural, False if urban")
    land_ownership_acres = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    is_student = models.BooleanField(default=False)
    employment_status = models.CharField(max_length=50, null=True, blank=True)
    
    # Store dynamic fields if needed later
    extra_details = models.JSONField(default=dict, blank=True)

    def __str__(self):
        return f"{self.user.username}'s Profile"
