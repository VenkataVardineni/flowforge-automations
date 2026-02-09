import json
import logging
from typing import Dict, Any, Optional
import re

logger = logging.getLogger(__name__)

def execute_transform(
    config: Dict[str, Any],
    input_data: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Execute Transform node.
    
    Config:
    - expression: JS-like expression or JQ-style mapping
      Examples:
        - "data.map(x => x.value)"
        - "data.filter(x => x.active)"
        - "data.reduce((acc, x) => acc + x.count, 0)"
        - Simple field mapping: {"output": "input.field"}
    
    Input:
    - input_data: Previous node output JSON
    
    Returns:
    - Transformed JSON
    """
    expression = config.get("expression", "")
    script = config.get("script", expression)  # Alternative key
    
    if not script and not expression:
        raise ValueError("Expression or script is required for Transform node")
    
    expr = script or expression
    
    # Simple field mapping (dict-based)
    if isinstance(expr, dict):
        result = {}
        for output_key, input_path in expr.items():
            try:
                value = _get_nested_value(input_data or {}, input_path)
                result[output_key] = value
            except Exception as e:
                logger.warning(f"Failed to map {input_path}: {e}")
                result[output_key] = None
        return result
    
    # String expression - simple transformations
    if isinstance(expr, str):
        # Simple field extraction: "data.field"
        if expr.startswith("data.") or expr.startswith("input."):
            path = expr.replace("data.", "").replace("input.", "")
            return _get_nested_value(input_data or {}, path)
        
        # Array operations (simplified)
        if ".map(" in expr or ".filter(" in expr or ".reduce(" in expr:
            # This is a simplified implementation
            # For production, you'd want a proper JS-like evaluator
            return _execute_simple_expression(expr, input_data or {})
        
        # JSON path-like: "$.field" or "field"
        if expr.startswith("$."):
            path = expr[2:]
            return _get_nested_value(input_data or {}, path)
        
        # Try to evaluate as JSON path
        return _get_nested_value(input_data or {}, expr)
    
    # Return as-is if no transformation
    return input_data or {}

def _get_nested_value(data: Dict[str, Any], path: str) -> Any:
    """Get nested value from dict using dot notation"""
    keys = path.split(".")
    value = data
    for key in keys:
        if isinstance(value, dict):
            value = value.get(key)
        elif isinstance(value, list) and key.isdigit():
            value = value[int(key)] if int(key) < len(value) else None
        else:
            return None
        if value is None:
            return None
    return value

def _execute_simple_expression(expr: str, data: Dict[str, Any]) -> Any:
    """Execute simple JS-like expressions (simplified)"""
    # Extract array operation
    if ".map(" in expr:
        # Simple map: data.map(x => x.field)
        match = re.search(r'\.map\([^=]+=>\s*([^)]+)\)', expr)
        if match:
            field = match.group(1).strip().replace("x.", "").replace("item.", "")
            if isinstance(data, list):
                return [item.get(field) if isinstance(item, dict) else item for item in data]
    
    if ".filter(" in expr:
        # Simple filter: data.filter(x => x.active)
        match = re.search(r'\.filter\([^=]+=>\s*([^)]+)\)', expr)
        if match:
            condition = match.group(1).strip()
            if isinstance(data, list):
                # Very simplified - just check truthiness
                return [item for item in data if item]
    
    # Default: return data as-is
    return data

