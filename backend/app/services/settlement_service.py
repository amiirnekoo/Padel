import uuid
from datetime import datetime
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.models.club import Club, Court
from backend.app.models.slot import TimeSlot
from backend.app.models.booking import Booking
from backend.app.models.settlement import SettlementBatch, SettlementItem

class SettlementService:
    @staticmethod
    async def generate_club_settlement(db: AsyncSession, club_id: str) -> SettlementBatch:
        """
        Aggregates all UNSETTLED confirmed bookings for a club.
        Calculates 97% venue share and 3% platform commission, packaging them into a settlement batch.
        """
        club_stmt = select(Club).where(Club.id == club_id)
        club_res = await db.execute(club_stmt)
        club = club_res.scalar_one_or_none()
        if not club:
            raise ValueError("باشگاه مورد نظر یافت نشد")

        # Query all confirmed unsettled bookings for this club
        booking_query = (
            select(Booking)
            .join(TimeSlot, Booking.timeslot_id == TimeSlot.id)
            .join(Court, TimeSlot.court_id == Court.id)
            .where(
                Court.club_id == club_id,
                Booking.status == "CONFIRMED",
                Booking.settlement_status == "UNSETTLED"
            )
        )
        b_res = await db.execute(booking_query)
        bookings = list(b_res.scalars().all())

        if not bookings:
            raise ValueError("هیچ رزرو تسویه‌نشده‌ای برای این باشگاه وجود ندارد")

        total_amount = sum(b.amount_paid for b in bookings)
        commission_rate = float(club.commission_rate or 3.00)
        commission_amount = int(total_amount * (commission_rate / 100.0))
        payout_amount = total_amount - commission_amount

        batch_number = f"PAYA-{datetime.utcnow().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
        batch = SettlementBatch(
            id=str(uuid.uuid4()),
            batch_number=batch_number,
            club_id=club_id,
            start_date=min(b.created_at for b in bookings),
            end_date=max(b.created_at for b in bookings),
            total_bookings_amount=total_amount,
            platform_commission_amount=commission_amount,
            club_payout_amount=payout_amount,
            status="PROCESSING",
            iban=club.iban
        )
        db.add(batch)

        for b in bookings:
            b_comm = int(b.amount_paid * (commission_rate / 100.0))
            b_share = b.amount_paid - b_comm
            item = SettlementItem(
                id=str(uuid.uuid4()),
                batch_id=batch.id,
                booking_id=b.id,
                booking_amount=b.amount_paid,
                club_share=b_share,
                commission_amount=b_comm
            )
            db.add(item)
            b.settlement_status = "SETTLED"

        await db.commit()
        await db.refresh(batch)
        return batch

    @staticmethod
    async def mark_settlement_paid(
        db: AsyncSession,
        batch_id: str,
        paya_reference: str
    ) -> SettlementBatch:
        """Marks a settlement batch as PAID with its bank Paya tracking reference."""
        stmt = select(SettlementBatch).where(SettlementBatch.id == batch_id)
        res = await db.execute(stmt)
        batch = res.scalar_one_or_none()
        if not batch:
            raise ValueError("دسته تسویه مورد نظر یافت نشد")

        batch.status = "PAID"
        batch.paya_reference = paya_reference
        batch.paid_at = datetime.utcnow()

        await db.commit()
        await db.refresh(batch)
        return batch

    @staticmethod
    async def get_club_settlements(db: AsyncSession, club_id: str) -> list[SettlementBatch]:
        """Fetches history of settlement batches generated for a club."""
        stmt = (
            select(SettlementBatch)
            .where(SettlementBatch.club_id == club_id)
            .options(selectinload(SettlementBatch.items))
            .order_by(SettlementBatch.created_at.desc())
        )
        res = await db.execute(stmt)
        return list(res.scalars().all())

    @staticmethod
    async def export_paya_batch_data(db: AsyncSession, batch_id: str) -> dict:
        """Formats settlement batch into official Paya/Satna bank transfer format."""
        stmt = select(SettlementBatch).where(SettlementBatch.id == batch_id)
        res = await db.execute(stmt)
        batch = res.scalar_one_or_none()
        if not batch:
            raise ValueError("دسته تسویه مورد نظر یافت نشد")

        return {
            "batch_number": batch.batch_number,
            "destination_iban": batch.iban,
            "amount_irr": batch.club_payout_amount,
            "amount_toman": batch.club_payout_amount // 10,
            "description": f"تسویه درآمد رزروهای پدل و تنیس دوره {batch.batch_number}",
            "created_at": batch.created_at.isoformat()
        }
