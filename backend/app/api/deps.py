from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError
from backend.app.core.security import decode_token

security = HTTPBearer(auto_error=False)

async def get_current_user_id(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    if not credentials:
        # Fallback test user id for mock/dev when not provided
        return "default-player-test-id"
    token = credentials.credentials
    try:
        payload = decode_token(token)
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="توکن نامعتبر است")
        return user_id
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="توکن نامعتبر یا منقضی شده است")

async def get_current_operator(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    if not credentials:
        return {"user_id": "operator-test-id", "role": "CLUB_OPERATOR", "club_id": "club-test-id"}
    token = credentials.credentials
    try:
        payload = decode_token(token)
        role = payload.get("role")
        if role not in ["CLUB_OPERATOR", "CLUB_ADMIN"]:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="دسترسی منحصراً برای کادر باجه باشگاه است")
        return payload
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="توکن نامعتبر یا منقضی شده است")
