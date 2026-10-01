import asyncio
import os
import sys
from datetime import datetime, date

# Ensure root directory is on PYTHONPATH
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from sqlalchemy import select
from backend.app.models.base import Base, engine, async_session_factory
from backend.app.models.product import ProductCategory, Product, ProductImage
from backend.app.models.content import ArticleCategory, Article, SiteBanner
from backend.app.models.tournament import Tournament, PlayerRanking
from backend.app.models.admin_user import AdminUser
from backend.app.core.security import get_password_hash
from backend.app.services.shop_service import CATALOG_PRODUCTS


async def seed_data():
    print("🚀 Starting Raally Production Seed Migration...")

    async with engine.begin() as conn:
        print("Creating all database tables if not exist...")
        await conn.run_sync(Base.metadata.create_all)

    async with async_session_factory() as session:
        # 1. Product Categories
        categories_data = [
            {"id": "cat-padel-rackets", "name": "راکت‌های پدل", "name_en": "Padel Rackets", "slug": "padel-rackets", "icon": "Flame", "display_order": 1},
            {"id": "cat-tennis-rackets", "name": "راکت‌های تنیس", "name_en": "Tennis Rackets", "slug": "tennis-rackets", "icon": "Sparkles", "display_order": 2},
            {"id": "cat-balls", "name": "توپ پدل و تنیس", "name_en": "Balls", "slug": "balls", "icon": "CircleDot", "display_order": 3},
            {"id": "cat-accessories", "name": "لوازم جانبی و اورگریپ", "name_en": "Accessories", "slug": "accessories", "icon": "Layers", "display_order": 4},
            {"id": "cat-bags", "name": "ساک و کیف مسافرتی کورت", "name_en": "Bags", "slug": "bags", "icon": "Briefcase", "display_order": 5},
            {"id": "cat-shoes", "name": "کفش تخصصی پدل و تنیس", "name_en": "Shoes", "slug": "shoes", "icon": "Footprints", "display_order": 6},
        ]

        for cat in categories_data:
            existing = await session.get(ProductCategory, cat["id"])
            if not existing:
                session.add(ProductCategory(**cat))
        await session.commit()
        print("✅ Product categories seeded.")

        # 2. Seed Flagship & Catalog Products
        category_map = {
            "PADEL_RACKET": "cat-padel-rackets",
            "TENNIS_RACKET": "cat-tennis-rackets",
            "BALLS": "cat-balls",
            "ACCESSORIES": "cat-accessories",
            "BAGS": "cat-bags",
            "SHOES": "cat-shoes",
        }

        # 2.1 Flagship NOX AT10 18K 2026
        flagship_id = "nox-at10-genius-18k-2026"
        existing_flagship = await session.get(Product, flagship_id)
        if not existing_flagship:
            flagship = Product(
                id=flagship_id,
                title_fa="راکت پدل نوکس مدل AT10 Luxury Genius 18K Alum ۲۰۲۶ آگوستین تاپیا",
                title_en="NOX AT10 Luxury Genius 18K Alum by Agustín Tapia 2026",
                slug="nox-at10-luxury-genius-18k-alum-2026",
                category_id="cat-padel-rackets",
                brand="NOX",
                model_year=2026,
                sport="PADEL",
                level="PRO",
                original_price=24500000,
                discount_percent=8,
                price=22540000,
                stock=14,
                is_in_stock=True,
                is_new=True,
                is_featured=True,
                rating=4.98,
                review_count=64,
                primary_image="/images/products/nox/nox-at10-genius-18k-2026/1.jpg",
                description_fa="شاهکار شماره یک پدل جهان در سال ۲۰۲۶؛ راکت رسمی آگوستین تاپیا با فناوری انحصاری الیاف کربن ۱۸K آلومینیوم‌دار که تغییرات دمایی تاثیری در انعطاف آن ندارد. مجهز به کانال‌های هوای EOS Flap جهت افزایش ۱۵ درصدی سرعت حرکت دست و گریپ آنتی‌ویبریشن نوکس.",
                description_en="The official 2026 signature racket of Agustin Tapia featuring aluminized 18K carbon fiber, EOS flap lateral aerodynamic channels, and Custom Grip vibration absorption.",
                specs={
                    "weight": "360-375 گرم",
                    "balance": "متعادل (Even Balance)",
                    "shape": "اشکی قطره‌ای (Teardrop)",
                    "surface": "کربن ۱۸K آلومینایز بافت‌دار زبر 3D Rough",
                    "core": "فوم هوشمند چندلایه MLD Black EVA",
                    "power_index": 9.2,
                    "control_index": 10.0,
                    "series": "Luxury Series 2026",
                    "player_signature": "Agustín Tapia"
                },
                technologies=[
                    {"name": "Carbon 18K Alum", "desc": "الیاف کربن آلومینایز شده مقاوم در برابر تغییرات دمایی"},
                    {"name": "EOS Flap", "desc": "دریچه‌های آیرودینامیک جانبی برای چابکی سویینگ"},
                    {"name": "Pulse System", "desc": "نوارهای الاستومر جاذب ارتعاش در شفت راکت"},
                    {"name": "Smartstrap", "desc": "بند مچی امنیتی با قابلیت تعویض سریع و بهداشتی"}
                ]
            )
            session.add(flagship)
            await session.flush()

            # Add images 1 to 15
            for i in range(1, 16):
                session.add(ProductImage(
                    product_id=flagship_id,
                    image_url=f"/images/products/nox/nox-at10-genius-18k-2026/{i}.jpg",
                    alt_text=f"نمای شماره {i} راکت پدل ناکس AT10 Genius 18K 2026",
                    display_order=i,
                    is_primary=(i == 1)
                ))

        # 2.2 Seed all catalog products
        for cp in CATALOG_PRODUCTS:
            prod_id = cp["id"]
            existing_prod = await session.get(Product, prod_id)
            if not existing_prod:
                cat_id = category_map.get(cp.get("category", "PADEL_RACKET"), "cat-padel-rackets")
                product_obj = Product(
                    id=prod_id,
                    title_fa=cp["name_fa"],
                    title_en=cp["name_en"],
                    slug=prod_id,
                    category_id=cat_id,
                    brand=cp["brand"],
                    model_year=2025,
                    sport=cp.get("sport", "PADEL"),
                    level=cp.get("level", "PRO"),
                    original_price=cp.get("original_price", cp["price"]),
                    discount_percent=cp.get("discount_percent", 0),
                    price=cp["price"],
                    stock=cp.get("stock", 10),
                    is_in_stock=True,
                    is_new=False,
                    is_featured=(cp.get("rating", 4.5) >= 4.9),
                    rating=cp.get("rating", 4.9),
                    review_count=cp.get("reviews_count", 20),
                    primary_image=cp.get("image_url", "/images/padel_racket.jpg"),
                    description_fa=cp.get("description", cp["name_fa"]),
                    specs={
                        "weight": cp.get("weight"),
                        "balance": cp.get("balance"),
                        "shape": cp.get("shape"),
                        "surface": cp.get("surface"),
                        "core": cp.get("core"),
                        "power_index": cp.get("power_index", 9.0),
                        "control_index": cp.get("control_index", 9.0)
                    }
                )
                session.add(product_obj)
                await session.flush()

                session.add(ProductImage(
                    product_id=prod_id,
                    image_url=cp.get("image_url", "/images/padel_racket.jpg"),
                    alt_text=cp["name_fa"],
                    display_order=1,
                    is_primary=True
                ))

        await session.commit()
        print("✅ Products & images seeded.")

        # 3. Seed Article Categories & Articles
        art_cats = [
            {"id": "cat-national-team", "title": "تیم ملی ایران", "slug": "national-team", "display_order": 1},
            {"id": "cat-tutorial", "title": "آموزش و تکنیک", "slug": "tutorial", "display_order": 2},
            {"id": "cat-world-padel", "title": "پدل جهان", "slug": "world-padel", "display_order": 3},
            {"id": "cat-events", "title": "رویدادها و تورنمنت‌ها", "slug": "events", "display_order": 4},
        ]
        for ac in art_cats:
            existing = await session.get(ArticleCategory, ac["id"])
            if not existing:
                session.add(ArticleCategory(**ac))
        await session.commit()

        articles_data = [
            {
                "id": "news-1",
                "title": "اردوی آماده‌سازی تیم ملی پدل آقایان در جزیره کیش با مربیان ارشد بین‌المللی",
                "slug": "iran-national-padel-camp-kish",
                "summary": "ملی‌پوشان پدل کشور در کمپ اختصاصی المپیک کیش آخرین مراحل بدنسازی تاکتیکی و مسابقات درون‌اردویی را برای اعزام به مسابقات مقدماتی قهرمانی آسیا پشت سر می‌گذارند.",
                "content_html": "<p>اردوی آماده‌سازی تیم ملی پدل بزرگسالان ایران با حضور ۱۲ بازیکن برگزیده رنکینگ کشوری در کورت‌های پدل مجموعه المپیک کیش آغاز شد.</p><p>تمرکز کادر فنی در این مرحله بر روی رالی‌های پرفشار بالای ۲۰ ضربه، بازی ترکیبی با شیشه‌های انتهایی و استراتژی چرخش سریع در منطقه تهاجمی تور (Net Zone) قرار دارد.</p>",
                "cover_image": "/images/news/news_national_team.jpg",
                "author_name": "روابط عمومی رالی پدل",
                "category_id": "cat-national-team",
                "reading_time_minutes": 4,
                "view_count": 840,
                "is_published": True
            },
            {
                "id": "news-2",
                "title": "تکنیک ضربه باندخا (Bandeja): ستون فقرات دفاع و ضدحمله تاکتیکی در پدل مدرن",
                "slug": "bandeja-technique-guide",
                "summary": "چرا باندخا مهم‌ترین ضربه دفاعی تهاجمی در پدل است و چگونه با رعایت زاویه راکت مانع از جهش بلند توپ پس از برخورد با شیشه عقب شویم؟",
                "content_html": "<p>بر خلاف تنیس که ضربه اسمش همواره با هدف تمام کردن امتیاز نواخته می‌شود، در پدل ضربه باندخا با هدف حفظ منطقه تور و فرستادن توپ با چرخش برشی عمیق اجرا می‌شود.</p><p>مهم‌ترین اصل در ضربه باندخا، ایستادن نیم‌رخ به تور، بالا نگه داشتن آرنج دست غالب هم‌سطح با شانه و ضربه زدن به توپ در ارتفاع سر است.</p>",
                "cover_image": "/images/news/news_technique.jpg",
                "author_name": "آکادمی مربیان رالی",
                "category_id": "cat-tutorial",
                "reading_time_minutes": 5,
                "view_count": 1250,
                "is_published": True
            },
            {
                "id": "news-3",
                "title": "تحلیل فینال جذاب تور جهانی پرمیر پدل: قدرت بی‌پایان زوج کوئلو و تاپیا",
                "slug": "premier-padel-final-analysis-coello-tapia",
                "summary": "بررسی فنی پیروزی مقتدرانه شماره یک‌های جهان در فینال مادرید و بررسی آمار اعجاب‌انگیز ریکاوری توپ‌های سخت از خارج کورت.",
                "content_html": "<p>آرتورو کوئلو و آگوستین تاپیا بار دیگر نشان دادند که هارمونی چپ‌دست و راست‌دست با پوشش هندسی زمین می‌تواند هر دفاع مستحکمی را متلاشی کند.</p>",
                "cover_image": "/images/news/news_world_padel.jpg",
                "author_name": "سرویس بین‌الملل رالی",
                "category_id": "cat-world-padel",
                "reading_time_minutes": 3,
                "view_count": 920,
                "is_published": True
            }
        ]

        for art in articles_data:
            existing = await session.get(Article, art["id"])
            if not existing:
                session.add(Article(**art))
        await session.commit()
        print("✅ Articles seeded.")

        # 4. Seed Tournaments
        tournaments_data = [
            {
                "id": "tour-king-of-court-2026",
                "title": "تورنمنت پادشاه زمین (King of the Court 2026)",
                "slug": "king-of-court-2026",
                "subtitle": "فرمت سریع و پویا — رقابت نفس‌گیر تیم‌ها برای فتح زمین شماره یک",
                "cover_image": "/images/tournaments/king_of_court_2026.jpg",
                "sport_type": "PADEL",
                "tournament_format": "KING_OF_COURT",
                "gender": "MEN",
                "level": "ADVANCED",
                "status": "REGISTRATION_OPEN",
                "venue_name": "مجموعه پدل سنترال انقلاب تهران",
                "venue_address": "تهران، خیابان سئول، مجموعه ورزشی انقلاب",
                "start_date": date(2026, 10, 15),
                "end_date": date(2026, 10, 17),
                "entry_fee": 1800000,
                "prize_pool": "۵۰,۰۰۰,۰۰۰ تومان جایزه نقدی + راکت NOX 2026",
                "max_teams": 24,
                "registered_teams_count": 18,
                "rules_summary": "فرمت King of the Court: تیم‌ها در تایم‌های ۱۵ دقیقه‌ای رقابت می‌کنند؛ تیمی که امتیاز بیشتری در کورت پادشاه بیاورد صعود می‌کند."
            },
            {
                "id": "tour-rulo-adineh-2026",
                "title": "کاپ رولو آدینه پدل (Rulo Weekend Cup)",
                "slug": "rulo-weekend-cup-2026",
                "subtitle": "جام هفتگی جمعه‌ها مخصوص بازیکنان سطح متوسط و پیشرفته",
                "cover_image": "/images/tournaments/rulo_weekend_cup_2026.jpg",
                "sport_type": "PADEL",
                "tournament_format": "RULO_ADINEH",
                "gender": "OPEN",
                "level": "INTERMEDIATE",
                "status": "REGISTRATION_OPEN",
                "venue_name": "باشگاه پدل آرنا ولنجک",
                "venue_address": "تهران، انتهای ولنجک، بام تهران",
                "start_date": date(2026, 10, 24),
                "end_date": date(2026, 10, 24),
                "entry_fee": 1200000,
                "prize_pool": "۲۰,۰۰۰,۰۰۰ تومان + بن خرید تجهیزات رالی",
                "max_teams": 16,
                "registered_teams_count": 12,
                "rules_summary": "برگزاری در یک روز جمعه، جدول دوحذفی تضمینی حداقل ۲ مسابقه برای هر تیم."
            },
            {
                "id": "tour-mel-moj-league-2026",
                "title": "لیگ مل اند موج پدل (Mel & Moj Premier League)",
                "slug": "mel-moj-premier-league-2026",
                "subtitle": "بزرگترین لیگ باشگاهی کشور با پخش زنده و رنکینگ رسمی",
                "cover_image": "/images/tournaments/mel_moj_league_2026.jpg",
                "sport_type": "PADEL",
                "tournament_format": "LEAGUE_MELE_MOJ",
                "gender": "MEN",
                "level": "PRO",
                "status": "IN_PROGRESS",
                "venue_name": "مجموعه پدل مل اند موج نیاوران",
                "venue_address": "تهران، نیاوران، خیابان باهنر",
                "start_date": date(2026, 9, 1),
                "end_date": date(2026, 11, 30),
                "entry_fee": 4500000,
                "prize_pool": "۱۵۰,۰۰۰,۰۰۰ تومان جایزه نقدی تیم‌های برتر",
                "max_teams": 12,
                "registered_teams_count": 12,
                "rules_summary": "مسابقات رفت و برگشت هفتگی، سیستم امتیازدهی رسمی FIP."
            }
        ]

        for t in tournaments_data:
            existing = await session.get(Tournament, t["id"])
            if not existing:
                session.add(Tournament(**t))
        await session.commit()
        print("✅ Tournaments seeded.")

        # 5. Seed Player Rankings
        rankings_data = [
            {"player_name": "فرساد شاهی", "category": "MEN_PRO", "rank": 1, "points": 2450, "tournaments_played": 14, "matches_won": 42, "matches_lost": 6, "win_rate": 87.5},
            {"player_name": "امیرمحمد جمشیدی", "category": "MEN_PRO", "rank": 2, "points": 2280, "tournaments_played": 15, "matches_won": 38, "matches_lost": 7, "win_rate": 84.4},
            {"player_name": "سهراب درفشی", "category": "MEN_PRO", "rank": 3, "points": 2190, "tournaments_played": 13, "matches_won": 35, "matches_lost": 8, "win_rate": 81.3},
            {"player_name": "مازیار یاوری", "category": "MEN_PRO", "rank": 4, "points": 1940, "tournaments_played": 12, "matches_won": 30, "matches_lost": 9, "win_rate": 76.9},
            {"player_name": "آریا حیدری", "category": "MEN_PRO", "rank": 5, "points": 1820, "tournaments_played": 11, "matches_won": 27, "matches_lost": 8, "win_rate": 77.1},
        ]

        for r in rankings_data:
            q = await session.execute(
                select(PlayerRanking).where(PlayerRanking.player_name == r["player_name"])
            )
            existing = q.scalars().first()
            if not existing:
                session.add(PlayerRanking(**r))
        await session.commit()
        print("✅ Player rankings seeded.")

        # 6. Seed Site Banners
        banners_data = [
            {
                "title": "تورنمنت بزرگ King of the Court ۲۰۲۶",
                "subtitle": "هم‌اکنون در پدل سنترال انقلاب؛ سریع، مهیج و بدون توقف",
                "image_url": "/images/tournaments/king_of_court_2026.jpg",
                "link_url": "/tournaments/king-of-court-2026",
                "button_text": "مشاهده و ثبت‌نام تیم",
                "banner_type": "HERO_SLIDER",
                "display_order": 1,
                "is_active": True
            },
            {
                "title": "راکت اختصاصی آگوستین تاپیا ۲۰۲۶",
                "subtitle": "عرضه انحصاری NOX AT10 18K Alum با گارانتی رسمی رالی",
                "image_url": "/images/products/nox/nox-at10-genius-18k-2026/1.jpg",
                "link_url": "/shop/product/nox-at10-genius-18k-2026",
                "button_text": "خرید با تخفیف ویژه",
                "banner_type": "SHOP_TOP",
                "display_order": 2,
                "is_active": True
            }
        ]

        for b in banners_data:
            q = await session.execute(
                select(SiteBanner).where(SiteBanner.title == b["title"])
            )
            existing = q.scalars().first()
            if not existing:
                session.add(SiteBanner(**b))
        await session.commit()
        print("✅ Site banners seeded.")

        # 7. Seed Admin Users
        admin_accounts = [
            {
                "username": "Nimadvr",
                "password_hash": get_password_hash("kirtookoonesadati"),
                "full_name": "نیما داوری",
                "email": "nima@raally.ir",
                "role": "OPERATIONS_ADMIN",
                "is_active": True
            },
            {
                "username": "superadmin",
                "password_hash": get_password_hash("SuperAdmin@Raally2026!"),
                "full_name": "مدیر ارشد پلتفرم رالی",
                "email": "admin@raally.ir",
                "role": "SUPER_ADMIN",
                "is_active": True
            }
        ]

        for acc in admin_accounts:
            q = await session.execute(
                select(AdminUser).where(AdminUser.username == acc["username"])
            )
            existing = q.scalars().first()
            if not existing:
                session.add(AdminUser(**acc))
            else:
                # Update password hash to secure bcrypt hash
                existing.password_hash = acc["password_hash"]
                existing.role = acc["role"]
                existing.full_name = acc["full_name"]
        await session.commit()
        print("✅ Admin users seeded with secure bcrypt hashes.")

    print("🎉 Raally Production Seed Migration completed successfully!")


if __name__ == "__main__":
    asyncio.run(seed_data())
