from sqlalchemy import Column, String, Integer, DateTime, Text, ForeignKey, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
import enum
from app.database import Base

class RunStatus(str, enum.Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class StepStatus(str, enum.Enum):
    QUEUED = "queued"
    RUNNING = "running"
    SUCCEEDED = "succeeded"
    FAILED = "failed"
    SKIPPED = "skipped"

class Run(Base):
    __tablename__ = "runs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workflow_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    org_id = Column(UUID(as_uuid=True), nullable=True, index=True)
    status = Column(SQLEnum(RunStatus), nullable=False, default=RunStatus.PENDING, index=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    started_at = Column(DateTime, nullable=True)
    finished_at = Column(DateTime, nullable=True)
    error = Column(Text, nullable=True)
    triggered_by = Column(UUID(as_uuid=True), nullable=True)

    # Relationship to step_runs
    step_runs = relationship("StepRun", back_populates="run", cascade="all, delete-orphan")

class StepRun(Base):
    __tablename__ = "step_runs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    run_id = Column(UUID(as_uuid=True), ForeignKey("runs.id"), nullable=False, index=True)
    org_id = Column(UUID(as_uuid=True), nullable=True, index=True)
    node_id = Column(String, nullable=False, index=True)
    status = Column(SQLEnum(StepStatus), nullable=False, default=StepStatus.QUEUED, index=True)
    started_at = Column(DateTime, nullable=True)
    finished_at = Column(DateTime, nullable=True)
    input_json = Column(JSONB, nullable=True)
    output_json = Column(JSONB, nullable=True)
    error = Column(Text, nullable=True)

    # Relationship to run
    run = relationship("Run", back_populates="step_runs")


