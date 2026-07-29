import os
import io
import json
import logging

from django.conf import settings
from django.core.cache import cache
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser

from .models import CitizenProfile
from .serializers import CitizenProfileSerializer

logger = logging.getLogger(__name__)


class CitizenProfileView(generics.RetrieveUpdateAPIView):
    """
    GET   /api/profiles/me/  — retrieve logged-in user's profile
    PUT   /api/profiles/me/  — full update
    PATCH /api/profiles/me/  — partial update
    Also invalidates the eligibility cache on update.
    """
    serializer_class = CitizenProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        profile, _ = CitizenProfile.objects.get_or_create(user=self.request.user)
        return profile

    def perform_update(self, serializer):
        serializer.save()
        # Invalidate eligibility cache so next /check/ is fresh
        cache.delete(f"eligibility:{self.request.user.id}")


class OCRUploadView(APIView):
    """
    POST /api/profiles/ocr-upload/
    Accepts an image (Aadhaar / Income Certificate / Student ID).
    Pipeline:
      1. Pillow preprocess (grayscale → threshold)
      2. Tesseract → raw text
      3. Gemini → structured profile fields JSON
    Returns extracted fields for frontend to auto-fill.
    """
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser]

    def post(self, request):
        image_file = request.FILES.get('document')
        if not image_file:
            return Response({'detail': 'No document file provided.'}, status=status.HTTP_400_BAD_REQUEST)

        doc_type = request.data.get('doc_type', 'general')  # aadhaar | income_cert | student_id | general

        # ── Step 1: Preprocess with Pillow ─────────────────────────────
        try:
            from PIL import Image, ImageFilter, ImageEnhance
            img = Image.open(image_file).convert('L')  # Grayscale
            img = img.filter(ImageFilter.SHARPEN)
            enhancer = ImageEnhance.Contrast(img)
            img = enhancer.enhance(2.0)
            # Binarize
            img = img.point(lambda x: 0 if x < 128 else 255, '1')
        except Exception as e:
            logger.error(f"Image preprocessing failed: {e}")
            return Response({'detail': 'Could not process image.'}, status=status.HTTP_400_BAD_REQUEST)

        # ── Step 2: Tesseract OCR ───────────────────────────────────────
        try:
            import pytesseract
            tesseract_cmd = getattr(settings, 'TESSERACT_CMD', 'tesseract')
            if tesseract_cmd != 'tesseract':
                pytesseract.pytesseract.tesseract_cmd = tesseract_cmd

            raw_text = pytesseract.image_to_string(img, lang='eng')
            raw_text = raw_text.strip()
        except Exception as e:
            logger.error(f"Tesseract OCR failed: {e}")
            return Response(
                {'detail': 'OCR failed. Ensure Tesseract is installed.', 'raw_text': ''},
                status=status.HTTP_422_UNPROCESSABLE_ENTITY
            )

        if not raw_text:
            return Response({'detail': 'No text found in document.', 'extracted_fields': {}})

        # ── Step 3: Gemini → structured fields ─────────────────────────
        extracted_fields = {}
        gemini_key = getattr(settings, 'GEMINI_API_KEY', '')

        if gemini_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=gemini_key)
                model = genai.GenerativeModel('gemini-1.5-flash')

                prompt = f"""
You are a document parser for Indian government documents.
Extract the following fields from this OCR text and return ONLY valid JSON.
Fields to extract (use null if not found):
- name (full name)
- age (integer)
- gender (Male/Female/Other)
- state (Indian state name)
- district
- annual_income (integer in INR, if mentioned)
- occupation (e.g. Farmer, Student, Salaried, Business)
- category (SC/ST/OBC/General)
- is_student (true/false)
- education (highest qualification)

Document type: {doc_type}
OCR Text:
\"\"\"
{raw_text[:3000]}
\"\"\"

Return ONLY a JSON object with these fields. No explanation.
"""
                response = model.generate_content(prompt)
                response_text = response.text.strip()

                # Extract JSON from response
                if '```json' in response_text:
                    response_text = response_text.split('```json')[1].split('```')[0].strip()
                elif '```' in response_text:
                    response_text = response_text.split('```')[1].split('```')[0].strip()

                extracted_fields = json.loads(response_text)
                # Remove null values
                extracted_fields = {k: v for k, v in extracted_fields.items() if v is not None}

            except Exception as e:
                logger.error(f"Gemini extraction failed: {e}")
                # Return raw text so frontend can still show it
                extracted_fields = {}
        else:
            logger.warning("GEMINI_API_KEY not configured — skipping AI extraction")

        return Response({
            'raw_text': raw_text,
            'extracted_fields': extracted_fields,
            'doc_type': doc_type,
        })
