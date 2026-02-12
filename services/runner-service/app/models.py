from sqlalchemy import Column, String, Integer, DateTime, Text, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID, JSONB
from sqlalchemy.types import TypeDecorator, CHAR
import uuid
from datetime import datetime
import enum
import json
from app.database import Base, engine

# SQLite-compatible UUID type
class GUID(TypeDecorator):
    """Platform-independent GUID type."""
    impl = CHAR
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == 'postgresql':
            return dialect.type_descriptor(PostgresUUID())
        else:
            return dialect.type_descriptor(CHAR(36))

    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        elif dialect.name == 'postgresql':
            return str(value)
        else:
            if not isinstance(value, uuid.UUID):
                return str(uuid.UUID(value))
            return str(value)

    def process_result_value(self, value, dialect):
        if value is None:
            return value
        else:
            if not isinstance(value, uuid.UUID):
                return uuid.UUID(value)
            return value

# JSON type that works with both PostgreSQL and SQLite
class JSONType(TypeDecorator):
    impl = Text
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == 'postgresql':
            return dialect.type_descriptor(JSONB())
        else:
            return dialect.type_descriptor(Text())

    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        if dialect.name == 'postgresql':
            return value
        return json.dumps(value) if value is not None else None

    def process_result_value(self, value, dialect):
        if value is None:
            return value
        if dialect.name == 'postgresql':
            return value
        return json.loads(value) if value else None

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

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    workflow_id = Column(GUID(), nullable=False, index=True)
    org_id = Column(GUID(), nullable=True, index=True)
    status = Column(SQLEnum(RunStatus), nullable=False, default=RunStatus.PENDING, index=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    started_at = Column(DateTime, nullable=True)
    finished_at = Column(DateTime, nullable=True)
    error = Column(Text, nullable=True)
    triggered_by = Column(GUID(), nullable=True)

    # Relationship to step_runs
    step_runs = relationship("StepRun", back_populates="run", cascade="all, delete-orphan")

class StepRun(Base):
    __tablename__ = "step_runs"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    run_id = Column(GUID(), ForeignKey("runs.id"), nullable=False, index=True)
    org_id = Column(GUID(), nullable=True, index=True)
    node_id = Column(String, nullable=False, index=True)
    status = Column(SQLEnum(StepStatus), nullable=False, default=StepStatus.QUEUED, index=True)
    started_at = Column(DateTime, nullable=True)
    finished_at = Column(DateTime, nullable=True)
    input_json = Column(JSONType(), nullable=True)
    output_json = Column(JSONType(), nullable=True)
    error = Column(Text, nullable=True)

    # Relationship to run
    run = relationship("Run", back_populates="step_runs")
