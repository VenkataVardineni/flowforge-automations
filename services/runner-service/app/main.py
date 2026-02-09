from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db, engine, Base
from app.models import Run, StepRun
from app.schemas import CreateRunRequest, RunResponse, StepRunResponse
from app.tasks import execute_workflow
from uuid import UUID
import logging

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

