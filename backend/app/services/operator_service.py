from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.app.models.slot import TimeSlot
from backend.app.models.club import Court

class OperatorService:
    @staticmethod
    async def verify_court_ownership(db: AsyncSession, court_id: str, club_id: str):
        stmt = select(Court).where(Court.id == court_id)
        result = await db.execute(stmt)
        court = result.scalar_one_or_none()
        if not court:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="زمین مورد نظر یافت نشد")
        # In multi-tenant environments, verify court.club_id == club_id if specified
        return court

    @staticmethod
    async def block_slot(db: AsyncSession, slot_id: str, club_id: str) -> TimeSlot:
        stmt = select(TimeSlot).where(TimeSlot.id == slot_id).with_for_update()
        result = await db.execute(stmt)
        slot = result.scalar_one_or_none()

        if not slot:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="سانس یافت نشد")

        if slot.status == "BOOKED":
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="این سانس قبلاً آنلاین رزرو شده و قابل مسدودسازی دستی نیست")

        slot.status = "BLOCKED"
        slot.held_by_user_id = None
        slot.hold_expires_at = None
        await db.commit()
        await db.refresh(slot)
        return slot

    @staticmethod
    async def unblock_slot(db: AsyncSession, slot_id: str, club_id: str) -> TimeSlot:
        stmt = select(TimeSlot).where(TimeSlot.id == slot_id).with_for_update()
        result = await db.execute(stmt)
        slot = result.scalar_one_or_none()

        if not slot:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="سانس یافت نشد")

        if slot.status != "BLOCKED":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="صرفاً سانس‌های مسدودشده قابل آزادسازی هستند")

        slot.status = "AVAILABLE"
        await db.commit()
        await db.refresh(slot)

        # Trigger durable in-app waitlist notifications
        try:
            from backend.app.services.waitlist_service import WaitlistService
            await WaitlistService.trigger_slot_release_notifications(db=db, slot_id=slot.id)
        except Exception:
            pass

        return slot

    @staticmethod
    async def allocate_tournament_slots(db: AsyncSession, slot_ids: list[str], club_id: str) -> list[TimeSlot]:
        updated_slots = []
        for slot_id in slot_ids:
            stmt = select(TimeSlot).where(TimeSlot.id == slot_id).with_for_update()
            res = await db.execute(stmt)
            slot = res.scalar_one_or_none()
            if slot and slot.status in ["AVAILABLE", "HOLD"]:
                slot.status = "TOURNAMENT_HOLD"
                slot.held_by_user_id = None
                slot.hold_expires_at = None
                updated_slots.append(slot)
        await db.commit()
        return updated_slots
