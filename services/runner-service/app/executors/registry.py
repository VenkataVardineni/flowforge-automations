from typing import Dict, Callable, Optional
from app.executors.http_request import execute_http_request
from app.executors.transform import execute_transform
import logging

logger = logging.getLogger(__name__)

# Registry of node executors
EXECUTORS: Dict[str, Callable] = {
    "httpRequest": execute_http_request,
    "transform": execute_transform,
    # Stubbed executors (to be implemented)
    "webhookTrigger": lambda config, input_data: {"triggered": True, "data": input_data or {}},
    "ifCondition": lambda config, input_data: {"result": True, "data": input_data or {}},
    "postgresWrite": lambda config, input_data: {"rows_affected": 0, "data": input_data or {}},
    "notification": lambda config, input_data: {"sent": True, "data": input_data or {}},
}

def get_executor(node_type: str) -> Optional[Callable]:
    """Get executor function for a node type"""
    return EXECUTORS.get(node_type)

def register_executor(node_type: str, executor: Callable):
    """Register a new executor"""
    EXECUTORS[node_type] = executor
    logger.info(f"Registered executor for node type: {node_type}")


