from rest_framework import serializers
from .models import Scheme, SchemeRule, Bookmark, EligibilityCheck


class SchemeRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = SchemeRule
        fields = ('id', 'logic')


class SchemeSerializer(serializers.ModelSerializer):
    rule = SchemeRuleSerializer(read_only=True)
    is_bookmarked = serializers.SerializerMethodField()

    class Meta:
        model = Scheme
        fields = (
            'id', 'name', 'description', 'category', 'state_applicable',
            'benefits', 'documents_required', 'official_website',
            'deadline', 'is_active', 'search_tags', 'rule',
            'is_bookmarked', 'created_at', 'updated_at',
        )

    def get_is_bookmarked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Bookmark.objects.filter(user=request.user, scheme=obj).exists()
        return False


class EligibilityResultSerializer(serializers.Serializer):
    """Used to return eligibility check results."""
    scheme_id = serializers.IntegerField()
    scheme_name = serializers.CharField()
    category = serializers.CharField()
    result = serializers.ChoiceField(choices=['eligible', 'not_eligible', 'needs_info'])
    explanation = serializers.ListField()
    benefits = serializers.CharField()
    official_website = serializers.URLField(allow_null=True)
    deadline = serializers.DateField(allow_null=True)


class BookmarkSerializer(serializers.ModelSerializer):
    scheme = SchemeSerializer(read_only=True)
    scheme_id = serializers.PrimaryKeyRelatedField(
        queryset=Scheme.objects.all(), source='scheme', write_only=True
    )

    class Meta:
        model = Bookmark
        fields = ('id', 'scheme', 'scheme_id', 'created_at')
        read_only_fields = ('id', 'created_at')


class EligibilityCheckSerializer(serializers.ModelSerializer):
    scheme_name = serializers.CharField(source='scheme.name', read_only=True)
    category = serializers.CharField(source='scheme.category', read_only=True)
    benefits = serializers.CharField(source='scheme.benefits', read_only=True)

    class Meta:
        model = EligibilityCheck
        fields = ('id', 'scheme_name', 'category', 'benefits', 'result', 'explanation', 'checked_at')
        read_only_fields = fields
