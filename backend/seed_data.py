import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

import asyncio
from datetime import date, time, datetime, timedelta
from sqlalchemy import select
from backend.app.models.base import engine, Base, async_session_factory
from backend.app.models.user import User
from backend.app.models.club import Club, Court
from backend.app.models.slot import TimeSlot
from backend.app.models.wallet import Wallet, WalletTransaction
from backend.app.models.coach import CoachProfile

async def seed():
    print("⏳ در حال ایجاد جداول و تزریق داده‌های واقعی پلتفرم پدل ایران...")

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session_factory() as session:
        # 1. Seed Users
        existing_user = await session.execute(select(User).where(User.id == "user-1"))
        if existing_user.scalar_one_or_none():
            print("✔️ داده‌های پیش‌فرض از قبل در دیتابیس موجود است.")
            return

        user_player = User(
            id="user-1",
            phone_number="09121111111",
            full_name="امیرحسین نیکوزاده",
            role="PLAYER",
            city="تهران",
            province="تهران",
            skill_level="INTERMEDIATE",
            tags="VIP_PLAYER"
        )
        session.add(user_player)

        user_operator = User(
            id="op-1",
            phone_number="09122222222",
            full_name="علی متصدی باجه",
            role="CLUB_OPERATOR",
            club_id="club-enghelab",
            city="تهران"
        )
        session.add(user_operator)

        user_owner = User(
            id="owner-1",
            phone_number="09123333333",
            full_name="سهراب مدیر مجموعه",
            role="CLUB_MANAGER",
            city="تهران"
        )
        session.add(user_owner)

        user_coach = User(
            id="coach-1",
            phone_number="09124444444",
            full_name="کامیار صمیمی",
            role="COACH",
            city="تهران",
            skill_level="PRO"
        )
        session.add(user_coach)

        coach_profile = CoachProfile(
            id="cp-1",
            user_id="coach-1",
            certification_id="FIP-LEVEL-2",
            sport_types="PADEL,TENNIS",
            bio="سرمربی رسمی فدراسیون و قهرمان لیگ برتر پدل",
            hourly_rate=1500000,
            is_verified=True
        )
        session.add(coach_profile)

        # 2. Seed Wallet with pre-funded balance for user-1
        wallet = Wallet(
            id="w-1",
            user_id="user-1",
            balance=50000000,  # 5,000,000 Tomans
            currency="IRR",
            is_locked=False
        )
        session.add(wallet)

        tx_initial = WalletTransaction(
            id="tx-init-1",
            wallet_id="w-1",
            amount=50000000,
            transaction_type="CREDIT",
            category="TOPUP",
            reference_id="INIT_SHAPARAK_99",
            description="شارژ اولیه هدیه خوش‌آمدگویی و موجودی تست"
        )
        session.add(tx_initial)

        # 3. Seed Clubs
        clubs_data = [
            {
                "id": "club-enghelab",
                "name": "مجموعه ورزشی پدل و تنیس انقلاب تهران",
                "city": "تهران",
                "province": "تهران",
                "address": "خیابان ولیعصر، اتوبان نیایش، مجموعه فرهنگی ورزشی انقلاب",
                "phone": "02122001100",
                "sports_supported": "PADEL,TENNIS",
                "default_hourly_rate": 24000000,
                "amenities": "پارکینگ اختصاصی، کافه رستوران، رختکن VIP، نورافکن استاندارد جهانی",
                "approval_status": "APPROVED",
                "is_active": True,
                "iban": "IR880120000000001234567801"
            },
            {
                "id": "club-spin-shiraz",
                "name": "کلوپ تخصصی پدل اسپین شیراز",
                "city": "شیراز",
                "province": "فارس",
                "address": "شیراز، بلوار چمران، خیابان شاهد، کوچه ۸",
                "phone": "07136224455",
                "sports_supported": "PADEL",
                "default_hourly_rate": 20000000,
                "amenities": "کافه تریا، فروشگاه راکت و تجهیزات پدل، مربیان مقیم",
                "approval_status": "APPROVED",
                "is_active": True,
                "iban": "IR880120000000001234567802"
            },
            {
                "id": "club-parvaz-isfahan",
                "name": "آکادمی تنیس و پدل پرواز اصفهان",
                "city": "اصفهان",
                "province": "اصفهان",
                "address": "اصفهان، خیابان مشتاق سوم، مجموعه پرواز",
                "phone": "03132667788",
                "sports_supported": "PADEL,TENNIS",
                "default_hourly_rate": 18000000,
                "amenities": "زمین روباز و سرپوشیده، پارکینگ، سالن بدنسازی مجهز",
                "approval_status": "APPROVED",
                "is_active": True,
                "iban": "IR880120000000001234567803"
            },
            {
                "id": "club-kish-padel",
                "name": "مرکز بین‌المللی پدل کیش",
                "city": "کیش",
                "province": "هرمزگان",
                "address": "جزیره کیش، میدان سنایی، بلوار ساحل",
                "phone": "07644421100",
                "sports_supported": "PADEL",
                "default_hourly_rate": 28000000,
                "amenities": "زمین‌های پانورامیک شیشه‌ای، منظره دریا، رختکن لوکس",
                "approval_status": "APPROVED",
                "is_active": True,
                "iban": "IR880120000000001234567804"
            },
            {
                "id": "club-lafour",
                "name": "باشگاه پدل لفور (Lafour Club)",
                "city": "تهران",
                "province": "تهران",
                "address": "تهران، منطقه ۱، اقدسیه / آجودانیه، مجتمع تفریحی ورزشی لفور",
                "phone": "02126110000",
                "sports_supported": "PADEL",
                "default_hourly_rate": 30000000,
                "amenities": "کورت سوپر پانورامیک روباز، کافه رستوران اختصاصی، پارکینگ ولت، رختکن VIP",
                "approval_status": "APPROVED",
                "is_active": True,
                "iban": "IR880120000000001234567805"
            }
        ]

        for c in clubs_data:
            session.add(Club(**c))

        # 4. Seed Courts
        courts_data = [
            {"id": "court-eng-1", "club_id": "club-enghelab", "name": "کورت سنترال پدل (انقلاب)", "sport_type": "PADEL", "is_indoor": True},
            {"id": "court-eng-2", "club_id": "club-enghelab", "name": "کورت ۲ پدل روباز (انقلاب)", "sport_type": "PADEL", "is_indoor": False},
            {"id": "court-laf-1", "club_id": "club-lafour", "name": "کورت ۱ روباز پانورامیک (لفور)", "sport_type": "PADEL", "is_indoor": False},
            {"id": "court-eng-3", "club_id": "club-enghelab", "name": "کورت تنیس شماره ۱ خاکی", "sport_type": "TENNIS", "is_indoor": False},
            {"id": "court-shz-1", "club_id": "club-spin-shiraz", "name": "کورت ۱ پانورامیک اسپین", "sport_type": "PADEL", "is_indoor": True},
            {"id": "court-isf-1", "club_id": "club-parvaz-isfahan", "name": "کورت پدل شماره ۱ پرواز", "sport_type": "PADEL", "is_indoor": True},
            {"id": "court-kish-1", "club_id": "club-kish-padel", "name": "کورت سنترال کیش", "sport_type": "PADEL", "is_indoor": False},
        ]
        for ct in courts_data:
            session.add(Court(**ct))

        # 5. Seed Slots for today and tomorrow
        today = date.today()
        tomorrow = today + timedelta(days=1)
        slot_hours = [
            (time(8, 0), time(9, 30), 18000000),
            (time(9, 30), time(11, 0), 18000000),
            (time(16, 30), time(18, 0), 22000000),
            (time(18, 0), time(19, 30), 25000000),
            (time(19, 30), time(21, 0), 25000000),
            (time(21, 0), time(22, 30), 22000000),
        ]

        slot_count = 0
        for slot_day in [today, tomorrow]:
            for ct in courts_data:
                for idx, (st, et, price) in enumerate(slot_hours):
                    slot_count += 1
                    s_id = f"slot-{ct['id']}-{slot_day.strftime('%d')}-{idx}"
                    # Make some slots booked for realistic preview
                    status = "BOOKED" if (idx == 1 and slot_day == today and ct['id'] == "court-eng-1") else "AVAILABLE"
                    session.add(TimeSlot(
                        id=s_id,
                        court_id=ct["id"],
                        slot_date=slot_day,
                        start_time=st,
                        end_time=et,
                        price=price,
                        status=status
                    ))

        await session.commit()
        print(f"✅ مقداردهی اولیه با موفقیت انجام شد:")
        print(f"   - {len(clubs_data)} باشگاه در شهرهای تهران، شیراز، اصفهان، کیش")
        print(f"   - {len(courts_data)} کورت پدل و تنیس")
        print(f"   - {slot_count} سانس فعال برای امروز و فردا")
        print(f"   - کاربر {user_player.phone_number} با موجودی کیف پول ۵ میلیون تومان")

if __name__ == "__main__":
    asyncio.run(seed())
