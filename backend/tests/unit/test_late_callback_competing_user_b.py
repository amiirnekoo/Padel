import pytest
from datetime import datetime, timedelta
from sqlalchemy import select
from backend.app.services.booking_service import BookingService
from backend.app.services.payment_service import PaymentService
from backend.app.models.slot import TimeSlot
from backend.app.models.booking import Booking
from backend.app.models.payment import PaymentAttempt
from backend.app.models.refund import Refund
from backend.app.models.user import User

@pytest.mark.asyncio
async def test_late_callback_competing_user_b_hold_protected(db_session, seed_data):
    """
    آزمون سناریوی کلیدی رقابت کال‌بک دیرهنگام و کاربر دوم:
    ۱. کاربر A سانس را Hold می‌کند.
    ۲. مهلت ۱۰ دقیقه کاربر A منقضی می‌شود.
    ۳. کاربر B همان سانس را به طور مستقل Hold می‌کند.
    ۴. کال‌بک پرداخت کاربر A با تأخیر از بانک می‌رسد.
    تضمین‌ها:
    - پرداخت A برگشت داده شده و رزرو A منقضی می‌شود.
    - رکورد استرداد برای A با دلیل LATE_CALLBACK صادر می‌شود.
    - اسلات کاربر B به هیچ عنوان آزاد نشده، بازنویسی نشده و مالکیت B حفظ می‌شود.
    """
    user_a = seed_data["user"]
    slot = seed_data["slot"]

    # Create User B in DB
    user_b = User(id="user-b-99", phone_number="09129999999", full_name="کاربر بی")
    db_session.add(user_b)
    await db_session.commit()

    # 1. User A holds slot
    booking_a = await BookingService.hold_slot(db_session, slot.id, user_a.id)
    checkout_a = await PaymentService.create_checkout(db_session, booking_a.id, user_a.id)
    token_a = checkout_a["gateway_token"]

    # 2. Simulate User A's hold expiration (backdate hold_expires_at)
    res = await db_session.execute(select(TimeSlot).where(TimeSlot.id == slot.id))
    s = res.scalar_one()
    s.hold_expires_at = datetime.utcnow() - timedelta(minutes=2)
    await db_session.commit()

    # 3. User B holds the exact same slot (validly acquiring the expired slot)
    booking_b = await BookingService.hold_slot(db_session, slot.id, user_b.id)
    assert booking_b.user_id == user_b.id
    assert booking_b.status == "PENDING_PAYMENT"

    # Verify slot is currently rightfully held by User B
    res_b_slot = await db_session.execute(select(TimeSlot).where(TimeSlot.id == slot.id))
    slot_after_b = res_b_slot.scalar_one()
    assert slot_after_b.held_by_user_id == user_b.id
    assert slot_after_b.status == "HOLD"
    b_hold_expires = slot_after_b.hold_expires_at

    # 4. Late Callback for User A arrives!
    callback_res = await PaymentService.process_callback(
        db_session,
        gateway_token=token_a,
        ref_id="SHP-LATE-USER-A-4455",
        success=True
    )

    # Invariants for User A:
    assert callback_res["status"] == "REVERSED_EXPIRED"

    res_bk_a = await db_session.execute(select(Booking).where(Booking.id == booking_a.id))
    bk_a = res_bk_a.scalar_one()
    assert bk_a.status == "EXPIRED"

    res_att_a = await db_session.execute(select(PaymentAttempt).where(PaymentAttempt.gateway_token == token_a))
    att_a = res_att_a.scalar_one()
    assert att_a.status == "REVERSED"

    res_ref_a = await db_session.execute(select(Refund).where(Refund.booking_id == booking_a.id))
    ref_a = res_ref_a.scalar_one()
    assert ref_a.amount == slot.price
    assert ref_a.reason == "LATE_CALLBACK"

    # CRITICAL INVARIANT FOR USER B:
    # Slot MUST STILL be held by User B, status MUST be HOLD, and expiration unchanged!
    res_final_slot = await db_session.execute(select(TimeSlot).where(TimeSlot.id == slot.id))
    final_slot = res_final_slot.scalar_one()
    assert final_slot.status == "HOLD", "Slot must NOT be released to AVAILABLE while User B has an active hold!"
    assert final_slot.held_by_user_id == user_b.id, "Slot ownership must strictly remain with User B!"
    assert final_slot.hold_expires_at == b_hold_expires, "User B hold expiration must remain completely intact!"
