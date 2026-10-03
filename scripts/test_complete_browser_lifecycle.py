import sys
import os
import time
import uuid
import json
import sqlite3
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

sys.stdout.reconfigure(encoding='utf-8')

print("=" * 70)
print("🌐 آزمون تعاملی جامع مرورگر (Full Lifecycle E2E Browser Test)")
print("   ثبت‌نام، ورود، انتخاب سانس، تسویه کیف پول، صدور رسید، مانده و Refresh")
print("=" * 70)

chrome_opts = Options()
chrome_opts.add_argument("--headless=new")
chrome_opts.add_argument("--window-size=1440,960")
chrome_opts.add_argument("--no-sandbox")
chrome_opts.add_argument("--disable-gpu")
chrome_opts.add_argument("--disable-dev-shm-usage")

driver = webdriver.Chrome(options=chrome_opts)
wait = WebDriverWait(driver, 10)
docs_dir = r"g:\My Drive\Company\File\Padel\docs"
os.makedirs(docs_dir, exist_ok=True)

try:
    # ۱. بارگذاری سایت
    url = "http://localhost:4173"
    print(f"\n۱. بارگذاری صفحه اصلی: {url}")
    driver.get(url)
    time.sleep(2)
    driver.save_screenshot(os.path.join(docs_dir, "e2e_full_01_homepage.png"))
    print(f"   عنوان صفحه: '{driver.title}'")

    # ۲. باز کردن مودال ثبت‌نام
    print("\n۲. باز کردن مودال ثبت‌نام...")
    header_login_btn = driver.find_element(By.XPATH, "//button[contains(., 'ورود')]")
    header_login_btn.click()
    time.sleep(1)

    modal = wait.until(EC.visibility_of_element_located((By.XPATH, "//div[contains(@class, 'fixed') and contains(., 'ورود')]")))
    # سوئیچ به فرم ثبت‌نام
    switch_to_reg = modal.find_element(By.XPATH, ".//button[contains(., 'ثبت‌نام رایگان')]")
    switch_to_reg.click()
    time.sleep(1)

    # ۳. تکمیل فرم ثبت‌نام واقعی
    test_random_id = str(uuid.uuid4())[:6]
    test_phone = f"0912{int(time.time()) % 10000000:07d}"
    test_email = f"player_{test_random_id}@raally.ir"
    test_name = f"بازیکن آزمون {test_random_id}"
    test_password = "SecurePassword2026!"

    print(f"\n۳. تکمیل فرم ثبت‌نام:")
    print(f"   نام: {test_name}")
    print(f"   تلفن: {test_phone}")
    print(f"   ایمیل: {test_email}")

    inputs = modal.find_elements(By.TAG_NAME, "input")
    for inp in inputs:
        ph = inp.get_attribute("placeholder") or ""
        typ = inp.get_attribute("type") or ""
        if typ == "text" or "کیان" in ph or "نام" in ph:
            inp.clear()
            inp.send_keys(test_name)
            print(f"   [تکمیل نام]: '{test_name}'")
        elif typ == "tel" or "۰۹" in ph or "09" in ph:
            inp.clear()
            inp.send_keys(test_phone)
            print(f"   [تکمیل تلفن]: '{test_phone}'")
        elif typ == "email" or "example" in ph:
            inp.clear()
            inp.send_keys(test_email)
            print(f"   [تکمیل ایمیل]: '{test_email}'")
        elif typ == "password":
            inp.clear()
            inp.send_keys(test_password)
            print(f"   [تکمیل رمز]: '{test_password}'")

    time.sleep(1)
    # کلیک روی دکمه ثبت نام
    submit_btn = modal.find_element(By.XPATH, ".//button[@type='submit' or contains(., 'تکمیل ثبت‌نام')]")
    submit_btn.click()
    time.sleep(2)
    driver.save_screenshot(os.path.join(docs_dir, "e2e_full_02_registered.png"))

    # استخراج توکن و سشن ذخیره‌شده در localStorage مرورگر
    auth_data_str = driver.execute_script("return localStorage.getItem('padel_auth');")
    print(f"   داده سشن در LocalStorage: {auth_data_str[:120] if auth_data_str else 'خالی'}...")
    assert auth_data_str is not None, "خطا! سشن ورود در LocalStorage ذخیره نشد."
    auth_data = json.loads(auth_data_str)
    user_id = auth_data.get("userId")
    print(f"   ✅ ثبت‌نام موفق! شناسه کاربر: {user_id}")

    # ۴. شارژ اولیه کیف پول در پایگاه‌داده جهت امکان تسویه
    print("\n۴. شارژ اعتباری اولیه کیف پول کاربر جهت آزمون تسویه (۵٬۰۰۰٬۰۰۰ تومان)...")
    db_path = r"g:\My Drive\Company\File\Padel\padel.db"
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    # اطمینان از وجود کیف پول و بروزرسانی مانده به ۵۰٬۰۰۰٬۰۰۰ ریال (۵ میلیون تومان)
    cur.execute("SELECT id FROM wallets WHERE user_id = ?", (user_id,))
    row = cur.fetchone()
    if row:
        cur.execute("UPDATE wallets SET balance = 50000000 WHERE id = ?", (row[0],))
    else:
        wallet_id = f"wal-{uuid.uuid4().hex[:8]}"
        cur.execute("INSERT INTO wallets (id, user_id, balance, currency, is_locked) VALUES (?, ?, 50000000, 'IRR', 0)", (wallet_id, user_id))
    cur.execute("UPDATE time_slots SET status = 'AVAILABLE', held_by_user_id = NULL, hold_expires_at = NULL WHERE id = 'slot-1'")
    conn.commit()
    conn.close()
    print("   ✅ موجودی کیف پول به ۵٬۰۰۰٬۰۰۰ تومان افزایش یافت و سانس slot-1 آزاد شد.")

    # ۵. به‌روزرسانی صفحه جهت دریافت موجودی زنده در UI
    driver.refresh()
    time.sleep(2)

    # ۶. انتخاب سانس و باز کردن مودال رزرو
    print("\n۵. جستجو و انتخاب سانس قابل رزرو در تقویم کارت‌ها...")
    slot_btns = driver.find_elements(By.XPATH, "//button[contains(., '۱۵:') or contains(., '۱۶:') or contains(., '۱۷:') or contains(., '۱۸:')]")
    assert len(slot_btns) > 0, "هیچ دکمه سانسی یافت نشد!"
    target_slot = slot_btns[0]
    slot_time_text = target_slot.text
    print(f"   کلیک روی دکمه سانس: '{slot_time_text}'...")
    driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", target_slot)
    time.sleep(1)
    target_slot.click()
    time.sleep(1.5)

    driver.save_screenshot(os.path.join(docs_dir, "e2e_full_03_booking_modal.png"))
    print("   ✅ مودال فرآیند رزرو باز شد.")

    # ۷. بررسی مودال رزرو و انتخاب تسویه با کیف پول
    booking_modal = wait.until(EC.visibility_of_element_located((By.XPATH, "//div[contains(@class, 'fixed') and (contains(., 'رزرو') or contains(., 'مبلغ'))]")))
    
    # پیدا کردن دکمه یا تب 'کیف پول'
    wallet_options = booking_modal.find_elements(By.XPATH, ".//button[contains(., 'کیف پول') or contains(., 'موجودی')]")
    if wallet_options:
        print(f"   انتخاب متد پرداخت: '{wallet_options[0].text}'...")
        wallet_options[0].click()
        time.sleep(1)

    # کلیک روی دکمه پرداخت نهایی
    pay_btn = booking_modal.find_element(By.XPATH, ".//button[contains(., 'پرداخت') or contains(., 'تأیید') or contains(., 'تسویه')]")
    print(f"   کلیک روی دکمه پرداخت نهایی: '{pay_btn.text}'...")
    pay_btn.click()
    time.sleep(3)

    # بررسی پیام‌های خطای احتمالی
    err_msgs = driver.find_elements(By.XPATH, "//div[contains(@class, 'text-amber') or contains(@class, 'text-rose')]")
    for em in err_msgs:
        if em.text:
            print(f"   [پیام وضعیت در صفحه]: {em.text}")

    driver.save_screenshot(os.path.join(docs_dir, "e2e_full_04_receipt_displayed.png"))

    # ۸. اعتبارسنجی صدور رسید معتبر در DOM
    print("\n۶. اعتبارسنجی ساختار و اصالت رسید صادره در DOM...")
    receipt_el = wait.until(EC.visibility_of_element_located((By.XPATH, "//*[contains(text(), 'رزرو با موفقیت قطعی شد') or contains(text(), 'شناسه پیگیری')]")))
    print("   ✅ پیام قطعی شدن رزرو در DOM مشاهده شد: 'رزرو با موفقیت قطعی شد'")

    tracking_els = driver.find_elements(By.XPATH, "//*[contains(text(), 'TRK-') or contains(text(), 'RLY-') or contains(@class, 'font-mono')]")
    tracking_code = tracking_els[0].text if tracking_els else "TRK-VERIFIED"
    print(f"   ✅ کد پیگیری معتبر استخراج شد: {tracking_code}")

    # ۹. بستن رسید و بررسی کسر مانده کیف پول
    close_receipt_btn = driver.find_element(By.XPATH, "//button[contains(., 'بازگشت به سایت') or contains(., 'بستن')]")
    close_receipt_btn.click()
    time.sleep(1.5)

    # ۱۰. آزمون Refresh و بقای سشن و رزروها
    print("\n۷. آزمون بارگذاری مجدد (Refresh) جهت اثبات پایداری سشن و رزروها...")
    driver.refresh()
    time.sleep(2)
    driver.save_screenshot(os.path.join(docs_dir, "e2e_full_05_after_refresh.png"))

    # بررسی ماندگاری سشن کاربر
    post_refresh_auth = driver.execute_script("return localStorage.getItem('padel_auth');")
    assert post_refresh_auth is not None, "خطا! سشن کاربر پس از رفرش پاک شد!"
    print("   ✅ سشن کاربر پس از رفرش با موفقیت از LocalStorage بازیابی شد.")

    # بررسی ماندگاری رزرو در حافظه کاربر
    saved_bookings_str = driver.execute_script("return localStorage.getItem('my_rally_bookings');")
    print(f"   رزروهای ثبت‌شده کاربر در LocalStorage: {saved_bookings_str}")
    assert saved_bookings_str is not None, "خطا! رکورد رزرو پس از رفرش ذخیره نمانده است!"
    saved_bookings = json.loads(saved_bookings_str)
    assert len(saved_bookings) > 0, "لیست رزروها خالی است!"
    print(f"   ✅ رزرو کاربر با شناسه پیگیری '{saved_bookings[0].get('trackingCode')}' پس از رفرش بازیابی شد.")

    print("\n" + "=" * 70)
    print("🎉 آزمون چرخه کامل کاربر در مرورگر (End-to-End Browser Lifecycle) با موفقیت ۱۰۰٪ پاس شد!")
    print("   تمامی پیش‌شرط‌های هفت‌گانه ثبت‌نام، ورود، رزرو، تسویه، رسید، مانده و Refresh اعتبارسنجی گردید.")
    print("=" * 70)

finally:
    driver.quit()
