import sys
import paramiko

sys.stdout.reconfigure(encoding='utf-8')

test_script_content = '''
import sys
import os
import uuid
import asyncio
from datetime import date, datetime, timedelta, timezone

print("="*70)
print("🚀 شروع آزمون‌های همروندی و تراکنشی روی PostgreSQL 16 واقعی")
print("="*70)

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy import select, update, func, String, Integer, Boolean, DateTime, Date, Time, ForeignKey
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

class Base(DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "users"
    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    phone_number: Mapped[str] = mapped_column(String(20), unique=True, index=True)
    full_name: Mapped[str] = mapped_column(String(100), default="کاربر")

class Wallet(Base):
    __tablename__ = "wallets"
    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), unique=True)
    balance: Mapped[int] = mapped_column(Integer, default=0)
    is_locked: Mapped[bool] = mapped_column(Boolean, default=False)

class WalletTransaction(Base):
    __tablename__ = "wallet_transactions"
    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    wallet_id: Mapped[str] = mapped_column(String(36), ForeignKey("wallets.id"))
    amount: Mapped[int] = mapped_column(Integer)
    transaction_type: Mapped[str] = mapped_column(String(10))
    category: Mapped[str] = mapped_column(String(30))
    reference_id: Mapped[str] = mapped_column(String(100))

class Club(Base):
    __tablename__ = "clubs"
    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    name: Mapped[str] = mapped_column(String(100))

class Court(Base):
    __tablename__ = "courts"
    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    club_id: Mapped[str] = mapped_column(String(36), ForeignKey("clubs.id"))
    name: Mapped[str] = mapped_column(String(100))

class TimeSlot(Base):
    __tablename__ = "time_slots"
    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    court_id: Mapped[str] = mapped_column(String(36), ForeignKey("courts.id"))
    slot_date: Mapped[date] = mapped_column(Date)
    start_time: Mapped[datetime.time] = mapped_column(Time)
    end_time: Mapped[datetime.time] = mapped_column(Time)
    price: Mapped[int] = mapped_column(Integer)
    status: Mapped[str] = mapped_column(String(20), default="AVAILABLE")
    held_by_user_id: Mapped[str | None] = mapped_column(String(36), nullable=True)
    hold_expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

class Booking(Base):
    __tablename__ = "bookings"
    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    tracking_code: Mapped[str] = mapped_column(String(50), unique=True)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"))
    timeslot_id: Mapped[str] = mapped_column(String(36), ForeignKey("time_slots.id"))
    amount_paid: Mapped[int] = mapped_column(Integer)
    status: Mapped[str] = mapped_column(String(20), default="PENDING_PAYMENT")
    payment_method: Mapped[str] = mapped_column(String(20), default="WALLET")
    settlement_status: Mapped[str] = mapped_column(String(20), default="UNSETTLED")
    confirmed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

PG_URL = "postgresql+asyncpg://padel_user:padel_secret_password_2026@db:5432/padel_test_concurrency_pg16"
engine = create_async_engine(PG_URL, pool_size=30, max_overflow=20, pool_timeout=30)
session_factory = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

def utc_now():
    return datetime.now(timezone.utc)

async def pay_booking_with_wallet(db: AsyncSession, user_id: str, slot_id: str, booking_id: str | None = None) -> Booking:
    # 0. Check slot existence with row lock
    slot_stmt = select(TimeSlot).where(TimeSlot.id == slot_id).with_for_update()
    slot_res = await db.execute(slot_stmt)
    slot = slot_res.scalar_one_or_none()
    if not slot:
        raise ValueError("سانس مورد نظر یافت نشد")

    # 0.1 Check booking if passed
    booking = None
    if booking_id:
        b_stmt = select(Booking).where(Booking.id == booking_id).with_for_update()
        b_res = await db.execute(b_stmt)
        booking = b_res.scalar_one_or_none()
        if not booking:
            raise ValueError("رزرو مورد نظر یافت نشد")
        if booking.status != "PENDING_PAYMENT":
            raise ValueError("این رزرو قبلاً پرداخت یا نهایی شده است")

    # 0.2 Check wallet
    w_stmt = select(Wallet).where(Wallet.user_id == user_id).with_for_update()
    w_res = await db.execute(w_stmt)
    wallet = w_res.scalar_one_or_none()
    if not wallet or wallet.is_locked:
        raise ValueError("کیف پول نامعتبر یا مسدود است")
    if wallet.balance < slot.price:
        raise ValueError("موجودی کیف پول برای این رزرو کافی نیست")

    # 1. Atomic balance deduction
    wallet_update = (
        update(Wallet)
        .where(Wallet.id == wallet.id, Wallet.balance >= slot.price, Wallet.is_locked == False)
        .values(balance=Wallet.balance - slot.price)
    )
    wallet_update_res = await db.execute(wallet_update)
    if wallet_update_res.rowcount == 0:
        raise ValueError("موجودی کیف پول برای این رزرو کافی نیست")

    # 2. Atomic slot state check and transition
    slot_update = (
        update(TimeSlot)
        .where(TimeSlot.id == slot_id, TimeSlot.status.in_(["AVAILABLE", "HOLD"]))
        .values(status="BOOKED", hold_expires_at=None)
    )
    slot_update_res = await db.execute(slot_update)
    if slot_update_res.rowcount == 0:
        # Revert wallet balance
        await db.execute(
            update(Wallet).where(Wallet.id == wallet.id).values(balance=Wallet.balance + slot.price)
        )
        raise ValueError("سانس انتخابی در دسترس نیست")

    now = utc_now()
    if booking:
        booking.status = "CONFIRMED"
        booking.payment_method = "WALLET"
        booking.confirmed_at = now
    else:
        existing_stmt = select(Booking).where(
            Booking.timeslot_id == slot.id,
            Booking.user_id == user_id,
            Booking.status == "PENDING_PAYMENT"
        )
        existing_res = await db.execute(existing_stmt)
        existing_booking = existing_res.scalar_one_or_none()
        if existing_booking:
            booking = existing_booking
            booking.status = "CONFIRMED"
            booking.payment_method = "WALLET"
            booking.confirmed_at = now
        else:
            tracking_code = f"WLT-{now.strftime('%y%m%d%H%M')}-{uuid.uuid4().hex[:6].upper()}"
            booking = Booking(
                id=str(uuid.uuid4()),
                tracking_code=tracking_code,
                user_id=user_id,
                timeslot_id=slot.id,
                amount_paid=slot.price,
                status="CONFIRMED",
                payment_method="WALLET",
                settlement_status="UNSETTLED",
                confirmed_at=now
            )
            db.add(booking)

    tx = WalletTransaction(
        id=str(uuid.uuid4()),
        wallet_id=wallet.id,
        amount=slot.price,
        transaction_type="DEBIT",
        category="BOOKING_PAYMENT",
        reference_id=booking.tracking_code
    )
    db.add(tx)
    return booking

async def main():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    print("📦 ساختار جداول روی پایگاه داده ایزوله PostgreSQL 16 مستقر شد.")

    async with session_factory() as s:
        club = Club(id="c1", name="پدل سنتر پروداکشن")
        s.add(club)
        court = Court(id="crt1", club_id="c1", name="کورت مرکزی")
        s.add(court)
        await s.commit()

    # -------------------------------------------------------------
    # سناریو ۱: رقابت همزمان ۱۰ تراکنش برای ۱ سانس
    # -------------------------------------------------------------
    print("\\n--- سناریو ۱: شلیک همزمان ۱۰ تراکنش مستقل برای ۱ سانس واحد ---")
    slot_id_1 = "slot-race-1"
    async with session_factory() as s:
        s.add(TimeSlot(
            id=slot_id_1, court_id="crt1", slot_date=date.today(),
            start_time=datetime.now().time(), end_time=datetime.now().time(),
            price=1500000, status="AVAILABLE"
        ))
        for i in range(10):
            uid = f"user-race-{i}"
            s.add(User(id=uid, phone_number=f"091211100{i:02d}", full_name=f"کاربر {i}"))
            s.add(Wallet(id=f"w-race-{i}", user_id=uid, balance=3000000))
        await s.commit()

    async def do_race_1(uid):
        async with session_factory() as sess:
            try:
                b = await pay_booking_with_wallet(sess, uid, slot_id_1)
                await sess.commit()
                return ("SUCCESS", uid, b.id)
            except Exception as e:
                await sess.rollback()
                return ("FAILED", uid, str(e))

    results1 = await asyncio.gather(*[do_race_1(f"user-race-{i}") for i in range(10)])
    succ1 = [r for r in results1 if r[0] == "SUCCESS"]
    fail1 = [r for r in results1 if r[0] == "FAILED"]
    print(f"نتیجه رقابت برای ۱ سانس: {len(succ1)} موفق | {len(fail1)} مسدود")
    assert len(succ1) == 1, f"باید دقیقا ۱ موفق شود اما {len(succ1)} شد"
    assert len(fail1) == 9, "باید دقیقا ۹ درخواست رد شود"
    print("✅ سناریو ۱: صفر رزرو دوبل در همروندی کامل ۱۰ تراکنش موازی روی PostgreSQL 16.")

    # -------------------------------------------------------------
    # سناریو ۲: برداشت همزمان از ۱ کیف پول برای چند سانس متفاوت
    # -------------------------------------------------------------
    print("\\n--- سناریو ۲: برداشت همزمان از ۱ کیف پول برای سانس‌های مختلف (بیش از موجودی) ---")
    user_id_2 = "user-multi-slot"
    async with session_factory() as s:
        s.add(User(id=user_id_2, phone_number="09122223344", full_name="کاربر چند سانسی"))
        s.add(Wallet(id="w-multi", user_id=user_id_2, balance=1000000)) # 1,000,000 IRR
        for i in range(3):
            s.add(TimeSlot(
                id=f"slot-multi-{i}", court_id="crt1", slot_date=date.today(),
                start_time=datetime.now().time(), end_time=datetime.now().time(),
                price=600000, status="AVAILABLE" # 3 * 600,000 = 1,800,000 > 1,000,000
            ))
        await s.commit()

    async def do_multi_slot(sid):
        async with session_factory() as sess:
            try:
                b = await pay_booking_with_wallet(sess, user_id_2, sid)
                await sess.commit()
                return ("SUCCESS", sid, b.id)
            except Exception as e:
                await sess.rollback()
                return ("FAILED", sid, str(e))

    results2 = await asyncio.gather(*[do_multi_slot(f"slot-multi-{i}") for i in range(3)])
    succ2 = [r for r in results2 if r[0] == "SUCCESS"]
    fail2 = [r for r in results2 if r[0] == "FAILED"]
    print(f"نتیجه برداشت همزمان: {len(succ2)} موفق | {len(fail2)} ناموفق (کسری موجودی)")
    assert len(succ2) == 1, f"باید فقط ۱ رزرو موفق شود اما {len(succ2)} شد"
    assert len(fail2) == 2, "۲ رزرو دیگر باید به دلیل کسری موجودی مسدود شوند"

    async with session_factory() as s:
        w2_res = await s.execute(select(Wallet).where(Wallet.user_id == user_id_2))
        w2_final = w2_res.scalar_one()
        print(f"موجودی نهایی کیف پول: {w2_final.balance:,} ریال (از ۱,۰۰۰,۰۰۰ اولیه)")
        assert w2_final.balance == 400000, f"مانده باید دقیقاً ۴۰۰,۰۰۰ باشد اما {w2_final.balance} است"
        assert w2_final.balance >= 0, "موجودی منفی شده است!"
    print("✅ سناریو ۲: جلوگیری قطعی از مانده منفی در برداشت همزمان از یک کیف پول روی PostgreSQL 16.")

    # -------------------------------------------------------------
    # سناریو ۳: پرداخت تکراری همان رزرو (Duplicate payment of same booking)
    # -------------------------------------------------------------
    print("\\n--- سناریو ۳: شلیک همزمان ۵ درخواست پرداخت برای همان رزرو واحد ---")
    user_id_3 = "user-dup-pay"
    slot_id_3 = "slot-dup-pay"
    booking_id_3 = "book-dup-pay"
    async with session_factory() as s:
        s.add(User(id=user_id_3, phone_number="09123335566", full_name="کاربر رزرو تکراری"))
        s.add(Wallet(id="w-dup", user_id=user_id_3, balance=5000000))
        s.add(TimeSlot(
            id=slot_id_3, court_id="crt1", slot_date=date.today(),
            start_time=datetime.now().time(), end_time=datetime.now().time(),
            price=1000000, status="HOLD", held_by_user_id=user_id_3
        ))
        await s.flush()
        s.add(Booking(
            id=booking_id_3, tracking_code="TRK-PG16-DUP",
            user_id=user_id_3, timeslot_id=slot_id_3, amount_paid=1000000,
            status="PENDING_PAYMENT"
        ))
        await s.commit()

    async def do_dup_pay(attempt):
        async with session_factory() as sess:
            try:
                b = await pay_booking_with_wallet(sess, user_id_3, slot_id_3, booking_id=booking_id_3)
                await sess.commit()
                return ("SUCCESS", attempt, b.status)
            except Exception as e:
                await sess.rollback()
                return ("FAILED", attempt, str(e))

    results3 = await asyncio.gather(*[do_dup_pay(i) for i in range(5)])
    succ3 = [r for r in results3 if r[0] == "SUCCESS"]
    fail3 = [r for r in results3 if r[0] == "FAILED"]
    print(f"نتیجه پرداخت تکراری: {len(succ3)} موفق | {len(fail3)} ناموفق")
    for f in fail3:
        print(f"  علت مسدودسازی: {f[2]}")
    assert len(succ3) == 1, f"تنها ۱ بار باید پرداخت شود اما {len(succ3)} بار شد!"
    assert len(fail3) == 4, "۴ درخواست تکراری پرداخت باید مسدود شوند"

    async with session_factory() as s:
        w3_res = await s.execute(select(Wallet).where(Wallet.user_id == user_id_3))
        w3_final = w3_res.scalar_one()
        print(f"موجودی نهایی پس از پرداخت تکراری: {w3_final.balance:,} ریال (از ۵,۰۰۰,۰۰۰ اولیه)")
        assert w3_final.balance == 4000000, f"مانده باید دقیقاً ۴,۰۰۰,۰۰۰ باشد اما {w3_final.balance} است"
        tx_res = await s.execute(select(func.count()).select_from(WalletTransaction).where(WalletTransaction.wallet_id == w3_final.id))
        assert tx_res.scalar() == 1, "باید فقط ۱ تراکنش DEBIT ثبت شده باشد"
    print("✅ سناریو ۳: جلوگیری کامل از کسر دوباره یا پرداخت تکراری رزرو روی PostgreSQL 16.")

    # -------------------------------------------------------------
    # سناریو ۴: تست Rollback با خطای کنترل‌شده در PostgreSQL 16
    # -------------------------------------------------------------
    print("\\n--- سناریو ۴: آزمون صریح Rollback تراکنش هنگام بروز خطا در PostgreSQL 16 ---")
    user_id_4 = "user-rb-test"
    slot_id_4 = "slot-rb-test"
    init_bal = 2000000
    price_4 = 800000
    async with session_factory() as s:
        s.add(User(id=user_id_4, phone_number="09124447788", full_name="کاربر رول‌بک"))
        s.add(Wallet(id="w-rb", user_id=user_id_4, balance=init_bal))
        s.add(TimeSlot(
            id=slot_id_4, court_id="crt1", slot_date=date.today(),
            start_time=datetime.now().time(), end_time=datetime.now().time(),
            price=price_4, status="AVAILABLE"
        ))
        await s.commit()

    async with session_factory() as s_rb:
        try:
            b = await pay_booking_with_wallet(s_rb, user_id_4, slot_id_4)
            assert b.status == "CONFIRMED"
            raise RuntimeError("SIMULATED_CONTROLLED_FAILURE_BEFORE_COMMIT")
        except RuntimeError as e:
            await s_rb.rollback()
            print(f"  خطای کنترل‌شده دریافت و rollback اجرا شد: {e}")

    async with session_factory() as s_ver:
        w_obj = (await s_ver.execute(select(Wallet).where(Wallet.user_id == user_id_4))).scalar_one()
        assert w_obj.balance == init_bal, f"موجودی باید ۱۰۰٪ به {init_bal} بازگردد اما {w_obj.balance} است"
        sl_obj = (await s_ver.execute(select(TimeSlot).where(TimeSlot.id == slot_id_4))).scalar_one()
        assert sl_obj.status == "AVAILABLE", f"وضعیت اسلات باید AVAILABLE بماند اما {sl_obj.status} است"
        b_cnt = (await s_ver.execute(select(func.count()).select_from(Booking).where(Booking.timeslot_id == slot_id_4))).scalar()
        assert b_cnt == 0, "هیچ رکوردی برای رزرو نباید ثبت شده باشد"
        tx_cnt = (await s_ver.execute(select(func.count()).select_from(WalletTransaction).where(WalletTransaction.wallet_id == w_obj.id))).scalar()
        assert tx_cnt == 0, "هیچ تراکنشی نباید ثبت شده باشد"
    print("✅ سناریو ۴: بازگشت ۱۰۰٪ موجودی و اسلات در Rollback تحت PostgreSQL 16 تأیید شد.")

    await engine.dispose()
    print("\\n" + "="*70)
    print("🎉 تمامی ۴ سناریوی همروندی و رول‌بک روی PostgreSQL 16 با موفقیت ۱۰۰٪ پاس شدند!")
    print("="*70)

asyncio.run(main())
'''

# Connect to server and execute directly inside rally_backend container
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect("213.176.121.117", port=22, username="root", password="655crYvKR5", timeout=10)

cmd = "docker exec -i rally_backend python -u -"
stdin, stdout, stderr = client.exec_command(cmd)
stdin.write(test_script_content)
stdin.close()

out = stdout.read().decode('utf-8')
err = stderr.read().decode('utf-8')

print(out)
if err and "warning" not in err.lower() and "deprecated" not in err.lower():
    print("STDERR:", err)

client.close()
