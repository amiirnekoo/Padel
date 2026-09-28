import pytest
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.models.user import User
from backend.app.services.wallet_service import WalletService
from backend.app.services.shop_service import ShopService

@pytest.mark.asyncio
async def test_get_catalog_and_filtering():
    # 1. Fetch all products
    all_products = ShopService.get_products()
    assert len(all_products) >= 8

    # 2. Filter by category PADEL_RACKET
    padel_rackets = ShopService.get_products(category="PADEL_RACKET")
    assert len(padel_rackets) >= 2
    for p in padel_rackets:
        assert p["category"] == "PADEL_RACKET"
        assert p["sport"] == "PADEL"

    # 3. Filter by sport TENNIS
    tennis_items = ShopService.get_products(sport="TENNIS")
    assert len(tennis_items) >= 2
    for p in tennis_items:
        assert p["sport"] == "TENNIS"

    # 4. Search by keyword
    bullpadel_items = ShopService.get_products(search="Bullpadel")
    assert len(bullpadel_items) >= 1
    assert "Bullpadel" in bullpadel_items[0]["name_en"]

@pytest.mark.asyncio
async def test_cart_calculation_with_free_shipping_and_coupon():
    # Product 1: Bullpadel Hack 03 (e.g. 18,500,000 Tomans)
    items = [
        {"product_id": "racket-padel-1", "quantity": 1}
    ]
    
    # Calculate without coupon
    calc_res = ShopService.calculate_cart(items=items, coupon_code=None)
    assert calc_res["subtotal"] > 10000000
    assert calc_res["shipping_fee"] == 0 # Free shipping over 2,000,000 Tomans
    assert calc_res["discount_amount"] == 0
    assert calc_res["total_amount"] == calc_res["subtotal"]

    # Calculate with valid 10% coupon: RALLY10
    coupon_res = ShopService.calculate_cart(items=items, coupon_code="RALLY10")
    expected_discount = int(calc_res["subtotal"] * 0.10)
    assert coupon_res["discount_amount"] == expected_discount
    assert coupon_res["total_amount"] == calc_res["subtotal"] - expected_discount

@pytest.mark.asyncio
async def test_checkout_via_wallet(db_session: AsyncSession):
    # 1. Create buyer user
    user = User(
        phone_number="09120009988",
        full_name="کیوان راد",
        role="PLAYER"
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)

    # 2. Charge wallet with enough funds (30,000,000 Tomans)
    await WalletService.get_or_create_wallet(db_session, user.id)
    await WalletService.top_up_wallet(db_session, user.id, 300000000, reference_id="SHAPARAK_INIT")

    # 3. Checkout shop order
    items = [
        {"product_id": "acc-balls-1", "quantity": 2} # e.g. 2 boxes of balls
    ]
    order = await ShopService.checkout_order(
        db=db_session,
        user_id=user.id,
        items=items,
        delivery_address="تهران، شهرک غرب، فاز ۱",
        receiver_name="کیوان راد",
        receiver_phone="09120009988",
        payment_method="WALLET",
        coupon_code=None
    )

    assert order["status"] == "PAID"
    assert order["tracking_code"].startswith("RLY-SHP-")
    assert order["total_amount"] > 0

    # 4. Verify wallet was debited
    wallet = await WalletService.get_or_create_wallet(db_session, user.id)
    assert wallet.balance == 300000000 - (order["total_amount"] * 10) # converted to Rials
