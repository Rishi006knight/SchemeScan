from django.db.models import Q
from django.core.cache import cache
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import Scheme, SchemeRule, Bookmark, EligibilityCheck
from .serializers import (
    SchemeSerializer, EligibilityResultSerializer,
    BookmarkSerializer, EligibilityCheckSerializer
)
from .engine import evaluate_eligibility
from profiles.models import CitizenProfile


class SchemeListView(generics.ListAPIView):
    """
    GET /api/schemes/
    Public. Supports ?search=, ?category=, ?state=, ?is_active=
    """
    serializer_class = SchemeSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = Scheme.objects.filter(is_active=True).select_related('rule')
        params = self.request.query_params

        # Full-text search across name, description, search_tags
        search = params.get('search', '').strip()
        if search:
            qs = qs.filter(
                Q(name__icontains=search) |
                Q(description__icontains=search) |
                Q(search_tags__icontains=search) |
                Q(category__icontains=search)
            )

        category = params.get('category', '').strip()
        if category:
            qs = qs.filter(category__iexact=category)

        state = params.get('state', '').strip()
        if state:
            qs = qs.filter(Q(state_applicable__iexact=state) | Q(state_applicable__iexact='All'))

        return qs


class SchemeDetailView(generics.RetrieveAPIView):
    """GET /api/schemes/:id/ — Public"""
    serializer_class = SchemeSerializer
    permission_classes = [permissions.AllowAny]
    queryset = Scheme.objects.filter(is_active=True).select_related('rule')


class EligibilityCheckView(APIView):
    """
    POST /api/schemes/check/  — JWT required
    Evaluates all active schemes against the user's CitizenProfile.
    Returns eligible, not_eligible, needs_info buckets with explanations.
    Uses Redis cache (1hr) — invalidated on profile update.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        cache_key = f"eligibility:{user.id}"
        cached = cache.get(cache_key)
        if cached:
            return Response(cached)

        # Load profile
        try:
            profile = CitizenProfile.objects.get(user=user)
        except CitizenProfile.DoesNotExist:
            return Response(
                {'detail': 'Profile not found. Please complete your profile first.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Build profile dict for JSON Logic
        profile_data = {
            'age': profile.age,
            'gender': profile.gender,
            'state': profile.state,
            'district': profile.district,
            'annual_income': float(profile.annual_income) if profile.annual_income else None,
            'occupation': profile.occupation,
            'education': profile.education,
            'category': profile.category,
            'disability_status': profile.disability_status,
            'marital_status': profile.marital_status,
            'family_size': profile.family_size,
            'is_rural': profile.is_rural,
            'land_ownership_acres': float(profile.land_ownership_acres) if profile.land_ownership_acres else None,
            'is_student': profile.is_student,
            'employment_status': profile.employment_status,
        }
        # Merge extra_details for custom fields
        profile_data.update(profile.extra_details or {})

        # Evaluate all active schemes with rules
        schemes_with_rules = Scheme.objects.filter(is_active=True).select_related('rule')
        eligible, not_eligible, needs_info = [], [], []
        history_records = []

        for scheme in schemes_with_rules:
            if not hasattr(scheme, 'rule'):
                continue

            result, explanation = evaluate_eligibility(scheme.rule.logic, profile_data)

            entry = {
                'scheme_id': scheme.id,
                'scheme_name': scheme.name,
                'category': scheme.category,
                'result': result,
                'explanation': explanation,
                'benefits': scheme.benefits,
                'official_website': scheme.official_website,
                'deadline': str(scheme.deadline) if scheme.deadline else None,
            }

            if result == 'eligible':
                eligible.append(entry)
            elif result == 'not_eligible':
                not_eligible.append(entry)
            else:
                needs_info.append(entry)

            # Save to history
            history_records.append(EligibilityCheck(
                user=user, scheme=scheme, result=result, explanation=explanation
            ))

        # Bulk create history (ignore duplicates via delete+create)
        EligibilityCheck.objects.filter(user=user).delete()
        EligibilityCheck.objects.bulk_create(history_records)

        response_data = {
            'profile_complete': all(v is not None for k, v in profile_data.items()
                                    if k not in ('district', 'extra_details')),
            'summary': {
                'eligible_count': len(eligible),
                'not_eligible_count': len(not_eligible),
                'needs_info_count': len(needs_info),
            },
            'eligible': eligible,
            'not_eligible': not_eligible,
            'needs_info': needs_info,
        }

        cache.set(cache_key, response_data, timeout=3600)
        return Response(response_data)


class BookmarkToggleView(APIView):
    """
    POST   /api/schemes/:id/bookmark/  → add bookmark
    DELETE /api/schemes/:id/bookmark/  → remove bookmark
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            scheme = Scheme.objects.get(pk=pk, is_active=True)
        except Scheme.DoesNotExist:
            return Response({'detail': 'Scheme not found.'}, status=status.HTTP_404_NOT_FOUND)

        bookmark, created = Bookmark.objects.get_or_create(user=request.user, scheme=scheme)
        if created:
            return Response({'bookmarked': True, 'message': f'"{scheme.name}" saved.'}, status=status.HTTP_201_CREATED)
        return Response({'bookmarked': True, 'message': 'Already bookmarked.'})

    def delete(self, request, pk):
        deleted, _ = Bookmark.objects.filter(user=request.user, scheme_id=pk).delete()
        if deleted:
            return Response({'bookmarked': False, 'message': 'Bookmark removed.'})
        return Response({'detail': 'Bookmark not found.'}, status=status.HTTP_404_NOT_FOUND)


class BookmarkListView(generics.ListAPIView):
    """GET /api/schemes/bookmarks/ — My saved schemes"""
    serializer_class = BookmarkSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Bookmark.objects.filter(user=self.request.user).select_related('scheme__rule')


class EligibilityHistoryView(generics.ListAPIView):
    """GET /api/schemes/history/ — My past eligibility checks"""
    serializer_class = EligibilityCheckSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return EligibilityCheck.objects.filter(user=self.request.user).select_related('scheme')[:50]
