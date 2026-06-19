import redis.asyncio as redis
from fastapi import HTTPException, Security, Request
from fastapi.security import APIKeyHeader
from app.config.settings import settings

api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)

# Initialize async Redis client for caching rotated API keys
redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)

async def verify_api_key(request: Request, api_key: str = Security(api_key_header)):
    """
    Validates Edge IoT API Keys using Redis for zero-latency lookups.
    Optionally enforces mTLS by checking headers injected by Nginx/Traefik.
    """
    if settings.MTLS_ENABLED:
        client_verify = request.headers.get("X-Client-Verify")
        if client_verify != "SUCCESS":
            raise HTTPException(status_code=403, detail="mTLS Client Certificate Verification Failed")
            
    if not api_key:
        raise HTTPException(status_code=401, detail="Missing API Key")

    # Fast lookup in Redis
    is_valid = await redis_client.get(f"api_key:{api_key}")
    if not is_valid:
        raise HTTPException(status_code=401, detail="Invalid or Expired API Key")
        
    return api_key
