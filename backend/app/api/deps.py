from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError
from backend.app.core.config import settings
from backend.app.core.security import decode_token

security = HTTPBearer(auto_error=False)

async def get_current_user_id(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    if not credentials:
        if settings.ALLOW_DEV_AUTH_BYPASS:
            return "default-player-test-id"
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="احراز هویت الزامی است. لطفاً وارد حساب کاربری خود شوید."
        )
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
        if settings.ALLOW_DEV_AUTH_BYPASS:
            return {"user_id": "operator-test-id", "role": "CLUB_OPERATOR", "club_id": "club-test-id"}
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="احراز هویت متصدی باجه الزامی است."
        )
    token = credentials.credentials
    try:
        payload = decode_token(token)
        role = payload.get("role")
        if role not in ["CLUB_OPERATOR", "CLUB_ADMIN", "OPERATIONS_ADMIN"]:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="دسترسی منحصراً برای کادر باجه باشگاه است")
        return payload
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="توکن نامعتبر یا منقضی شده است")

async def get_current_admin(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    if not credentials:
        if settings.ALLOW_DEV_AUTH_BYPASS:
            return {"user_id": "admin-test-id", "role": "OPERATIONS_ADMIN", "username": "admin"}
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="دسترسی به این بخش نیازمند ورود مدیر سیستم است."
        )
    token = credentials.credentials
    try:
        payload = decode_token(token)
        role = payload.get("role")
        if role not in ["OPERATIONS_ADMIN", "SUPER_ADMIN", "ADMIN"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="دسترسی غیرمجاز؛ فقط مدیران ارشد به این بخش دسترسی دارند."
            )
        return payload
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="توکن نامعتبر یا منقضی شده است")
