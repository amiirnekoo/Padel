from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class TransactionCreateIn(BaseModel):
    transaction_type: str = Field(..., description="INCOME or EXPENSE")
    category: str = Field(..., description="Category code")
    title: str = Field(..., min_length=2, max_length=200, description="Title of transaction")
    amount: int = Field(..., gt=0, description="Amount in Tomans")
    payment_method: str = Field(default="POS", description="ONLINE, POS, CASH, CARD_TO_CARD, WALLET")
    reference_id: str | None = None
    contact_name: str | None = None
    contact_phone: str | None = None
    description: str | None = None
    transaction_date: datetime | None = None


class TransactionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    tenant_type: str
    tenant_id: str
    transaction_type: str
    category: str
    title: str
    amount: int
    payment_method: str
    reference_id: str | None = None
    contact_name: str | None = None
    contact_phone: str | None = None
    description: str | None = None
    transaction_date: datetime
    created_at: datetime


class CategoryBreakdown(BaseModel):
    category: str
    amount: int
    count: int


class AccountingSummaryOut(BaseModel):
    tenant_type: str
    tenant_id: str
    total_income: int
    total_expense: int
    net_profit: int
    transactions_count: int
    income_categories: list[CategoryBreakdown] = []
    expense_categories: list[CategoryBreakdown] = []
