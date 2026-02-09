from celery import Task
from app.celery_app import celery_app
from app.database import SessionLocal
from app.models import Run, StepRun, RunStatus, StepStatus
from app.events import event_emitter
from app.executors.registry import get_executor
from datetime import datetime
from uuid import UUID
import json
import logging
import os
import httpx
import asyncio

logger = logging.getLogger(__name__)

class DatabaseTask(Task):
    """Custom task class that provides database session"""
    _db = None

    @property
    def db(self):
        if self._db is None:
            self._db = SessionLocal()
        return self._db

    def after_return(self, *args, **kwargs):
        if self._db:
            self._db.close()
            self._db = None

@celery_app.task(bind=True, base=DatabaseTask)
def execute_workflow(self, run_id: str):
    """
    Main workflow execution task.
    This is enqueued when a run is created.
    Note: Celery tasks are sync, so we use asyncio.run for async operations.
    """
    asyncio.run(_execute_workflow_async(run_id, self.db))

async def _execute_workflow_async(run_id: str, db):
    """Async workflow execution"""
    run_uuid = UUID(run_id)
    
    try:
        # Get run record
        run = db.query(Run).filter(Run.id == run_uuid).first()
        if not run:
            logger.error(f"Run {run_id} not found")
            return
        
        # Update run status to running
        run.status = RunStatus.RUNNING
        run.started_at = datetime.utcnow()
        db.commit()
        
        # Emit run_started event
        event_emitter.emit(str(run_id), "run_started", {
            "run_id": str(run_id),
            "started_at": run.started_at.isoformat()
        })
        
        # Fetch workflow graph from workflow-service
        workflow_service_url = os.getenv("WORKFLOW_SERVICE_URL", "http://workflow-service:8080")
        try:
            async with httpx.AsyncClient() as client:
                workflow_response = await client.get(
                    f"{workflow_service_url}/api/workflows/{run.workflow_id}"
                )
                if workflow_response.status_code != 200:
                    raise Exception(f"Failed to fetch workflow: {workflow_response.status_code}")
                
                workflow_data = workflow_response.json()
                graph = workflow_data.get("graph", {})
                nodes = graph.get("nodes", [])
                edges = graph.get("edges", [])
                
                if not nodes:
                    raise Exception("Workflow has no nodes")
                
                logger.info(f"Fetched workflow graph with {len(nodes)} nodes")
        except Exception as e:
            logger.error(f"Failed to fetch workflow: {e}")
            raise
        
        # Execute workflow nodes
        await execute_workflow_nodes(db, run_uuid, nodes, edges)
        
        # Mark as completed
        run = db.query(Run).filter(Run.id == run_uuid).first()
        run.status = RunStatus.COMPLETED
        run.finished_at = datetime.utcnow()
        db.commit()
        
        # Emit run_finished event
        event_emitter.emit(str(run_id), "run_finished", {
            "run_id": str(run_id),
            "status": "completed",
            "finished_at": run.finished_at.isoformat()
        })
        
        logger.info(f"Workflow execution completed for run {run_id}")
        
    except Exception as e:
        logger.error(f"Error executing workflow {run_id}: {str(e)}", exc_info=True)
        db.rollback()
        
        # Update run status to failed
        run = db.query(Run).filter(Run.id == run_uuid).first()
        if run:
            run.status = RunStatus.FAILED
            run.finished_at = datetime.utcnow()
            run.error = str(e)
            db.commit()
            
            # Emit run_finished event with error
            event_emitter.emit(str(run_id), "run_finished", {
                "run_id": str(run_id),
                "status": "failed",
                "error": str(e),
                "finished_at": run.finished_at.isoformat()
            })
        
        raise

