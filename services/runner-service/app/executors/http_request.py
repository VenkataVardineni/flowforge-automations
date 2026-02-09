import httpx
import json
import logging
import asyncio
from typing import Dict, Any, Optional
from datetime import datetime
import time

logger = logging.getLogger(__name__)

async def execute_http_request(
    config: Dict[str, Any],
    input_data: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Execute HTTP Request node.
    
    Config:
    - method: HTTP method (GET, POST, PUT, DELETE, PATCH)
    - url: Request URL
    - headers: Request headers (dict)
    - body: Request body (dict or string)
    - timeout: Timeout in seconds (default: 30)
    - retry_count: Number of retries (default: 3)
    
    Returns:
    - status_code: HTTP status code
    - response_headers: Response headers (dict)
    - response_body: Response body (dict or string, truncated if > 10KB)
    """
    method = config.get("method", "GET").upper()
    url = config.get("url", "")
    headers = config.get("headers", {})
    body = config.get("body", None)
    timeout = config.get("timeout", 30)
    retry_count = config.get("retry_count", 3)
    
    if not url:
        raise ValueError("URL is required for HTTP Request node")
    
    # Prepare headers
    if isinstance(headers, str):
        try:
            headers = json.loads(headers)
        except json.JSONDecodeError:
            headers = {}
    
    # Prepare body
    if body:
        if isinstance(body, str):
            try:
                body = json.loads(body)
            except json.JSONDecodeError:
                pass  # Keep as string
        if isinstance(body, dict):
            if not headers.get("Content-Type"):
                headers["Content-Type"] = "application/json"
            body = json.dumps(body)
    
    # Execute with retries
    last_error = None
    for attempt in range(retry_count + 1):
        try:
            async with httpx.AsyncClient(timeout=timeout) as client:
                response = await client.request(
                    method=method,
                    url=url,
                    headers=headers,
                    content=body if body else None
                )
                
                # Parse response body
                try:
                    response_body = response.json()
                except:
                    response_body = response.text
                
                # Truncate large responses (> 10KB)
                response_body_str = json.dumps(response_body) if isinstance(response_body, dict) else str(response_body)
                if len(response_body_str) > 10000:
                    response_body = response_body_str[:10000] + "... [truncated]"
                
                return {
                    "status_code": response.status_code,
                    "response_headers": dict(response.headers),
                    "response_body": response_body,
                    "success": 200 <= response.status_code < 300
                }
                
        except httpx.TimeoutException as e:
            last_error = f"Timeout: {str(e)}"
            logger.warning(f"HTTP request timeout (attempt {attempt + 1}/{retry_count + 1}): {url}")
        except httpx.RequestError as e:
            last_error = f"Request error: {str(e)}"
            logger.warning(f"HTTP request error (attempt {attempt + 1}/{retry_count + 1}): {str(e)}")
        except Exception as e:
            last_error = f"Unexpected error: {str(e)}"
            logger.error(f"Unexpected error in HTTP request: {str(e)}", exc_info=True)
        
        # Exponential backoff before retry
        if attempt < retry_count:
            wait_time = (2 ** attempt) * 1  # 1s, 2s, 4s...
            logger.info(f"Retrying HTTP request in {wait_time}s...")
            await asyncio.sleep(wait_time)
    
    # All retries failed
    raise Exception(f"HTTP request failed after {retry_count + 1} attempts: {last_error}")

