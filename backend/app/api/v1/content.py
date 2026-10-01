from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from backend.app.models.base import get_db_session
from backend.app.models.content import Article, ArticleCategory, SiteBanner
from backend.app.models.tournament import Tournament, PlayerRanking

router = APIRouter(prefix="/content", tags=["Content & CMS"])


@router.get("/articles")
async def list_articles(
    category_id: Optional[str] = None,
    limit: int = Query(20, ge=1, le=100),
    offset: int = 0,
    session: AsyncSession = Depends(get_db_session)
):
    """لیست مقالات، اخبار و تحلیل‌های پدل با قابلیت فیلتر بر اساس دسته‌بندی"""
    query = select(Article).where(Article.is_published == True).order_by(desc(Article.published_at))
    if category_id:
        query = query.where(Article.category_id == category_id)
    query = query.offset(offset).limit(limit)
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
            "published_at": a.published_at.isoformat() if a.published_at else None
        }
        for a in articles
    ]


@router.get("/articles/{slug_or_id}")
async def get_article_detail(
    slug_or_id: str,
    session: AsyncSession = Depends(get_db_session)
):
    """مشاهده متن کامل مقاله"""
    stmt = select(Article).where(
        (Article.id == slug_or_id) | (Article.slug == slug_or_id)
    )
    res = await session.execute(stmt)
    article = res.scalar_one_or_none()
    if not article:
        raise HTTPException(status_code=404, detail="مقاله مورد نظر یافت نشد.")

    # Increment view count
    article.view_count += 1
    await session.commit()

    return {
        "id": article.id,
        "title": article.title,
        "slug": article.slug,
        "summary": article.summary,
        "content_html": article.content_html,
        "cover_image": article.cover_image,
        "author_name": article.author_name,
        "category_id": article.category_id,
        "reading_time_minutes": article.reading_time_minutes,
        "view_count": article.view_count,
        "published_at": article.published_at.isoformat() if article.published_at else None
    }


@router.get("/banners")
async def list_banners(
    banner_type: Optional[str] = None,
    session: AsyncSession = Depends(get_db_session)
):
    """لیست بنرهای تبلیغاتی و اسلایدر صفحه اصلی"""
    query = select(SiteBanner).where(SiteBanner.is_active == True).order_by(SiteBanner.display_order)
    if banner_type:
        query = query.where(SiteBanner.banner_type == banner_type)
    res = await session.execute(query)
    banners = res.scalars().all()
    return [
        {
            "id": b.id,
            "title": b.title,
            "subtitle": b.subtitle,
            "image_url": b.image_url,
            "mobile_image_url": b.mobile_image_url,
            "link_url": b.link_url,
            "button_text": b.button_text,
            "banner_type": b.banner_type,
            "display_order": b.display_order
        }
        for b in banners
    ]


@router.get("/tournaments")
async def list_tournaments(
    sport_type: Optional[str] = None,
    status: Optional[str] = None,
    session: AsyncSession = Depends(get_db_session)
):
    """لیست تورنمنت‌ها و مسابقات فعال با قابلیت فیلتر"""
    query = select(Tournament).where(Tournament.is_active == True).order_by(Tournament.start_date)
    if sport_type:
        query = query.where(Tournament.sport_type == sport_type)
    if status:
        query = query.where(Tournament.status == status)
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
            "gender": t.gender,
            "level": t.level,
            "status": t.status,
            "venue_name": t.venue_name,
            "venue_address": t.venue_address,
            "start_date": t.start_date.isoformat(),
            "end_date": t.end_date.isoformat(),
            "entry_fee": t.entry_fee,
            "prize_pool": t.prize_pool,
            "max_teams": t.max_teams,
            "registered_teams_count": t.registered_teams_count,
            "rules_summary": t.rules_summary
        }
        for t in tournaments
    ]


@router.get("/rankings")
async def list_rankings(
    category: str = Query("MEN_PRO", description="دسته‌بندی رنکینگ"),
    session: AsyncSession = Depends(get_db_session)
):
    """لیست بازیکنان برتر و رنکینگ رسمی"""
    query = select(PlayerRanking).where(PlayerRanking.category == category).order_by(PlayerRanking.rank)
    res = await session.execute(query)
    rankings = res.scalars().all()
    return [
        {
            "id": r.id,
            "player_name": r.player_name,
            "avatar_url": r.avatar_url,
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
