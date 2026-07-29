import json
import logging
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status

logger = logging.getLogger(__name__)

SCHEME_ADVISOR_SYSTEM_PROMPT = """
You are SchemeBot, an expert Indian government scheme advisor.
Your job is to help citizens discover and understand government welfare schemes.

Rules:
- Only answer questions about government schemes, eligibility, benefits, documents, and application processes.
- If asked unrelated questions, politely redirect to scheme-related topics.
- Always be helpful, clear, and compassionate — many users may have low literacy.
- When mentioning schemes, include: what it is, who qualifies, and key benefits.
- Respond in the same language the user writes in (English or Hindi).
- Keep answers concise (under 300 words) unless the user asks for more detail.
- If you're unsure about a scheme's current status, mention that details should be verified on the official portal.
"""

STUB_CHATBOT_RESPONSES = [
    "I'm SchemeBot! I can help you find government schemes you're eligible for. Please tell me about yourself — your age, occupation, income, and state.",
    "That's a great question. To give you accurate scheme recommendations, I'd need to know your annual income, state, and occupation. Could you share those?",
    "Based on what you've described, you may be eligible for several central and state government schemes. Please complete your profile for a personalized eligibility check.",
]


def _get_gemini_client():
    api_key = getattr(settings, 'GEMINI_API_KEY', '')
    if not api_key or api_key == 'your-gemini-api-key-here':
        return None
    try:
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        return genai.GenerativeModel('gemini-1.5-flash')
    except Exception as e:
        logger.error(f"Failed to initialize Gemini: {e}")
        return None


class ChatbotView(APIView):
    """
    POST /api/ai/chat/
    Stateless chat — accepts message history + optional user profile context.
    Body: { "messages": [{"role": "user"|"model", "content": "..."}], "include_profile": true }
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        messages = request.data.get('messages', [])
        include_profile = request.data.get('include_profile', True)

        if not messages:
            return Response({'detail': 'No messages provided.'}, status=status.HTTP_400_BAD_REQUEST)

        # Build system context with user profile
        system_prompt = SCHEME_ADVISOR_SYSTEM_PROMPT
        if include_profile:
            try:
                profile = request.user.profile
                profile_context = f"""
Current user profile:
- Age: {profile.age or 'Not provided'}
- Gender: {profile.gender or 'Not provided'}
- State: {profile.state or 'Not provided'}
- Annual Income: ₹{profile.annual_income or 'Not provided'}
- Occupation: {profile.occupation or 'Not provided'}
- Category: {profile.category or 'Not provided'}
- Is Student: {'Yes' if profile.is_student else 'No'}
- Is Rural: {'Yes' if profile.is_rural else 'No'}
- Disability: {'Yes' if profile.disability_status else 'No'}
"""
                system_prompt += "\n\n" + profile_context
            except Exception:
                pass

        model = _get_gemini_client()

        if not model:
            # Stub response if Gemini not configured
            import random
            return Response({
                'reply': random.choice(STUB_CHATBOT_RESPONSES),
                'ai_powered': False,
                'note': 'Set GEMINI_API_KEY in .env for AI-powered responses.',
            })

        try:
            # Build Gemini chat history
            history = []
            for msg in messages[:-1]:  # All but last
                role = 'user' if msg.get('role') == 'user' else 'model'
                history.append({'role': role, 'parts': [msg.get('content', '')]})

            chat = model.start_chat(history=history)
            last_message = messages[-1].get('content', '')

            # Prepend system prompt to first user message if history is empty
            if not history:
                last_message = f"{system_prompt}\n\nUser: {last_message}"

            response = chat.send_message(last_message)
            return Response({'reply': response.text, 'ai_powered': True})

        except Exception as e:
            logger.error(f"Gemini chat error: {e}")
            return Response(
                {'detail': 'AI service temporarily unavailable. Please try again.'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )


class NLPProfileExtractView(APIView):
    """
    POST /api/ai/extract-profile/
    User types: "I'm a 25-year-old female farmer from Tamil Nadu earning ₹1.5L"
    Gemini extracts → structured profile fields JSON for auto-fill.
    Body: { "text": "..." }
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        text = request.data.get('text', '').strip()
        if not text:
            return Response({'detail': 'No text provided.'}, status=status.HTTP_400_BAD_REQUEST)

        model = _get_gemini_client()
        if not model:
            return Response({
                'extracted_fields': {},
                'ai_powered': False,
                'note': 'Set GEMINI_API_KEY in .env to enable NLP profile extraction.',
            })

        prompt = f"""
Extract citizen profile fields from this natural language description.
Return ONLY valid JSON. Use null for fields not mentioned.

Fields:
- age (integer)
- gender (Male/Female/Other)
- state (Indian state name, full name)
- district
- annual_income (integer in INR — convert "₹1.5L" to 150000, "2 lakh" to 200000)
- occupation (Farmer/Student/Salaried/Business/Self-employed/Unemployed/Other)
- category (SC/ST/OBC/General)
- education (No Education/Primary/Secondary/Higher Secondary/Graduate/Post-Graduate)
- is_student (true/false)
- is_rural (true/false)
- disability_status (true/false)
- marital_status (Single/Married/Widowed/Divorced)
- family_size (integer)
- land_ownership_acres (float)
- employment_status (Employed/Unemployed/Self-employed/Student)

Input: "{text}"

Return ONLY JSON.
"""
        try:
            response = model.generate_content(prompt)
            response_text = response.text.strip()

            if '```json' in response_text:
                response_text = response_text.split('```json')[1].split('```')[0].strip()
            elif '```' in response_text:
                response_text = response_text.split('```')[1].split('```')[0].strip()

            fields = json.loads(response_text)
            fields = {k: v for k, v in fields.items() if v is not None}

            return Response({'extracted_fields': fields, 'ai_powered': True})

        except Exception as e:
            logger.error(f"NLP extraction error: {e}")
            return Response(
                {'detail': 'Extraction failed. Please fill the form manually.'},
                status=status.HTTP_422_UNPROCESSABLE_ENTITY
            )


class EligibilityExplainView(APIView):
    """
    POST /api/ai/explain/
    Takes a scheme_id — generates a human-friendly paragraph explanation.
    Body: { "scheme_id": 1 }
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        scheme_id = request.data.get('scheme_id')
        if not scheme_id:
            return Response({'detail': 'scheme_id required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            from schemes.models import Scheme, EligibilityCheck
            scheme = Scheme.objects.get(pk=scheme_id)
            check = EligibilityCheck.objects.filter(
                user=request.user, scheme=scheme
            ).first()
        except Exception:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

        model = _get_gemini_client()
        if not model:
            return Response({
                'explanation': f'This is the {scheme.name} scheme. You {"qualify" if check and check.result == "eligible" else "may not qualify"} based on your profile.',
                'ai_powered': False,
            })

        result = check.result if check else 'unknown'
        explanation_data = check.explanation if check else []

        prompt = f"""
Write a friendly, encouraging explanation (2-3 sentences, simple English) for an Indian citizen about their eligibility for the following government scheme.

Scheme: {scheme.name}
Category: {scheme.category}
Benefits: {scheme.benefits}
Result: {result.replace('_', ' ').title()}
Conditions checked: {json.dumps(explanation_data, indent=2)}

If eligible: Congratulate and mention the key benefits.
If not eligible: Be empathetic, explain what didn't match, suggest what could change eligibility.
If needs more info: Explain what information is missing.

Keep it under 100 words. Simple language only.
"""
        try:
            response = model.generate_content(prompt)
            return Response({'explanation': response.text, 'ai_powered': True})
        except Exception as e:
            logger.error(f"Explain error: {e}")
            return Response({'detail': 'Could not generate explanation.'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
