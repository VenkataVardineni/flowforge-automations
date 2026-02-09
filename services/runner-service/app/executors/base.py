from typing import Dict, Any, Optional
from abc import ABC, abstractmethod

class BaseExecutor(ABC):
    """Base class for node executors"""
    
    @abstractmethod
    async def execute(self, config: Dict[str, Any], input_data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Execute the node with given config and input data"""
        pass
    
    @abstractmethod
    def get_node_type(self) -> str:
        """Return the node type this executor handles"""
        pass

