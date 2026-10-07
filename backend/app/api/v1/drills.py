import base64
from typing import Optional, List, Dict, Any
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Request, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, desc

from backend.app.core.config import settings
from backend.app.models.base import get_db_session
from backend.app.models.admin_user import AdminUser
from backend.app.models.drill import Drill, DrillMedia, UserDrillActivity
from backend.app.schemas.drill import (
    DrillCreateIn, DrillUpdateIn, DrillReviewIn, DrillPublishIn,
    DrillPublicListItem, DrillPublicDetailOut, DrillAdminOut,
    DrillMediaAdminOut, DrillMediaUploadIn, SetCoverIn, MediaPreviewTokenOut,
    BookmarkIn, BookmarkOut,
    CompletionEventIn, CompletionEventOut, UserActivitySummaryItem,
    SportType, DrillCategory, DrillLevel, ParticipantType, DurationBracket
)
from backend.app.services.drill_service import DrillService
from backend.app.services.drill_media_service import DrillMediaService
from backend.app.api.deps import get_current_admin, get_current_user_id

router = APIRouter(prefix="/drills", tags=["drills"])
admin_router = APIRouter(prefix="/admin/drills", tags=["admin-drills"])


# =============================================================
# PUBLIC ENDPOINTS
# =============================================================

@router.get("", response_model=Dict[str, Any])
async def list_drills(
    sport: Optional[SportType] = None,
    category: Optional[DrillCategory] = None,
    level: Optional[DrillLevel] = None,
    participant_type: Optional[ParticipantType] = None,
    duration_bracket: Optional[DurationBracket] = None,
    search: Optional[str] = None,
    limit: int = Query(20, ge=1, le=50),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db_session)
):
    """
    Public listing of published drills with filters, Persian search, and duration brackets.
    """
    items, total = await DrillService.list_public_drills(
        db=db,
        sport=sport,
        category=category,
        level=level,
        participant_type=participant_type,
        duration_bracket=duration_bracket,
        search=search,
        limit=limit,
        offset=offset
    )
    return {
        "items": items,
        "total": total,
        "limit": limit,
        "offset": offset
    }


@router.get("/my/activities", response_model=Dict[str, Any])
async def get_my_activities(
    type: Optional[str] = Query("all", pattern="^(all|bookmarks|completed)$"),
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db_session)
):
    """
    Authenticated player's bookmarked drills and completion history.
    """
    stmt = (
        select(UserDrillActivity, Drill)
        .join(Drill, UserDrillActivity.drill_id == Drill.id)
        .where(UserDrillActivity.user_id == user_id)
    )
    if type == "bookmarks":
        stmt = stmt.where(UserDrillActivity.is_bookmarked == True)
    elif type == "completed":
        stmt = stmt.where(UserDrillActivity.completion_count > 0)

    res = await db.execute(stmt.order_by(desc(UserDrillActivity.updated_at)))
    rows = res.all()

    items = []
    for act, drill in rows:
        items.append({
            "drill_id": drill.id,
            "slug": drill.slug,
            "title": drill.title,
            "sport": drill.sport,
            "category": drill.category,
            "is_bookmarked": act.is_bookmarked,
            "bookmarked_at": act.bookmarked_at,
            "completion_count": act.completion_count,
            "last_completed_at": act.last_completed_at
        })

    return {"items": items, "count": len(items)}


@router.get("/{slug}", response_model=DrillPublicDetailOut)
async def get_drill_detail(slug: str, db: AsyncSession = Depends(get_db_session)):
    """
    Public drill detail by slug. Returns 404 if not published.
    """
    return await DrillService.get_public_drill_by_slug(db, slug)


@router.get("/{slug}/media/{media_id}")
async def stream_public_media(
    slug: str,
    media_id: str,
    request: Request,
    db: AsyncSession = Depends(get_db_session)
):
    """
    Range-request streaming for public media belonging to a PUBLISHED drill.
    If drill is unpublished or unapproved, returns 404!
    """
    drill_stmt = select(Drill).where(and_(Drill.slug == slug, Drill.status == "PUBLISHED"))
    drill_res = await db.execute(drill_stmt)
    drill = drill_res.scalar_one_or_none()
    if not drill:
        raise HTTPException(status_code=404, detail="تمرین یا رسانه مورد نظر یافت نشد.")

    media_stmt = select(DrillMedia).where(
        and_(
            DrillMedia.id == media_id,
            DrillMedia.drill_id == drill.id,
            DrillMedia.validation_status.in_(["VALID", "VALIDATED"])
        )
    )
    media_res = await db.execute(media_stmt)
    media = media_res.scalar_one_or_none()
    if not media:
        raise HTTPException(status_code=404, detail="رسانه در دسترس نیست.")

    return DrillMediaService.stream_media(request, media.storage_key, media.mime_type)


@router.get("/{id}/media/{media_id}/preview")
async def stream_media_preview(
    id: str,
    media_id: str,
    token: str = Query(...),
    request: Request = None,
    db: AsyncSession = Depends(get_db_session)
):
    """
    Secure ephemeral preview stream for admins and reviewers without exposing JWT or requiring cookies.
    Verifies:
    1. Cryptographic signature, expiration, and media/drill binding.
    2. Current user account authorization and active status in DB (Revocation check).
    3. Current drill state (cannot preview archived drill).
    4. Current media state and linkage.
    Never prints token in logs.
    """
    is_valid, user_id = DrillMediaService.verify_ephemeral_preview_token(token=token, media_id=media_id, drill_id=id)
    if not is_valid or not user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="توکن پیش‌نمایش رسانه نامعتبر است، منقضی شده یا برای رسانه دیگری صادر شده است."
        )

    # Current account authorization check (Revocation check)
    if not (settings.ALLOW_DEV_AUTH_BYPASS and user_id in ["admin", "admin-test-id", "default-admin"]):
        user_stmt = select(AdminUser).where(or_(AdminUser.id == user_id, AdminUser.username == user_id))
        user_res = await db.execute(user_stmt)
        admin_row = user_res.scalar_one_or_none()
        if not admin_row or not admin_row.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="دسترسی حساب مدیر صادرکننده این پیش‌نمایش لغو شده یا معلق است."
            )

    # Current drill state check
    drill_stmt = select(Drill).where(Drill.id == id)
    drill_res = await db.execute(drill_stmt)
    drill = drill_res.scalar_one_or_none()
    if not drill or drill.status == "ARCHIVED":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="تمرین در وضعیت بایگانی است و دسترسی به پیش‌نمایش رسانه‌های آن مسدود است."
        )

    # Current media state check
    stmt = select(DrillMedia).where(and_(DrillMedia.id == media_id, DrillMedia.drill_id == id))
    res = await db.execute(stmt)
    media = res.scalar_one_or_none()
    if not media:
        raise HTTPException(status_code=404, detail="رسانه مورد نظر یافت نشد.")
    if media.validation_status == "INVALID":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="رسانه مورد نظر در وضعیت نامعتبر قرار دارد و امکان پیش‌نمایش ندارد."
        )

    return DrillMediaService.stream_media(request, media.storage_key, media.mime_type)


@router.post("/{drill_id}/bookmark", response_model=BookmarkOut)
async def toggle_drill_bookmark(
    drill_id: str,
    payload: BookmarkIn,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db_session)
):
    """
    Idempotent bookmark toggle for authenticated users.
    """
    act = await DrillService.set_bookmark(db, user_id=user_id, drill_id=drill_id, bookmarked=payload.bookmarked)
    return BookmarkOut(
        drill_id=drill_id,
        is_bookmarked=act.is_bookmarked,
        bookmarked_at=act.bookmarked_at
    )


@router.post("/{drill_id}/complete", response_model=CompletionEventOut)
async def record_drill_complete(
    drill_id: str,
    payload: CompletionEventIn,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db_session)
):
    """
    Records drill completion idempotently.
    Repeated submission with identical idempotency_key returns ALREADY_RECORDED.
    """
    event, event_status, count = await DrillService.record_completion_event(
        db=db,
        user_id=user_id,
        drill_id=drill_id,
        idempotency_key=payload.idempotency_key,
        client_timestamp=payload.client_timestamp
    )
    return CompletionEventOut(
        event_id=event.id,
        drill_id=drill_id,
        idempotency_key=event.idempotency_key,
        status=event_status,
        completion_count=count,
        server_timestamp=event.server_timestamp
    )


# =============================================================
# ADMIN ENDPOINTS (Restricted to RBAC)
# =============================================================

def format_drill_admin_out(drill: Drill) -> DrillAdminOut:
    media_outs = []
    cover_url = None
    if drill.cover_media_id:
        cover_url = f"/api/v1/drills/{drill.slug}/media/{drill.cover_media_id}"

    media_list = drill.__dict__.get("media_items")
    if media_list:
        for m in media_list:
            media_outs.append(DrillMediaAdminOut(
                id=m.id,
                media_type=m.media_type,
                mime_type=m.mime_type,
                file_size_bytes=m.file_size_bytes,
                duration_seconds=m.duration_seconds,
                width=m.width,
                height=m.height,
                display_order=m.display_order,
                is_cover=(m.id == drill.cover_media_id),
                provenance=m.provenance,
                usage_rights_status=m.usage_rights_status,
                language=m.language,
                stream_url=f"/api/v1/admin/drills/{drill.id}/media/{m.id}",
                original_filename=m.original_filename,
                storage_key=m.storage_key,
                validation_status=m.validation_status,
                validation_error=m.validation_error,
                license_details=m.license_details,
                created_at=m.created_at
            ))

    return DrillAdminOut(
        id=drill.id,
        slug=drill.slug,
        sport=drill.sport,
        category=drill.category,
        level=drill.level,
        participant_type=drill.participant_type,
        title=drill.title,
        summary=drill.summary,
        objective=drill.objective,
        duration_minutes=drill.duration_minutes,
        equipment_required=drill.equipment_required or [],
        steps=drill.steps or [],
        common_mistakes=drill.common_mistakes or [],
        safety_precautions=drill.safety_precautions or [],
        status=drill.status,
        content_version=drill.content_version,
        approved_version=drill.approved_version,
        author_id=drill.author_id,
        author_name=drill.author_name,
        reviewer_id=drill.reviewer_id,
        reviewer_name=drill.reviewer_name,
        review_notes=drill.review_notes,
        reviewed_at=drill.reviewed_at,
        last_editor_id=drill.last_editor_id,
        last_editor_name=drill.last_editor_name,
        version_contributors=drill.version_contributors or [],
        cover_media_id=drill.cover_media_id,
        cover_image_url=cover_url,
        published_at=drill.published_at,
        created_at=drill.created_at,
        updated_at=drill.updated_at,
        media_items=media_outs
    )


@admin_router.get("", response_model=Dict[str, Any])
async def admin_list_drills(
    status: Optional[str] = None,
    sport: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    admin: dict = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db_session)
):
    stmt = select(Drill)
    if status:
        stmt = stmt.where(Drill.status == status)
    if sport:
        stmt = stmt.where(Drill.sport == sport)

    res = await db.execute(stmt.order_by(desc(Drill.created_at)).offset(offset).limit(limit))
    drills = res.scalars().all()
    return {
        "items": [format_drill_admin_out(d) for d in drills],
        "count": len(drills)
    }


@admin_router.post("", response_model=DrillAdminOut, status_code=status.HTTP_201_CREATED)
async def admin_create_drill(
    payload: DrillCreateIn,
    admin: dict = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db_session)
):
    author_id = admin.get("user_id") or admin.get("sub") or "admin"
    author_name = admin.get("username") or admin.get("full_name") or "کارشناس آموزش"

    drill = await DrillService.create_drill(
        db=db,
        payload=payload,
        author_id=author_id,
        author_name=author_name
    )
    return format_drill_admin_out(drill)


@admin_router.get("/{id}", response_model=DrillAdminOut)
async def admin_get_drill(
    id: str,
    admin: dict = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db_session)
):
    stmt = select(Drill).where(Drill.id == id)
    res = await db.execute(stmt)
    drill = res.scalar_one_or_none()
    if not drill:
        raise HTTPException(status_code=404, detail="تمرین یافت نشد.")

    # Eager load media
    media_stmt = select(DrillMedia).where(DrillMedia.drill_id == id).order_by(DrillMedia.display_order)
    media_res = await db.execute(media_stmt)
    drill.media_items = list(media_res.scalars().all())

    return format_drill_admin_out(drill)


@admin_router.put("/{id}", response_model=DrillAdminOut)
async def admin_update_drill(
    id: str,
    payload: DrillUpdateIn,
    admin: dict = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db_session)
):
    editor_id = admin.get("user_id") or admin.get("sub") or "admin"
    editor_name = admin.get("full_name") or admin.get("username") or "ویرایشگر رالی"
    drill = await DrillService.update_drill(
        db, drill_id=id, payload=payload, editor_id=editor_id, editor_name=editor_name
    )
    return format_drill_admin_out(drill)


@admin_router.post("/{id}/cover", response_model=DrillAdminOut)
async def admin_set_drill_cover(
    id: str,
    payload: SetCoverIn,
    admin: dict = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db_session)
):
    drill = await DrillService.set_drill_cover(db, drill_id=id, media_id=payload.media_id)
    return format_drill_admin_out(drill)


@admin_router.get("/{id}/media/{media_id}/preview-token", response_model=MediaPreviewTokenOut)
async def admin_get_preview_token(
    id: str,
    media_id: str,
    admin: dict = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db_session)
):
    admin_id = admin.get("user_id") or admin.get("sub") or "admin"
    token, exp_dt = DrillMediaService.generate_ephemeral_preview_token(
        media_id=media_id,
        drill_id=id,
        user_id=admin_id,
        purpose="preview",
        valid_seconds=600
    )
    preview_url = f"/api/v1/drills/{id}/media/{media_id}/preview?token={token}"
    return MediaPreviewTokenOut(preview_url=preview_url, expires_at=exp_dt)


@admin_router.post("/{id}/submit-for-review", response_model=DrillAdminOut)
async def admin_submit_for_review(
    id: str,
    admin: dict = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db_session)
):
    drill = await DrillService.submit_for_review(db, drill_id=id)
    return format_drill_admin_out(drill)


@admin_router.post("/{id}/review", response_model=DrillAdminOut)
async def admin_review_drill(
    id: str,
    payload: DrillReviewIn,
    admin: dict = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db_session)
):
    reviewer_id = admin.get("user_id") or admin.get("sub") or "admin"
    reviewer_name = admin.get("username") or admin.get("full_name") or "ناظر ارشد"

    drill = await DrillService.review_drill(
        db=db,
        drill_id=id,
        payload=payload,
        reviewer_id=reviewer_id,
        reviewer_name=reviewer_name
    )
    return format_drill_admin_out(drill)


@admin_router.post("/{id}/publish", response_model=DrillAdminOut)
async def admin_publish_drill(
    id: str,
    payload: DrillPublishIn,
    admin: dict = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db_session)
):
    drill = await DrillService.publish_drill(
        db=db,
        drill_id=id,
        confirm_usage_rights=payload.confirm_usage_rights
    )
    return format_drill_admin_out(drill)


@admin_router.post("/{id}/archive", response_model=DrillAdminOut)
async def admin_archive_drill(
    id: str,
    admin: dict = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db_session)
):
    drill = await DrillService.archive_drill(db, drill_id=id)
    return format_drill_admin_out(drill)


@admin_router.post("/{id}/media", response_model=DrillMediaAdminOut)
async def admin_upload_media(
    id: str,
    payload: DrillMediaUploadIn,
    admin: dict = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db_session)
):
    """
    Uploads and securely associates media to drill using base64 payload.
    """
    try:
        file_bytes = base64.b64decode(payload.file_base64)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="داده Base64 ارسالی نامعتبر است."
        )

    storage_key, mime_type, file_size = DrillMediaService.save_media_bytes(
        drill_id=id,
        raw_bytes=file_bytes,
        original_filename=payload.original_filename,
        media_type=payload.media_type.value
    )

    media = await DrillService.attach_media(
        db=db,
        drill_id=id,
        storage_key=storage_key,
        original_filename=payload.original_filename,
        media_type=payload.media_type.value,
        mime_type=mime_type,
        file_size_bytes=file_size,
        is_cover=payload.is_cover,
        provenance=payload.provenance.value,
        usage_rights_status=payload.usage_rights_status.value,
        license_details=payload.license_details
    )

    return DrillMediaAdminOut(
        id=media.id,
        media_type=media.media_type,
        mime_type=media.mime_type,
        file_size_bytes=media.file_size_bytes,
        duration_seconds=media.duration_seconds,
        width=media.width,
        height=media.height,
        display_order=media.display_order,
        is_cover=media.is_cover,
        provenance=media.provenance,
        usage_rights_status=media.usage_rights_status,
        language=media.language,
        stream_url=f"/api/v1/admin/drills/{id}/media/{media.id}",
        original_filename=media.original_filename,
        storage_key=media.storage_key,
        validation_status=media.validation_status,
        validation_error=media.validation_error,
        license_details=media.license_details,
        created_at=media.created_at
    )


@admin_router.get("/{id}/media/{media_id}")
async def admin_stream_media(
    id: str,
    media_id: str,
    request: Request,
    admin: dict = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db_session)
):
    """
    Allows authorized administrators/reviewers to stream unapproved/draft media safely.
    """
    media_stmt = select(DrillMedia).where(and_(DrillMedia.id == media_id, DrillMedia.drill_id == id))
    media_res = await db.execute(media_stmt)
    media = media_res.scalar_one_or_none()
    if not media:
        raise HTTPException(status_code=404, detail="رسانه یافت نشد.")

    return DrillMediaService.stream_media(request, media.storage_key, media.mime_type)


@admin_router.delete("/{id}/media/{media_id}")
async def admin_delete_media(
    id: str,
    media_id: str,
    admin: dict = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db_session)
):
    media_stmt = select(DrillMedia).where(and_(DrillMedia.id == media_id, DrillMedia.drill_id == id))
    media_res = await db.execute(media_stmt)
    media = media_res.scalar_one_or_none()
    if not media:
        raise HTTPException(status_code=404, detail="رسانه یافت نشد.")

    # Remove physical file
    DrillMediaService.delete_physical_file(media.storage_key)

    # Check if was cover
    drill_stmt = select(Drill).where(Drill.id == id)
    drill_res = await db.execute(drill_stmt)
    drill = drill_res.scalar_one_or_none()
    if drill and drill.cover_media_id == media.id:
        drill.cover_media_id = None

    await db.delete(media)
    await db.commit()
    return {"status": "ok", "message": "رسانه با موفقیت حذف شد."}
