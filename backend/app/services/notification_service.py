import json
import uuid
from typing import Any
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.models.notification import NotificationLog
from backend.app.models.booking import Booking
from backend.app.models.slot import TimeSlot
from backend.app.models.club import Club, Court
from backend.app.core.sms import get_sms_provider, BaseSmsProvider

class NotificationService:
    @staticmethod
    def _provider() -> BaseSmsProvider:
        return get_sms_provider("mock")

    @staticmethod
    async def send_booking_confirmation(
        db: AsyncSession,
        booking: Booking,
        slot: TimeSlot,
        court: Court,
        club: Club,
        recipient_phone: str
    ) -> NotificationLog:
        """Sends instant booking confirmation SMS to the player with tracking code and map coordinates."""
        tokens = {
            "club": club.name,
            "court": court.name,
            "time": f"{slot.start_time.strftime('%H:%M')}-{slot.end_time.strftime('%H:%M')}",
            "date": str(slot.slot_date),
            "tracking": booking.tracking_code,
            "map_link": f"https://neshan.org/maps/@{club.city}"
        }

        provider = NotificationService._provider()
        res = await provider.send_pattern_sms(
            receptor=recipient_phone,
            template="booking_confirmation_player",
            tokens=tokens
        )

        log = NotificationLog(
            id=str(uuid.uuid4()),
            recipient=recipient_phone,
            event_type="BOOKING_CONFIRMATION_PLAYER",
            template_name="booking_confirmation_player",
            provider=res.provider,
            tokens_json=json.dumps(tokens, ensure_ascii=False),
            status="DELIVERED" if res.success else "FAILED",
            message_id=res.message_id,
            error_message=res.error
        )
        db.add(log)
        await db.commit()
        await db.refresh(log)
        return log

    @staticmethod
    async def send_operator_booking_alert(
        db: AsyncSession,
        booking: Booking,
        slot: TimeSlot,
        court: Court,
        player_name: str | None,
        player_phone: str,
        operator_phone: str
    ) -> NotificationLog:
        """Alerts court desk operator immediately when a new slot is locked and paid."""
        tokens = {
            "court": court.name,
            "time": f"{slot.start_time.strftime('%H:%M')}",
            "date": str(slot.slot_date),
            "player": player_name or "ورزشکار",
            "phone": player_phone,
            "tracking": booking.tracking_code
        }

        provider = NotificationService._provider()
        res = await provider.send_pattern_sms(
            receptor=operator_phone,
            template="booking_alert_operator",
            tokens=tokens
        )

        log = NotificationLog(
            id=str(uuid.uuid4()),
            recipient=operator_phone,
            event_type="BOOKING_ALERT_OPERATOR",
            template_name="booking_alert_operator",
            provider=res.provider,
            tokens_json=json.dumps(tokens, ensure_ascii=False),
            status="DELIVERED" if res.success else "FAILED",
            message_id=res.message_id,
            error_message=res.error
        )
        db.add(log)
        await db.commit()
        await db.refresh(log)
        return log

    @staticmethod
    async def send_booking_reminder(
        db: AsyncSession,
        booking: Booking,
        club_name: str,
        slot_time: str,
        recipient_phone: str
    ) -> NotificationLog:
        """Sends scheduled 2-hour pre-game SMS reminder to the player."""
        tokens = {
            "club": club_name,
            "time": slot_time,
            "tracking": booking.tracking_code
        }

        provider = NotificationService._provider()
        res = await provider.send_pattern_sms(
            receptor=recipient_phone,
            template="booking_reminder_2h",
            tokens=tokens
        )

        log = NotificationLog(
            id=str(uuid.uuid4()),
            recipient=recipient_phone,
            event_type="BOOKING_REMINDER_2H",
            template_name="booking_reminder_2h",
            provider=res.provider,
            tokens_json=json.dumps(tokens, ensure_ascii=False),
            status="DELIVERED" if res.success else "FAILED",
            message_id=res.message_id,
            error_message=res.error
        )
        db.add(log)
        await db.commit()
        await db.refresh(log)
        return log

    @staticmethod
    async def send_cancellation_refund_notice(
        db: AsyncSession,
        tracking_code: str,
        refund_toman: int,
        current_balance_toman: int,
        recipient_phone: str
    ) -> NotificationLog:
        """Notifies player about instant 24h cancellation refund credited to their platform wallet."""
        tokens = {
            "tracking": tracking_code,
            "refund": str(refund_toman),
            "balance": str(current_balance_toman)
        }

        provider = NotificationService._provider()
        res = await provider.send_pattern_sms(
            receptor=recipient_phone,
            template="booking_cancellation_refund",
            tokens=tokens
        )

        log = NotificationLog(
            id=str(uuid.uuid4()),
            recipient=recipient_phone,
            event_type="BOOKING_CANCELLATION_REFUND",
            template_name="booking_cancellation_refund",
            provider=res.provider,
            tokens_json=json.dumps(tokens, ensure_ascii=False),
            status="DELIVERED" if res.success else "FAILED",
            message_id=res.message_id,
            error_message=res.error
        )
        db.add(log)
        await db.commit()
        await db.refresh(log)
        return log

    @staticmethod
    async def get_notification_logs(
        db: AsyncSession,
        recipient: str | None = None,
        event_type: str | None = None,
        limit: int = 50
    ) -> list[NotificationLog]:
        """Fetches telemetry history of notification logs."""
        query = select(NotificationLog)
        if recipient:
            query = query.where(NotificationLog.recipient.contains(recipient))
        if event_type:
            query = query.where(NotificationLog.event_type == event_type)

        res = await db.execute(query.order_by(NotificationLog.created_at.desc()).limit(limit))
        return list(res.scalars().all())
