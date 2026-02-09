from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
from uuid import UUID
from app.models import RunStatus, StepStatus

class CreateRunRequest(BaseModel):
    workflow_id: UUID

class RunResponse(BaseModel):
    id: UUID
    workflow_id: UUID
    status: RunStatus
    created_at: datetime
    started_at: Optional[datetime] = None
    finished_at: Optional[datetime] = None
    error: Optional[str] = None

    class Config:
        from_attributes = True

class StepRunResponse(BaseModel):
    id: UUID
    run_id: UUID
    node_id: str
    status: StepStatus
    started_at: Optional[datetime] = None
    finished_at: Optional[datetime] = None
    input_json: Optional[Dict[str, Any]] = None
    output_json: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

    class Config:
        from_attributes = True

