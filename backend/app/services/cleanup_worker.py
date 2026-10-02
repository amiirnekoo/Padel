import asyncio
import logging
from datetime import datetime, timedelta
from sqlalchemy import select, update
from backend.app.core.datetime_utils import utc_now
from backend.app.models.base import async_session_factory
from backend.app.models.slot import TimeSlot
from backend.app.models.booking import Booking

logger = logging.getLogger("cleanup_worker")

async def cleanup_expired_holds(session_factory=None) -> int:
    now = utc_now()
    factory = session_factory or async_session_factory
    async with factory() as session:
        # 1. Release expired slots from HOLD back to AVAILABLE
        stmt = (
            update(TimeSlot)
            .where(TimeSlot.status == "HOLD", TimeSlot.hold_expires_at < now)
            .values(status="AVAILABLE", held_by_user_id=None, hold_expires_at=None)
        )
        result = await session.execute(stmt)

        # 2. Prevent database bloat: mark abandoned bookings past 10 minutes as EXPIRED
        ten_mins_ago = now - timedelta(minutes=10)
        booking_stmt = (
            update(Booking)
            .where(Booking.status == "PENDING_PAYMENT", Booking.created_at < ten_mins_ago)
            .values(status="EXPIRED")
        )
        await session.execute(booking_stmt)
        await session.commit()

        if result.rowcount > 0:
            logger.info(f"Cleaned up {result.rowcount} expired court holds and marked abandoned bookings as EXPIRED.")
        return result.rowcount

async def run_periodic_cleanup(interval_seconds: int = 60):
    while True:
        try:
            await cleanup_expired_holds()
        except asyncio.CancelledError:
            break
        except Exception as e:
            logger.error(f"Error in cleanup worker: {e}")
        await asyncio.sleep(interval_seconds)
