from django.urls import path
from .views import (
    SchemeListView, SchemeDetailView, EligibilityCheckView,
    BookmarkToggleView, BookmarkListView, EligibilityHistoryView,
)

urlpatterns = [
    path('', SchemeListView.as_view(), name='scheme-list'),
    path('<int:pk>/', SchemeDetailView.as_view(), name='scheme-detail'),
    path('check/', EligibilityCheckView.as_view(), name='eligibility-check'),
    path('<int:pk>/bookmark/', BookmarkToggleView.as_view(), name='bookmark-toggle'),
    path('bookmarks/', BookmarkListView.as_view(), name='bookmark-list'),
    path('history/', EligibilityHistoryView.as_view(), name='eligibility-history'),
]
