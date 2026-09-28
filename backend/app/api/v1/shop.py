from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, Field
from typing import List, Optional
from backend.app.core.database import get_db
from backend.app.services.shop_service import ShopService

router = APIRouter(prefix="/shop", tags=["Shop"])

class CartItemPayload(BaseModel):
    product_id: str = Field(..., description="شناسه محصول")
    quantity: int = Field(1, ge=1, le=50, description="تعداد سفارش")

class CalculateCartRequest(BaseModel):
    items: List[CartItemPayload]
    coupon_code: Optional[str] = None

class CheckoutRequest(BaseModel):
    user_id: str = Field(..., description="شناسه کاربر خریدار")
    items: List[CartItemPayload]
    delivery_address: str = Field(..., description="آدرس پستی جهت ارسال مرسوله")
    receiver_name: str = Field(..., description="نام تحویل‌گیرنده")
    receiver_phone: str = Field(..., description="شماره تماس تحویل‌گیرنده")
    payment_method: str = Field("WALLET", description="روش پرداخت: WALLET یا SHAPARAK")
    coupon_code: Optional[str] = None

@router.get("/products")
async def get_products(
    category: Optional[str] = Query(None, description="دسته‌بندی محصول"),
    sport: Optional[str] = Query(None, description="رشته ورزشی PADEL یا TENNIS"),
    brand: Optional[str] = Query(None, description="برند کالا"),
    search: Optional[str] = Query(None, description="جستجوی متنی نام محصول")
):
    """لیست محصولات فروشگاه تجهیزات رالی همراه با فیلترها و مشخصات فنی"""
    return ShopService.get_products(
        category=category,
        sport=sport,
        brand=brand,
        search=search
    )

@router.get("/products/{product_id}")
async def get_product_details(product_id: str):
    """مشاهده مشخصات کامل یک محصول"""
    product = ShopService.get_product_by_id(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="محصول مورد نظر یافت نشد.")
    return product

@router.post("/cart/calculate")
async def calculate_cart(payload: CalculateCartRequest):
    """محاسبه بلادرنگ سبد خرید، اعتبارسنجی قیمت، تخفیف کوپن و هزینه ارسال"""
    items_data = [item.model_dump() for item in payload.items]
    return ShopService.calculate_cart(items=items_data, coupon_code=payload.coupon_code)

@router.post("/checkout")
async def checkout_shop_order(
    payload: CheckoutRequest,
    db: AsyncSession = Depends(get_db)
):
    """ثبت نهایی سفارش، کسر از کیف پول یا ارجاع به درگاه بانکی شاپرک"""
    try:
        items_data = [item.model_dump() for item in payload.items]
        order = await ShopService.checkout_order(
            db=db,
            user_id=payload.user_id,
            items=items_data,
            delivery_address=payload.delivery_address,
            receiver_name=payload.receiver_name,
            receiver_phone=payload.receiver_phone,
            payment_method=payload.payment_method,
            coupon_code=payload.coupon_code
        )
        return order
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
