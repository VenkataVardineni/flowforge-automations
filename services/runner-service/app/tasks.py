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

async def execute_workflow_nodes(db, run_id: UUID, nodes: list, edges: list):
    """
    Execute workflow nodes in topological order.
    Implements idempotency: uses deterministic step_run keys to prevent duplicates.
    """
    # Build graph structure
    node_map = {node["id"]: node for node in nodes}
    incoming_edges = {node_id: [] for node_id in node_map.keys()}
    outgoing_edges = {node_id: [] for node_id in node_map.keys()}
    
    for edge in edges:
        source = edge["source"]
        target = edge["target"]
        incoming_edges[target].append(source)
        outgoing_edges[source].append(target)
    
    # Find trigger node (no incoming edges)
    trigger_nodes = [node_id for node_id, deps in incoming_edges.items() if not deps]
    if not trigger_nodes:
        raise Exception("No trigger node found in workflow")
    
    # Track node outputs
    node_outputs = {}
    
    # Execute nodes in topological order (BFS)
    queue = trigger_nodes.copy()
    executed = set()
    
    while queue:
        node_id = queue.pop(0)
        if node_id in executed:
            continue
        
        node = node_map[node_id]
        node_type = node.get("data", {}).get("type", "")
        node_config = node.get("data", {}).get("properties", {})
        
        # Check if all dependencies are executed
        deps = incoming_edges.get(node_id, [])
        if any(dep not in executed for dep in deps):
            # Not ready yet, skip for now
            queue.append(node_id)
            continue
        
        # Idempotency: Check if step_run already exists (for retries)
        existing_step = db.query(StepRun).filter(
            StepRun.run_id == run_id,
            StepRun.node_id == node_id
        ).first()
        
        if existing_step and existing_step.status == StepStatus.SUCCEEDED:
            # Step already completed successfully, skip
            logger.info(f"Node {node_id} already executed successfully, skipping")
            node_outputs[node_id] = existing_step.output_json or {}
            executed.add(node_id)
            # Add dependent nodes to queue
            for next_node_id in outgoing_edges.get(node_id, []):
                if next_node_id not in executed and next_node_id not in queue:
                    queue.append(next_node_id)
            continue
        
        # Get org_id from run
        run_record = db.query(Run).filter(Run.id == run_id).first()
        org_id = run_record.org_id if run_record else None
        
        # Create or update step run record
        if existing_step:
            step_run = existing_step
            step_run.status = StepStatus.QUEUED
            step_run.input_json = None  # Will be set below
        else:
            step_run = StepRun(
                run_id=run_id,
                org_id=org_id,
                node_id=node_id,
                status=StepStatus.QUEUED,
                input_json=None
            )
            db.add(step_run)
        
        # Get input data (from previous nodes)
        input_data = None
        if deps:
            # Merge outputs from all dependencies
            input_data = {}
            for dep_id in deps:
                dep_output = node_outputs.get(dep_id)
                if dep_output:
                    if isinstance(input_data, dict) and isinstance(dep_output, dict):
                        input_data.update(dep_output)
                    else:
                        input_data = dep_output
        
        step_run.input_json = input_data
        db.commit()
        db.refresh(step_run)
        
        # Emit step_started event
        event_emitter.emit(str(run_id), "step_started", {
            "step_id": str(step_run.id),
            "node_id": node_id,
            "node_type": node_type
        })
        
        # Update step status to running
        step_run.status = StepStatus.RUNNING
        step_run.started_at = datetime.utcnow()
        db.commit()
        
        try:
            # Get executor for node type
            executor = get_executor(node_type)
            if not executor:
                raise Exception(f"No executor found for node type: {node_type}")
            
            # Execute node
            if asyncio.iscoroutinefunction(executor):
                output_data = await executor(node_config, input_data)
            else:
                # Run sync executor in thread pool
                loop = asyncio.get_event_loop()
                output_data = await loop.run_in_executor(None, executor, node_config, input_data)
            
            # Update step run with output
            step_run.status = StepStatus.SUCCEEDED
            step_run.finished_at = datetime.utcnow()
            step_run.output_json = output_data
            db.commit()
            
            # Store output for next nodes
            node_outputs[node_id] = output_data
            
            # Emit step_succeeded event
            event_emitter.emit(str(run_id), "step_succeeded", {
                "step_id": str(step_run.id),
                "node_id": node_id,
                "output": output_data
            })
            
            logger.info(f"Node {node_id} ({node_type}) executed successfully")
            
        except Exception as e:
            error_msg = str(e)
            logger.error(f"Error executing node {node_id}: {error_msg}", exc_info=True)
            
            # Update step run with error
            step_run.status = StepStatus.FAILED
            step_run.finished_at = datetime.utcnow()
            step_run.error = error_msg
            db.commit()
            
            # Emit step_failed event
            event_emitter.emit(str(run_id), "step_failed", {
                "step_id": str(step_run.id),
                "node_id": node_id,
                "error": error_msg
            })
            
            # Stop workflow execution on error
            raise
        
        executed.add(node_id)
        
        # Add dependent nodes to queue
        for next_node_id in outgoing_edges.get(node_id, []):
            if next_node_id not in executed and next_node_id not in queue:
                queue.append(next_node_id)
