import os
import uuid
import pytest
from datetime import datetime, timedelta
from httpx import AsyncClient, ASGITransport
from starlette.requests import Request
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.app.main import app
from backend.app.models.base import get_db_session
from backend.app.models.user import User
from backend.app.models.drill import Drill, DrillMedia, UserDrillActivity, DrillCompletionEvent
from backend.app.core.security import create_access_token
from backend.app.services.drill_service import DrillService
from backend.app.services.drill_media_service import DrillMediaService
from backend.app.schemas.drill import DrillCreateIn, DrillUpdateIn, DrillReviewIn, DrillStep, CommonMistake


@pytest.fixture
def auth_tokens(db_session: AsyncSession):
    # User 1 (Player A)
    user_a = User(id="usr-player-a", phone_number="09129990001", full_name="بازیکن اول", role="PLAYER")
    # User 2 (Player B)
    user_b = User(id="usr-player-b", phone_number="09129990002", full_name="بازیکن دوم", role="PLAYER")
    # Author Admin (Coach / Content Creator)
    author_admin = User(id="adm-author-1", phone_number="09129990003", full_name="مربی نویسنده", role="ADMIN")
    # Reviewer Admin (Senior Coach / Supervisor)
    reviewer_admin = User(id="adm-reviewer-1", phone_number="09129990004", full_name="ناظر ارشد", role="ADMIN")

    db_session.add_all([user_a, user_b, author_admin, reviewer_admin])

    token_a = create_access_token(subject=user_a.id, role="PLAYER")
    token_b = create_access_token(subject=user_b.id, role="PLAYER")
    token_author = create_access_token(subject=author_admin.id, role="CONTENT_EDITOR")
    token_reviewer = create_access_token(subject=reviewer_admin.id, role="SUPER_ADMIN")

    return {
        "user_a": user_a,
        "user_b": user_b,
        "token_a": token_a,
        "token_b": token_b,
        "token_author": token_author,
        "token_reviewer": token_reviewer,
        "author_id": author_admin.id,
        "reviewer_id": reviewer_admin.id
    }


@pytest.mark.asyncio
async def test_public_api_only_returns_published_drills(db_session: AsyncSession, auth_tokens):
    """
    سناریو ۱: تمرین‌های پیش‌نویس، تأییدشده ولی منتشرنشده، و بایگانی‌شده
    نباید از API عمومی قابل دریافت باشند و باید ۴۰۴ بدهند.
    """
    async def override_db():
        yield db_session

    app.dependency_overrides[get_db_session] = override_db

    # Create 4 drills in different lifecycle statuses
    d_draft = Drill(
        id=str(uuid.uuid4()), slug="draft-drill", sport="PADEL", category="TECHNIQUE",
        level="BEGINNER", title="تمرین پیش‌نویس", summary="خلاصه پیش‌نویس", objective="هدف",
        duration_minutes=15, status="DRAFT", content_version=1
    )
    d_pending = Drill(
        id=str(uuid.uuid4()), slug="pending-drill", sport="PADEL", category="TACTICS",
        level="INTERMEDIATE", title="تمرین در انتظار", summary="خلاصه انتظار", objective="هدف",
        duration_minutes=20, status="PENDING_REVIEW", content_version=1
    )
    d_approved = Drill(
        id=str(uuid.uuid4()), slug="approved-drill", sport="TENNIS", category="PHYSICAL_FITNESS",
        level="ADVANCED", title="تمرین تاییدشده", summary="خلاصه تایید", objective="هدف",
        duration_minutes=25, status="APPROVED", approved_version=1, content_version=1
    )
    d_archived = Drill(
        id=str(uuid.uuid4()), slug="archived-drill", sport="PADEL", category="MENTAL_SKILLS",
        level="PRO", title="تمرین بایگانی", summary="خلاصه بایگانی", objective="هدف",
        duration_minutes=30, status="ARCHIVED", content_version=1
    )
    d_published = Drill(
        id=str(uuid.uuid4()), slug="published-drill", sport="PADEL", category="TECHNIQUE",
        level="INTERMEDIATE", title="تمرین منتشرشده رسمی", summary="خلاصه منتشرشده", objective="هدف رسمی",
        duration_minutes=15, status="PUBLISHED", content_version=1, approved_version=1,
        published_at=datetime.utcnow()
    )

    db_session.add_all([d_draft, d_pending, d_approved, d_archived, d_published])
    await db_session.commit()

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # 1. List endpoint: only published drill must appear
        res_list = await ac.get("/api/v1/drills")
        assert res_list.status_code == 200
        data = res_list.json()
        assert data["total"] == 1
        assert len(data["items"]) == 1
        assert data["items"][0]["slug"] == "published-drill"

        # 2. Detail endpoint: published drill gives 200
        res_pub = await ac.get("/api/v1/drills/published-drill")
        assert res_pub.status_code == 200
        assert res_pub.json()["title"] == "تمرین منتشرشده رسمی"

        # 3. Detail endpoint: draft, pending, approved, archived return strict 404
        for slug in ["draft-drill", "pending-drill", "approved-drill", "archived-drill", "non-existent"]:
            res_hidden = await ac.get(f"/api/v1/drills/{slug}")
            assert res_hidden.status_code == 404

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_private_media_not_accessible_to_guest_or_unpublished(db_session: AsyncSession, auth_tokens):
    """
    سناریو ۲: لینک رسانه اختصاصی تمرین غیرمنتشر در دسترس مهمان نیست.
    """
    async def override_db():
        yield db_session
    app.dependency_overrides[get_db_session] = override_db

    drill = Drill(
        id=str(uuid.uuid4()), slug="private-media-drill", sport="PADEL", category="TECHNIQUE",
        level="BEGINNER", title="تمرین خصوصی", summary="خلاصه", objective="هدف",
        duration_minutes=15, status="DRAFT", content_version=1
    )
    db_session.add(drill)
    await db_session.flush()

    media = DrillMedia(
        id=str(uuid.uuid4()), drill_id=drill.id, storage_key="test_private.jpg",
        original_filename="test.jpg", media_type="IMAGE", mime_type="image/jpeg",
        file_size_bytes=1024, validation_status="VALID"
    )
    db_session.add(media)
    await db_session.commit()

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        res = await ac.get(f"/api/v1/drills/{drill.slug}/media/{media.id}")
        # Must be 404 because drill is not published!
        assert res.status_code == 404

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_unpublishing_revokes_public_media_access(db_session: AsyncSession, auth_tokens):
    """
    سناریو ۳: لغو انتشار، دسترسی عمومی به رسانه را قطع می‌کند.
    """
    async def override_db():
        yield db_session
    app.dependency_overrides[get_db_session] = override_db

    # Create dummy physical file
    storage_dir = DrillMediaService.get_storage_path()
    dummy_key = f"pub_test_{uuid.uuid4().hex[:8]}.jpg"
    file_path = os.path.join(storage_dir, dummy_key)
    with open(file_path, "wb") as f:
        f.write(b"\xff\xd8\xff\xe0" + b"\x00" * 100)

    try:
        drill = Drill(
            id=str(uuid.uuid4()), slug="toggle-pub-drill", sport="PADEL", category="TECHNIQUE",
            level="BEGINNER", title="تمرین تست انتشار", summary="خلاصه", objective="هدف",
            duration_minutes=15, status="PUBLISHED", content_version=1, approved_version=1,
            published_at=datetime.utcnow()
        )
        db_session.add(drill)
        await db_session.flush()

        media = DrillMedia(
            id=str(uuid.uuid4()), drill_id=drill.id, storage_key=dummy_key,
            original_filename="cover.jpg", media_type="IMAGE", mime_type="image/jpeg",
            file_size_bytes=104, validation_status="VALID", is_cover=True,
            provenance="REAL_RECORDING", usage_rights_status="OWNED"
        )
        db_session.add(media)
        await db_session.commit()

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            # When published -> 200 OK
            res_pub = await ac.get(f"/api/v1/drills/{drill.slug}/media/{media.id}")
            assert res_pub.status_code == 200

            # Unpublish (archive)
            await DrillService.archive_drill(db_session, drill.id)

            # When archived -> 404 Not Found!
            res_arch = await ac.get(f"/api/v1/drills/{drill.slug}/media/{media.id}")
            assert res_arch.status_code == 404

    finally:
        if os.path.exists(file_path):
            os.remove(file_path)
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_publish_workflow_and_provenance_validation(db_session: AsyncSession, auth_tokens):
    """
    سناریو ۴: انتشار بدون تاییدیه، نسخه ناسازگار یا حقوق نامعتبر رد می‌شود.
    """
    # 1. Create a draft drill
    payload = DrillCreateIn(
        slug="bandeja-drill", sport="PADEL", category="TECHNIQUE", level="INTERMEDIATE",
        title="آموزش ضربه باندخا", summary="تمرین کنترل ضربه هوایی در انتهای کورت",
        objective="بهبود چرخه حرکت پا و بازگشت به تور", duration_minutes=20,
        equipment_required=["راکت پدل", "سبد توپ"],
        steps=[DrillStep(step_number=1, title="حرکت پا", instruction="سه گام مورب به سمت شیشه", reps_or_time="۱۰ تکرار")],
        common_mistakes=[CommonMistake(mistake="ایستادن روی پنجه بدون زاویه", correction="چرخش ۴۵ درجه شانه")],
        safety_precautions=["توجه به فاصله با شیشه پشتی"]
    )
    drill = await DrillService.create_drill(db_session, payload, auth_tokens["author_id"], "مربی نویسنده")

    # Publishing directly in DRAFT must fail
    with pytest.raises(Exception) as exc_info:
        await DrillService.publish_drill(db_session, drill.id, confirm_usage_rights=True)
    assert "APPROVED" in str(exc_info.value.detail)

    # Submit for review
    await DrillService.submit_for_review(db_session, drill.id)

    # Attach media with UNSPECIFIED provenance or UNAUTHORIZED rights
    media = DrillMedia(
        id=str(uuid.uuid4()), drill_id=drill.id, storage_key="fake_unauth.mp4",
        original_filename="clip.mp4", media_type="VIDEO", mime_type="video/mp4",
        file_size_bytes=5000, validation_status="VALID", provenance="UNSPECIFIED",
        usage_rights_status="UNAUTHORIZED"
    )
    db_session.add(media)
    await db_session.commit()

    # Reviewer approves
    await DrillService.review_drill(
        db_session, drill.id,
        DrillReviewIn(action="APPROVE", review_notes="تایید شد"),
        reviewer_id=auth_tokens["reviewer_id"], reviewer_name="ناظر ارشد"
    )

    # Publishing must fail due to UNAUTHORIZED usage rights
    with pytest.raises(Exception) as exc_unauth:
        await DrillService.publish_drill(db_session, drill.id, confirm_usage_rights=True)
    assert "UNAUTHORIZED" in str(exc_unauth.value.detail)

    # Fix rights but leave provenance UNSPECIFIED
    media.usage_rights_status = "OWNED"
    await db_session.commit()

    with pytest.raises(Exception) as exc_prov:
        await DrillService.publish_drill(db_session, drill.id, confirm_usage_rights=True)
    assert "UNSPECIFIED" in str(exc_prov.value.detail)

    # Fix provenance to REAL_RECORDING
    media.provenance = "REAL_RECORDING"
    await db_session.commit()

    # Publishing without confirm_usage_rights fails
    with pytest.raises(Exception) as exc_conf:
        await DrillService.publish_drill(db_session, drill.id, confirm_usage_rights=False)
    assert "تأییدیه صریح" in str(exc_conf.value.detail)

    # Successful publish
    pub_drill = await DrillService.publish_drill(db_session, drill.id, confirm_usage_rights=True)
    assert pub_drill.status == "PUBLISHED"
    assert pub_drill.published_at is not None


@pytest.mark.asyncio
async def test_author_cannot_review_own_drill_and_rbac(db_session: AsyncSession, auth_tokens):
    """
    سناریو ۵ و ۱۲: تفکیک وظایف و عدم امکان بازبینی توسط خود نویسنده.
    """
    drill = Drill(
        id=str(uuid.uuid4()), slug="rbac-drill", sport="PADEL", category="TECHNIQUE",
        level="BEGINNER", title="تمرین RBAC", summary="خلاصه", objective="هدف",
        duration_minutes=15, status="PENDING_REVIEW", content_version=1,
        author_id=auth_tokens["author_id"], author_name="مربی نویسنده",
        steps=[{"step_number": 1, "title": "گام ۱", "instruction": "دستور گام"}]
    )
    db_session.add(drill)
    await db_session.commit()

    # Author tries to approve their own drill -> 403 Forbidden!
    with pytest.raises(Exception) as exc:
        await DrillService.review_drill(
            db_session, drill.id,
            DrillReviewIn(action="APPROVE", review_notes="خودم تایید می‌کنم"),
            reviewer_id=auth_tokens["author_id"],
            reviewer_name="مربی نویسنده"
        )
    assert "تفکیک وظایف" in str(exc.value.detail)

    # Independent reviewer approves -> OK
    approved = await DrillService.review_drill(
        db_session, drill.id,
        DrillReviewIn(action="APPROVE", review_notes="تایید توسط ناظر"),
        reviewer_id=auth_tokens["reviewer_id"],
        reviewer_name="ناظر ارشد"
    )
    assert approved.status == "APPROVED"
    assert approved.approved_version == 1


@pytest.mark.asyncio
async def test_optimistic_concurrency_conflict(db_session: AsyncSession, auth_tokens):
    """
    سناریو ۶: ویرایش همزمان یا ارسال نسخه قدیمی Conflict (409) می‌دهد.
    """
    drill = Drill(
        id=str(uuid.uuid4()), slug="concurrency-drill", sport="PADEL", category="TECHNIQUE",
        level="BEGINNER", title="عنوان نسخه ۱", summary="خلاصه", objective="هدف",
        duration_minutes=15, status="DRAFT", content_version=2
    )
    db_session.add(drill)
    await db_session.commit()

    # Client expects version 1, but DB is at version 2 -> 409 Conflict
    with pytest.raises(Exception) as exc:
        await DrillService.update_drill(
            db_session, drill.id,
            DrillUpdateIn(expected_version=1, title="ویرایش با نسخه منقضی")
        )
    assert exc.value.status_code == 409


@pytest.mark.asyncio
async def test_media_validation_magic_bytes_and_path_traversal():
    """
    سناریو ۷: اعتبارسنجی هدر جادویی، فایل‌های مخرب، و جلوگیری از Path Traversal.
    """
    # 1. Valid JPEG
    mime, mtype = DrillMediaService.inspect_and_validate_header(b"\xff\xd8\xff\xe0" + b"\x00" * 20, "photo.jpg")
    assert mime == "image/jpeg"
    assert mtype == "IMAGE"

    # 2. Valid PNG
    mime_png, mtype_png = DrillMediaService.inspect_and_validate_header(b"\x89PNG\r\n\x1a\n" + b"\x00" * 20, "photo.png")
    assert mime_png == "image/png"
    assert mtype_png == "IMAGE"

    # 3. Valid WebP
    webp_bytes = b"RIFF\x00\x00\x00\x00WEBPVP8 " + b"\x00" * 10
    mime_webp, _ = DrillMediaService.inspect_and_validate_header(webp_bytes, "photo.webp")
    assert mime_webp == "image/webp"

    # 4. Valid MP4 (ftyp isom)
    mp4_bytes = b"\x00\x00\x00\x18ftypisom\x00\x00\x02\x00mp41" + b"\x00" * 10
    mime_mp4, mtype_mp4 = DrillMediaService.inspect_and_validate_header(mp4_bytes, "video.mp4")
    assert mime_mp4 == "video/mp4"
    assert mtype_mp4 == "VIDEO"

    # 5. Invalid / Dangerous binary (e.g. Windows EXE / Shell script)
    with pytest.raises(Exception):
        DrillMediaService.inspect_and_validate_header(b"MZ\x90\x00\x03\x00\x00\x00\x04\x00\x00\x00", "virus.exe")

    # 6. File too short
    with pytest.raises(Exception):
        DrillMediaService.inspect_and_validate_header(b"short", "test.mp4")


@pytest.mark.asyncio
async def test_combined_filters_duration_and_pagination(db_session: AsyncSession):
    """
    سناریو ۸: فیلترهای ترکیبی ورزش، دسته، سطح و بازه‌های دقیق مدت زمان (<15, 15-30, >30).
    """
    # Create 3 published drills with exact duration boundaries
    d1 = Drill(
        id=str(uuid.uuid4()), slug="d-10min", sport="PADEL", category="TECHNIQUE",
        level="BEGINNER", title="تمرین ۱۰ دقیقه‌ای", summary="سریع", objective="هدف",
        duration_minutes=10, status="PUBLISHED", content_version=1, published_at=datetime.utcnow()
    )
    d2 = Drill(
        id=str(uuid.uuid4()), slug="d-25min", sport="PADEL", category="TECHNIQUE",
        level="INTERMEDIATE", title="تمرین ۲۵ دقیقه‌ای", summary="متوسط", objective="هدف",
        duration_minutes=25, status="PUBLISHED", content_version=1, published_at=datetime.utcnow()
    )
    d3 = Drill(
        id=str(uuid.uuid4()), slug="d-45min", sport="TENNIS", category="PHYSICAL_FITNESS",
        level="ADVANCED", title="تمرین ۴۵ دقیقه‌ای", summary="طولانی", objective="هدف",
        duration_minutes=45, status="PUBLISHED", content_version=1, published_at=datetime.utcnow()
    )
    db_session.add_all([d1, d2, d3])
    await db_session.commit()

    from backend.app.schemas.drill import DurationBracket, SportType

    # Filter <15 min
    items_sub15, count1 = await DrillService.list_public_drills(db_session, duration_bracket=DurationBracket.UNDER_15)
    assert count1 == 1
    assert items_sub15[0]["slug"] == "d-10min"

    # Filter 15-30 min
    items_15_30, count2 = await DrillService.list_public_drills(db_session, duration_bracket=DurationBracket.BETWEEN_15_AND_30)
    assert count2 == 1
    assert items_15_30[0]["slug"] == "d-25min"

    # Filter >30 min
    items_over30, count3 = await DrillService.list_public_drills(db_session, duration_bracket=DurationBracket.OVER_30)
    assert count3 == 1
    assert items_over30[0]["slug"] == "d-45min"

    # Filter Sport PADEL
    padel_items, padel_count = await DrillService.list_public_drills(db_session, sport=SportType.PADEL)
    assert padel_count == 2


@pytest.mark.asyncio
async def test_idempotent_bookmark(db_session: AsyncSession, auth_tokens):
    """
    سناریو ۹: بوک‌مارک تکراری نتیجه کاملاً یکسان دارد (Idempotent).
    """
    drill = Drill(
        id=str(uuid.uuid4()), slug="bookmark-test", sport="PADEL", category="TECHNIQUE",
        level="BEGINNER", title="تمرین بوک‌مارک", summary="خلاصه", objective="هدف",
        duration_minutes=15, status="PUBLISHED", content_version=1, published_at=datetime.utcnow()
    )
    db_session.add(drill)
    await db_session.commit()

    user_id = auth_tokens["user_a"].id

    # 1. Bookmark True
    act1 = await DrillService.set_bookmark(db_session, user_id, drill.id, True)
    assert act1.is_bookmarked is True

    # 2. Bookmark True again (Idempotent)
    act2 = await DrillService.set_bookmark(db_session, user_id, drill.id, True)
    assert act2.id == act1.id
    assert act2.is_bookmarked is True

    # Verify in DB: exactly 1 record
    stmt = select(UserDrillActivity).where(UserDrillActivity.user_id == user_id, UserDrillActivity.drill_id == drill.id)
    records = (await db_session.execute(stmt)).scalars().all()
    assert len(records) == 1

    # 3. Bookmark False
    act3 = await DrillService.set_bookmark(db_session, user_id, drill.id, False)
    assert act3.is_bookmarked is False


@pytest.mark.asyncio
async def test_idempotent_completion_events(db_session: AsyncSession, auth_tokens):
    """
    سناریو ۱۰ و ۱۱:
    - ثبت تکراری یک رویداد با idempotency_key یکسان، فقط یک‌بار شمرده می‌شود.
    - ثبت رویداد با همان کلید اما برای تمرین دیگر، Conflict (409) می‌دهد.
    - ثبت دو رویداد مستقل با کلیدهای متفاوت، دقیقاً ۲ بار شمرده می‌شود.
    """
    drill_a = Drill(
        id=str(uuid.uuid4()), slug="comp-drill-a", sport="PADEL", category="TECHNIQUE",
        level="BEGINNER", title="تمرین A", summary="خلاصه", objective="هدف",
        duration_minutes=15, status="PUBLISHED", content_version=1
    )
    drill_b = Drill(
        id=str(uuid.uuid4()), slug="comp-drill-b", sport="PADEL", category="TECHNIQUE",
        level="BEGINNER", title="تمرین B", summary="خلاصه", objective="هدف",
        duration_minutes=15, status="PUBLISHED", content_version=1
    )
    db_session.add_all([drill_a, drill_b])
    await db_session.commit()

    user_id = auth_tokens["user_a"].id
    idempotency_key = "idemp-key-unique-001"

    # Event 1: First attempt -> CREATED, count = 1
    evt1, status1, count1 = await DrillService.record_completion_event(
        db_session, user_id, drill_a.id, idempotency_key
    )
    assert status1 == "CREATED"
    assert count1 == 1

    # Event 1 Retry: Same user, same drill, same key -> ALREADY_RECORDED, count remains 1!
    evt2, status2, count2 = await DrillService.record_completion_event(
        db_session, user_id, drill_a.id, idempotency_key
    )
    assert status2 == "ALREADY_RECORDED"
    assert count2 == 1
    assert evt2.id == evt1.id

    # Event Reuse on DIFFERENT drill -> 409 Conflict!
    with pytest.raises(Exception) as exc:
        await DrillService.record_completion_event(
            db_session, user_id, drill_b.id, idempotency_key
        )
    assert exc.value.status_code == 409

    # Event 2: New independent key -> CREATED, count becomes 2
    evt3, status3, count3 = await DrillService.record_completion_event(
        db_session, user_id, drill_a.id, "idemp-key-unique-002"
    )
    assert status3 == "CREATED"
    assert count3 == 2


@pytest.mark.asyncio
async def test_media_range_requests_and_missing_file():
    """
    سناریو ۱۳: پشتیبانی از HTTP Range Requests (206 Partial Content) و خطای فایل ناموجود (404).
    """
    storage_dir = DrillMediaService.get_storage_path()
    dummy_key = f"range_test_{uuid.uuid4().hex[:8]}.mp4"
    file_path = os.path.join(storage_dir, dummy_key)

    # Write 1000 dummy bytes
    file_content = b"0123456789" * 100
    with open(file_path, "wb") as f:
        f.write(file_content)

    try:
        # 1. Full request (no Range) -> 200 OK
        req_full = Request({"type": "http", "headers": []})
        resp_full = DrillMediaService.stream_media(req_full, dummy_key, "video/mp4")
        assert resp_full.status_code == 200
        assert resp_full.headers["Content-Length"] == "1000"
        assert resp_full.headers["Accept-Ranges"] == "bytes"

        # 2. Range request: bytes=0-9 -> 206 Partial Content
        req_range = Request({"type": "http", "headers": [(b"range", b"bytes=0-9")]})
        resp_range = DrillMediaService.stream_media(req_range, dummy_key, "video/mp4")
        assert resp_range.status_code == 206
        assert resp_range.headers["Content-Length"] == "10"
        assert resp_range.headers["Content-Range"] == "bytes 0-9/1000"

        # 3. Missing file -> 404 Not Found
        with pytest.raises(Exception) as exc_missing:
            DrillMediaService.stream_media(req_full, "non_existent_file.mp4", "video/mp4")
        assert exc_missing.value.status_code == 404

    finally:
        if os.path.exists(file_path):
            os.remove(file_path)


@pytest.mark.asyncio
async def test_sql_migration_script_syntax_and_tables():
    """
    سناریو ۱۴: بررسی انطباق و یکپارچگی فایل اسکریپت مایگریشن scripts/migration_add_drills_module.sql.
    """
    migration_path = os.path.join("scripts", "migration_add_drills_module.sql")
    assert os.path.exists(migration_path)

    with open(migration_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Verify presence of all 4 tables, transaction blocks, and no DROP in forward migration
    assert "CREATE TABLE IF NOT EXISTS drills" in content
    assert "CREATE TABLE IF NOT EXISTS drill_media" in content
    assert "CREATE TABLE IF NOT EXISTS user_drill_activities" in content
    assert "CREATE TABLE IF NOT EXISTS drill_completion_events" in content
    assert "uq_user_drill_activity" in content
    assert "uq_user_drill_idempotency" in content
    assert "DROP TABLE" not in content

    # Verify dedicated rollback script
    rollback_path = os.path.join("scripts", "migration_add_drills_module_rollback.sql")
    assert os.path.exists(rollback_path)
    with open(rollback_path, "r", encoding="utf-8") as rf:
        rb_content = rf.read()
    assert "DROP TABLE IF EXISTS drills" in rb_content
    assert "DROP TABLE IF EXISTS drill_media" in rb_content


@pytest.mark.asyncio
async def test_subsequent_editor_cannot_self_approve(db_session: AsyncSession, auth_tokens):
    """
    آزمون تکمیلی: ممانعت از تایید نسخه توسط ویرایشگر موثر (نه فقط نویسنده اولیه).
    اگر کاربر B تمرین ایجادشده توسط کاربر A را ویرایش کند، کاربر B نمی‌تواند همان نسخه را تایید کند.
    """
    payload = DrillCreateIn(
        slug="editor-check-drill", sport="PADEL", category="TACTICS", level="ADVANCED",
        title="تمرین تاکتیک تیمی", summary="شرح تاکتیک تیمی پیشرفته",
        objective="بهبود پوشش فضای خالی بین دو بازیکن", duration_minutes=30,
        steps=[DrillStep(step_number=1, title="حرکت همزمان", instruction="حرکت زوجی در عرض کورت", reps_or_time="۱۰ دقیقه")]
    )
    drill = await DrillService.create_drill(db_session, payload, author_id=auth_tokens["author_id"], author_name="مربی نویسنده")

    # User B (editor_id) updates the drill
    editor_b_id = "user-editor-b-id"
    await DrillService.update_drill(
        db_session, drill.id,
        DrillUpdateIn(expected_version=1, title="ویرایش شده توسط کاربر B"),
        editor_id=editor_b_id,
        editor_name="ویرایشگر دوم"
    )

    # Submit for review
    await DrillService.submit_for_review(db_session, drill.id)

    # User B attempts to approve their own modified version -> Must be blocked with 403!
    with pytest.raises(Exception) as exc:
        await DrillService.review_drill(
            db_session, drill.id,
            DrillReviewIn(action="APPROVE", review_notes="تایید خودم"),
            reviewer_id=editor_b_id,
            reviewer_name="ویرایشگر دوم"
        )
    assert exc.value.status_code == 403
    assert "تفکیک وظایف" in str(exc.value.detail)

    # An independent reviewer C approves -> Must succeed!
    independent_reviewer_id = "user-reviewer-c-id"
    approved_drill = await DrillService.review_drill(
        db_session, drill.id,
        DrillReviewIn(action="APPROVE", review_notes="تایید مستقل"),
        reviewer_id=independent_reviewer_id,
        reviewer_name="ناظر مستقل C"
    )
    assert approved_drill.status == "APPROVED"
    assert approved_drill.reviewer_id == independent_reviewer_id


@pytest.mark.asyncio
async def test_ephemeral_preview_token_generation_and_validation():
    """
    آزمون تکمیلی: تولید و اعتبارسنجی توکن امضاشده موقت (Ephemeral Preview Token).
    بدون افشای JWT اصلی در URL و با انقضای زمان‌مند.
    """
    dummy_media_id = "media-test-123"
    dummy_drill_id = "drill-test-456"
    dummy_user_id = "admin-test-789"

    # Generate token valid for 5 seconds
    token, expires_at = DrillMediaService.generate_ephemeral_preview_token(
        media_id=dummy_media_id,
        drill_id=dummy_drill_id,
        user_id=dummy_user_id,
        purpose="preview",
        valid_seconds=5
    )
    assert token is not None
    assert expires_at is not None

    # Valid check: returns (True, dummy_user_id)
    is_valid, user_id = DrillMediaService.verify_ephemeral_preview_token(token, dummy_media_id, dummy_drill_id)
    assert is_valid is True
    assert user_id == dummy_user_id

    # Tampered media_id check
    assert DrillMediaService.verify_ephemeral_preview_token(token, "other-media-id", dummy_drill_id)[0] is False

    # Tampered drill_id check
    assert DrillMediaService.verify_ephemeral_preview_token(token, dummy_media_id, "other-drill-id")[0] is False

    # Tampered signature check
    tampered_token = token[:-4] + "ffff"
    assert DrillMediaService.verify_ephemeral_preview_token(tampered_token, dummy_media_id, dummy_drill_id)[0] is False


@pytest.mark.asyncio
async def test_set_cover_and_is_cover_single_source_of_truth(db_session: AsyncSession, auth_tokens):
    """
    آزمون تکمیلی: cover_media_id مرجع واحد جلد است و is_cover صرفاً بر اساس آن است.
    """
    payload = DrillCreateIn(
        slug="cover-single-source", sport="PADEL", category="TECHNIQUE", level="BEGINNER",
        title="تمرین تست کاور", summary="بررسی منبع واحد کاور",
        objective="تضمین عدم تناقض فیلدهای جلد", duration_minutes=15,
        steps=[DrillStep(step_number=1, title="شروع", instruction="دستورالعمل", reps_or_time="۵ بار")]
    )
    drill = await DrillService.create_drill(db_session, payload, author_id=auth_tokens["author_id"], author_name="مربی")

    # Attach Media 1 (image)
    m1 = DrillMedia(
        id=str(uuid.uuid4()), drill_id=drill.id, storage_key="key1.jpg",
        original_filename="img1.jpg", media_type="IMAGE", mime_type="image/jpeg",
        file_size_bytes=1000, validation_status="VALIDATED", is_cover=False,
        provenance="REAL_RECORDING", usage_rights_status="OWNED"
    )
    # Attach Media 2 (image)
    m2 = DrillMedia(
        id=str(uuid.uuid4()), drill_id=drill.id, storage_key="key2.jpg",
        original_filename="img2.jpg", media_type="IMAGE", mime_type="image/jpeg",
        file_size_bytes=2000, validation_status="VALIDATED", is_cover=False,
        provenance="REAL_RECORDING", usage_rights_status="OWNED"
    )
    db_session.add_all([m1, m2])
    await db_session.commit()

    # Set media 2 as cover
    updated_drill = await DrillService.set_drill_cover(db_session, drill.id, m2.id)
    assert updated_drill.cover_media_id == m2.id

    # Verify is_cover computation
    from backend.app.api.v1.drills import format_drill_admin_out
    # Re-fetch media
    res = await db_session.execute(select(DrillMedia).where(DrillMedia.drill_id == drill.id).order_by(DrillMedia.created_at))
    updated_drill.media_items = list(res.scalars().all())
    formatted = format_drill_admin_out(updated_drill)

    m1_out = next(m for m in formatted.media_items if m.id == m1.id)
    m2_out = next(m for m in formatted.media_items if m.id == m2.id)
    assert m1_out.is_cover is False
    assert m2_out.is_cover is True


@pytest.mark.asyncio
async def test_reviewer_independence_multi_contributor_chain(db_session: AsyncSession):
    """
    آزمون فاز ۴: تضمین استقلال بازبین در زنجیره چند ویرایشگر.
    سناریو: فرد A محتوا را می‌سازد، سپس B آن را ویرایش می‌کند، سپس C ویرایش می‌کند.
    هیچ‌یک از افراد A، B یا C نباید بتوانند نسخه را تایید کنند؛ منحصراً بازبین مستقل D مجاز است.
    """
    admin_a = "admin-a-creator"
    admin_b = "admin-b-editor"
    admin_c = "admin-c-editor"
    reviewer_d = "reviewer-d-independent"

    payload = DrillCreateIn(
        slug="chain-reviewer-independence", sport="PADEL", category="TECHNIQUE", level="INTERMEDIATE",
        title="تمرین زنجیره ویرایش", summary="بررسی استقلال کامل بازبین",
        objective="تضمین عدم خودبازبینی حتی پس از دست به دست شدن ویرایش", duration_minutes=20,
        steps=[DrillStep(step_number=1, title="گام ۱", instruction="دستور گام", reps_or_time="۱۰ بار")]
    )
    drill = await DrillService.create_drill(db_session, payload, author_id=admin_a, author_name="مدیر A")
    assert admin_a in drill.version_contributors

    # B edits drill
    await DrillService.update_drill(
        db_session, drill.id,
        DrillUpdateIn(expected_version=1, title="عنوان اصلاح‌شده توسط B"),
        editor_id=admin_b, editor_name="مدیر B"
    )
    assert admin_b in drill.version_contributors

    # C edits drill
    await DrillService.update_drill(
        db_session, drill.id,
        DrillUpdateIn(expected_version=2, title="عنوان اصلاح‌شده توسط C"),
        editor_id=admin_c, editor_name="مدیر C"
    )
    assert admin_c in drill.version_contributors

    # Submit for review
    await DrillService.submit_for_review(db_session, drill.id)

    # 1. Admin A attempts to review -> 403 Forbidden
    with pytest.raises(HTTPException) as exc_a:
        await DrillService.review_drill(
            db_session, drill.id, DrillReviewIn(action="APPROVE"), reviewer_id=admin_a, reviewer_name="مدیر A"
        )
    assert exc_a.value.status_code == 403

    # 2. Admin B attempts to review -> 403 Forbidden
    with pytest.raises(HTTPException) as exc_b:
        await DrillService.review_drill(
            db_session, drill.id, DrillReviewIn(action="APPROVE"), reviewer_id=admin_b, reviewer_name="مدیر B"
        )
    assert exc_b.value.status_code == 403

    # 3. Admin C attempts to review -> 403 Forbidden
    with pytest.raises(HTTPException) as exc_c:
        await DrillService.review_drill(
            db_session, drill.id, DrillReviewIn(action="APPROVE"), reviewer_id=admin_c, reviewer_name="مدیر C"
        )
    assert exc_c.value.status_code == 403

    # 4. Independent Reviewer D reviews and approves -> 200 OK
    approved = await DrillService.review_drill(
        db_session, drill.id, DrillReviewIn(action="APPROVE", review_notes="تایید تخصصی توسط بازبین مستقل"),
        reviewer_id=reviewer_d, reviewer_name="ناظر مستقل D"
    )
    assert approved.status == "APPROVED"
    assert approved.approved_version == 3
    assert approved.reviewer_id == reviewer_d
    # Version contributors reset for future revision cycle
    assert len(approved.version_contributors) == 0


@pytest.mark.asyncio
async def test_expert_review_checklist_validation(db_session: AsyncSession):
    """
    آزمون فاز ۴: اعتبارسنجی فرم چک‌لیست بازبینی تخصصی و ثبت متادیتا.
    عدم تایید تناسب ورزشی، وضوح حرکت یا هماهنگی رسانه مانع تایید نهایی می‌شود.
    """
    from backend.app.schemas.drill import DrillReviewChecklist

    payload = DrillCreateIn(
        slug="checklist-review-test", sport="PADEL", category="TACTICS", level="BEGINNER",
        title="تمرین چک‌لیست بازبینی", summary="بررسی شرایط بازبینی تخصصی",
        objective="تضمین ارزیابی حرکتی توسط کارشناس واقعی", duration_minutes=15,
        steps=[DrillStep(step_number=1, title="گام ۱", instruction="دستور", reps_or_time="۵ بار")]
    )
    drill = await DrillService.create_drill(db_session, payload, author_id="author-1", author_name="مربی ۱")
    await DrillService.submit_for_review(db_session, drill.id)

    # 1. Attempt APPROVE with suitability_approved=False -> 400 Bad Request
    invalid_checklist = DrillReviewChecklist(
        suitability_approved=False,
        movement_clarity_approved=True,
        media_sync_approved=True,
        pedagogical_notes="حرکت مناسب سطح مبتدی نیست"
    )
    with pytest.raises(HTTPException) as exc_suit:
        await DrillService.review_drill(
            db_session, drill.id,
            DrillReviewIn(action="APPROVE", checklist=invalid_checklist),
            reviewer_id="reviewer-ext", reviewer_name="بازبین کارشناس"
        )
    assert exc_suit.value.status_code == 400

    # 2. Attempt APPROVE with valid checklist -> 200 OK and audit trail in review_notes
    valid_checklist = DrillReviewChecklist(
        suitability_approved=True,
        movement_clarity_approved=True,
        media_sync_approved=True,
        pedagogical_notes="اجرا استاندارد است",
        safety_notes="توجه به فاصله مناسب از شیشه پشت کورت",
        verified_media_ids=["media-101"]
    )
    approved = await DrillService.review_drill(
        db_session, drill.id,
        DrillReviewIn(action="APPROVE", review_notes="مورد تایید کادر فنی", checklist=valid_checklist),
        reviewer_id="reviewer-ext", reviewer_name="بازبین کارشناس"
    )
    assert approved.status == "APPROVED"
    assert "چک‌لیست بازبینی تخصصی" in approved.review_notes
    assert "تناسب ورزشی: تایید" in approved.review_notes
    assert "فاصله مناسب از شیشه" in approved.review_notes


