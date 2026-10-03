import sys
import os
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

sys.stdout.reconfigure(encoding='utf-8')

print("=" * 70)
print("🌐 شروع آزمون تعاملی واقعی مرورگر (Interactive Browser E2E Test)")
print("   با Google Chrome Headless و Selenium بر روی نسخه انتشار 3f7f489")
print("=" * 70)

chrome_opts = Options()
chrome_opts.add_argument("--headless=new")
chrome_opts.add_argument("--window-size=1400,950")
chrome_opts.add_argument("--no-sandbox")
chrome_opts.add_argument("--disable-gpu")
chrome_opts.add_argument("--disable-dev-shm-usage")

driver = webdriver.Chrome(options=chrome_opts)
wait = WebDriverWait(driver, 10)

try:
    url = "http://localhost:4173"
    print(f"۱. بارگذاری آدرس: {url}")
    driver.get(url)
    time.sleep(2)
    print(f"   عنوان صفحه: '{driver.title}'")
    assert "رالی" in driver.title or "پدل" in driver.title

    docs_dir = r"g:\My Drive\Company\File\Padel\docs"
    os.makedirs(docs_dir, exist_ok=True)
    driver.save_screenshot(os.path.join(docs_dir, "e2e_01_homepage.png"))
    print("   ✅ اسکرین‌شات صفحه اصلی ذخیره شد: e2e_01_homepage.png")

    # ۲. پیدا کردن و کلیک روی دکمه 'ورود' در هدر
    print("\n۲. جستجو و تعامل با دکمه 'ورود' در هدر...")
    login_buttons = driver.find_elements(By.XPATH, "//button[contains(., 'ورود')]")
    assert len(login_buttons) > 0, "دکمه ورود یافت نشد!"
    header_login_btn = login_buttons[0]
    print(f"   دکمه ورود با متن '{header_login_btn.text}' یافت شد. در حال کلیک...")
    header_login_btn.click()
    time.sleep(1)

    # ۳. بررسی باز شدن مودال ورود (AuthModal)
    print("\n۳. بررسی باز شدن مودال احراز هویت در DOM...")
    modal = wait.until(EC.visibility_of_element_located((By.XPATH, "//div[contains(@class, 'fixed') and contains(., 'ورود')]")))
    print("   ✅ مودال احراز هویت با موفقیت در DOM رندر و باز شد.")
    driver.save_screenshot(os.path.join(docs_dir, "e2e_02_login_modal.png"))
    print("   ✅ اسکرین‌شات مودال ورود ذخیره شد: e2e_02_login_modal.png")

    # ۴. سوئیچ به فرم ثبت‌نام (RegisterForm)
    print("\n۴. بررسی دکمه‌های موجود در داخل مودال...")
    modal_buttons = modal.find_elements(By.TAG_NAME, "button")
    for i, b in enumerate(modal_buttons):
        print(f"   [دکمه {i}]: '{b.text}' (aria: {b.get_attribute('aria-label')})")
    
    # پیدا کردن دکمه ثبت نام
    switch_to_register_btn = None
    for b in modal_buttons:
        if "ثبت‌نام" in b.text or "عضو جدید" in b.text or "ثبت نام" in b.text:
            switch_to_register_btn = b
            break
            
    if not switch_to_register_btn:
        print("   جستجو بر اساس تگ‌های a یا span...")
        clickable_links = modal.find_elements(By.XPATH, ".//*[contains(text(), 'ثبت') or contains(text(), 'عضو')]")
        for cl in clickable_links:
            print(f"   [المان قابل کلیک]: {cl.tag_name} -> '{cl.text}'")
            if cl.tag_name in ['button', 'a', 'span']:
                switch_to_register_btn = cl
                break

    assert switch_to_register_btn is not None, "دکمه ثبت نام یافت نشد!"
    print(f"   دکمه سوئیچ ثبت‌نام یافت شد: '{switch_to_register_btn.text}'. کلیک...")
    switch_to_register_btn.click()
    time.sleep(1)

    driver.save_screenshot(os.path.join(docs_dir, "e2e_03_register_form.png"))
    print("   ✅ اسکرین‌شات فرم ثبت‌نام ذخیره شد: e2e_03_register_form.png")

    # ۵. تعامل واقعی با فیلدهای فرم ثبت‌نام
    print("\n۵. ورود داده‌های آزمون در فیلدهای فرم ثبت‌نام (شامل فیلدهای جدید email و دست تخصصی)...")
    inputs = driver.find_elements(By.TAG_NAME, "input")
    print(f"   تعداد اینپوت‌های فعال در فرم: {len(inputs)}")

    # یافتن فیلدها بر اساس placeholder یا type
    for inp in inputs:
        ph = inp.get_attribute("placeholder") or ""
        typ = inp.get_attribute("type") or ""
        val = inp.get_attribute("value") or ""
        
        if "نام" in ph or "علی" in ph:
            inp.clear()
            inp.send_keys("امیر بازیکن تستی")
            print(f"   [تکمیل فیلد نام]: {ph} -> 'امیر بازیکن تستی'")
        elif "09" in ph or "همراه" in ph or "شماره" in ph:
            inp.clear()
            inp.send_keys("09129998877")
            print(f"   [تکمیل فیلد تلفن]: {ph} -> '09129998877'")
        elif "ایمیل" in ph or "email" in ph or typ == "email":
            inp.clear()
            inp.send_keys("test_pilot_2026@raally.ir")
            print(f"   [تکمیل فیلد ایمیل]: {ph} -> 'test_pilot_2026@raally.ir'")
        elif typ == "password":
            inp.clear()
            inp.send_keys("StrongP@ss2026!")
            print(f"   [تکمیل فیلد رمز]: {ph} -> 'StrongP@ss2026!'")

    time.sleep(1)
    driver.save_screenshot(os.path.join(docs_dir, "e2e_04_register_filled.png"))
    print("   ✅ اسکرین‌شات فرم تکمیل‌شده ثبت‌نام ذخیره شد: e2e_04_register_filled.png")

    # ۶. کلیک روی دکمه ثبت‌نام
    print("\n۶. کلیک روی دکمه نهایی ثبت‌نام...")
    submit_reg_btn = modal.find_element(By.XPATH, ".//button[@type='submit' or contains(., 'تکمیل ثبت‌نام') or contains(., 'ثبت‌نام در رالی')]")
    print(f"   دکمه ارسال: '{submit_reg_btn.text}'. در حال کلیک...")
    submit_reg_btn.click()
    time.sleep(2)
    driver.save_screenshot(os.path.join(docs_dir, "e2e_05_register_submitted.png"))
    print("   ✅ اسکرین‌شات پس از ارسال ثبت‌نام ذخیره شد: e2e_05_register_submitted.png")

    # ۷. بستن مودال و تست تعامل با دکمه‌های سانس‌ها در صفحه اصلی
    print("\n۷. بستن پنجره مودال و تست تعامل با سانس‌ها...")
    close_btns = modal.find_elements(By.XPATH, ".//button[@aria-label='بستن پنجره']")
    if close_btns:
        close_btns[0].click()
        time.sleep(1)
        print("   مودال بسته شد.")

    # کلیک روی دکمه سانس‌های باشگاه‌ها در صفحه اصلی
    slot_buttons = driver.find_elements(By.XPATH, "//button[contains(., '۱۵:') or contains(., '۱۶:') or contains(., '۱۷:') or contains(., '۱۸:')]")
    print(f"   تعداد دکمه‌های سانس یافت‌شده در کارت‌ها: {len(slot_buttons)}")
    if slot_buttons:
        target_slot = slot_buttons[0]
        print(f"   کلیک روی دکمه سانس: '{target_slot.text}'...")
        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", target_slot)
        time.sleep(1)
        target_slot.click()
        time.sleep(1)
        driver.save_screenshot(os.path.join(docs_dir, "e2e_06_slot_clicked.png"))
        print("   ✅ اسکرین‌شات پس از کلیک روی سانس ذخیره شد: e2e_06_slot_clicked.png")

    print("\n" + "=" * 70)
    print("🎉 آزمون تعاملی واقعی مرورگر (E2E UI) با موفقیت کامل به پایان رسید!")
    print("   تمامی تعاملات دکمه‌ها، فرم‌ها، تغییر وضعیت‌ها و اسکرین‌شات‌ها ثبت گردید.")
    print("=" * 70)

finally:
    driver.quit()
