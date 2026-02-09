from celery import Task
from app.celery_app import celery_app
from app.database import SessionLocal
from app.models import Run, StepRun, RunStatus, StepStatus
from datetime import datetime
from uuid import UUID
import json
import logging

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
    """
    db = self.db
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
        
        # TODO: Fetch workflow graph from workflow-service
        # For now, this is a placeholder that will be implemented in Commit #4
        logger.info(f"Executing workflow for run {run_id}")
        
        # Simulate execution (will be replaced with real node execution)
        # This is just to demonstrate the queue is working
        
        # Mark as completed for now
        run.status = RunStatus.COMPLETED
        run.finished_at = datetime.utcnow()
        db.commit()
        
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
        
        raise

