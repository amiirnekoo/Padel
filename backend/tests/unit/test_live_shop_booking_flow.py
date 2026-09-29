import pytest
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.models.user import User
from backend.app.services.wallet_service import WalletService
from backend.app.services.shop_service import ShopService

@pytest.mark.asyncio
async def test_shop_checkout_insufficient_wallet_balance(db_session: AsyncSession):
    user = User(
        phone_number="09121112233",
        full_name="سارا احمدی",
        role="PLAYER"
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)

    await WalletService.get_or_create_wallet(db_session, user.id)

    items = [{"product_id": "racket-padel-1", "quantity": 1}]
    with pytest.raises(ValueError, match="موجودی کیف پول"):
        await ShopService.checkout_order(
            db=db_session,
            user_id=user.id,
            items=items,
            delivery_address="تهران، ونک",
            receiver_name="سارا احمدی",
            receiver_phone="09121112233",
            payment_method="WALLET"
        )

@pytest.mark.asyncio
async def test_shop_checkout_invalid_product(db_session: AsyncSession):
    user = User(
        phone_number="09122223344",
        full_name="علی شایان",
        role="PLAYER"
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)

    items = [{"product_id": "non-existent-product-id", "quantity": 1}]
    with pytest.raises(ValueError, match="سبد خرید شما خالی است"):
        await ShopService.checkout_order(
            db=db_session,
            user_id=user.id,
            items=items,
            delivery_address="تهران",
            receiver_name="علی شایان",
            receiver_phone="09122223344",
            payment_method="WALLET"
        )

@pytest.mark.asyncio
async def test_shop_checkout_shaparak_gateway(db_session: AsyncSession):
    user = User(
        phone_number="09123334455",
        full_name="مهدی پاکدل",
        role="PLAYER"
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)

    items = [{"product_id": "acc-balls-1", "quantity": 1}]
    order = await ShopService.checkout_order(
        db=db_session,
        user_id=user.id,
        items=items,
        delivery_address="تهران، میرداماد",
        receiver_name="مهدی پاکدل",
        receiver_phone="09123334455",
        payment_method="SHAPARAK"
    )

    assert order["status"] == "WAITING_PAYMENT"
    assert "payment_url" in order
    assert order["payment_url"].startswith("/api/v1/payments/shaparak-gateway")
