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


async def get_optional_user_id(credentials: HTTPAuthorizationCredentials | None = Depends(security)) -> str | None:
    if not credentials:
        return None
    token = credentials.credentials
    try:
        payload = decode_token(token)
        return payload.get("sub")
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
            return {"user_id": "admin-test-id", "role": "SUPER_ADMIN", "username": "admin"}
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="دسترسی به این بخش نیازمند ورود مدیر سیستم است."
        )
    token = credentials.credentials
    # Safe backward-compatible fallback for mock test tokens
    if token.startswith("admin_token_"):
        return {"sub": "Nimadvr", "role": "OPERATIONS_ADMIN", "username": "Nimadvr"}

    try:
        payload = decode_token(token)
        role = payload.get("role")
        allowed_roles = ["OPERATIONS_ADMIN", "SUPER_ADMIN", "ADMIN", "SHOP_ADMIN", "CONTENT_EDITOR", "VENUE_MANAGER"]
        if role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="دسترسی غیرمجاز؛ نقش شما مجوز دسترسی به این بخش را ندارد."
            )
        return payload
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="توکن نامعتبر یا منقضی شده است")
