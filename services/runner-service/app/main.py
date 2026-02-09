from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List, AsyncGenerator
from app.database import get_db, engine, Base
from app.models import Run, StepRun
from app.schemas import CreateRunRequest, RunResponse, StepRunResponse
from app.tasks import execute_workflow
from app.events import event_emitter
from uuid import UUID
from datetime import datetime
import logging
import asyncio
import json

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="FlowForge Runner Service", version="0.1.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/runs", response_model=RunResponse, status_code=201)
async def create_run(
    request: CreateRunRequest,
    db: Session = Depends(get_db)
):
    """
    Create a new workflow run and enqueue it for execution.
    Returns immediately with the run record.
    """
    # Create run record
    run = Run(
        workflow_id=request.workflow_id,
        status=RunStatus.PENDING
    )
    db.add(run)
    db.commit()
    db.refresh(run)
    
    # Enqueue the workflow execution task
    execute_workflow.delay(str(run.id))
    
    logger.info(f"Created run {run.id} for workflow {request.workflow_id} and enqueued for execution")
    
    return run

@app.get("/runs/{run_id}", response_model=RunResponse)
async def get_run(
    run_id: UUID,
    db: Session = Depends(get_db)
):
    """Get run details by ID"""
    run = db.query(Run).filter(Run.id == run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    return run

@app.get("/runs", response_model=List[RunResponse])
async def list_runs(
    workflow_id: UUID = None,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """List runs, optionally filtered by workflow_id"""
    query = db.query(Run)
    if workflow_id:
        query = query.filter(Run.workflow_id == workflow_id)
    runs = query.order_by(Run.created_at.desc()).limit(limit).all()
    return runs

@app.get("/runs/{run_id}/steps", response_model=List[StepRunResponse])
async def get_run_steps(
    run_id: UUID,
    db: Session = Depends(get_db)
):
    """Get all step runs for a given run"""
    run = db.query(Run).filter(Run.id == run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    
    steps = db.query(StepRun).filter(StepRun.run_id == run_id).order_by(StepRun.started_at).all()
    return steps

@app.get("/runs/{run_id}/steps/{step_id}", response_model=StepRunResponse)
async def get_step_run(
    run_id: UUID,
    step_id: UUID,
    db: Session = Depends(get_db)
):
    """Get a specific step run"""
    step = db.query(StepRun).filter(
        StepRun.id == step_id,
        StepRun.run_id == run_id
    ).first()
    if not step:
        raise HTTPException(status_code=404, detail="Step run not found")
    return step

@app.get("/runs/{run_id}/events")
async def stream_run_events(run_id: UUID, db: Session = Depends(get_db)):
    """
    Server-Sent Events (SSE) stream for run execution events.
    Emits: run_started, step_started, step_succeeded, step_failed, run_finished
    """
    # Verify run exists
    run = db.query(Run).filter(Run.id == run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    
    async def event_generator() -> AsyncGenerator[str, None]:
        """Generate SSE events"""
        queue = asyncio.Queue()
        
        def event_handler(event: dict):
            """Callback to handle events"""
            asyncio.run_coroutine_threadsafe(queue.put(event), loop)
        
        # Subscribe to events
        event_emitter.subscribe(str(run_id), event_handler)
        
        try:
            # Send initial run state
            initial_event = {
                "type": "run_state",
                "data": {
                    "run_id": str(run_id),
                    "status": run.status.value,
                    "created_at": run.created_at.isoformat() if run.created_at else None,
                    "started_at": run.started_at.isoformat() if run.started_at else None,
                    "finished_at": run.finished_at.isoformat() if run.finished_at else None,
                },
                "timestamp": run.created_at.isoformat() if run.created_at else datetime.utcnow().isoformat()
            }
            yield event_emitter.format_sse(initial_event)
            
            # Send existing step runs (replay)
            steps = db.query(StepRun).filter(StepRun.run_id == run_id).order_by(StepRun.started_at).all()
            for step in steps:
                step_event = {
                    "type": f"step_{step.status.value}",
                    "data": {
                        "step_id": str(step.id),
                        "node_id": step.node_id,
                        "status": step.status.value,
                        "started_at": step.started_at.isoformat() if step.started_at else None,
                        "finished_at": step.finished_at.isoformat() if step.finished_at else None,
                    },
                    "timestamp": step.started_at.isoformat() if step.started_at else datetime.utcnow().isoformat()
                }
                yield event_emitter.format_sse(step_event)
            
            # Stream new events
            while True:
                try:
                    # Wait for event with timeout to keep connection alive
                    event = await asyncio.wait_for(queue.get(), timeout=30.0)
                    yield event_emitter.format_sse(event)
                    
                    # If run is finished, close connection
                    if event.get("type") == "run_finished":
                        break
                except asyncio.TimeoutError:
                    # Send keepalive
                    yield ": keepalive\n\n"
                    
        finally:
            # Unsubscribe
            event_emitter.unsubscribe(str(run_id), event_handler)
    
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        }
    )

