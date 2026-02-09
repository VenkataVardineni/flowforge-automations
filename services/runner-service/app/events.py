from typing import Dict, Any, Optional
from datetime import datetime
from app.models import RunStatus, StepStatus
import json

class EventEmitter:
    """Simple in-memory event emitter for SSE"""
    def __init__(self):
        self.listeners: Dict[str, list] = {}
    
    def subscribe(self, run_id: str, callback):
        """Subscribe to events for a specific run"""
        if run_id not in self.listeners:
            self.listeners[run_id] = []
        self.listeners[run_id].append(callback)
    
    def unsubscribe(self, run_id: str, callback):
        """Unsubscribe from events"""
        if run_id in self.listeners:
            self.listeners[run_id].remove(callback)
            if not self.listeners[run_id]:
                del self.listeners[run_id]
    
    def emit(self, run_id: str, event_type: str, data: Dict[str, Any]):
        """Emit an event to all subscribers"""
        event = {
            "type": event_type,
            "data": data,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        if run_id in self.listeners:
            for callback in self.listeners[run_id]:
                try:
                    callback(event)
                except Exception as e:
                    print(f"Error emitting event to listener: {e}")
    
    def format_sse(self, event: Dict[str, Any]) -> str:
        """Format event as SSE message"""
        event_type = event.get("type", "message")
        data = json.dumps(event)
        return f"event: {event_type}\ndata: {data}\n\n"

# Global event emitter instance
event_emitter = EventEmitter()

