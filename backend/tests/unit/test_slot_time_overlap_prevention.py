import pytest
from datetime import date, time
from backend.app.models.slot import TimeSlot
from backend.app.services.booking_service import BookingService

@pytest.mark.asyncio
async def test_slot_time_overlap_prevention_logic(db_session, seed_data):
    """
    اثبات ریاضی و تراکنشی جلوگیری از تداخل بازه‌ها:
    فرمول بازه‌های نیمه‌باز [start, end):
    existing.start_time < new_end_time AND existing.end_time > new_start_time
    تضمین‌ها:
    - سانس متداخل جزئی (قبل یا بعد) رد می‌شود.
    - سانس کاملاً محصور یا دربرگیرنده رد می‌شود.
    - بازه‌های مماس متوالی (پایان اولی = شروع دومی) مجاز بوده و تداخل تلقی نمی‌شوند.
    - سانس برای زمین دیگر یا تاریخ دیگر تداخل ندارد.
    - در ویرایش، مستثنی کردن شناسه خود سانس (exclude_slot_id) به درستی عمل می‌کند.
    """
    court = seed_data["court"]
    test_date = date(2026, 10, 10)

    # سانس پایه: 10:00 تا 11:30
    base_slot = TimeSlot(
        id="slot-base-overlap-1",
        court_id=court.id,
        slot_date=test_date,
        start_time=time(10, 0),
        end_time=time(11, 30),
        price=2000000,
        status="AVAILABLE"
    )
    db_session.add(base_slot)
    await db_session.commit()

    # ۱. تداخل جزئی از انتها (11:00 تا 12:30) -> باید True باشد (رد شود)
    assert await BookingService.check_slot_time_overlap(
        db_session, court.id, test_date, time(11, 0), time(12, 30)
    ) is True

    # ۲. تداخل جزئی از ابتدا (09:00 تا 10:30) -> باید True باشد (رد شود)
    assert await BookingService.check_slot_time_overlap(
        db_session, court.id, test_date, time(9, 0), time(10, 30)
    ) is True

    # ۳. تداخل محصور کامل درون بازه (10:15 تا 11:15) -> باید True باشد (رد شود)
    assert await BookingService.check_slot_time_overlap(
        db_session, court.id, test_date, time(10, 15), time(11, 15)
    ) is True

    # ۴. تداخل فراگیر کامل دور بازه (09:30 تا 12:00) -> باید True باشد (رد شود)
    assert await BookingService.check_slot_time_overlap(
        db_session, court.id, test_date, time(9, 30), time(12, 0)
    ) is True

    # ۵. مماس متوالی قبل: 08:30 تا 10:00 (پایان 10:00 برابر شروع بازه پایه) -> نباید تداخل باشد (False)
    assert await BookingService.check_slot_time_overlap(
        db_session, court.id, test_date, time(8, 30), time(10, 0)
    ) is False

    # ۶. مماس متوالی بعد: 11:30 تا 13:00 (شروع 11:30 برابر پایان بازه پایه) -> نباید تداخل باشد (False)
    assert await BookingService.check_slot_time_overlap(
        db_session, court.id, test_date, time(11, 30), time(13, 0)
    ) is False

    # ۷. زمین دیگر در همان تاریخ و ساعت -> نباید تداخل باشد (False)
    assert await BookingService.check_slot_time_overlap(
        db_session, "other-court-999", test_date, time(10, 0), time(11, 30)
    ) is False

    # ۸. همان زمین در تاریخ دیگر -> نباید تداخل باشد (False)
    other_date = date(2026, 10, 11)
    assert await BookingService.check_slot_time_overlap(
        db_session, court.id, other_date, time(10, 0), time(11, 30)
    ) is False

    # ۹. استثنا کردن خود سانس پایه در حالت ویرایش -> نباید تداخل با خود بدهد (False)
    assert await BookingService.check_slot_time_overlap(
        db_session, court.id, test_date, time(10, 0), time(11, 30), exclude_slot_id=base_slot.id
    ) is False
