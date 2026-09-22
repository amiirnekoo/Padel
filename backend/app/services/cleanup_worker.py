import asyncio
import logging
from datetime import datetime
from sqlalchemy import select, update
from backend.app.models.base import async_session_factory
from backend.app.models.slot import TimeSlot

logger = logging.getLogger("cleanup_worker")

async def cleanup_expired_holds(session_factory=None) -> int:
    now = datetime.utcnow()
    factory = session_factory or async_session_factory
    async with factory() as session:
        stmt = (
            update(TimeSlot)
            .where(TimeSlot.status == "HOLD", TimeSlot.hold_expires_at < now)
            .values(status="AVAILABLE", held_by_user_id=None, hold_expires_at=None)
        )
        result = await session.execute(stmt)
        await session.commit()
        if result.rowcount > 0:
            logger.info(f"Cleaned up {result.rowcount} expired court holds.")
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
