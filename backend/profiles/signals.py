from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings

from .models import CitizenProfile


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_profile_on_user_register(sender, instance, created, **kwargs):
    """Automatically create an empty CitizenProfile when a new User is created."""
    if created:
        CitizenProfile.objects.get_or_create(user=instance)
