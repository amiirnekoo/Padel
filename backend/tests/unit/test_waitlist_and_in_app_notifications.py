import pytest
from datetime import date, time
from sqlalchemy import select
from backend.app.models.user import User
from backend.app.models.slot import TimeSlot
from backend.app.models.waitlist import WaitlistEntry, InAppNotification
from backend.app.services.waitlist_service import WaitlistService
from backend.app.services.booking_service import BookingService

@pytest.mark.asyncio
async def test_waitlist_lifecycle_and_in_app_notification(db_session, seed_data):
    """
    اثبات چرخه کامل لیست انتظار پایدار درون‌پرتال بدون وابستگی به پیامک:
    ۱. ثبت‌نام کاربر در لیست انتظار برای سانس پر یا مسدود.
    ۲. جلوگیری از عضویت تکراری برای همان رویداد.
    ۳. خروج و لغو عضویت اختیاری از لیست انتظار.
    ۴. وقوع رویداد آزادسازی سانس (کنسلی یا رفع مسدودی).
    ۵. صدور اعلان پایدار در دیتابیس (InAppNotification) با شناسه اسلات و لینک مستقیم.
    ۶. تغییر وضعیت خوانده‌شده/خوانده‌نشده.
    ۷. ارزیابی زنده موجودی در هنگام کلیک روی اعلان (اعلان فاقد اولویت انحصاری یا تضمین هولد است).
    """
    court = seed_data["court"]
    user = seed_data["user"]
    test_date = date(2026, 10, 15)

    # ۱. عضویت در لیست انتظار
    entry = await WaitlistService.join_waitlist(
        db=db_session,
        user_id=user.id,
        court_id=court.id,
        slot_date=test_date,
        start_time=time(18, 0)
    )
    assert entry.id is not None
    assert entry.user_id == user.id
    assert entry.status == "ACTIVE"

    # ۲. جلوگیری از عضویت تکراری (همان رکورد فعال مجدداً بازمی‌گردد)
    duplicate_entry = await WaitlistService.join_waitlist(
        db=db_session,
        user_id=user.id,
        court_id=court.id,
        slot_date=test_date,
        start_time=time(18, 0)
    )
    assert duplicate_entry.id == entry.id

    # ۳. لغو عضویت اختیاری
    cancelled = await WaitlistService.leave_waitlist(
        db=db_session,
        user_id=user.id,
        court_id=court.id,
        slot_date=test_date,
        start_time=time(18, 0)
    )
    assert cancelled is True

    # بررسی وضعیت غیرفعال
    db_entry = await db_session.get(WaitlistEntry, entry.id)
    assert db_entry.status == "CANCELLED"

    # عضویت مجدد برای تست آزادسازی سانس
    re_entry = await WaitlistService.join_waitlist(
        db=db_session,
        user_id=user.id,
        court_id=court.id,
        slot_date=test_date,
        start_time=time(18, 0)
    )
    assert re_entry.status == "ACTIVE"

    # ۴. ایجاد یک سانس و سپس شبیه‌سازی آزادسازی آن
    slot = TimeSlot(
        id="slot-waitlist-test-1",
        court_id=court.id,
        slot_date=test_date,
        start_time=time(18, 0),
        end_time=time(19, 30),
        price=2400000,
        status="AVAILABLE"
    )
    db_session.add(slot)
    await db_session.commit()

    # تریگر آزادسازی سانس
    notified_count = await WaitlistService.trigger_slot_release_notifications(
        db=db_session,
        slot_id=slot.id
    )
    assert notified_count == 1

    # تریگر مجدد نباید اعلان تکراری صادر کند (Anti-duplicate)
    notified_count_again = await WaitlistService.trigger_slot_release_notifications(
        db=db_session,
        slot_id=slot.id
    )
    assert notified_count_again == 0

    # ۵. بررسی اعلان‌های دریافتی کاربر در پرتال
    notifs = await WaitlistService.get_user_notifications(db=db_session, user_id=user.id)
    assert len(notifs) >= 1
    target_notif = next(n for n in notifs if n["slot_id"] == slot.id)
    assert target_notif["is_read"] is False
    assert target_notif["link_url"] is not None
    assert "آزاد شد" in target_notif["title"]

    # ۶. خوانده شدن اعلان
    mark_res = await WaitlistService.mark_as_read(
        db=db_session,
        notification_id=target_notif["id"],
        user_id=user.id
    )
    assert mark_res is True
    recheck_notif = await db_session.get(InAppNotification, target_notif["id"])
    assert recheck_notif.is_read is True

    # ۷. بررسی مجدد موجودی سانس در زمان کلیک:
    # الف) وقتی سانس آزاد است:
    check_available = await WaitlistService.verify_slot_availability(db=db_session, slot_id=slot.id)
    assert check_available["is_available"] is True
    assert check_available["status"] == "AVAILABLE"

    # ب) وقتی کاربر دیگری سریع‌تر سانس را Hold کرده است:
    other_user = User(id="user-other-fast-1", phone_number="09121112233", full_name="کاربر سریع")
    db_session.add(other_user)
    await db_session.commit()

    await BookingService.hold_slot(db_session, slot.id, other_user.id)

    check_taken = await WaitlistService.verify_slot_availability(db=db_session, slot_id=slot.id)
    assert check_taken["is_available"] is False
    assert check_taken["status"] == "HOLD"
