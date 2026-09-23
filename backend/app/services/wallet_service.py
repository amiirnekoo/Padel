import uuid
from datetime import datetime
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.models.wallet import Wallet, WalletTransaction
from backend.app.models.slot import TimeSlot
from backend.app.models.booking import Booking

class WalletService:
    @staticmethod
    async def get_or_create_wallet(db: AsyncSession, user_id: str) -> Wallet:
        """Retrieves existing wallet or safely provisions a new zero-balance wallet."""
        stmt = select(Wallet).where(Wallet.user_id == user_id)
        res = await db.execute(stmt)
        wallet = res.scalar_one_or_none()
        if not wallet:
            wallet = Wallet(
                id=str(uuid.uuid4()),
                user_id=user_id,
                balance=0,
                currency="IRR",
                is_locked=False
            )
            db.add(wallet)
            await db.commit()
            await db.refresh(wallet)
        return wallet

    @staticmethod
    async def top_up_wallet(
        db: AsyncSession,
        user_id: str,
        amount: int,
        reference_id: str | None = None,
        description: str = "شارژ کیف پول از طریق درگاه بانکی"
    ) -> Wallet:
        """Credits wallet balance after successful online payment."""
        if amount <= 0:
            raise ValueError("مبلغ شارژ باید بزرگتر از صفر باشد")

        wallet = await WalletService.get_or_create_wallet(db, user_id)
        if wallet.is_locked:
            raise ValueError("کیف پول شما مسدود شده است")

        wallet.balance += amount

        tx = WalletTransaction(
            id=str(uuid.uuid4()),
            wallet_id=wallet.id,
            amount=amount,
            transaction_type="CREDIT",
            category="TOPUP",
            reference_id=reference_id,
            description=description
        )
        db.add(tx)
        await db.commit()
        await db.refresh(wallet)
        return wallet

    @staticmethod
    async def pay_booking_with_wallet(
        db: AsyncSession,
        user_id: str,
        slot_id: str
    ) -> Booking:
        """
        Executes instant 1-click booking payment via wallet balance.
        Guarantees atomic slot state transition without redirecting to Shaparak gateway.
        """
        wallet = await WalletService.get_or_create_wallet(db, user_id)
        if wallet.is_locked:
            raise ValueError("کیف پول شما مسدود است")

        # Slot verification
        slot_stmt = select(TimeSlot).where(TimeSlot.id == slot_id)
        slot_res = await db.execute(slot_stmt)
        slot = slot_res.scalar_one_or_none()
        if not slot:
            raise ValueError("سانس مورد نظر یافت نشد")

        if slot.status not in ["AVAILABLE", "HOLD"]:
            raise ValueError("سانس انتخابی در دسترس نیست")

        if wallet.balance < slot.price:
            raise ValueError("موجودی کیف پول برای این رزرو کافی نیست")

        # Deduct wallet
        wallet.balance -= slot.price

        # Update slot state
        slot.status = "BOOKED"
        slot.hold_expires_at = None

        # Create confirmed booking
        tracking_code = f"WLT-{datetime.utcnow().strftime('%y%m%d%H%M')}-{uuid.uuid4().hex[:6].upper()}"
        booking = Booking(
            id=str(uuid.uuid4()),
            tracking_code=tracking_code,
            user_id=user_id,
            timeslot_id=slot.id,
            amount_paid=slot.price,
            status="CONFIRMED",
            payment_method="WALLET",
            settlement_status="UNSETTLED",
            confirmed_at=datetime.utcnow()
        )
        db.add(booking)

        # Record debit transaction
        tx = WalletTransaction(
            id=str(uuid.uuid4()),
            wallet_id=wallet.id,
            amount=slot.price,
            transaction_type="DEBIT",
            category="BOOKING_PAYMENT",
            reference_id=booking.tracking_code,
            description=f"پرداخت آنی رزرو سانس کد {booking.tracking_code}"
        )
        db.add(tx)

        await db.commit()
        await db.refresh(booking)
        return booking

    @staticmethod
    async def refund_to_wallet(
        db: AsyncSession,
        user_id: str,
        booking_id: str,
        refund_amount: int,
        description: str = "استرداد وجه لغو رزرو به کیف پول"
    ) -> Wallet:
        """Instantly credits eligible 24h cancellation refund directly to user wallet."""
        wallet = await WalletService.get_or_create_wallet(db, user_id)
        wallet.balance += refund_amount

        tx = WalletTransaction(
            id=str(uuid.uuid4()),
            wallet_id=wallet.id,
            amount=refund_amount,
            transaction_type="CREDIT",
            category="REFUND",
            reference_id=booking_id,
            description=description
        )
        db.add(tx)
        await db.commit()
        await db.refresh(wallet)
        return wallet

    @staticmethod
    async def get_wallet_transactions(db: AsyncSession, user_id: str) -> list[WalletTransaction]:
        """Fetches complete audit trail of transactions for a user's wallet."""
        wallet = await WalletService.get_or_create_wallet(db, user_id)
        stmt = (
            select(WalletTransaction)
            .where(WalletTransaction.wallet_id == wallet.id)
            .order_by(WalletTransaction.created_at.desc())
        )
        res = await db.execute(stmt)
        return list(res.scalars().all())
