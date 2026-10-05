from datetime import datetime
from typing import Optional, List, Dict, Any, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func, desc
from fastapi import HTTPException, status

from backend.app.models.drill import Drill, DrillMedia, UserDrillActivity, DrillCompletionEvent
from backend.app.models.user import User
from backend.app.schemas.drill import (
    DrillCreateIn, DrillUpdateIn, DrillReviewIn,
    SportType, DrillCategory, DrillLevel, ParticipantType, DurationBracket,
    MediaProvenance, UsageRightsStatus
)
from backend.app.core.datetime_utils import utc_now


class DrillService:

    # -------------------------------------------------------------
    # 1. Public Queries
    # -------------------------------------------------------------

    @staticmethod
    async def list_public_drills(
        db: AsyncSession,
        sport: Optional[SportType] = None,
        category: Optional[DrillCategory] = None,
        level: Optional[DrillLevel] = None,
        participant_type: Optional[ParticipantType] = None,
        duration_bracket: Optional[DurationBracket] = None,
        search: Optional[str] = None,
        limit: int = 20,
        offset: int = 0
    ) -> Tuple[List[Dict[str, Any]], int]:
        """
        Lists published drills with structured filtering and Persian search.
        Strictly filters status == 'PUBLISHED' in DB query.
        """
        limit = min(max(1, limit), 50)
        conditions = [Drill.status == "PUBLISHED"]

        if sport:
            conditions.append(Drill.sport == sport.value)
        if category:
            conditions.append(Drill.category == category.value)
        if level:
            conditions.append(Drill.level == level.value)
        if participant_type:
            conditions.append(Drill.participant_type == participant_type.value)

        # Duration Brackets: <15, 15-30 (inclusive), >30
        if duration_bracket == DurationBracket.UNDER_15:
            conditions.append(Drill.duration_minutes < 15)
        elif duration_bracket == DurationBracket.BETWEEN_15_AND_30:
            conditions.append(and_(Drill.duration_minutes >= 15, Drill.duration_minutes <= 30))
        elif duration_bracket == DurationBracket.OVER_30:
            conditions.append(Drill.duration_minutes > 30)

        if search and search.strip():
            kw = f"%{search.strip()}%"
            conditions.append(or_(Drill.title.ilike(kw), Drill.summary.ilike(kw)))

        where_clause = and_(*conditions)

        # Count total
        count_stmt = select(func.count(Drill.id)).where(where_clause)
        total_res = await db.execute(count_stmt)
        total_count = total_res.scalar_one()

        # Query items with stable ordering
        stmt = (
            select(Drill)
            .where(where_clause)
            .order_by(desc(Drill.published_at), desc(Drill.created_at))
            .offset(offset)
            .limit(limit)
        )
        res = await db.execute(stmt)
        drills = res.scalars().all()

        items = []
        for d in drills:
            # Check for cover image url
            cover_url = None
            if d.cover_media_id:
                cover_url = f"/api/v1/drills/{d.slug}/media/{d.cover_media_id}"

            # Check if has video
            media_stmt = select(func.count(DrillMedia.id)).where(
                and_(
                    DrillMedia.drill_id == d.id,
                    DrillMedia.media_type == "VIDEO",
                    DrillMedia.validation_status == "VALID"
                )
            )
            vid_res = await db.execute(media_stmt)
            has_video = (vid_res.scalar_one() > 0)

            items.append({
                "id": d.id,
                "slug": d.slug,
                "sport": d.sport,
                "category": d.category,
                "level": d.level,
                "participant_type": d.participant_type,
                "title": d.title,
                "summary": d.summary,
                "duration_minutes": d.duration_minutes,
                "cover_image_url": cover_url,
                "has_video": has_video,
                "published_at": d.published_at
            })

        return items, total_count

    @staticmethod
    async def get_public_drill_by_slug(db: AsyncSession, slug: str) -> Dict[str, Any]:
        """
        Fetches single drill by slug. Strict 404 if drill does not exist or is not PUBLISHED.
        """
        stmt = select(Drill).where(and_(Drill.slug == slug, Drill.status == "PUBLISHED"))
        res = await db.execute(stmt)
        drill = res.scalar_one_or_none()
        if not drill:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="تمرین مورد نظر یافت نشد یا هنوز منتشر نشده است."
            )

        # Fetch valid media items
        media_stmt = (
            select(DrillMedia)
            .where(and_(DrillMedia.drill_id == drill.id, DrillMedia.validation_status == "VALID"))
            .order_by(DrillMedia.display_order, DrillMedia.created_at)
        )
        media_res = await db.execute(media_stmt)
        media_rows = media_res.scalars().all()

        cover_url = None
        if drill.cover_media_id:
            cover_url = f"/api/v1/drills/{drill.slug}/media/{drill.cover_media_id}"

        media_items = []
        for m in media_rows:
            media_items.append({
                "id": m.id,
                "media_type": m.media_type,
                "mime_type": m.mime_type,
                "file_size_bytes": m.file_size_bytes,
                "duration_seconds": m.duration_seconds,
                "width": m.width,
                "height": m.height,
                "display_order": m.display_order,
                "is_cover": m.is_cover,
                "provenance": m.provenance,
                "usage_rights_status": m.usage_rights_status,
                "language": m.language,
                "stream_url": f"/api/v1/drills/{drill.slug}/media/{m.id}"
            })

        return {
            "id": drill.id,
            "slug": drill.slug,
            "sport": drill.sport,
            "category": drill.category,
            "level": drill.level,
            "participant_type": drill.participant_type,
            "title": drill.title,
            "summary": drill.summary,
            "objective": drill.objective,
            "duration_minutes": drill.duration_minutes,
            "equipment_required": drill.equipment_required or [],
            "steps": drill.steps or [],
            "common_mistakes": drill.common_mistakes or [],
            "safety_precautions": drill.safety_precautions or [],
            "cover_image_url": cover_url,
            "media_items": media_items,
            "published_at": drill.published_at
        }

    # -------------------------------------------------------------
    # 2. Admin & Workflow Management
    # -------------------------------------------------------------

    @staticmethod
    async def create_drill(
        db: AsyncSession,
        payload: DrillCreateIn,
        author_id: str,
        author_name: str
    ) -> Drill:
        """Creates new drill in DRAFT status."""
        # Check slug uniqueness
        existing = await db.execute(select(Drill).where(Drill.slug == payload.slug))
        if existing.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"اسلاگ '{payload.slug}' قبلاً ثبت شده است. لطفاً اسلاگ دیگری انتخاب فرمایید."
            )

        drill = Drill(
            slug=payload.slug,
            sport=payload.sport.value,
            category=payload.category.value,
            level=payload.level.value,
            participant_type=payload.participant_type.value,
            title=payload.title,
            summary=payload.summary,
            objective=payload.objective,
            duration_minutes=payload.duration_minutes,
            equipment_required=payload.equipment_required,
            steps=[s.model_dump() for s in payload.steps],
            common_mistakes=[m.model_dump() for m in payload.common_mistakes],
            safety_precautions=payload.safety_precautions,
            status="DRAFT",
            content_version=1,
            author_id=author_id,
            author_name=author_name,
            version_contributors=[author_id] if author_id else []
        )
        db.add(drill)
        await db.commit()
        await db.refresh(drill)
        return drill

    @staticmethod
    async def update_drill(
        db: AsyncSession,
        drill_id: str,
        payload: DrillUpdateIn,
        editor_id: Optional[str] = None,
        editor_name: Optional[str] = None
    ) -> Drill:
        """
        Updates drill with optimistic concurrency control and row-level locking.
        If substantive training steps or details are modified and the drill was
        APPROVED or PUBLISHED, it is automatically revoked and returned to PENDING_REVIEW!
        """
        stmt = select(Drill).where(Drill.id == drill_id).with_for_update()
        res = await db.execute(stmt)
        drill = res.scalar_one_or_none()
        if not drill:
            raise HTTPException(status_code=404, detail="تمرین مورد نظر یافت نشد.")

        # Concurrency check
        if drill.content_version != payload.expected_version:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"تعارض در ویرایش: نسخه تمرین تغییر کرده است (نسخه سرور: {drill.content_version}، نسخه ارسالی شما: {payload.expected_version}). لطفاً ابتدا اطلاعات را بازخوانی کنید."
            )

        # Check slug uniqueness if changed
        if payload.slug and payload.slug != drill.slug:
            existing = await db.execute(select(Drill).where(and_(Drill.slug == payload.slug, Drill.id != drill_id)))
            if existing.scalar_one_or_none():
                raise HTTPException(status_code=400, detail=f"اسلاگ '{payload.slug}' قبلاً ثبت شده است.")
            drill.slug = payload.slug

        if payload.sport is not None:
            drill.sport = payload.sport.value
        if payload.category is not None:
            drill.category = payload.category.value
        if payload.level is not None:
            drill.level = payload.level.value
        if payload.participant_type is not None:
            drill.participant_type = payload.participant_type.value
        if payload.title is not None:
            drill.title = payload.title
        if payload.summary is not None:
            drill.summary = payload.summary
        if payload.objective is not None:
            drill.objective = payload.objective
        if payload.duration_minutes is not None:
            drill.duration_minutes = payload.duration_minutes
        if payload.equipment_required is not None:
            drill.equipment_required = payload.equipment_required
        if payload.steps is not None:
            drill.steps = [s.model_dump() for s in payload.steps]
        if payload.common_mistakes is not None:
            drill.common_mistakes = [m.model_dump() for m in payload.common_mistakes]
        if payload.safety_precautions is not None:
            drill.safety_precautions = payload.safety_precautions

        # Version increment & track contributors
        drill.content_version += 1
        if editor_id:
            drill.last_editor_id = editor_id
            drill.last_editor_name = editor_name or "ویرایشگر رالی"
            contributors = list(drill.version_contributors or [])
            if editor_id not in contributors:
                contributors.append(editor_id)
            drill.version_contributors = contributors

        # Substantive change: re-review trigger
        if drill.status in ["APPROVED", "PUBLISHED"]:
            drill.status = "PENDING_REVIEW"
            drill.approved_version = None
            drill.published_at = None

        await db.commit()
        await db.refresh(drill)
        return drill

    @staticmethod
    async def submit_for_review(db: AsyncSession, drill_id: str) -> Drill:
        """Transitions DRAFT to PENDING_REVIEW."""
        stmt = select(Drill).where(Drill.id == drill_id)
        res = await db.execute(stmt)
        drill = res.scalar_one_or_none()
        if not drill:
            raise HTTPException(status_code=404, detail="تمرین یافت نشد.")

        if drill.status not in ["DRAFT", "PENDING_REVIEW"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"امکان ارسال برای بازبینی از وضعیت فعلی '{drill.status}' وجود ندارد."
            )

        # Validate mandatory completeness
        if not drill.title or not drill.summary or not drill.objective:
            raise HTTPException(status_code=400, detail="عنوان، خلاصه و هدف تمرین باید تکمیل باشند.")
        if not drill.steps or len(drill.steps) == 0:
            raise HTTPException(status_code=400, detail="ثبت حداقل یک مرحله اجرایی برای ارسال به بازبینی الزامی است.")

        drill.status = "PENDING_REVIEW"
        await db.commit()
        await db.refresh(drill)
        return drill

    @staticmethod
    async def review_drill(
        db: AsyncSession,
        drill_id: str,
        payload: DrillReviewIn,
        reviewer_id: str,
        reviewer_name: str
    ) -> Drill:
        """
        Approves or rejects a drill in PENDING_REVIEW.
        Enforces separation of duties: Neither original author NOR last substantive editor can approve their own drill!
        """
        stmt = select(Drill).where(Drill.id == drill_id)
        res = await db.execute(stmt)
        drill = res.scalar_one_or_none()
        if not drill:
            raise HTTPException(status_code=404, detail="تمرین یافت نشد.")

        if drill.status != "PENDING_REVIEW":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"تمرین در انتظار بازبینی نیست (وضعیت فعلی: {drill.status})."
            )

        # Red Line: Reviewer Independence (Author, last editor, and ANY contributor to this version cannot review)
        contributors = set(drill.version_contributors or [])
        if drill.author_id:
            contributors.add(drill.author_id)
        if drill.last_editor_id:
            contributors.add(drill.last_editor_id)

        if reviewer_id in contributors:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="تفکیک وظایف: نویسنده، ویرایشگر یا هر یک از مشارکت‌کنندگان موثر در این نسخه نمی‌توانند بازبین مستقل همان نسخه باشند."
            )

        structured_notes = payload.review_notes or ""
        if payload.checklist:
            cl = payload.checklist
            if payload.action == "APPROVE":
                if not cl.suitability_approved:
                    raise HTTPException(status_code=400, detail="تأیید تمرین ممکن نیست: تناسب آموزش با ورزش و سطح تایید نشده است.")
                if not cl.movement_clarity_approved:
                    raise HTTPException(status_code=400, detail="تأیید تمرین ممکن نیست: وضوح اجرای حرکت تایید نشده است.")
                if not cl.media_sync_approved:
                    raise HTTPException(status_code=400, detail="تأیید تمرین ممکن نیست: هماهنگی متن و رسانه تایید نشده است.")

            audit_parts = [
                f"[چک‌لیست بازبینی تخصصی v{drill.content_version}]",
                f"تناسب ورزشی: {'تایید' if cl.suitability_approved else 'رد'}",
                f"وضوح حرکت: {'تایید' if cl.movement_clarity_approved else 'رد'}",
                f"هماهنگی رسانه: {'تایید' if cl.media_sync_approved else 'رد'}"
            ]
            if cl.pedagogical_notes:
                audit_parts.append(f"نکات آموزشی: {cl.pedagogical_notes}")
            if cl.safety_notes:
                audit_parts.append(f"نکات ایمنی: {cl.safety_notes}")
            if cl.verified_media_ids:
                audit_parts.append(f"رسانه‌های بررسی‌شده: {', '.join(cl.verified_media_ids)}")
            if structured_notes:
                audit_parts.append(f"توضیحات تکمیلی: {structured_notes}")
            structured_notes = " | ".join(audit_parts)

        if payload.action == "APPROVE":
            drill.status = "APPROVED"
            drill.approved_version = drill.content_version
            drill.reviewer_id = reviewer_id
            drill.reviewer_name = reviewer_name
            drill.reviewed_at = utc_now()
            drill.review_notes = structured_notes
            drill.version_contributors = []
        else:
            drill.status = "DRAFT"
            drill.approved_version = None
            drill.review_notes = structured_notes

        await db.commit()
        await db.refresh(drill)
        return drill

    @staticmethod
    async def publish_drill(
        db: AsyncSession,
        drill_id: str,
        confirm_usage_rights: bool
    ) -> Drill:
        """
        Publishes an APPROVED drill.
        Validates:
        - Must be APPROVED with approved_version == content_version
        - All media items must be VALID
        - All media items must have valid usage rights (OWNED, LICENSED, PUBLIC_DOMAIN)
        - Provenance must NOT be UNSPECIFIED
        """
        if not confirm_usage_rights:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="جهت انتشار عمومی، تأییدیه صریح بررسی حقوق نشر و اصالت رسانه‌ها الزامی است."
            )

        stmt = select(Drill).where(Drill.id == drill_id)
        res = await db.execute(stmt)
        drill = res.scalar_one_or_none()
        if not drill:
            raise HTTPException(status_code=404, detail="تمرین یافت نشد.")

        if drill.status != "APPROVED":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"تنها تمریناتی که در وضعیت تأییدشده (APPROVED) هستند قابل انتشارند (وضعیت فعلی: {drill.status})."
            )

        if drill.approved_version != drill.content_version:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="نسخه محتوای تمرین پس از تأیید تغییر کرده است و نیازمند بازبینی مجدد است."
            )

        # Inspect attached media items
        media_stmt = select(DrillMedia).where(DrillMedia.drill_id == drill_id)
        media_res = await db.execute(media_stmt)
        media_items = media_res.scalars().all()

        for m in media_items:
            if m.validation_status not in ["VALID", "VALIDATED"]:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"فایل رسانه '{m.original_filename}' اعتبارسنجی نشده یا رد شده است (وضعیت: {m.validation_status}) و اجازه انتشار ندارد."
                )
            if m.usage_rights_status == "UNAUTHORIZED":
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"رسانه '{m.original_filename}' فاقد مجوز استفاده قانونی است (وضعیت UNAUTHORIZED)."
                )
            if m.provenance == "UNSPECIFIED":
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"منشأ رسانه '{m.original_filename}' نامشخص (UNSPECIFIED) است. منشأ باید شفاف تعیین گردد."
                )

        drill.status = "PUBLISHED"
        drill.published_at = utc_now()
        await db.commit()
        await db.refresh(drill)
        return drill

    @staticmethod
    async def archive_drill(db: AsyncSession, drill_id: str) -> Drill:
        """Archives a drill (removes from public display)."""
        stmt = select(Drill).where(Drill.id == drill_id)
        res = await db.execute(stmt)
        drill = res.scalar_one_or_none()
        if not drill:
            raise HTTPException(status_code=404, detail="تمرین یافت نشد.")

        drill.status = "ARCHIVED"
        await db.commit()
        await db.refresh(drill)
        return drill

    # -------------------------------------------------------------
    # 3. Media Association & Cover Management
    # -------------------------------------------------------------

    @staticmethod
    async def attach_media(
        db: AsyncSession,
        drill_id: str,
        storage_key: str,
        original_filename: str,
        media_type: str,
        mime_type: str,
        file_size_bytes: int,
        is_cover: bool = False,
        provenance: str = "REAL_RECORDING",
        usage_rights_status: str = "OWNED",
        license_details: Optional[str] = None
    ) -> DrillMedia:
        stmt = select(Drill).where(Drill.id == drill_id)
        res = await db.execute(stmt)
        drill = res.scalar_one_or_none()
        if not drill:
            raise HTTPException(status_code=404, detail="تمرین یافت نشد.")

        validation_status = "VALIDATED" if media_type != "VIDEO" else "PENDING_VALIDATION"
        validation_error = None
        duration_seconds = None
        width = None
        height = None

        if media_type == "VIDEO":
            v_status, v_err, dur, w, h = DrillMediaService.validate_video_metadata(storage_key)
            validation_status = v_status
            validation_error = v_err
            duration_seconds = dur
            width = w
            height = h

        # Only allow cover on valid media
        if is_cover and validation_status not in ["VALID", "VALIDATED"]:
            is_cover = False

        if is_cover:
            from sqlalchemy import update
            await db.execute(
                update(DrillMedia).where(DrillMedia.drill_id == drill_id).values(is_cover=False)
            )

        media = DrillMedia(
            drill_id=drill_id,
            storage_key=storage_key,
            original_filename=original_filename,
            media_type=media_type,
            mime_type=mime_type,
            file_size_bytes=file_size_bytes,
            validation_status=validation_status,
            validation_error=validation_error,
            duration_seconds=duration_seconds,
            width=width,
            height=height,
            is_cover=is_cover,
            provenance=provenance,
            usage_rights_status=usage_rights_status,
            license_details=license_details
        )
        db.add(media)
        await db.flush()

        if is_cover:
            drill.cover_media_id = media.id

        # Substantive change trigger: if published, unpublish and require re-review
        drill.content_version += 1
        if drill.status in ["APPROVED", "PUBLISHED"]:
            drill.status = "PENDING_REVIEW"
            drill.approved_version = None
            drill.published_at = None

        await db.commit()
        await db.refresh(media)
        return media

    @staticmethod
    async def set_drill_cover(
        db: AsyncSession,
        drill_id: str,
        media_id: str
    ) -> Drill:
        """
        Sets drill cover image with strict validation:
        1. Media belongs to same drill
        2. Media type is appropriate (IMAGE, DIAGRAM, VIDEO)
        3. Media validation_status is valid
        """
        stmt = select(Drill).where(Drill.id == drill_id)
        res = await db.execute(stmt)
        drill = res.scalar_one_or_none()
        if not drill:
            raise HTTPException(status_code=404, detail="تمرین یافت نشد.")

        m_stmt = select(DrillMedia).where(DrillMedia.id == media_id)
        m_res = await db.execute(m_stmt)
        media = m_res.scalar_one_or_none()
        if not media or media.drill_id != drill_id:
            raise HTTPException(status_code=400, detail="رسانه انتخابی متعلق به این تمرین نیست.")

        if media.media_type not in ["IMAGE", "DIAGRAM", "VIDEO"]:
            raise HTTPException(status_code=400, detail="نوع رسانه برای تنظیم به عنوان تصویر جلد نامعتبر است.")

        if media.validation_status not in ["VALID", "VALIDATED"]:
            raise HTTPException(status_code=400, detail="رسانه انتخابی هنوز اعتبارسنجی نشده یا نامعتبر است.")

        drill.cover_media_id = media.id
        from sqlalchemy import update
        await db.execute(update(DrillMedia).where(DrillMedia.drill_id == drill_id).values(is_cover=False))
        media.is_cover = True
        await db.commit()
        await db.refresh(drill)
        return drill

    # -------------------------------------------------------------
    # 4. Activity & Idempotency
    # -------------------------------------------------------------

    @staticmethod
    async def set_bookmark(
        db: AsyncSession,
        user_id: str,
        drill_id: str,
        bookmarked: bool
    ) -> UserDrillActivity:
        """Idempotent bookmark toggle."""
        # Ensure drill exists
        drill_stmt = select(Drill).where(Drill.id == drill_id)
        drill_res = await db.execute(drill_stmt)
        if not drill_res.scalar_one_or_none():
            raise HTTPException(status_code=404, detail="تمرین یافت نشد.")

        stmt = select(UserDrillActivity).where(
            and_(UserDrillActivity.user_id == user_id, UserDrillActivity.drill_id == drill_id)
        )
        res = await db.execute(stmt)
        act = res.scalar_one_or_none()

        if not act:
            act = UserDrillActivity(
                user_id=user_id,
                drill_id=drill_id,
                is_bookmarked=bookmarked,
                bookmarked_at=utc_now() if bookmarked else None
            )
            db.add(act)
        else:
            act.is_bookmarked = bookmarked
            act.bookmarked_at = utc_now() if bookmarked else None

        await db.commit()
        await db.refresh(act)
        return act

    @staticmethod
    async def record_completion_event(
        db: AsyncSession,
        user_id: str,
        drill_id: str,
        idempotency_key: str,
        client_timestamp: Optional[datetime] = None
    ) -> Tuple[DrillCompletionEvent, str, int]:
        """
        Records drill completion idempotently.
        Guarantees:
        - If idempotency_key was already used for this user & same drill: returns existing event (ALREADY_RECORDED)
        - If idempotency_key was used for this user & different drill: raises 409 Conflict!
        - If new: creates event, increments completion_count, returns (event, 'CREATED', count)
        """
        # 1. Check existing idempotency key
        stmt = select(DrillCompletionEvent).where(
            and_(DrillCompletionEvent.user_id == user_id, DrillCompletionEvent.idempotency_key == idempotency_key)
        )
        res = await db.execute(stmt)
        existing_event = res.scalar_one_or_none()

        if existing_event:
            if existing_event.drill_id != drill_id:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="کلید یکتایی (Idempotency Key) پیش از این برای تمرین دیگری به کار رفته است."
                )

            # Get current count
            act_stmt = select(UserDrillActivity).where(
                and_(UserDrillActivity.user_id == user_id, UserDrillActivity.drill_id == drill_id)
            )
            act_res = await db.execute(act_stmt)
            act = act_res.scalar_one_or_none()
            count = act.completion_count if act else 1
            return existing_event, "ALREADY_RECORDED", count

        # 2. Ensure drill exists
        drill_stmt = select(Drill).where(Drill.id == drill_id)
        drill_res = await db.execute(drill_stmt)
        if not drill_res.scalar_one_or_none():
            raise HTTPException(status_code=404, detail="تمرین یافت نشد.")

        # 3. Create completion event
        event = DrillCompletionEvent(
            user_id=user_id,
            drill_id=drill_id,
            idempotency_key=idempotency_key,
            client_timestamp=client_timestamp,
            server_timestamp=utc_now()
        )
        db.add(event)

        # 4. Upsert UserDrillActivity
        act_stmt = select(UserDrillActivity).where(
            and_(UserDrillActivity.user_id == user_id, UserDrillActivity.drill_id == drill_id)
        )
        act_res = await db.execute(act_stmt)
        act = act_res.scalar_one_or_none()

        if not act:
            act = UserDrillActivity(
                user_id=user_id,
                drill_id=drill_id,
                is_bookmarked=False,
                completion_count=1,
                last_completed_at=utc_now()
            )
            db.add(act)
        else:
            act.completion_count += 1
            act.last_completed_at = utc_now()

        await db.commit()
        await db.refresh(event)
        return event, "CREATED", act.completion_count
