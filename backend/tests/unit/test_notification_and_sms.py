import pytest
from datetime import datetime, date, time
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.models.user import User
from backend.app.models.club import Club, Court
from backend.app.models.slot import TimeSlot
from backend.app.models.booking import Booking
from backend.app.models.notification import NotificationLog
from backend.app.core.sms import MockSmsProvider, BaseSmsProvider
from backend.app.services.notification_service import NotificationService

@pytest.mark.asyncio
async def test_mock_sms_provider_pattern_dispatch():
    provider: BaseSmsProvider = MockSmsProvider()
    res = await provider.send_pattern_sms(
        receptor="09121112233",
        template="booking_confirmation",
        tokens={"club": "کلوپ پدل ولنجک", "time": "18:00", "tracking": "PAD-123456"}
    )
    assert res.success is True
    assert res.message_id is not None
    assert res.provider == "mock"
    assert "09121112233" in res.recipient


@pytest.mark.asyncio
async def test_booking_confirmation_and_operator_alert_notifications(db_session: AsyncSession):
    # 1. Setup entities
    club = Club(
        name="کلوپ پدل ولنجک",
        address="ولنجک، خیابان ساسان",
        phone="02122000000"
    )
    db_session.add(club)
    await db_session.commit()

    court = Court(club_id=club.id, name="کورت شماره ۱", sport_type="PADEL")
    db_session.add(court)
    await db_session.commit()

    slot = TimeSlot(
        court_id=court.id,
        slot_date=date(2026, 10, 5),
        start_time=time(19, 0),
        end_time=time(20, 0),
        price=3500000,
        status="BOOKED"
    )
    db_session.add(slot)
    await db_session.commit()

    player = User(
        phone_number="09123334455",
        full_name="رامین فرزاد",
        role="PLAYER"
    )
    operator = User(
        phone_number="09129990011",
        full_name="متصدی باجه ولنجک",
        role="CLUB_OPERATOR",
        club_id=club.id
    )
    db_session.add_all([player, operator])
    await db_session.commit()

    booking = Booking(
        tracking_code="PAD-CONFIRM-99",
        user_id=player.id,
        timeslot_id=slot.id,
        amount_paid=3500000,
        status="CONFIRMED"
    )
    db_session.add(booking)
    await db_session.commit()

    # 2. Trigger Player Booking Confirmation Notification
    log_player = await NotificationService.send_booking_confirmation(
        db=db_session,
        booking=booking,
        slot=slot,
        court=court,
        club=club,
        recipient_phone=player.phone_number
    )
    assert log_player.status == "DELIVERED"
    assert log_player.recipient == "09123334455"
    assert log_player.event_type == "BOOKING_CONFIRMATION_PLAYER"
    assert "PAD-CONFIRM-99" in log_player.tokens_json

    # 3. Trigger Operator Alert Notification
    log_op = await NotificationService.send_operator_booking_alert(
        db=db_session,
        booking=booking,
        slot=slot,
        court=court,
        player_name=player.full_name,
        player_phone=player.phone_number,
        operator_phone=operator.phone_number
    )
    assert log_op.status == "DELIVERED"
    assert log_op.recipient == "09129990011"
    assert log_op.event_type == "BOOKING_ALERT_OPERATOR"

    # 4. Trigger 2-Hour Reminder Notification
    log_reminder = await NotificationService.send_booking_reminder(
        db=db_session,
        booking=booking,
        club_name=club.name,
        slot_time="19:00",
        recipient_phone=player.phone_number
    )
    assert log_reminder.status == "DELIVERED"
    assert log_reminder.event_type == "BOOKING_REMINDER_2H"

    # 5. Query Notification Logs with Filters
    logs = await NotificationService.get_notification_logs(
        db=db_session,
        recipient="09123334455"
    )
    assert len(logs) == 2  # confirmation + reminder
