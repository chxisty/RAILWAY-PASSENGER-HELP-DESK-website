import os
import hmac
import hashlib
import secrets
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any
import jwt

# Secret key for JWT signing; uses env var or fallback secure key
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "railassist-ai-super-secure-production-jwt-key-2026-v1")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24
REMEMBER_ME_EXPIRE_DAYS = 7
PBKDF2_ITERATIONS = 600000

def hash_password(password: str) -> tuple[str, str]:
    """
    Hashes a password using PBKDF2-HMAC-SHA256 with 600,000 iterations and a 32-byte salt.
    Returns (password_hash_hex, salt_hex).
    """
    salt = secrets.token_bytes(32)
    key = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt,
        PBKDF2_ITERATIONS
    )
    return key.hex(), salt.hex()

def verify_password(plain_password: str, password_hash_hex: str, salt_hex: str) -> bool:
    """
    Verifies a plain password against the stored hash and salt in constant time.
    """
    try:
        salt = bytes.fromhex(salt_hex)
        key = hashlib.pbkdf2_hmac(
            'sha256',
            plain_password.encode('utf-8'),
            salt,
            PBKDF2_ITERATIONS
        )
        return hmac.compare_digest(key.hex(), password_hash_hex)
    except Exception:
        return False

def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """
    Creates a signed JWT access token.
    """
    to_encode = data.copy()
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    
    to_encode.update({"exp": expire, "iat": now})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Decodes and validates a JWT access token. Returns payload or None if invalid/expired.
    """
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return payload
    except (jwt.PyJWTError, Exception):
        return None

def generate_reset_token() -> str:
    """
    Generates a cryptographically secure random token for password resets.
    """
    return secrets.token_urlsafe(32)

