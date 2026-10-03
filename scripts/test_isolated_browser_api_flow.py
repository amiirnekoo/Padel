import sys
import os
import uuid
import asyncio
from datetime import date, datetime, timedelta, timezone

sys.stdout.reconfigure(encoding='utf-8')

print("="*70)
print("🧪 آزمون سناریوی کامل کاربر (ورود، توکن، رزرو، پرداخت کیف پول و رسید)")
print("   بر روی پایگاه داده ایزوله PostgreSQL 16 با مدل‌های کامل")
print("="*70)

import paramiko
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect("213.176.121.117", port=22, username="root", password="655crYvKR5", timeout=10)

# Create isolated test DB
client.exec_command('docker exec -i rally_postgres psql -U padel_user -d postgres -c "DROP DATABASE IF EXISTS padel_test_user_flow_pg16;"')
client.exec_command('docker exec -i rally_postgres psql -U padel_user -d postgres -c "CREATE DATABASE padel_test_user_flow_pg16;"')

flow_runner_script = '''
import sys
import uuid
import asyncio
from datetime import date, datetime, timedelta, timezone
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy import select

from backend.app.models.base import Base
from backend.app.models.user import User
from backend.app.models.club import Club, Court
from backend.app.models.slot import TimeSlot
from backend.app.models.booking import Booking
from backend.app.models.wallet import Wallet, WalletTransaction
from backend.app.services.wallet_service import WalletService
from backend.app.services.booking_service import BookingService
from backend.app.core.security import create_access_token, verify_password, get_password_hash

PG_URL = "postgresql+asyncpg://padel_user:padel_secret_password_2026@db:5432/padel_test_user_flow_pg16"
engine = create_async_engine(PG_URL, echo=False)
session_factory = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

async def test_full_user_flow():
    # 1. Create schema
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("1. ساختار کامل جداول با تمامی فیلدها (email, preferred_sport, dominant_hand) ایجاد شد.")

    # 2. Register User & Issue Token
    test_phone = f"0912{uuid.uuid4().int % 10000000:07d}"
    test_password = "SecurePassword2026!"
    hashed_pwd = get_password_hash(test_password)
    user_id = str(uuid.uuid4())

    async with session_factory() as s:
        user = User(
            id=user_id,
            phone_number=test_phone,
            email="athlete@padel.ir",
            full_name="ورزشکار حرفه‌ای",
            password_hash=hashed_pwd,
            preferred_sport="PADEL",
            dominant_hand="RIGHT",
            role="PLAYER"
        )
        s.add(user)
        # Give initial balance for testing
        wallet = Wallet(id=str(uuid.uuid4()), user_id=user_id, balance=3000000)
        s.add(wallet)

        club = Club(id="club-flow-1", name="مجموعه پدل FGB انقلاب", address="خیابان سئول", phone="02126700000")
        s.add(club)
        court = Court(id="court-flow-1", club_id=club.id, name="کورت سنترال")
        s.add(court)
        slot = TimeSlot(
            id="slot-flow-1",
            court_id=court.id,
            slot_date=date.today() + timedelta(days=1),
            start_time=datetime.now().time(),
            end_time=datetime.now().time(),
            price=2400000,
            status="AVAILABLE"
        )
        s.add(slot)
        await s.commit()

    token = create_access_token(subject=user_id, role="PLAYER")
    print(f"2. کاربر با شماره {test_phone} ثبت و توکن احراز هویت با موفقیت صادر شد:")
    print(f"   Bearer {token[:25]}... (طول: {len(token)})")

    # 3. Check Wallet Balance with Token
    async with session_factory() as s:
        w_res = await s.execute(select(Wallet).where(Wallet.user_id == user_id))
        w = w_res.scalar_one()
        print(f"3. مانده کیف پول احراز شده: {w.balance:,} ریال ({w.balance // 10:,} تومان)")
        assert w.balance == 3000000

    # 4. Hold Slot (قفل موقت ۱۰ دقیقه‌ای)
    async with session_factory() as s:
        booking = await BookingService.hold_slot(s, "slot-flow-1", user_id)
        await s.commit()
        print(f"4. سانس با موفقیت قفل اتمیک شد:")
        print(f"   شناسه رزرو موقت: {booking.id}")
        print(f"   وضعیت: {booking.status}")
        assert booking.status == "PENDING_PAYMENT"

    # 5. Pay with Wallet (تسویه آنی با کیف پول)
    async with session_factory() as s:
        confirmed_booking = await WalletService.pay_booking_with_wallet(
            s, user_id=user_id, slot_id="slot-flow-1", booking_id=booking.id
        )
        await s.commit()
        print(f"5. پرداخت با موجودی کیف پول انجام شد:")
        print(f"   وضعیت رزرو: {confirmed_booking.status}")
        print(f"   روش پرداخت: {confirmed_booking.payment_method}")
        print(f"   کد رهگیری صادرشده: {confirmed_booking.tracking_code}")
        assert confirmed_booking.status == "CONFIRMED"
        assert confirmed_booking.payment_method == "WALLET"

    # 6. Verify Final Receipt and State
    async with session_factory() as s:
        # Check slot is booked
        s_res = await s.execute(select(TimeSlot).where(TimeSlot.id == "slot-flow-1"))
        sl = s_res.scalar_one()
        assert sl.status == "BOOKED"

        # Check wallet deducted exactly 2,400,000
        w_res2 = await s.execute(select(Wallet).where(Wallet.user_id == user_id))
        w_final = w_res2.scalar_one()
        print(f"6. رسید قطعی صادر گردید:")
        print(f"   کد پیگیری: {confirmed_booking.tracking_code}")
        print(f"   مبلغ کسر شده: ۲٬۴۰۰٬۰۰۰ ریال")
        print(f"   مانده نهایی کیف پول: {w_final.balance:,} ریال (از ۳,۰۰۰,۰۰۰ اولیه)")
        assert w_final.balance == 600000

    await engine.dispose()
    print("\\n✅ تمام ۶ مرحله جریان واقعی کاربر با موفقیت ۱۰۰٪ تأیید و مستند شد.")

asyncio.run(test_full_user_flow())
'''

stdin, stdout, stderr = client.exec_command("docker exec -i rally_backend python -u -")
stdin.write(flow_runner_script)
stdin.close()

out = stdout.read().decode('utf-8')
err = stderr.read().decode('utf-8')

print(out)
if err and "warning" not in err.lower() and "deprecated" not in err.lower():
    print("ERR:", err)

# Cleanup isolated test db
client.exec_command('docker exec -i rally_postgres psql -U padel_user -d postgres -c "DROP DATABASE IF EXISTS padel_test_user_flow_pg16;"')
client.close()
