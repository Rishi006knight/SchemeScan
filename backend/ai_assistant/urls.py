from django.urls import path
from .views import ChatbotView, NLPProfileExtractView, EligibilityExplainView

urlpatterns = [
    path('chat/', ChatbotView.as_view(), name='ai-chat'),
    path('extract-profile/', NLPProfileExtractView.as_view(), name='ai-extract-profile'),
    path('explain/', EligibilityExplainView.as_view(), name='ai-explain'),
]
