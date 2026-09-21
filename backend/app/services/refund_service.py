from datetime import datetime
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.models.enums import RefundStatus, WalletCreditStatus
from backend.app.models.refund import Refund
from backend.app.models.wallet_credit import WalletCredit
from backend.app.services.slot_service import InvalidOperationError


class RefundService:
    @staticmethod
    async def process_refund_gateway_result(
        session: AsyncSession,
        refund_id: str,
        success: bool,
        gateway_reference: str | None = None,
        error_message: str | None = None,
        retry_count: int = 0,
    ) -> Refund:
        """
        Process external gateway reversal result.
        States: INITIATED -> PENDING_GATEWAY -> SUCCEEDED / FAILED_RETRY / FAILED_ESCALATED.
        """
        stmt = select(Refund).where(Refund.id == refund_id).with_for_update()
        refund = (await session.execute(stmt)).scalar_one_or_none()
        if not refund:
            raise InvalidOperationError("رکورد استرداد یافت نشد.")

        if success:
            refund.status = RefundStatus.SUCCEEDED
            refund.gateway_reference = gateway_reference
            refund.error_message = None
        else:
            if retry_count < 3:
                refund.status = RefundStatus.FAILED_RETRY
                refund.error_message = error_message
            else:
                refund.status = RefundStatus.FAILED_ESCALATED
                refund.error_message = f"ESCALATED_TO_DLQ: {error_message}"

        await session.flush()
        return refund

    @staticmethod
    async def opt_in_convert_to_store_credit(
        session: AsyncSession,
        refund_id: str,
        user_id: str,
        now: datetime,
    ) -> WalletCredit:
        """
        Decoupled conversion: Converts refund to internal store credit ONLY upon user's explicit opt-in.
        """
        stmt = select(Refund).where(Refund.id == refund_id).with_for_update()
        refund = (await session.execute(stmt)).scalar_one_or_none()
        if not refund:
            raise InvalidOperationError("رکورد استرداد یافت نشد.")

        if refund.user_id != user_id:
            raise InvalidOperationError("تنها کاربر ذینفع مجاز به تبدیل استرداد به اعتبار است.")

        # Create wallet credit with explicit confirmation timestamp
        credit = WalletCredit(
            user_id=user_id,
            booking_id=refund.booking_id,
            amount=refund.amount,
            status=WalletCreditStatus.CREDITED,
            opt_in_confirmed_at=now,
        )
        session.add(credit)

        # Mark refund as completed via store credit conversion
        refund.status = RefundStatus.SUCCEEDED
        refund.gateway_reference = f"INTERNAL_WALLET_CREDIT_{credit.id}"

        await session.flush()
        return credit
