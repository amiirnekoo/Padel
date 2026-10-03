import sys
import os
import time
import uuid
import json
import sqlite3
import subprocess
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

sys.stdout.reconfigure(encoding='utf-8')

print("=" * 75)
print("🌐 آزمون عملیاتی بقای رزرو پس از پاکسازی کامل حافظه محلی مرورگر (Local Storage Wipe)")
print("   ۱. رزرو و تسویه سانس با کیف پول")
print("   ۲. پاکسازی کامل localStorage و sessionStorage و ریستارت سشن مرورگر")
print("   ۳. ورود مجدد با تلفن و کلمه عبور و استعلام اطلاعات مستقیم از سرور")
print("   ۴. تطبیق سه‌گانه بین داده‌های مرورگر، API بک‌اند و رکوردهای دیتابیس")
print("=" * 75)

# اطمینان از بالا بودن بک‌اند تستی روی 8085
docs_dir = r"g:\My Drive\Company\File\Padel\docs"
os.makedirs(docs_dir, exist_ok=True)
db_path = r"g:\My Drive\Company\File\Padel\padel.db"

# سید کردن اسلات معتبر برای تست با رعایت قید یکتایی (court_id, slot_date, start_time)
conn = sqlite3.connect(db_path)
cur = conn.cursor()
cur.execute("DELETE FROM time_slots WHERE id = 'club-enghelab-slot-1' OR (court_id = 'court-eng-1' AND slot_date = '2026-10-04' AND start_time = '15:00:00.000000')")
cur.execute('''
INSERT INTO time_slots (id, court_id, slot_date, start_time, end_time, price, status, held_by_user_id, hold_expires_at)
VALUES ('club-enghelab-slot-1', 'court-eng-1', '2026-10-04', '15:00:00.000000', '16:30:00.000000', 12000000, 'AVAILABLE', NULL, NULL)
''')
conn.commit()
conn.close()

chrome_opts = Options()
chrome_opts.add_argument("--headless=new")
chrome_opts.add_argument("--window-size=1440,960")
chrome_opts.add_argument("--no-sandbox")
chrome_opts.add_argument("--disable-gpu")
chrome_opts.add_argument("--disable-dev-shm-usage")

driver = webdriver.Chrome(options=chrome_opts)
wait = WebDriverWait(driver, 10)

try:
    url = "http://localhost:4173"
    print(f"\n۱. بارگذاری صفحه اصلی: {url}")
    driver.get(url)
    time.sleep(2)

    # ۲. ثبت‌نام کاربر جدید
    test_id = str(uuid.uuid4())[:6]
    test_phone = f"0912{int(time.time()) % 10000000:07d}"
    test_email = f"user_{test_id}@raally.ir"
    test_name = f"کاربر اعتبارسنجی {test_id}"
    test_password = "SecurePassword2026!"

    print(f"\n۲. ثبت‌نام کاربر با مشخصات: {test_phone} / {test_name}")
    header_login_btn = driver.find_element(By.XPATH, "//button[contains(., 'ورود')]")
    header_login_btn.click()
    time.sleep(1)

    modal = wait.until(EC.visibility_of_element_located((By.XPATH, "//div[contains(@class, 'fixed') and contains(., 'ورود')]")))
    switch_to_reg = modal.find_element(By.XPATH, ".//button[contains(., 'ثبت‌نام رایگان')]")
    switch_to_reg.click()
    time.sleep(1)

    inputs = modal.find_elements(By.TAG_NAME, "input")
    for inp in inputs:
        ph = inp.get_attribute("placeholder") or ""
        typ = inp.get_attribute("type") or ""
        if typ == "text" or "کیان" in ph or "نام" in ph:
            inp.clear(); inp.send_keys(test_name)
        elif typ == "tel" or "۰۹" in ph or "09" in ph:
            inp.clear(); inp.send_keys(test_phone)
        elif typ == "email" or "example" in ph:
            inp.clear(); inp.send_keys(test_email)
        elif typ == "password":
            inp.clear(); inp.send_keys(test_password)

    submit_btn = modal.find_element(By.XPATH, ".//button[@type='submit' or contains(., 'تکمیل ثبت‌نام')]")
    submit_btn.click()
    time.sleep(2)

    auth_str = driver.execute_script("return localStorage.getItem('padel_auth');")
    assert auth_str, "خطا در ثبت‌نام!"
    user_id = json.loads(auth_str).get("userId")
    print(f"   ✅ ثبت‌نام موفق! شناسه کاربر: {user_id}")

    # ۳. شارژ اولیه کیف پول در پایگاه‌داده (۵٬۰۰۰٬۰۰۰ تومان = ۵۰٬۰۰۰٬۰۰۰ ریال)
    print("\n۳. شارژ اولیه کیف پول به میزان ۵٬۰۰۰٬۰۰۰ تومان در پایگاه‌داده...")
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    cur.execute("SELECT id FROM wallets WHERE user_id = ?", (user_id,))
    row = cur.fetchone()
    if row:
        cur.execute("UPDATE wallets SET balance = 50000000 WHERE id = ?", (row[0],))
    else:
        cur.execute("INSERT INTO wallets (id, user_id, balance, currency, is_locked) VALUES (?, ?, 50000000, 'IRR', 0)", (f"wal-{test_id}", user_id))
    conn.commit()
    conn.close()

    driver.refresh()
    time.sleep(2)

    # ۴. رزرو سانس با کیف پول
    print("\n۴. انتخاب سانس و تسویه از طریق کیف پول رالی...")
    slot_btns = driver.find_elements(By.XPATH, "//button[contains(., '۱۵:') or contains(., '۱۶:') or contains(., '۱۷:') or contains(., '۱۸:')]")
    driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", slot_btns[0])
    time.sleep(1)
    slot_btns[0].click()
    time.sleep(1.5)

    booking_modal = wait.until(EC.visibility_of_element_located((By.XPATH, "//div[contains(@class, 'fixed') and (contains(., 'رزرو') or contains(., 'مبلغ'))]")))
    
    wallet_options = booking_modal.find_elements(By.XPATH, ".//button[contains(., 'کیف پول') or contains(., 'موجودی')]")
    if wallet_options:
        wallet_options[0].click()
        time.sleep(1)

    pay_btn = booking_modal.find_element(By.XPATH, ".//button[contains(., 'ثبت نهایی')]")
    print(f"   کلیک روی دکمه پرداخت نهایی: '{pay_btn.text}'...")
    driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", pay_btn)
    time.sleep(1)
    pay_btn.click()
    time.sleep(3)

    err_msgs = driver.find_elements(By.XPATH, "//div[contains(@class, 'text-amber') or contains(@class, 'text-rose')]")
    for em in err_msgs:
        if em.text:
            print(f"   [پیام وضعیت/خطا در صفحه]: {em.text}")

    # اعتبارسنجی رسید و استخراج کد پیگیری
    receipt_el = wait.until(EC.visibility_of_element_located((By.XPATH, "//*[contains(text(), 'رزرو با موفقیت قطعی شد') or contains(text(), 'شناسه پیگیری')]")))
    tracking_els = driver.find_elements(By.XPATH, "//*[contains(text(), 'PAD-') or contains(text(), 'TRK-') or contains(@class, 'font-mono')]")
    issued_tracking_code = tracking_els[0].text if tracking_els else "PAD-UNKNOWN"
    print(f"   ✅ رزرو قطعی شد! کد پیگیری صادره: {issued_tracking_code}")
    driver.save_screenshot(os.path.join(docs_dir, "wipe_test_01_receipt_issued.png"))

    close_btn = driver.find_element(By.XPATH, "//button[contains(., 'بازگشت به سایت') or contains(., 'بستن')]")
    close_btn.click()
    time.sleep(1)

    # ۵. پاکسازی کامل حافظه محلی مرورگر (Local Storage Wipe)
    print("\n۵. 💥 پاکسازی کامل حافظه محلی مرورگر (localStorage.clear & sessionStorage.clear)...")
    driver.execute_script("localStorage.clear(); sessionStorage.clear();")
    driver.refresh()
    time.sleep(2)
    driver.save_screenshot(os.path.join(docs_dir, "wipe_test_02_after_wipe.png"))

    # اطمینان از پاک شدن تمام داده‌های محلی
    cleared_auth = driver.execute_script("return localStorage.getItem('padel_auth');")
    cleared_bookings = driver.execute_script("return localStorage.getItem('my_rally_bookings');")
    assert cleared_auth is None, "خطا! توکن احراز هویت پاک نشد!"
    assert cleared_bookings is None, "خطا! رزروهای محلی پاک نشد!"
    print("   ✅ اثبات شد: کلیه اطلاعات سشن، توکن و رزروهای ذخیره‌شده در کلاینت مرورگر ۱۰۰٪ پاک گردیدند.")

    # ۶. ورود مجدد با نام کاربری و رمز عبور
    print("\n۶. ورود مجدد کاربر با شماره همراه و کلمه عبور...")
    login_btn = driver.find_element(By.XPATH, "//button[contains(., 'ورود')]")
    login_btn.click()
    time.sleep(1)

    login_modal = wait.until(EC.visibility_of_element_located((By.XPATH, "//div[contains(@class, 'fixed') and contains(., 'ورود')]")))
    inputs = login_modal.find_elements(By.TAG_NAME, "input")
    for inp in inputs:
        typ = inp.get_attribute("type") or ""
        ph = inp.get_attribute("placeholder") or ""
        if typ == "tel" or "۰۹" in ph or "09" in ph:
            inp.clear(); inp.send_keys(test_phone)
        elif typ == "password":
            inp.clear(); inp.send_keys(test_password)

    submit_login = login_modal.find_element(By.XPATH, ".//button[@type='submit' or contains(., 'ورود به پنل')]")
    submit_login.click()
    time.sleep(2)

    re_auth_str = driver.execute_script("return localStorage.getItem('padel_auth');")
    assert re_auth_str, "خطا در ورود مجدد کاربر!"
    re_auth = json.loads(re_auth_str)
    new_token = re_auth.get("token")
    print(f"   ✅ ورود مجدد موفق! توکن جدید دریافت شد: {new_token[:30]}...")

    # ۷. استعلام مستقیم موجودی و رزروها از سرور بک‌اند
    print("\n۷. استعلام زنده اطلاعات از سرور با توکن جدید احراز هویت:")
    import httpx
    headers = {"Authorization": f"Bearer {new_token}"}
    
    # الف) مانده کیف پول از سرور
    balance_res = httpx.get("http://localhost:8085/api/v1/wallet/balance", headers=headers)
    assert balance_res.status_code == 200, f"خطا در استعلام موجودی: {balance_res.text}"
    server_balance_data = balance_res.json()
    server_balance_rials = server_balance_data.get("balance")
    server_balance_toman = server_balance_data.get("balance_toman")
    print(f"   💰 مانده کیف پول گزارش‌شده توسط سرور: {server_balance_toman:,} تومان ({server_balance_rials:,} ریال)")

    # ب) لیست رزروهای کاربر از سرور
    bookings_res = httpx.get("http://localhost:8085/api/v1/bookings/my", headers=headers)
    assert bookings_res.status_code == 200, f"خطا در استعلام رزروها: {bookings_res.text}"
    server_bookings = bookings_res.json()
    print(f"   📋 تعداد رزروهای ثبت‌شده کاربر در سرور: {len(server_bookings)}")
    assert len(server_bookings) > 0, "هیچ رزروی در سرور یافت نشد!"
    first_b = server_bookings[0]
    print(f"   🏷️ کد پیگیری رزرو در سرور: {first_b.get('tracking_code')}")
    print(f"   📊 وضعیت رزرو در سرور: {first_b.get('status')}")
    print(f"   💳 مبلغ کسر شده: {first_b.get('amount_toman'):,} تومان")

    # ۸. تطبیق مستقیم با جداول پایگاه‌داده (Database Verification)
    print("\n۸. راستی‌آزمایی و تطبیق داده‌ها با رکوردهای پایگاه‌داده:")
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()

    cur.execute("SELECT balance FROM wallets WHERE user_id = ?", (user_id,))
    db_wallet_balance = cur.fetchone()[0]

    cur.execute("SELECT id, tracking_code, status, amount_paid FROM bookings WHERE user_id = ?", (user_id,))
    db_booking = cur.fetchone()

    cur.execute("SELECT status FROM time_slots WHERE id = 'club-enghelab-slot-1'")
    db_slot_status = cur.fetchone()[0]
    conn.close()

    print(f"   🗄️ مانده در جدول wallets: {db_wallet_balance:,} ریال")
    print(f"   🗄️ رکورد در جدول bookings: شناسه={db_booking[0]} | کد={db_booking[1]} | وضعیت={db_booking[2]} | مبلغ={db_booking[3]:,} ریال")
    print(f"   🗄️ وضعیت در جدول time_slots: {db_slot_status}")

    # اعتبارسنجی انطباق ۱۰۰٪
    assert server_balance_rials == db_wallet_balance, "ناهمخوانی مانده سرور و دیتابیس!"
    assert db_wallet_balance == 38000000, f"موجودی باید ۳۸ میلیون ریال باشد اما {db_wallet_balance} است!"
    assert first_b.get('tracking_code') == db_booking[1], "ناهمخوانی کد پیگیری سرور و دیتابیس!"
    assert first_b.get('tracking_code') == issued_tracking_code, "ناهمخوانی کد پیگیری صادره در مرورگر و سرور!"
    assert db_booking[2] == "CONFIRMED", "وضعیت رزرو در دیتابیس CONFIRMED نیست!"
    assert db_slot_status == "BOOKED", "وضعیت سانس در دیتابیس BOOKED نیست!"

    driver.save_screenshot(os.path.join(docs_dir, "wipe_test_03_reloaded_from_server.png"))

    print("\n" + "=" * 75)
    print("🎉 تطابق سه‌گانه با موفقیت ۱۰۰٪ اثبات گردید:")
    print(f"   ۱. کد پیگیری صادره در مرورگر:   {issued_tracking_code}")
    print(f"   ۲. کد پیگیری بازیابی‌شده از API: {first_b.get('tracking_code')}")
    print(f"   ۳. کد پیگیری ثبت‌شده در دیتابیس: {db_booking[1]}")
    print(f"   ۴. مانده نهایی کیف پول:        {db_wallet_balance // 10:,} تومان (دقیقاً ۳٬۸۰۰٬۰۰۰ تومان)")
    print("=" * 75)

finally:
    driver.quit()
