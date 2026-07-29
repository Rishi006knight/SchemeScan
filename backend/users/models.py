from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    # Extending the default Django user
    # Add any extra fields like phone_number if needed
    phone_number = models.CharField(max_length=15, blank=True, null=True)

    def __str__(self):
        return self.username
