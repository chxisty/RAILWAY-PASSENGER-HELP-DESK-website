"""
helpdesk/llm.py - LLM client wrapper for Google Gemini.
Includes retry logic with exponential backoff for transient rate limits (HTTP 429) and network timeouts.
Immediately falls back to deterministic grounded generation if daily quota is reached.
"""

import os
import time
import logging
import warnings
from typing import Optional, Dict, Any, List
from dotenv import load_dotenv

# Suppress deprecation/future warnings to ensure clean JSON stdout
warnings.filterwarnings("ignore")

logger = logging.getLogger("helpdesk.llm")

# Load environment variables
load_dotenv()

DEFAULT_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.5-flash")


class GeminiClient:
    """Wrapper around Google Gemini API with robust retry and error recovery."""
    
    def __init__(self, api_key: Optional[str] = None, model_name: Optional[str] = None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY", "")
        self.model_name = model_name or os.getenv("GEMINI_MODEL", DEFAULT_MODEL)
        self.client = None
        self.daily_quota_exhausted = False
        self._init_client()
        
    def _init_client(self):
        if not self.api_key:
            logger.warning("No GEMINI_API_KEY found in environment.")
            return
            
        try:
            import google.generativeai as genai
            genai.configure(api_key=self.api_key)
            self.client = genai.GenerativeModel(self.model_name)
            logger.info(f"Initialized Gemini client with model {self.model_name}")
        except Exception as e:
            logger.error(f"Failed to initialize Gemini client: {e}")
            self.client = None

    def generate(self, prompt: str, system_instruction: Optional[str] = None, max_retries: int = 2) -> Optional[str]:
        """
        Generate text response from Gemini with exponential backoff for rate limits.
        Falls back instantly if daily quota is exhausted.
        """
        if not self.client or self.daily_quota_exhausted:
            return None
            
        full_prompt = prompt
        if system_instruction:
            full_prompt = f"{system_instruction}\n\nUser Question:\n{prompt}"
            
        delay = 2.0
        for attempt in range(max_retries + 1):
            try:
                response = self.client.generate_content(full_prompt)
                if response and hasattr(response, "text") and response.text:
                    return response.text.strip()
                return None
            except Exception as e:
                err_str = str(e).lower()
                
                # Check for daily quota exhaustion (e.g. Free Tier 20 requests/day exceeded)
                if "perday" in err_str or "per day" in err_str or "retry in" in err_str:
                    logger.warning("Gemini daily quota exhausted. Falling back to deterministic grounded synthesis.")
                    self.daily_quota_exhausted = True
                    return None
                    
                is_rate_limit = "429" in err_str or "quota" in err_str or "resourceexhausted" in err_str
                is_transient = "503" in err_str or "timeout" in err_str or "unavailable" in err_str
                
                if (is_rate_limit or is_transient) and attempt < max_retries:
                    logger.warning(f"Gemini transient rate limit (attempt {attempt+1}/{max_retries}). Retrying in {delay}s...")
                    time.sleep(delay)
                    delay *= 2.0
                else:
                    logger.error(f"Gemini generation error: {e}")
                    return None
                    
        return None


# Global singleton instance
_llm_client: Optional[GeminiClient] = None

def get_llm_client() -> GeminiClient:
    global _llm_client
    if _llm_client is None:
        _llm_client = GeminiClient()
    return _llm_client
