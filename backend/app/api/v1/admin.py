from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Request
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.models.base import get_db_session
from backend.app.services.admin_service import AdminService
from backend.app.api.deps import get_current_admin

router = APIRouter(prefix="/admin", tags=["admin"])

class AdminLoginRequest(BaseModel):
    username: str
    password: str

class IncidentCreateRequest(BaseModel):
    title: str
    severity: str = "WARNING"  # CRITICAL, WARNING, INFO
    category: str = "GENERAL"  # PAYMENT, COURT, SHOP, TECH, DISPUTE
    description: str
    reporter_name: str = "ادمین عملیاتی"

class IncidentResolveRequest(BaseModel):
    resolution_notes: str

class EmergencyCancelRequest(BaseModel):
    reason: str
    admin_name: str = "ادمین عملیاتی"

class AuditLogCreateRequest(BaseModel):
    action: str
    target_type: str
    target_id: str
    details: Optional[Dict[str, Any]] = None
    admin_name: str = "ادمین عملیاتی"

@router.post("/login")
async def admin_login(
    req: AdminLoginRequest,
    request: Request,
    session: AsyncSession = Depends(get_db_session)
):
    """
    Authenticates operations admin and issues secure token.
    """
    client_ip = request.client.host if request.client else "127.0.0.1"
    service = AdminService(session)
    result = await service.authenticate_admin(
        username=req.username,
        password=req.password,
        ip_address=client_ip
    )
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=result.get("message", "نام کاربری یا رمز عبور نامعتبر است.")
        )
    return result

@router.get("/stats")
async def get_dashboard_stats(
    session: AsyncSession = Depends(get_db_session),
    admin: dict = Depends(get_current_admin)
):
    """
    Returns platform KPI overview and operational health metrics.
    Protected: Only authorized operations admins.
    """
    service = AdminService(session)
    return await service.get_admin_dashboard_stats()

@router.get("/incidents")
async def list_incidents(
    resolved: Optional[bool] = None,
    session: AsyncSession = Depends(get_db_session),
    admin: dict = Depends(get_current_admin)
):
    """
    Lists incident/SOS reports.
    Protected: Only authorized operations admins.
    """
    service = AdminService(session)
    incidents = await service.get_incidents(resolved=resolved)
    return [
        {
            "id": inc.id,
            "title": inc.title,
            "severity": inc.severity,
            "category": inc.category,
            "description": inc.description,
            "reporter_name": inc.reporter_name,
            "is_resolved": inc.is_resolved,
            "resolution_notes": inc.resolution_notes,
            "created_at": inc.created_at.isoformat() if inc.created_at else None
        }
        for inc in incidents
    ]

@router.post("/incidents", status_code=status.HTTP_201_CREATED)
async def report_incident(
    req: IncidentCreateRequest,
    session: AsyncSession = Depends(get_db_session)
):
    """
    Submits a critical incident or emergency alert to the platform owner.
    """
    service = AdminService(session)
    inc = await service.create_incident_report(
        title=req.title,
        severity=req.severity,
        category=req.category,
        description=req.description,
        reporter_name=req.reporter_name
    )
    return {
        "id": inc.id,
        "title": inc.title,
        "severity": inc.severity,
        "is_resolved": inc.is_resolved,
        "created_at": inc.created_at.isoformat() if inc.created_at else None
    }

@router.post("/incidents/{incident_id}/resolve")
async def resolve_incident(
    incident_id: str,
    req: IncidentResolveRequest,
    session: AsyncSession = Depends(get_db_session),
    admin: dict = Depends(get_current_admin)
):
    """
    Resolves an open incident report.
    Protected: Only authorized operations admins.
    """
    service = AdminService(session)
    inc = await service.resolve_incident(incident_id, req.resolution_notes)
    return {
        "id": inc.id,
        "is_resolved": inc.is_resolved,
        "resolution_notes": inc.resolution_notes
    }

@router.post("/matches/{game_id}/emergency-cancel")
async def emergency_cancel_match(
    game_id: str,
    req: EmergencyCancelRequest,
    session: AsyncSession = Depends(get_db_session),
    admin: dict = Depends(get_current_admin)
):
    """
    Executes emergency cancellation of a match with 100% full refund to players.
    Protected: Only authorized operations admins.
    """
    service = AdminService(session)
    game = await service.emergency_cancel_match(
        game_id=game_id,
        reason=req.reason,
        admin_name=req.admin_name
    )
    return {
        "game_id": game.id,
        "status": game.status,
        "message": "بازی مچ‌میکینگ با موفقیت لغو شد و وجه بازیکنان به کیف پول آن‌ها مسترد گردید."
    }

@router.post("/audit-logs", status_code=status.HTTP_201_CREATED)
async def record_audit_log(
    req: AuditLogCreateRequest,
    session: AsyncSession = Depends(get_db_session),
    admin: dict = Depends(get_current_admin)
):
    """
    Records operations audit actions.
    Protected: Only authorized operations admins.
    """
    service = AdminService(session)
    log = await service.record_audit_log(
        admin_name=req.admin_name,
        action=req.action,
        target_type=req.target_type,
        target_id=req.target_id,
        details=req.details
    )
    await session.commit()
    return {"id": log.id, "status": "LOGGED"}
