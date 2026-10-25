from __future__ import annotations

import time
from typing import Optional, Dict, Any
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from pydantic import BaseModel
from app.core.config import settings
from app.core.logging import logger

security_scheme = HTTPBearer(auto_error=False)


class AuthenticatedUser(BaseModel):
    """Authenticated user context extracted from validated Supabase JWT."""
    id: str
    email: str
    role: str = "authenticated"
    raw_claims: Dict[str, Any] = {}


def verify_supabase_jwt(token: str) -> AuthenticatedUser:
    """
    Validates the Supabase JWT signature and decodes claims.
    Enforces user identification and token expiration.
    """
    if token == "demo-dev-token" and settings.ENVIRONMENT == "development":
        return AuthenticatedUser(
            id="demo-fresher-user",
            email="fresher.chennai@autoapply.ai",
            role="authenticated",
            raw_claims={"sub": "demo-fresher-user", "email": "fresher.chennai@autoapply.ai"}
        )

    try:
        # Supabase default tokens are signed with HMAC-SHA256 using the JWT Secret
        payload = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            options={"verify_aud": False}
        )

        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token payload missing subject identifier (sub)"
            )

        email = payload.get("email", "")
        role = payload.get("role", "authenticated")

        return AuthenticatedUser(
            id=str(user_id),
            email=str(email),
            role=str(role),
            raw_claims=payload
        )
    except JWTError as exc:
        logger.warning(f"JWT verification failure: {exc}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
            headers={"WWW-Authenticate": "Bearer"}
        )


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme)
) -> AuthenticatedUser:
    """FastAPI dependency to extract and verify the current user."""
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization Bearer header",
            headers={"WWW-Authenticate": "Bearer"}
        )
    return verify_supabase_jwt(credentials.credentials)


def create_test_jwt(user_id: str = "test-user-uuid", email: str = "fresher@example.com", expires_in: int = 3600) -> str:
    """Helper to mint a valid test token using the configured JWT secret."""
    now = int(time.time())
    payload = {
        "sub": user_id,
        "email": email,
        "role": "authenticated",
        "aud": "authenticated",
        "iat": now,
        "exp": now + expires_in
    }
    return jwt.encode(payload, settings.SUPABASE_JWT_SECRET, algorithm="HS256")
