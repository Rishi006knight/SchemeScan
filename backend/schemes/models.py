from django.db import models
from django.conf import settings


class Scheme(models.Model):
    CATEGORY_CHOICES = [
        ('Agriculture', 'Agriculture'),
        ('Education', 'Education'),
        ('Health', 'Health'),
        ('Housing', 'Housing'),
        ('Women', 'Women'),
        ('Employment', 'Employment'),
        ('Finance', 'Finance'),
        ('Insurance', 'Insurance'),
        ('Pension', 'Pension'),
        ('MSME', 'MSME'),
        ('Other', 'Other'),
    ]

    name = models.CharField(max_length=255)
    description = models.TextField()
    category = models.CharField(max_length=100, choices=CATEGORY_CHOICES)
    state_applicable = models.CharField(max_length=100, default='All')  # 'All' for central
    benefits = models.TextField(help_text="Description of financial or other benefits")
    documents_required = models.TextField(help_text="Comma-separated list of required documents")
    official_website = models.URLField(blank=True, null=True)
    deadline = models.DateField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    # For search ranking
    search_tags = models.TextField(blank=True, help_text="Space-separated keywords for search")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name


class SchemeRule(models.Model):
    scheme = models.OneToOneField(Scheme, on_delete=models.CASCADE, related_name='rule')
    # JSON Logic rule — example: {"and": [{"<": [{"var": "annual_income"}, 200000]}, {"==": [{"var": "occupation"}, "Farmer"]}]}
    logic = models.JSONField(help_text="JSON Logic rule for eligibility")

    def __str__(self):
        return f"Rule for {self.scheme.name}"


class Bookmark(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='bookmarks')
    scheme = models.ForeignKey(Scheme, on_delete=models.CASCADE, related_name='bookmarks')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'scheme')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} → {self.scheme.name}"


class EligibilityCheck(models.Model):
    RESULT_CHOICES = [
        ('eligible', 'Eligible'),
        ('not_eligible', 'Not Eligible'),
        ('needs_info', 'Needs More Information'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='eligibility_checks')
    scheme = models.ForeignKey(Scheme, on_delete=models.CASCADE, related_name='eligibility_checks')
    result = models.CharField(max_length=20, choices=RESULT_CHOICES)
    explanation = models.JSONField(default=list, help_text="List of condition results explaining the decision")
    checked_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-checked_at']

    def __str__(self):
        return f"{self.user.username} — {self.scheme.name} — {self.result}"
