import sys
import os
import time
import uuid
import asyncio
import socket
import select as sys_select
import threading
from datetime import date, datetime, timedelta, timezone

sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, os.path.abspath('.'))

# 1. Setup SSH port forwarder to Postgres 16 container (172.18.0.4:5432)
import paramiko

SERVER_IP = "213.176.121.117"
SERVER_USER = "root"
SERVER_PASS = "655crYvKR5"
REMOTE_PG_HOST = "172.18.0.4"
REMOTE_PG_PORT = 5432
LOCAL_PORT = 5433

ssh_client = paramiko.SSHClient()
ssh_client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh_client.connect(SERVER_IP, port=22, username=SERVER_USER, password=SERVER_PASS, timeout=10)

class ForwardServer(threading.Thread):
    def __init__(self, local_port, remote_host, remote_port, transport):
        super().__init__(daemon=True)
        self.local_port = local_port
        self.remote_host = remote_host
        self.remote_port = remote_port
        self.transport = transport
        self.sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        self.sock.bind(('127.0.0.1', self.local_port))
        self.sock.listen(100)
        self.running = True

    def run(self):
        while self.running:
            try:
                client_sock, _ = self.sock.accept()
                chan = self.transport.open_channel(
                    'direct-tcpip',
                    (self.remote_host, self.remote_port),
                    client_sock.getpeername()
                )
                threading.Thread(target=self.handler, args=(client_sock, chan), daemon=True).start()
            except Exception:
                break

    def handler(self, client_sock, chan):
        while True:
            r, _, _ = sys_select.select([client_sock, chan], [], [])
            if client_sock in r:
                data = client_sock.recv(4096)
                if not data: break
                chan.send(data)
            if chan in r:
                data = chan.recv(4096)
                if not data: break
                client_sock.send(data)
        chan.close()
        client_sock.close()

    def stop(self):
        self.running = False
        try:
            self.sock.close()
        except:
            pass

forwarder = ForwardServer(LOCAL_PORT, REMOTE_PG_HOST, REMOTE_PG_PORT, ssh_client.get_transport())
forwarder.start()
time.sleep(1)
print(f"✅ SSH Tunnel established: 127.0.0.1:{LOCAL_PORT} -> {REMOTE_PG_HOST}:{REMOTE_PG_PORT} on PostgreSQL 16")

# 2. Database models & connections
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy import select, update, func
from backend.app.models.base import Base
from backend.app.models.user import User
from backend.app.models.club import Club, Court
from backend.app.models.slot import TimeSlot
from backend.app.models.booking import Booking
from backend.app.models.wallet import Wallet, WalletTransaction
from backend.app.services.wallet_service import WalletService
from backend.app.services.booking_service import BookingService
from backend.app.core.datetime_utils import utc_now

PG_TEST_URL = f"postgresql+asyncpg://padel_user:padel_secret_password_2026@127.0.0.1:{LOCAL_PORT}/padel_test_concurrency_pg16"

engine = create_async_engine(
    PG_TEST_URL,
    pool_size=30,
    max_overflow=20,
    pool_timeout=30,
    echo=False
)
session_factory = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

async def run_all_pg16_tests():
    print("\n" + "="*70)
    print("🚀 شروع آزمون‌های همروندی و تراکنشی روی PostgreSQL 16 واقعی")
    print("="*70)

    # Recreate tables in isolated test database
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    print("📦 جداول دیتابیس در پایگاه داده ایزوله padel_test_concurrency_pg16 ایجاد شدند.")

    # Setup base club and court
    async with session_factory() as setup_session:
        club = Club(id="club-pg16-1", name="باشگاه پروداکشن آزمایشی", address="تهران", phone="02188889999")
        setup_session.add(club)
        court = Court(id="court-pg16-1", club_id=club.id, name="کورت سنترال")
        setup_session.add(court)
        await setup_session.commit()

    # -------------------------------------------------------------
    # سناریو ۱: رقابت همزمان برای رزرو و پرداخت یک سانس واحد
    # -------------------------------------------------------------
    print("\n--- سناریو ۱: رقابت همزمان ۱۰ تراکنش مستقل برای ۱ سانس واحد ---")
    slot_id_1 = "slot-pg16-race-1"
    async with session_factory() as s:
        slot1 = TimeSlot(
            id=slot_id_1,
            court_id="court-pg16-1",
            slot_date=date.today() + timedelta(days=2),
            start_time=(datetime.now(timezone.utc) + timedelta(hours=1)).time(),
            end_time=(datetime.now(timezone.utc) + timedelta(hours=2)).time(),
            price=1500000,
            status="AVAILABLE"
        )
        s.add(slot1)
        users = []
        for i in range(10):
            uid = f"user-pg16-race-{i}"
            u = User(id=uid, phone_number=f"091200000{i:02d}", full_name=f"کاربر رقیب {i}")
            s.add(u)
            w = Wallet(id=f"wallet-pg16-race-{i}", user_id=uid, balance=3000000)
            s.add(w)
            users.append(uid)
        await s.commit()

    async def attempt_pay_slot1(user_id):
        async with session_factory() as session:
            try:
                booking = await WalletService.pay_booking_with_wallet(session, user_id, slot_id_1)
                await session.commit()
                return ("SUCCESS", user_id, booking.id)
            except Exception as e:
                await session.rollback()
                return ("FAILED", user_id, str(e))

    # Fire 10 concurrent requests at the exact same millisecond
    tasks1 = [attempt_pay_slot1(u) for u in users]
    results1 = await asyncio.gather(*tasks1)

    successes1 = [r for r in results1 if r[0] == "SUCCESS"]
    fails1 = [r for r in results1 if r[0] == "FAILED"]
    print(f"نتیجه رقابت برای ۱ سانس: {len(successes1)} موفق | {len(fails1)} مسدود/ناموفق")
    for f in fails1[:3]:
        print(f"  نمونه خطای کنترل‌شده رد درخواست: {f[2]}")

    assert len(successes1) == 1, f"خطای بحرانی: باید دقیقاً ۱ رزرو موفق شود اما {len(successes1)} رزرو شد!"
    assert len(fails1) == 9, "باید دقیقاً ۹ درخواست همزمان دیگر مسدود شوند!"

    async with session_factory() as s:
        s_res = await s.execute(select(TimeSlot).where(TimeSlot.id == slot_id_1))
        checked_slot = s_res.scalar_one()
        assert checked_slot.status == "BOOKED", "وضعیت سانس نهایی باید BOOKED باشد"

        b_res = await s.execute(select(func.count()).select_from(Booking).where(Booking.timeslot_id == slot_id_1))
        b_count = b_res.scalar()
        assert b_count == 1, f"تعداد رزروهای ثبت شده برای سانس: {b_count} (رزرو دوبل صفر نیست!)"

    print("✅ سناریو ۱ با موفقیت ۱۰۰٪ پاس شد: رزرو دوبل = ۰، شکستن همزمانی با اثبات اتمیک در PostgreSQL 16.")

    # -------------------------------------------------------------
    # سناریو ۲: برداشت همزمان از ۱ کیف پول برای سانس‌های متفاوت (بیش از موجودی)
    # -------------------------------------------------------------
    print("\n--- سناریو ۲: برداشت همزمان از یک کیف پول برای سانس‌های مختلف (بیش از موجودی) ---")
    user_id_2 = "user-pg16-multi-slot"
    async with session_factory() as s:
        u2 = User(id=user_id_2, phone_number="09123334455", full_name="کاربر چند سانسی")
        s.add(u2)
        # Balance = 1,000,000 IRR. Slot price = 600,000 IRR each.
        w2 = Wallet(id="wallet-pg16-multi-slot", user_id=user_id_2, balance=1000000)
        s.add(w2)

        slot_ids_2 = []
        for i in range(3):
            sid = f"slot-pg16-multi-{i}"
            slot_ids_2.append(sid)
            sl = TimeSlot(
                id=sid,
                court_id="court-pg16-1",
                slot_date=date.today() + timedelta(days=3),
                start_time=(datetime.now(timezone.utc) + timedelta(hours=i+1)).time(),
                end_time=(datetime.now(timezone.utc) + timedelta(hours=i+2)).time(),
                price=600000,
                status="AVAILABLE"
            )
            s.add(sl)
        await s.commit()

    async def attempt_pay_diff_slot(sid):
        async with session_factory() as session:
            try:
                booking = await WalletService.pay_booking_with_wallet(session, user_id_2, sid)
                await session.commit()
                return ("SUCCESS", sid, booking.id)
            except Exception as e:
                await session.rollback()
                return ("FAILED", sid, str(e))

    # 3 concurrent requests trying to debit 600,000 each (total 1,800,000) from 1,000,000 balance
    tasks2 = [attempt_pay_diff_slot(sid) for sid in slot_ids_2]
    results2 = await asyncio.gather(*tasks2)

    successes2 = [r for r in results2 if r[0] == "SUCCESS"]
    fails2 = [r for r in results2 if r[0] == "FAILED"]
    print(f"نتیجه برداشت همزمان: {len(successes2)} موفق | {len(fails2)} ناموفق")
    for f in fails2:
        print(f"  دلیل رد: {f[2]}")

    assert len(successes2) == 1, f"باید دقیقاً ۱ رزرو با مانده ۱,۰۰۰,۰۰۰ انجام شود اما {len(successes2)} انجام شد!"
    assert len(fails2) == 2, "۲ تراکنش دیگر باید به دلیل کسری موجودی مسدود شوند!"

    async with session_factory() as s:
        w_res = await s.execute(select(Wallet).where(Wallet.user_id == user_id_2))
        final_wallet = w_res.scalar_one()
        print(f"موجودی نهایی کیف پول: {final_wallet.balance:,} ریال")
        assert final_wallet.balance == 400000, f"موجودی باید دقیقاً ۴۰۰,۰۰۰ ریال بماند اما {final_wallet.balance} است!"
        assert final_wallet.balance >= 0, "موجودی کیف پول منفی شده است!"

    print("✅ سناریو ۲ با موفقیت ۱۰۰٪ پاس شد: جلوگیری قطعی از مانده منفی در برداشت‌های همزمان چندگانه.")

    # -------------------------------------------------------------
    # سناریو ۳: پرداخت تکراری همان رزرو (Duplicate payment of same booking)
    # -------------------------------------------------------------
    print("\n--- سناریو ۳: شلیک همزمان ۵ درخواست پرداخت برای همان رزرو واحد ---")
    user_id_3 = "user-pg16-dup-booking"
    booking_id_3 = "book-pg16-dup-target"
    slot_id_3 = "slot-pg16-dup-target"
    async with session_factory() as s:
        u3 = User(id=user_id_3, phone_number="09124445566", full_name="کاربر پرداخت تکراری")
        s.add(u3)
        w3 = Wallet(id="wallet-pg16-dup-target", user_id=user_id_3, balance=5000000)
        s.add(w3)
        sl3 = TimeSlot(
            id=slot_id_3,
            court_id="court-pg16-1",
            slot_date=date.today() + timedelta(days=4),
            start_time=(datetime.now(timezone.utc) + timedelta(hours=3)).time(),
            end_time=(datetime.now(timezone.utc) + timedelta(hours=4)).time(),
            price=1000000,
            status="HOLD",
            held_by_user_id=user_id_3,
            hold_expires_at=utc_now() + timedelta(minutes=10)
        )
        s.add(sl3)
        b3 = Booking(
            id=booking_id_3,
            tracking_code="TRK-PG16-DUP-1",
            user_id=user_id_3,
            timeslot_id=slot_id_3,
            amount_paid=1000000,
            status="PENDING_PAYMENT"
        )
        s.add(b3)
        await s.commit()

    async def attempt_dup_pay(attempt_no):
        async with session_factory() as session:
            try:
                res = await WalletService.pay_booking_with_wallet(
                    session, user_id=user_id_3, slot_id=slot_id_3, booking_id=booking_id_3
                )
                await session.commit()
                return ("SUCCESS", attempt_no, res.status)
            except Exception as e:
                await session.rollback()
                return ("FAILED", attempt_no, str(e))

    # Fire 5 concurrent payments for the exact same booking_id
    tasks3 = [attempt_dup_pay(i) for i in range(5)]
    results3 = await asyncio.gather(*tasks3)

    successes3 = [r for r in results3 if r[0] == "SUCCESS"]
    fails3 = [r for r in results3 if r[0] == "FAILED"]
    print(f"نتیجه پرداخت تکراری رزرو: {len(successes3)} موفق | {len(fails3)} ناموفق")
    for f in fails3:
        print(f"  دلیل رد پرداخت تکراری: {f[2]}")

    assert len(successes3) == 1, f"تنها ۱ درخواست پرداخت برای رزرو واحد باید موفق شود اما {len(successes3)} بار شد!"
    assert len(fails3) == 4, "۴ درخواست تکراری پرداخت باید فوراً مسدود گردند!"

    async with session_factory() as s:
        w_res3 = await s.execute(select(Wallet).where(Wallet.user_id == user_id_3))
        w3_final = w_res3.scalar_one()
        print(f"موجودی نهایی پس از تلاش‌های تکراری: {w3_final.balance:,} ریال (از ۵,۰۰۰,۰۰۰ اولیه)")
        assert w3_final.balance == 4000000, f"موجودی باید دقیقاً ۴,۰۰۰,۰۰۰ ریال باشد (دقیقاً ۱ بار کسر شده) اما {w3_final.balance} است!"

        tx_res = await s.execute(
            select(func.count()).select_from(WalletTransaction).where(WalletTransaction.wallet_id == w3_final.id)
        )
        tx_count = tx_res.scalar()
        print(f"تعداد تراکنش‌های مالی ثبت شده در تاریخچه کیف پول: {tx_count}")
        assert tx_count == 1, f"باید فقط ۱ تراکنش DEBIT ثبت شده باشد اما {tx_count} تراکنش ثبت شد!"

    print("✅ سناریو ۳ با موفقیت ۱۰۰٪ پاس شد: جلوگیری کامل از کسر مجدد یا پرداخت دوبل یک رزرو مشخص.")

    # -------------------------------------------------------------
    # سناریو ۴: تست Rollback با خطای کنترل‌شده پیش از کامیت در PostgreSQL 16
    # -------------------------------------------------------------
    print("\n--- سناریو ۴: آزمون صریح Rollback تراکنش هنگام بروز خطا در PostgreSQL 16 ---")
    user_id_4 = "user-pg16-rollback"
    slot_id_4 = "slot-pg16-rollback"
    initial_balance = 2000000
    slot_price = 800000

    async with session_factory() as s:
        u4 = User(id=user_id_4, phone_number="09125556677", full_name="کاربر رول‌بک")
        s.add(u4)
        w4 = Wallet(id="wallet-pg16-rollback", user_id=user_id_4, balance=initial_balance)
        s.add(w4)
        sl4 = TimeSlot(
            id=slot_id_4,
            court_id="court-pg16-1",
            slot_date=date.today() + timedelta(days=5),
            start_time=(datetime.now(timezone.utc) + timedelta(hours=4)).time(),
            end_time=(datetime.now(timezone.utc) + timedelta(hours=5)).time(),
            price=slot_price,
            status="AVAILABLE"
        )
        s.add(sl4)
        await s.commit()

    rollback_caught = False
    async with session_factory() as s_rb:
        try:
            # 1. Start execution inside transaction
            booking = await WalletService.pay_booking_with_wallet(s_rb, user_id_4, slot_id_4)
            # Verify in-memory state changed
            assert booking.status == "CONFIRMED"
            # 2. Inject intentional failure (e.g. external network failure or crash)
            raise RuntimeError("SIMULATED_CONTROLLED_FAILURE_BEFORE_COMMIT")
        except RuntimeError as e:
            rollback_caught = True
            await s_rb.rollback()
            print(f"  خطای کنترل‌شده رخ داد و rollback فراخوانی شد: {e}")

    assert rollback_caught is True

    # 3. Verify PostgreSQL 16 state after rollback
    async with session_factory() as s_verify:
        w_ver = await s_verify.execute(select(Wallet).where(Wallet.user_id == user_id_4))
        w_obj = w_ver.scalar_one()
        assert w_obj.balance == initial_balance, f"موجودی باید ۱۰۰٪ به {initial_balance} برگردد اما {w_obj.balance} است!"

        sl_ver = await s_verify.execute(select(TimeSlot).where(TimeSlot.id == slot_id_4))
        sl_obj = sl_ver.scalar_one()
        assert sl_obj.status == "AVAILABLE", f"وضعیت اسلات باید AVAILABLE بماند اما {sl_obj.status} است!"

        b_ver = await s_verify.execute(select(func.count()).select_from(Booking).where(Booking.timeslot_id == slot_id_4))
        assert b_ver.scalar() == 0, "هیچ رکوردی برای رزرو نباید در دیتابیس ثبت شده باشد!"

        tx_ver = await s_verify.execute(select(func.count()).select_from(WalletTransaction).where(WalletTransaction.wallet_id == w_obj.id))
        assert tx_ver.scalar() == 0, "هیچ تراکنش مالی نباید در دیتابیس ثبت شده باشد!"

    print("✅ سناریو ۴ با موفقیت ۱۰۰٪ پاس شد: اثبات اتمیک بودن Rollback و عدم تغییر موجودی و رکوردها.")

    await engine.dispose()

if __name__ == "__main__":
    try:
        asyncio.run(run_all_pg16_tests())
    finally:
        forwarder.stop()
        ssh_client.close()
        print("\n🔒 تونل SSH و اتصالات با موفقیت بسته شدند.")
