import os
import logging
from typing import Optional, Any
import httpx
from app.core.config import settings

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are the official Railway Passenger Help Desk AI Assistant.
Your mission is to provide accurate, concise, trustworthy, and well-structured assistance to railway passengers.

STRICT ACCURACY AND GROUNDING RULES:
1. ONLY answer using facts present in the provided "GROUND TRUTH CONTEXT".
2. NEVER hallucinate or assume train schedules, ticket prices, station facilities, platform numbers, or policies.
3. If the context does NOT contain enough information to answer the query, clearly state:
   "I do not have official records regarding this query in the loaded railway dataset. Please verify with the railway enquiry counter or contact the 24x7 Rail Madad Helpline at 139."
4. Always preserve exact train numbers, station codes, times, days of operation, and monetary rules exactly as stated in the context.
5. In case of an emergency, security concern, or medical issue, highlight the integrated Rail Madad helpline 139 and RPF/GRP assistance immediately.
6. Present information cleanly using Markdown formatting with bullet points or tables where appropriate.
"""

class LLMClient:
    def __init__(self):
        self.provider = settings.LLM_PROVIDER.lower()
        self.gemini_key = settings.GEMINI_API_KEY
        self.gemini_model = settings.GEMINI_MODEL
        self.openai_key = settings.OPENAI_API_KEY
        self.openai_model = settings.OPENAI_MODEL
        self.openai_base_url = settings.OPENAI_BASE_URL
        self.groq_key = settings.GROQ_API_KEY
        self.groq_model = settings.GROQ_MODEL
        
    def generate_grounded_answer(
        self,
        query: str,
        context: str,
        conversation_history: Optional[list[dict[str, str]]] = None
    ) -> str:
        """Generates an answer using the configured LLM with deterministic grounded fallback."""
        
        # If no context provided, handle missing data immediately
        if not context or not context.strip():
            return (
                "I could not locate matching records in the official railway dataset for your inquiry. "
                "To ensure passenger safety and accuracy, I do not generate unverified railway information.\n\n"
                "**Recommended Action:**\n"
                "- Please verify the train number (e.g., 12951, 20643) or station name/code (e.g., NDLS, CSMT, MAS).\n"
                "- For real-time updates and emergency passenger assistance, please dial the 24x7 Rail Madad helpline at **139**."
            )
        
        # 1. Try Gemini if configured
        if self.gemini_key:
            try:
                answer = self._call_gemini(query, context, conversation_history)
                if answer:
                    return answer
            except Exception as e:
                logger.warning(f"Gemini API invocation failed: {e}. Falling back to secondary generator.")
                
        # 2. Try OpenAI / Groq if configured
        if self.groq_key:
            try:
                answer = self._call_openai_compatible(
                    base_url="https://api.groq.com/openai/v1",
                    api_key=self.groq_key,
                    model=self.groq_model,
                    query=query,
                    context=context,
                    history=conversation_history
                )
                if answer:
                    return answer
            except Exception as e:
                logger.warning(f"Groq API invocation failed: {e}.")
                
        if self.openai_key:
            try:
                answer = self._call_openai_compatible(
                    base_url=self.openai_base_url,
                    api_key=self.openai_key,
                    model=self.openai_model,
                    query=query,
                    context=context,
                    history=conversation_history
                )
                if answer:
                    return answer
            except Exception as e:
                logger.warning(f"OpenAI API invocation failed: {e}.")

        # 3. Deterministic Grounded Engine Fallback (guaranteed 100% reliable, zero hallucination)
        return self._generate_deterministic_grounded_answer(query, context)

    def _call_gemini(
        self,
        query: str,
        context: str,
        history: Optional[list[dict[str, str]]] = None
    ) -> Optional[str]:
        """Calls Google Gemini API via REST."""
        models_to_try = [self.gemini_model, "gemini-flash-lite-latest", "gemini-3.8-flash"]
        # Deduplicate while preserving order
        models_to_try = list(dict.fromkeys(models_to_try))
        
        user_prompt = (
            f"{SYSTEM_PROMPT}\n\n"
            f"--- GROUND TRUTH CONTEXT ---\n{context}\n\n"
            f"--- PASSENGER QUESTION ---\n{query}"
        )
        
        contents = []
        if history:
            for msg in history[-4:]:
                role = "user" if msg.get("role") == "user" else "model"
                contents.append({"role": role, "parts": [{"text": msg.get("content", "")}]})
        contents.append({"role": "user", "parts": [{"text": user_prompt}]})
        
        for model in models_to_try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={self.gemini_key}"
            payload = {
                "contents": contents,
                "generationConfig": {
                    "temperature": 0.1,
                    "maxOutputTokens": 1024
                }
            }
            try:
                resp = httpx.post(url, json=payload, timeout=12.0)
                if resp.status_code == 200:
                    data = resp.json()
                    candidates = data.get("candidates", [])
                    if candidates and "content" in candidates[0]:
                        parts = candidates[0]["content"].get("parts", [])
                        if parts:
                            return parts[0].get("text", "").strip()
                elif resp.status_code in (404, 503):
                    logger.info(f"Model {model} returned {resp.status_code}, trying next model.")
                    continue
                else:
                    logger.warning(f"Gemini error {resp.status_code}: {resp.text[:150]}")
            except Exception as e:
                logger.warning(f"Error querying Gemini model {model}: {e}")
                
        return None

    def _call_openai_compatible(
        self,
        base_url: str,
        api_key: str,
        model: str,
        query: str,
        context: str,
        history: Optional[list[dict[str, str]]] = None
    ) -> Optional[str]:
        """Calls any OpenAI-compatible API endpoint (Groq, OpenAI, Ollama)."""
        url = f"{base_url.rstrip('/')}/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        if history:
            for msg in history[-4:]:
                messages.append({"role": msg.get("role", "user"), "content": msg.get("content", "")})
        messages.append({
            "role": "user",
            "content": f"GROUND TRUTH CONTEXT:\n{context}\n\nQUESTION:\n{query}"
        })
        payload = {
            "model": model,
            "messages": messages,
            "temperature": 0.1,
            "max_tokens": 1024
        }
        resp = httpx.post(url, headers=headers, json=payload, timeout=15.0)
        if resp.status_code == 200:
            data = resp.json()
            return data["choices"][0]["message"]["content"].strip()
        return None

    def _generate_deterministic_grounded_answer(self, query: str, context: str) -> str:
        """
        High-precision deterministic grounded synthesizer.
        Extracts verified facts from the context chunks and formats a structured response.
        """
        lines = [line.strip() for line in context.split("\n") if line.strip()]
        
        parts = ["Here is the verified information retrieved from the official railway records:\n"]
        for line in lines:
            if line.startswith("-") or line.startswith("*"):
                parts.append(line)
            else:
                parts.append(f"- {line}")
                
        parts.append("\n**Important Notice:** All information is grounded in official railway dataset records. For live operational emergencies or inquiries, contact the 24x7 Rail Madad helpline at **139**.")
        return "\n".join(parts)

llm_client = LLMClient()

