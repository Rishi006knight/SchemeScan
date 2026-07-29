from django.urls import path
from .views import CitizenProfileView, OCRUploadView

urlpatterns = [
    path('me/', CitizenProfileView.as_view(), name='profile-me'),
    path('ocr-upload/', OCRUploadView.as_view(), name='ocr-upload'),
]
