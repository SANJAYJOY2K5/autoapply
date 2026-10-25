from __future__ import annotations

from typing import Optional, Dict, Any
from app.core.config import settings
from app.core.logging import logger

try:
    from supabase import create_client, Client
    _SUPABASE_AVAILABLE = True
except ImportError:
    _SUPABASE_AVAILABLE = False
    Client = Any

_supabase_admin_client: Optional[Client] = None

# Thread-safe in-memory store for local testing/offline fallback
_in_memory_profiles: Dict[str, Dict[str, Any]] = {}
_in_memory_resumes: Dict[str, Dict[str, Any]] = {}


def get_supabase_admin() -> Optional[Client]:
    """
    Returns an authenticated Supabase admin client using the service role key.
    This client is strictly isolated to backend execution and never sent to clients.
    """
    global _supabase_admin_client
    if _supabase_admin_client is not None:
        return _supabase_admin_client

    if not _SUPABASE_AVAILABLE:
        logger.warning("supabase-py library not installed; falling back to in-memory store.")
        return None

    if settings.SUPABASE_URL and settings.SUPABASE_SERVICE_ROLE_KEY:
        try:
            _supabase_admin_client = create_client(
                settings.SUPABASE_URL,
                settings.SUPABASE_SERVICE_ROLE_KEY
            )
            return _supabase_admin_client
        except Exception as exc:
            logger.warning(f"Failed to initialize Supabase client: {exc}. Using fallback store.")
            return None
    return None
