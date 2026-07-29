from rest_framework import serializers
from .models import CitizenProfile


class CitizenProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = CitizenProfile
        fields = (
            'id',
            'username',
            'email',
            'age',
            'gender',
            'state',
            'district',
            'annual_income',
            'occupation',
            'education',
            'category',
            'disability_status',
            'marital_status',
            'family_size',
            'is_rural',
            'land_ownership_acres',
            'is_student',
            'employment_status',
            'extra_details',
        )
        read_only_fields = ('id', 'username', 'email')
