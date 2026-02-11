from fastapi import Header, HTTPException, Request
from typing import Optional
import os
import jwt
import logging

logger = logging.getLogger(__name__)

JWT_SECRET = os.getenv("JWT_SECRET", "changeme-super-secret")

def get_user_context(request: Request) -> dict:
    """Extract user context from headers (set by gateway)"""
    org_id = request.headers.get("X-Org-Id")
    user_id = request.headers.get("X-User-Id")
    role = request.headers.get("X-User-Role")
    
    return {
        "org_id": org_id,
        "user_id": user_id,
        "role": role
    }

def require_role(allowed_roles: list[str]):
    """Decorator to require specific roles"""
    def decorator(func):
        async def wrapper(*args, **kwargs):
            request = None
            for arg in args:
                if isinstance(arg, Request):
                    request = arg
                    break
            if not request:
                for key, value in kwargs.items():
                    if isinstance(value, Request):
                        request = value
                        break
            
            if not request:
                raise HTTPException(status_code=401, detail="Missing request context")
            
            context = get_user_context(request)
            role = context.get("role")
            
            if not role or role not in allowed_roles:
                raise HTTPException(status_code=403, detail="Insufficient permissions")
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator

