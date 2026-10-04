import uuid
from typing import List, Optional, Dict, Any
from datetime import datetime, date, time
from fastapi import APIRouter, Depends, HTTPException, status, Request, Query
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, func
from sqlalchemy.orm import selectinload

from backend.app.models.base import get_db_session
from backend.app.services.admin_service import AdminService
from backend.app.services.media_service import MediaService
from backend.app.api.deps import get_current_admin
from backend.app.models.product import Product, ProductCategory, ProductImage, ShopOrder, ShopOrderItem
from backend.app.models.content import Article, ArticleCategory, SiteBanner, MediaAsset
from backend.app.models.tournament import Tournament, PlayerRanking
from backend.app.models.admin_user import AdminUser
from backend.app.models.club import Club, Court
from backend.app.models.slot import TimeSlot
from backend.app.core.security import get_password_hash

router = APIRouter(prefix="/admin", tags=["admin"])


# ==================== Pydantic Request Models ====================
class AdminLoginRequest(BaseModel):
    username: str
    password: str

class IncidentCreateRequest(BaseModel):
    title: str
    severity: str = "WARNING"
    category: str = "GENERAL"
    description: str
    reporter_name: str = "ادمین عملیاتی"

class IncidentResolveRequest(BaseModel):
    resolution_notes: str

class EmergencyCancelRequest(BaseModel):
    reason: str
    admin_name: str = "ادمین عملیاتی"

class AuditLogCreateRequest(BaseModel):
    action: str
    target_type: str
    target_id: str
    details: Optional[Dict[str, Any]] = None
    admin_name: str = "ادمین عملیاتی"

# Products
class ProductPayload(BaseModel):
    id: Optional[str] = None
    title_fa: str
    title_en: str
    slug: Optional[str] = None
    category_id: str
    brand: str
    model_year: int = 2026
    sport: str = "PADEL"
    level: str = "PRO"
    original_price: int
    discount_percent: int = 0
    price: int
    stock: int = 0
    is_in_stock: bool = True
    is_new: bool = True
    is_featured: bool = False
    is_active: bool = True
    primary_image: str
    description_fa: str
    description_en: Optional[str] = None
    specs: Optional[Dict[str, Any]] = None
    technologies: Optional[List[Dict[str, Any]]] = None
    gallery_images: Optional[List[str]] = None

class StockUpdateRequest(BaseModel):
    stock: int = Field(..., ge=0)

class CategoryPayload(BaseModel):
    id: str
    name: str
    name_en: Optional[str] = None
    slug: str
    icon: Optional[str] = None
    display_order: int = 0

class OrderStatusUpdateRequest(BaseModel):
    order_status: str  # NEW, PROCESSING, SHIPPED, DELIVERED, CANCELLED
    shipping_tracking_code: Optional[str] = None
    admin_notes: Optional[str] = None

class ArticlePayload(BaseModel):
    id: Optional[str] = None
    title: str
    slug: Optional[str] = None
    summary: str
    content_html: str
    cover_image: str
    author_name: str = "تحریریه رالی"
    category_id: str
    reading_time_minutes: int = 5
    is_published: bool = True

class BannerPayload(BaseModel):
    title: str
    subtitle: Optional[str] = None
    image_url: str
    mobile_image_url: Optional[str] = None
    link_url: str
    button_text: Optional[str] = None
    banner_type: str = "HERO_SLIDER"
    display_order: int = 0
    is_active: bool = True

class TournamentPayload(BaseModel):
    id: Optional[str] = None
    title: str
    slug: Optional[str] = None
    subtitle: Optional[str] = None
    cover_image: str
    sport_type: str = "PADEL"
    tournament_format: str = "KING_OF_COURT"
    gender: str = "MEN"
    level: str = "OPEN"
    status: str = "REGISTRATION_OPEN"
    venue_name: str
    venue_address: Optional[str] = None
    start_date: date
    end_date: date
    entry_fee: int = 0
    prize_pool: str = "بدون جایزه نقدی"
    max_teams: int = 16
    registered_teams_count: int = 0
    rules_summary: Optional[str] = None

class RankingPayload(BaseModel):
    player_name: str
    avatar_url: Optional[str] = None
    category: str = "MEN_PRO"
    rank: int
    points: int = 0
    tournaments_played: int = 0
    matches_won: int = 0
    matches_lost: int = 0
    win_rate: float = 0.0

class BatchSlotsRequest(BaseModel):
    start_date: date
    end_date: date
    start_hour: int = 8
    end_hour: int = 24
    slot_duration_minutes: int = 90
    hourly_rate: int = 3000000

class SlotUpdateRequest(BaseModel):
    status: str  # AVAILABLE, BLOCKED, TOURNAMENT_HOLD
    price: Optional[int] = None

class AdminUserPayload(BaseModel):
    username: str
    password: str
    full_name: str
    email: Optional[str] = None
    role: str = "OPERATIONS_ADMIN"
    club_id: Optional[str] = None


# ==================== Core Auth & Dashboard ====================
@router.post("/login")
async def admin_login(
    req: AdminLoginRequest,
    request: Request,
    session: AsyncSession = Depends(get_db_session)
):
    client_ip = request.client.host if request.client else "127.0.0.1"
    service = AdminService(session)
    result = await service.authenticate_admin(
        username=req.username,
        password=req.password,
        ip_address=client_ip
    )
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=result.get("message", "نام کاربری یا رمز عبور نامعتبر است.")
        )
    return result

@router.get("/stats")
async def get_dashboard_stats(
    session: AsyncSession = Depends(get_db_session),
    admin: dict = Depends(get_current_admin)
):
    service = AdminService(session)
    return await service.get_admin_dashboard_stats()


# ==================== Product Catalog & Inventory ====================
@router.get("/products")
async def list_admin_products(
    category_id: Optional[str] = None,
    brand: Optional[str] = None,
    search: Optional[str] = None,
    session: AsyncSession = Depends(get_db_session),
    admin: dict = Depends(get_current_admin)
):
    query = select(Product).options(selectinload(Product.images)).order_by(desc(Product.created_at))
    if category_id:
        query = query.where(Product.category_id == category_id)
    if brand:
        query = query.where(Product.brand.ilike(f"%{brand}%"))
    if search:
        query = query.where(
            Product.title_fa.ilike(f"%{search}%") | Product.title_en.ilike(f"%{search}%")
        )
    res = await session.execute(query)
    products = res.scalars().all()
    return [
        {
            "id": p.id,
            "title_fa": p.title_fa,
            "title_en": p.title_en,
            "slug": p.slug,
            "category_id": p.category_id,
            "brand": p.brand,
            "model_year": p.model_year,
            "sport": p.sport,
            "level": p.level,
            "original_price": p.original_price,
            "discount_percent": p.discount_percent,
            "price": p.price,
            "stock": p.stock,
            "is_in_stock": p.is_in_stock,
            "is_new": p.is_new,
            "is_featured": p.is_featured,
            "is_active": p.is_active,
            "rating": p.rating,
            "review_count": p.review_count,
            "primary_image": p.primary_image,
            "description_fa": p.description_fa,
            "description_en": p.description_en,
            "specs": p.specs,
            "technologies": p.technologies,
            "images": [img.image_url for img in p.images] if p.images else [p.primary_image],
            "created_at": p.created_at.isoformat() if p.created_at else None
        }
        for p in products
    ]

@router.post("/products", status_code=status.HTTP_201_CREATED)
async def create_product(
    payload: ProductPayload,
    session: AsyncSession = Depends(get_db_session),
    admin: dict = Depends(get_current_admin)
):
    prod_id = payload.id or f"prod-{uuid.uuid4().hex[:8]}"
    slug = payload.slug or f"{payload.brand.lower()}-{uuid.uuid4().hex[:6]}"

    product = Product(
        id=prod_id,
        title_fa=payload.title_fa,
        title_en=payload.title_en,
        slug=slug,
        category_id=payload.category_id,
        brand=payload.brand,
        model_year=payload.model_year,
        sport=payload.sport,
        level=payload.level,
        original_price=payload.original_price,
        discount_percent=payload.discount_percent,
        price=payload.price,
        stock=payload.stock,
        is_in_stock=payload.stock > 0,
        is_new=payload.is_new,
        is_featured=payload.is_featured,
        is_active=payload.is_active,
        primary_image=payload.primary_image,
        description_fa=payload.description_fa,
        description_en=payload.description_en,
        specs=payload.specs,
        technologies=payload.technologies
    )
    session.add(product)
    await session.flush()

    # Add primary image
    session.add(ProductImage(
        product_id=prod_id,
        image_url=payload.primary_image,
        alt_text=payload.title_fa,
        display_order=1,
        is_primary=True
    ))

    # Add gallery images if any
    if payload.gallery_images:
        for idx, img_url in enumerate(payload.gallery_images, start=2):
            if img_url != payload.primary_image:
                session.add(ProductImage(
                    product_id=prod_id,
                    image_url=img_url,
                    alt_text=f"{payload.title_fa} - {idx}",
                    display_order=idx,
                    is_primary=False
                ))

    service = AdminService(session)
    await service.record_audit_log(
        admin_name=admin.get("username", "admin"),
        action="CREATE_PRODUCT",
        target_type="PRODUCT",
        target_id=prod_id,
        details={"title": payload.title_fa, "price": payload.price, "stock": payload.stock}
    )

    await session.commit()
    return {"id": prod_id, "status": "CREATED", "message": "محصول با موفقیت اضافه شد."}

@router.put("/products/{product_id}")
async def update_product(
    product_id: str,
    payload: ProductPayload,
    session: AsyncSession = Depends(get_db_session),
    admin: dict = Depends(get_current_admin)
):
    product = await session.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="محصول یافت نشد.")

    product.title_fa = payload.title_fa
    product.title_en = payload.title_en
    product.category_id = payload.category_id
    product.brand = payload.brand
    product.model_year = payload.model_year
    product.sport = payload.sport
    product.level = payload.level
    product.original_price = payload.original_price
    product.discount_percent = payload.discount_percent
    product.price = payload.price
    product.stock = payload.stock
    product.is_in_stock = payload.stock > 0
    product.is_new = payload.is_new
    product.is_featured = payload.is_featured
    product.is_active = payload.is_active
    product.primary_image = payload.primary_image
    product.description_fa = payload.description_fa
    product.description_en = payload.description_en
    product.specs = payload.specs
    product.technologies = payload.technologies

    service = AdminService(session)
    await service.record_audit_log(
        admin_name=admin.get("username", "admin"),
        action="UPDATE_PRODUCT",
        target_type="PRODUCT",
        target_id=product_id,
        details={"price": payload.price, "stock": payload.stock}
    )

    await session.commit()
    return {"id": product_id, "status": "UPDATED", "message": "محصول با موفقیت ویرایش شد."}

@router.patch("/products/{product_id}/stock")
async def update_product_stock(
    product_id: str,
    req: StockUpdateRequest,
    session: AsyncSession = Depends(get_db_session),
    admin: dict = Depends(get_current_admin)
):
    product = await session.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="محصول یافت نشد.")

    old_stock = product.stock
    product.stock = req.stock
    product.is_in_stock = req.stock > 0

    service = AdminService(session)
    await service.record_audit_log(
        admin_name=admin.get("username", "admin"),
        action="UPDATE_STOCK",
        target_type="PRODUCT",
        target_id=product_id,
        details={"old_stock": old_stock, "new_stock": req.stock}
    )

    await session.commit()
    return {"id": product_id, "stock": product.stock, "is_in_stock": product.is_in_stock}

@router.delete("/products/{product_id}")
async def delete_product(
    product_id: str,
    session: AsyncSession = Depends(get_db_session),
    admin: dict = Depends(get_current_admin)
):
    product = await session.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="محصول یافت نشد.")

    product.is_active = False  # Soft delete
    service = AdminService(session)
    await service.record_audit_log(
        admin_name=admin.get("username", "admin"),
        action="DELETE_PRODUCT",
        target_type="PRODUCT",
        target_id=product_id
    )
    await session.commit()
    return {"id": product_id, "status": "DELETED"}

@router.get("/categories")
async def list_categories(session: AsyncSession = Depends(get_db_session)):
    query = select(ProductCategory).order_by(ProductCategory.display_order)
    res = await session.execute(query)
    categories = res.scalars().all()
    return [
        {
            "id": c.id,
            "name": c.name,
            "name_en": c.name_en,
            "slug": c.slug,
            "icon": c.icon,
            "display_order": c.display_order
        }
        for c in categories
    ]

@router.post("/categories", status_code=status.HTTP_201_CREATED)
async def create_category(
    payload: CategoryPayload,
    session: AsyncSession = Depends(get_db_session),
    admin: dict = Depends(get_current_admin)
):
    cat = ProductCategory(**payload.model_dump())
    session.add(cat)
    await session.commit()
    return {"id": cat.id, "status": "CREATED"}


# ==================== Shop Orders Management ====================
@router.get("/orders")
async def list_orders(
    status_filter: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    session: AsyncSession = Depends(get_db_session),
    admin: dict = Depends(get_current_admin)
):
    query = select(ShopOrder).options(selectinload(ShopOrder.items)).order_by(desc(ShopOrder.created_at))
    if status_filter:
        query = query.where(ShopOrder.order_status == status_filter)
    query = query.offset(offset).limit(limit)

    res = await session.execute(query)
    orders = res.scalars().all()
    return [
        {
            "id": o.id,
            "tracking_code": o.tracking_code,
            "customer_name": o.customer_name,
            "customer_phone": o.customer_phone,
            "customer_address": o.customer_address,
            "city": o.city,
            "total_amount": o.total_amount,
            "discount_amount": o.discount_amount,
            "shipping_fee": o.shipping_fee,
            "payable_amount": o.payable_amount,
            "payment_method": o.payment_method,
            "payment_status": o.payment_status,
            "order_status": o.order_status,
            "shipping_tracking_code": o.shipping_tracking_code,
            "admin_notes": o.admin_notes,
            "items_count": len(o.items) if o.items else 0,
            "items": [
                {
                    "product_id": it.product_id,
                    "title": it.product_title,
                    "unit_price": it.unit_price,
                    "quantity": it.quantity,
                    "total_price": it.total_price
                }
                for it in o.items
            ] if o.items else [],
            "created_at": o.created_at.isoformat() if o.created_at else None
        }
        for o in orders
    ]

@router.patch("/orders/{order_id}/status")
async def update_order_status(
    order_id: str,
    req: OrderStatusUpdateRequest,
    session: AsyncSession = Depends(get_db_session),
    admin: dict = Depends(get_current_admin)
):
    order = await session.get(ShopOrder, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="سفارش یافت نشد.")

    old_status = order.order_status
    order.order_status = req.order_status
    if req.shipping_tracking_code:
        order.shipping_tracking_code = req.shipping_tracking_code
    if req.admin_notes:
        order.admin_notes = req.admin_notes

    service = AdminService(session)
    await service.record_audit_log(
        admin_name=admin.get("username", "admin"),
        action="UPDATE_ORDER_STATUS",
        target_type="ORDER",
        target_id=order_id,
        details={"old_status": old_status, "new_status": req.order_status, "tracking": req.shipping_tracking_code}
    )

    await session.commit()
    return {"id": order_id, "status": order.order_status, "message": "وضعیت سفارش بروزرسانی شد."}


# ==================== Content Management (CMS) ====================
@router.get("/articles")
async def list_admin_articles(
    session: AsyncSession = Depends(get_db_session),
    admin: dict = Depends(get_current_admin)
):
    query = select(Article).order_by(desc(Article.created_at))
    res = await session.execute(query)
    articles = res.scalars().all()
    return [
        {
            "id": a.id,
            "title": a.title,
            "slug": a.slug,
            "summary": a.summary,
            "cover_image": a.cover_image,
            "author_name": a.author_name,
            "category_id": a.category_id,
            "reading_time_minutes": a.reading_time_minutes,
            "view_count": a.view_count,
            "is_published": a.is_published,
            "published_at": a.published_at.isoformat() if a.published_at else None
        }
        for a in articles
    ]

@router.post("/articles", status_code=status.HTTP_201_CREATED)
async def create_article(
    payload: ArticlePayload,
    session: AsyncSession = Depends(get_db_session),
    admin: dict = Depends(get_current_admin)
):
    art_id = payload.id or f"art-{uuid.uuid4().hex[:8]}"
    slug = payload.slug or f"article-{uuid.uuid4().hex[:6]}"

    article = Article(
        id=art_id,
        title=payload.title,
        slug=slug,
        summary=payload.summary,
        content_html=payload.content_html,
        cover_image=payload.cover_image,
        author_name=payload.author_name,
        category_id=payload.category_id,
        reading_time_minutes=payload.reading_time_minutes,
        is_published=payload.is_published
    )
    session.add(article)
    await session.commit()
    return {"id": art_id, "status": "CREATED", "message": "مقاله با موفقیت ایجاد شد."}

@router.put("/articles/{article_id}")
async def update_article(
    article_id: str,
    payload: ArticlePayload,
    session: AsyncSession = Depends(get_db_session),
    admin: dict = Depends(get_current_admin)
):
    article = await session.get(Article, article_id)
    if not article:
        raise HTTPException(status_code=404, detail="مقاله یافت نشد.")

    article.title = payload.title
    article.summary = payload.summary
    article.content_html = payload.content_html
    article.cover_image = payload.cover_image
    article.author_name = payload.author_name
    article.category_id = payload.category_id
    article.reading_time_minutes = payload.reading_time_minutes
    article.is_published = payload.is_published

    await session.commit()
    return {"id": article_id, "status": "UPDATED"}

@router.delete("/articles/{article_id}")
async def delete_article(
    article_id: str,
    session: AsyncSession = Depends(get_db_session),
    admin: dict = Depends(get_current_admin)
):
    article = await session.get(Article, article_id)
    if not article:
        raise HTTPException(status_code=404, detail="مقاله یافت نشد.")

    await session.delete(article)
    await session.commit()
    return {"id": article_id, "status": "DELETED"}

@router.get("/banners")
async def list_admin_banners(
    session: AsyncSession = Depends(get_db_session),
    admin: dict = Depends(get_current_admin)
):
    query = select(SiteBanner).order_by(SiteBanner.display_order)
    res = await session.execute(query)
    banners = res.scalars().all()
    return [
        {
            "id": b.id,
            "title": b.title,
            "subtitle": b.subtitle,
            "image_url": b.image_url,
            "link_url": b.link_url,
            "button_text": b.button_text,
            "banner_type": b.banner_type,
            "display_order": b.display_order,
            "is_active": b.is_active
        }
        for b in banners
    ]

@router.post("/banners", status_code=status.HTTP_201_CREATED)
async def create_banner(
    payload: BannerPayload,
    session: AsyncSession = Depends(get_db_session),
    admin: dict = Depends(get_current_admin)
):
    banner = SiteBanner(**payload.model_dump())
    session.add(banner)
    await session.commit()
    return {"id": banner.id, "status": "CREATED"}

@router.delete("/banners/{banner_id}")
async def delete_banner(
    banner_id: str,
    session: AsyncSession = Depends(get_db_session),
    admin: dict = Depends(get_current_admin)
):
    banner = await session.get(SiteBanner, banner_id)
    if not banner:
        raise HTTPException(status_code=404, detail="بنر یافت نشد.")
    await session.delete(banner)
    await session.commit()
    return {"id": banner_id, "status": "DELETED"}


# ==================== Tournaments & Rankings ====================
@router.get("/tournaments")
async def list_admin_tournaments(
    session: AsyncSession = Depends(get_db_session),
    admin: dict = Depends(get_current_admin)
):
    query = select(Tournament).order_by(desc(Tournament.start_date))
    res = await session.execute(query)
    tournaments = res.scalars().all()
    return [
        {
            "id": t.id,
            "title": t.title,
            "slug": t.slug,
            "subtitle": t.subtitle,
            "cover_image": t.cover_image,
            "sport_type": t.sport_type,
            "tournament_format": t.tournament_format,
            "level": t.level,
            "status": t.status,
            "venue_name": t.venue_name,
            "start_date": t.start_date.isoformat(),
            "end_date": t.end_date.isoformat(),
            "entry_fee": t.entry_fee,
            "prize_pool": t.prize_pool,
            "max_teams": t.max_teams,
            "registered_teams_count": t.registered_teams_count,
            "is_active": t.is_active
        }
        for t in tournaments
    ]

@router.post("/tournaments", status_code=status.HTTP_201_CREATED)
async def create_tournament(
    payload: TournamentPayload,
    session: AsyncSession = Depends(get_db_session),
    admin: dict = Depends(get_current_admin)
):
    tour_id = payload.id or f"tour-{uuid.uuid4().hex[:8]}"
    slug = payload.slug or f"tournament-{uuid.uuid4().hex[:6]}"

    tour = Tournament(
        id=tour_id,
        title=payload.title,
        slug=slug,
        subtitle=payload.subtitle,
        cover_image=payload.cover_image,
        sport_type=payload.sport_type,
        tournament_format=payload.tournament_format,
        gender=payload.gender,
        level=payload.level,
        status=payload.status,
        venue_name=payload.venue_name,
        venue_address=payload.venue_address,
        start_date=payload.start_date,
        end_date=payload.end_date,
        entry_fee=payload.entry_fee,
        prize_pool=payload.prize_pool,
        max_teams=payload.max_teams,
        registered_teams_count=payload.registered_teams_count,
        rules_summary=payload.rules_summary
    )
    session.add(tour)
    await session.commit()
    return {"id": tour_id, "status": "CREATED", "message": "تورنمنت با موفقیت ثبت شد."}

@router.get("/rankings")
async def list_admin_rankings(
    category: str = "MEN_PRO",
    session: AsyncSession = Depends(get_db_session),
    admin: dict = Depends(get_current_admin)
):
    query = select(PlayerRanking).where(PlayerRanking.category == category).order_by(PlayerRanking.rank)
    res = await session.execute(query)
    rankings = res.scalars().all()
    return [
        {
            "id": r.id,
            "player_name": r.player_name,
            "category": r.category,
            "rank": r.rank,
            "points": r.points,
            "tournaments_played": r.tournaments_played,
            "matches_won": r.matches_won,
            "matches_lost": r.matches_lost,
            "win_rate": r.win_rate
        }
        for r in rankings
    ]

@router.post("/rankings", status_code=status.HTTP_201_CREATED)
async def create_ranking(
    payload: RankingPayload,
    session: AsyncSession = Depends(get_db_session),
    admin: dict = Depends(get_current_admin)
):
    ranking = PlayerRanking(**payload.model_dump())
    session.add(ranking)
    await session.commit()
    return {"id": ranking.id, "status": "CREATED"}


# ==================== Courts & TimeSlot Schedule ====================
@router.get("/courts")
async def list_admin_courts(
    session: AsyncSession = Depends(get_db_session),
    admin: dict = Depends(get_current_admin)
):
    query = select(Court).options(selectinload(Court.club))
    res = await session.execute(query)
    courts = res.scalars().all()
    return [
        {
            "id": c.id,
            "name": c.name,
            "sport_type": c.sport_type,
            "surface_type": c.surface_type,
            "hourly_rate": c.hourly_rate,
            "is_indoor": c.is_indoor,
            "has_lighting": c.has_lighting,
            "is_active": c.is_active,
            "club_id": c.club_id,
            "club_name": c.club.name if c.club else "باشگاه نامشخص"
        }
        for c in courts
    ]

@router.post("/courts/{court_id}/slots/batch")
async def batch_generate_court_slots(
    court_id: str,
    req: BatchSlotsRequest,
    session: AsyncSession = Depends(get_db_session),
    admin: dict = Depends(get_current_admin)
):
    court = await session.get(Court, court_id)
    if not court:
        raise HTTPException(status_code=404, detail="کورت یافت نشد.")

    from datetime import timedelta
    current_date = req.start_date
    created_count = 0

    while current_date <= req.end_date:
        current_minute = req.start_hour * 60
        end_minute = req.end_hour * 60

        while current_minute + req.slot_duration_minutes <= end_minute:
            sh = current_minute // 60
            sm = current_minute % 60
            eh = (current_minute + req.slot_duration_minutes) // 60
            em = (current_minute + req.slot_duration_minutes) % 60

            start_t = time(sh, sm)
            end_t = time(eh if eh < 24 else 23, em if eh < 24 else 59)

            # Strict non-overlap check: existing.start_time < end_t AND existing.end_time > start_t
            stmt = select(TimeSlot).where(
                TimeSlot.court_id == court_id,
                TimeSlot.slot_date == current_date,
                TimeSlot.start_time < end_t,
                TimeSlot.end_time > start_t
            )
            has_overlap = (await session.execute(stmt)).scalars().first()
            if not has_overlap:
                slot = TimeSlot(
                    court_id=court_id,
                    slot_date=current_date,
                    start_time=start_t,
                    end_time=end_t,
                    price=req.hourly_rate,
                    status="AVAILABLE"
                )
                session.add(slot)
                created_count += 1

            current_minute += req.slot_duration_minutes
        current_date += timedelta(days=1)

    await session.commit()
    return {"court_id": court_id, "created_slots_count": created_count, "message": f"{created_count} سانس جدید ایجاد شد."}

@router.patch("/slots/{slot_id}")
async def update_slot(
    slot_id: str,
    req: SlotUpdateRequest,
    session: AsyncSession = Depends(get_db_session),
    admin: dict = Depends(get_current_admin)
):
    slot = await session.get(TimeSlot, slot_id)
    if not slot:
        raise HTTPException(status_code=404, detail="سانس یافت نشد.")

    slot.status = req.status
    if req.price is not None:
        slot.price = req.price

    await session.commit()
    return {"id": slot_id, "status": slot.status, "price": slot.price}


# ==================== Media Upload Library ====================
class MediaUploadPayload(BaseModel):
    file_name: str
    content_base64: str
    folder: str = "general"

class ProductImageProcessPayload(BaseModel):
    product_slug: str
    image_name: str = "1"
    content_base64: str

@router.post("/media/process-product-image")
async def process_product_image_endpoint(
    payload: ProductImageProcessPayload,
    admin: dict = Depends(get_current_admin)
):
    """پردازش بهینه و خودکار تصویر کالا در ابعاد رسپانسیو وب، موبایل و تبلت با فرمت WebP"""
    import base64
    raw_b64 = payload.content_base64
    if "," in raw_b64:
        _, raw_b64 = raw_b64.split(",", 1)

    try:
        content_bytes = base64.b64decode(raw_b64)
    except Exception:
        raise HTTPException(status_code=400, detail="فرمت داده Base64 نامعتبر است.")

    variants = MediaService.process_product_responsive_images(
        content_bytes=content_bytes,
        product_slug=payload.product_slug,
        image_name=payload.image_name
    )
    return variants

@router.post("/media/upload")
async def upload_media_asset(
    payload: MediaUploadPayload,
    session: AsyncSession = Depends(get_db_session),
    admin: dict = Depends(get_current_admin)
):
    """آپلود تصویر در کتابخانه مدیا با پشتیبانی از کشیدن و رها کردن"""
    import base64
    raw_b64 = payload.content_base64
    if "," in raw_b64:
        header, raw_b64 = raw_b64.split(",", 1)
        mime_type = header.split(";")[0].replace("data:", "")
    else:
        mime_type = "image/jpeg"

    try:
        content_bytes = base64.b64decode(raw_b64)
    except Exception:
        raise HTTPException(status_code=400, detail="فرمت داده Base64 نامعتبر است.")

    admin_name = admin.get("username", "admin")
    asset_data = await MediaService.save_upload_bytes(
        db=session,
        file_name=payload.file_name,
        content_bytes=content_bytes,
        mime_type=mime_type,
        folder=payload.folder,
        uploaded_by=admin_name
    )
    return asset_data

@router.get("/media")
async def list_media_assets(
    folder: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    session: AsyncSession = Depends(get_db_session),
    admin: dict = Depends(get_current_admin)
):
    return await MediaService.list_media(db=session, folder=folder, limit=limit, offset=offset)

@router.delete("/media/{asset_id}")
async def delete_media_asset(
    asset_id: str,
    session: AsyncSession = Depends(get_db_session),
    admin: dict = Depends(get_current_admin)
):
    success = await MediaService.delete_media(db=session, asset_id=asset_id)
    if not success:
        raise HTTPException(status_code=404, detail="فایل مدیا یافت نشد.")
    return {"id": asset_id, "status": "DELETED"}


# ==================== Admin Users & Team RBAC ====================
@router.get("/users")
async def list_admin_users(
    session: AsyncSession = Depends(get_db_session),
    admin: dict = Depends(get_current_admin)
):
    query = select(AdminUser).order_by(AdminUser.created_at)
    res = await session.execute(query)
    users = res.scalars().all()
    return [
        {
            "id": u.id,
            "username": u.username,
            "full_name": u.full_name,
            "email": u.email,
            "role": u.role,
            "club_id": u.club_id,
            "is_active": u.is_active,
            "last_login_at": u.last_login_at.isoformat() if u.last_login_at else None
        }
        for u in users
    ]

@router.post("/users", status_code=status.HTTP_201_CREATED)
async def create_admin_user(
    payload: AdminUserPayload,
    session: AsyncSession = Depends(get_db_session),
    admin: dict = Depends(get_current_admin)
):
    stmt = select(AdminUser).where(AdminUser.username == payload.username)
    existing = (await session.execute(stmt)).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="این نام کاربری قبلاً ثبت شده است.")

    new_user = AdminUser(
        username=payload.username,
        password_hash=get_password_hash(payload.password),
        full_name=payload.full_name,
        email=payload.email,
        role=payload.role,
        club_id=payload.club_id
    )
    session.add(new_user)
    await session.commit()
    return {"id": new_user.id, "username": new_user.username, "status": "CREATED"}


# ==================== Incidents & Audit Logs (Original) ====================
@router.get("/incidents")
async def list_incidents(
    resolved: Optional[bool] = None,
    session: AsyncSession = Depends(get_db_session),
    admin: dict = Depends(get_current_admin)
):
    service = AdminService(session)
    incidents = await service.get_incidents(resolved=resolved)
    return [
        {
            "id": inc.id,
            "title": inc.title,
            "severity": inc.severity,
            "category": inc.category,
            "description": inc.description,
            "reporter_name": inc.reporter_name,
            "is_resolved": inc.is_resolved,
            "resolution_notes": inc.resolution_notes,
            "created_at": inc.created_at.isoformat() if inc.created_at else None
        }
        for inc in incidents
    ]

@router.post("/incidents", status_code=status.HTTP_201_CREATED)
async def report_incident(
    req: IncidentCreateRequest,
    session: AsyncSession = Depends(get_db_session),
    admin: dict = Depends(get_current_admin)
):
    service = AdminService(session)
    inc = await service.create_incident_report(
        title=req.title,
        severity=req.severity,
        category=req.category,
        description=req.description,
        reporter_name=req.reporter_name
    )
    return {
        "id": inc.id,
        "title": inc.title,
        "severity": inc.severity,
        "is_resolved": inc.is_resolved,
        "created_at": inc.created_at.isoformat() if inc.created_at else None
    }

@router.post("/incidents/{incident_id}/resolve")
async def resolve_incident(
    incident_id: str,
    req: IncidentResolveRequest,
    session: AsyncSession = Depends(get_db_session),
    admin: dict = Depends(get_current_admin)
):
    service = AdminService(session)
    inc = await service.resolve_incident(incident_id, req.resolution_notes)
    return {
        "id": inc.id,
        "is_resolved": inc.is_resolved,
        "resolution_notes": inc.resolution_notes
    }

@router.post("/matches/{game_id}/emergency-cancel")
async def emergency_cancel_match(
    game_id: str,
    req: EmergencyCancelRequest,
    session: AsyncSession = Depends(get_db_session),
    admin: dict = Depends(get_current_admin)
):
    service = AdminService(session)
    game = await service.emergency_cancel_match(
        game_id=game_id,
        reason=req.reason,
        admin_name=req.admin_name
    )
    return {
        "game_id": game.id,
        "status": game.status,
        "message": "بازی مچ‌میکینگ با موفقیت لغو شد و وجه بازیکنان به کیف پول آن‌ها مسترد گردید."
    }

@router.post("/audit-logs", status_code=status.HTTP_201_CREATED)
async def record_audit_log(
    req: AuditLogCreateRequest,
    session: AsyncSession = Depends(get_db_session),
    admin: dict = Depends(get_current_admin)
):
    service = AdminService(session)
    log = await service.record_audit_log(
        admin_name=req.admin_name,
        action=req.action,
        target_type=req.target_type,
        target_id=req.target_id,
        details=req.details
    )
    await session.commit()
    return {"id": log.id, "status": "LOGGED"}

@router.get("/audit-logs")
async def list_audit_logs(
    limit: int = 100,
    session: AsyncSession = Depends(get_db_session),
    admin: dict = Depends(get_current_admin)
):
    service = AdminService(session)
    logs = await service.get_audit_logs(limit=limit)
    return [
        {
            "id": l.id,
            "admin_name": l.admin_name,
            "action": l.action,
            "target_type": l.target_type,
            "target_id": l.target_id,
            "details": l.details,
            "timestamp": l.timestamp.isoformat() if l.timestamp else None
        }
        for l in logs
    ]
