from datetime import datetime
from collections import defaultdict
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, delete
from fastapi import HTTPException

from backend.app.models.accounting import FinancialTransaction
from backend.app.core.datetime_utils import utc_now


class AccountingService:
    @staticmethod
    async def create_transaction(
        session: AsyncSession,
        tenant_type: str,
        tenant_id: str,
        transaction_type: str,
        category: str,
        title: str,
        amount: int,
        payment_method: str = "POS",
        reference_id: str | None = None,
        contact_name: str | None = None,
        contact_phone: str | None = None,
        description: str | None = None,
        transaction_date: datetime | None = None,
    ) -> FinancialTransaction:
        if amount <= 0:
            raise HTTPException(status_code=400, detail="مبلغ تراکنش باید بیشتر از صفر باشد.")

        tx_type_normalized = transaction_type.upper()
        if tx_type_normalized not in ["INCOME", "EXPENSE"]:
            raise HTTPException(status_code=400, detail="نوع تراکنش نامعتبر است (باید INCOME یا EXPENSE باشد).")

        tx = FinancialTransaction(
            tenant_type=tenant_type.upper(),
            tenant_id=tenant_id,
            transaction_type=tx_type_normalized,
            category=category.upper(),
            title=title.strip(),
            amount=amount,
            payment_method=payment_method.upper(),
            reference_id=reference_id,
            contact_name=contact_name,
            contact_phone=contact_phone,
            description=description,
            transaction_date=transaction_date or utc_now(),
        )
        session.add(tx)
        await session.commit()
        await session.refresh(tx)
        return tx

    @staticmethod
    async def get_ledger(
        session: AsyncSession,
        tenant_type: str,
        tenant_id: str,
        start_date: datetime | None = None,
        end_date: datetime | None = None,
        transaction_type: str | None = None,
        category: str | None = None,
        limit: int = 100,
        offset: int = 0,
    ) -> list[FinancialTransaction]:
        conditions = [
            FinancialTransaction.tenant_type == tenant_type.upper(),
            FinancialTransaction.tenant_id == tenant_id,
        ]

        if start_date:
            conditions.append(FinancialTransaction.transaction_date >= start_date)
        if end_date:
            conditions.append(FinancialTransaction.transaction_date <= end_date)
        if transaction_type:
            conditions.append(FinancialTransaction.transaction_type == transaction_type.upper())
        if category:
            conditions.append(FinancialTransaction.category == category.upper())

        query = (
            select(FinancialTransaction)
            .where(and_(*conditions))
            .order_by(FinancialTransaction.transaction_date.desc())
            .limit(limit)
            .offset(offset)
        )
        result = await session.execute(query)
        return list(result.scalars().all())

    @staticmethod
    async def calculate_summary(
        session: AsyncSession,
        tenant_type: str,
        tenant_id: str,
        start_date: datetime | None = None,
        end_date: datetime | None = None,
    ) -> dict:
        conditions = [
            FinancialTransaction.tenant_type == tenant_type.upper(),
            FinancialTransaction.tenant_id == tenant_id,
        ]
        if start_date:
            conditions.append(FinancialTransaction.transaction_date >= start_date)
        if end_date:
            conditions.append(FinancialTransaction.transaction_date <= end_date)

        query = select(FinancialTransaction).where(and_(*conditions))
        result = await session.execute(query)
        transactions = list(result.scalars().all())

        total_income = 0
        total_expense = 0
        income_cats = defaultdict(lambda: {"amount": 0, "count": 0})
        expense_cats = defaultdict(lambda: {"amount": 0, "count": 0})

        for tx in transactions:
            if tx.transaction_type == "INCOME":
                total_income += tx.amount
                income_cats[tx.category]["amount"] += tx.amount
                income_cats[tx.category]["count"] += 1
            elif tx.transaction_type == "EXPENSE":
                total_expense += tx.amount
                expense_cats[tx.category]["amount"] += tx.amount
                expense_cats[tx.category]["count"] += 1

        net_profit = total_income - total_expense

        return {
            "tenant_type": tenant_type.upper(),
            "tenant_id": tenant_id,
            "total_income": total_income,
            "total_expense": total_expense,
            "net_profit": net_profit,
            "transactions_count": len(transactions),
            "income_categories": [
                {"category": cat, "amount": data["amount"], "count": data["count"]}
                for cat, data in income_cats.items()
            ],
            "expense_categories": [
                {"category": cat, "amount": data["amount"], "count": data["count"]}
                for cat, data in expense_cats.items()
            ],
        }

    @staticmethod
    async def delete_transaction(
        session: AsyncSession,
        tx_id: str,
        tenant_type: str,
        tenant_id: str,
    ) -> bool:
        stmt = delete(FinancialTransaction).where(
            and_(
                FinancialTransaction.id == tx_id,
                FinancialTransaction.tenant_type == tenant_type.upper(),
                FinancialTransaction.tenant_id == tenant_id,
            )
        )
        result = await session.execute(stmt)
        await session.commit()
        if result.rowcount == 0:
            raise HTTPException(status_code=404, detail="تراکنش مورد نظر یافت نشد یا دسترسی مجاز نیست.")
        return True
