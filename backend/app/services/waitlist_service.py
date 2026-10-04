import uuid
from datetime import datetime, date, time
from sqlalchemy import select, update, and_
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.core.datetime_utils import utc_now
from backend.app.models.waitlist import WaitlistEntry, InAppNotification
from backend.app.models.slot import TimeSlot
from backend.app.models.club import Court, Club

class WaitlistService:
    @staticmethod
    async def join_waitlist(
        db: AsyncSession,
        user_id: str,
        court_id: str,
        slot_date: date,
        start_time: time
    ) -> WaitlistEntry:
        """عضویت پایدار در لیست انتظار یک سانس مشخص"""
        stmt = select(WaitlistEntry).where(
            WaitlistEntry.user_id == user_id,
            WaitlistEntry.court_id == court_id,
            WaitlistEntry.slot_date == slot_date,
            WaitlistEntry.start_time == start_time
        )
        res = await db.execute(stmt)
        entry = res.scalar_one_or_none()

        if entry:
            entry.status = "ACTIVE"
            entry.created_at = utc_now()
        else:
            entry = WaitlistEntry(
                user_id=user_id,
                court_id=court_id,
                slot_date=slot_date,
                start_time=start_time,
                status="ACTIVE"
            )
            db.add(entry)

        await db.commit()
        await db.refresh(entry)
        return entry

    @staticmethod
    async def leave_waitlist(
        db: AsyncSession,
        user_id: str,
        court_id: str,
        slot_date: date,
        start_time: time
    ) -> bool:
        """لغو عضویت از لیست انتظار"""
        stmt = select(WaitlistEntry).where(
            WaitlistEntry.user_id == user_id,
            WaitlistEntry.court_id == court_id,
            WaitlistEntry.slot_date == slot_date,
            WaitlistEntry.start_time == start_time,
            WaitlistEntry.status == "ACTIVE"
        )
        res = await db.execute(stmt)
        entry = res.scalar_one_or_none()
        if entry:
            entry.status = "CANCELLED"
            await db.commit()
            return True
        return False

    @staticmethod
    async def trigger_slot_release_notifications(
        db: AsyncSession,
        slot_id: str
    ) -> int:
        """
        تشخیص آزاد شدن سانس و ایجاد اعلان‌های پایدار و ماندگار درون پرتال برای اعضای لیست انتظار.
        این اعلان در تراکنش دیتابیس ثبت شده و به فرآیندهای پس‌زمینه ناپایدار وابسته نیست.
        """
        slot_stmt = select(TimeSlot).where(TimeSlot.id == slot_id)
        slot_res = await db.execute(slot_stmt)
        slot = slot_res.scalar_one_or_none()
        if not slot or slot.status != "AVAILABLE":
            return 0

        # Load court details
        court_stmt = select(Court).where(Court.id == slot.court_id)
        court_res = await db.execute(court_stmt)
        court = court_res.scalar_one_or_none()
        court_name = court.name if court else "کورت رالی"

        # Find active waitlist entries for this slot
        wl_stmt = select(WaitlistEntry).where(
            WaitlistEntry.court_id == slot.court_id,
            WaitlistEntry.slot_date == slot.slot_date,
            WaitlistEntry.start_time == slot.start_time,
            WaitlistEntry.status == "ACTIVE"
        )
        wl_res = await db.execute(wl_stmt)
        entries = wl_res.scalars().all()

        notifications_created = 0
        now = utc_now()

        for entry in entries:
            # Check if an unread notification for this exact slot release already exists (Anti-duplicate)
            dup_stmt = select(InAppNotification).where(
                InAppNotification.user_id == entry.user_id,
                InAppNotification.slot_id == slot.id,
                InAppNotification.is_read == False
            )
            dup_res = await db.execute(dup_stmt)
            if dup_res.scalars().first():
                continue

            notif = InAppNotification(
                user_id=entry.user_id,
                title="آزاد شدن سانس مورد نظر شما",
                message=f"سانس ساعت {slot.start_time.strftime('%H:%M')} تا {slot.end_time.strftime('%H:%M')} در {court_name} آزاد شد. توجه: این اعلان به معنای رزرو قطعی نیست و نیازمند رزرو فوری توسط شما می‌باشد.",
                event_type="SLOT_RELEASED",
                slot_id=slot.id,
                link_url=f"/courts?courtId={slot.court_id}&date={slot.slot_date}&slotId={slot.id}",
                is_read=False,
                created_at=now
            )
            db.add(notif)
            entry.status = "NOTIFIED"
            entry.notified_at = now
            notifications_created += 1

        if notifications_created > 0:
            await db.commit()

        return notifications_created

    @staticmethod
    async def get_user_notifications(db: AsyncSession, user_id: str) -> list[dict]:
        """استعلام اعلان‌های پایدار کاربر در پرتال"""
        stmt = (
            select(InAppNotification)
            .where(InAppNotification.user_id == user_id)
            .order_by(InAppNotification.created_at.desc())
        )
        res = await db.execute(stmt)
        notifs = res.scalars().all()
        return [
            {
                "id": n.id,
                "title": n.title,
                "message": n.message,
                "event_type": n.event_type,
                "slot_id": n.slot_id,
                "link_url": n.link_url,
                "is_read": n.is_read,
                "created_at": n.created_at.isoformat() if n.created_at else None
            }
            for n in notifs
        ]

    @staticmethod
    async def mark_as_read(db: AsyncSession, notification_id: str, user_id: str) -> bool:
        """علامت‌گذاری اعلان به عنوان خوانده شده"""
        stmt = select(InAppNotification).where(
            InAppNotification.id == notification_id,
            InAppNotification.user_id == user_id
        )
        res = await db.execute(stmt)
        notif = res.scalar_one_or_none()
        if notif:
            notif.is_read = True
            await db.commit()
            return True
        return False

    @staticmethod
    async def verify_slot_availability(db: AsyncSession, slot_id: str) -> dict:
        """بررسی مجدد موجودی سانس هنگام کلیک روی اعلان لیست انتظار"""
        stmt = select(TimeSlot).where(TimeSlot.id == slot_id)
        res = await db.execute(stmt)
        slot = res.scalar_one_or_none()
        if not slot:
            return {"exists": False, "is_available": False, "status": "NOT_FOUND"}

        now = utc_now()
        is_available = (slot.status == "AVAILABLE") or (slot.status == "HOLD" and slot.hold_expires_at and slot.hold_expires_at < now)
        return {
            "exists": True,
            "slot_id": slot.id,
            "status": "AVAILABLE" if is_available else slot.status,
            "is_available": is_available,
            "start_time": slot.start_time.strftime("%H:%M"),
            "end_time": slot.end_time.strftime("%H:%M"),
            "price": slot.price
        }
