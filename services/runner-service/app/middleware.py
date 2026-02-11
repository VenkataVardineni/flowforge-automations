from fastapi import Request, Header
from typing import Optional
from app.database import engine
import logging

logger = logging.getLogger(__name__)

async def set_org_context(request: Request, x_org_id: Optional[str] = Header(None, alias="X-Org-Id")):
    """Set PostgreSQL session variable for RLS"""
    if x_org_id:
        try:
            with engine.connect() as conn:
                conn.execute(f"SET LOCAL app.org_id = '{x_org_id}'")
                conn.commit()
        except Exception as e:
            logger.error(f"Failed to set org context: {e}")

