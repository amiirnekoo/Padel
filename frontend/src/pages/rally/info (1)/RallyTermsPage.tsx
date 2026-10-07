import React, { useState } from 'react';
import { ShieldCheck, RefreshCw, ShoppingBag, FileText, CheckCircle2, Scale } from 'lucide-react';

export const RallyTermsPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'booking' | 'shop' | 'privacy' | 'complaints'>('booking');

  return (
    <div className="w-full bg-[#071524] text-[#F5F4EF] min-h-screen py-10 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Hero */}
        <div className="text-center space-y-3 bg-[#0B2238] border border-[#0F3960] rounded-2xl p-6 sm:p-8 shadow-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D7ED68]/10 text-[#D7ED68] text-xs font-bold border border-[#D7ED68]/20">
            <Scale className="w-4 h-4" />
            <span>شفافیت حقوقی و الزامات تجارت الکترونیک</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            قوانین، مقررات و رویه استرداد وجه پلتفرم رالی
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
            استفاده از خدمات رزرو کورت‌ها، فروشگاه تجهیزات و مسابقات رالی به معنای آگاهی کامل و پذیرش ضوابط قانونی زیر است.
          </p>
        </div>

        {/* Section Navigation Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#0B2238]/60 p-1.5 rounded-xl border border-white/10">
          <button
            onClick={() => setActiveSection('booking')}
            className={`py-3 px-3 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              activeSection === 'booking'
                ? 'bg-[#D7ED68] text-black shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <RefreshCw className="w-4 h-4 shrink-0" />
            <span>رزرو و لغو سانس</span>
          </button>

          <button
            onClick={() => setActiveSection('shop')}
            className={`py-3 px-3 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              activeSection === 'shop'
                ? 'bg-[#D7ED68] text-black shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <ShoppingBag className="w-4 h-4 shrink-0" />
            <span>فروشگاه و مرجوعی کالا</span>
          </button>

          <button
            onClick={() => setActiveSection('privacy')}
            className={`py-3 px-3 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              activeSection === 'privacy'
                ? 'bg-[#D7ED68] text-black shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>حریم خصوصی</span>
          </button>

          <button
            onClick={() => setActiveSection('complaints')}
            className={`py-3 px-3 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              activeSection === 'complaints'
                ? 'bg-[#D7ED68] text-black shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <FileText className="w-4 h-4 shrink-0" />
            <span>ثبت شکایات و حل اختلاف</span>
          </button>
        </div>

        {/* Content Box */}
        <div className="bg-[#0B2238] border border-[#0F3960] rounded-2xl p-6 sm:p-8 space-y-6 text-sm leading-relaxed text-slate-200">
          
          {activeSection === 'booking' && (
            <div className="space-y-6">
              <div className="border-b border-white/10 pb-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#D7ED68]" />
                  شرایط رزرو آنلاین کورت‌ها، سانس‌ها و رویه کنسلی
                </h2>
                <p className="text-xs text-slate-400 mt-1">مطابق با آیین‌نامه اجرایی خدمات ورزشی و قوانین جاری کشور</p>
              </div>

              <div className="space-y-4">
                <div className="bg-[#071524] p-4 rounded-xl border border-white/5 space-y-2">
                  <h3 className="font-bold text-[#D7ED68]">ماده ۱: شرایط لغو سانس توسط کاربر</h3>
                  <p>
                    کاربران تا ۲۴ ساعت پیش از شروع سانس رزروشده، حق لغو درخواست را از طریق پنل کاربری دارند. در این حالت، مبلغ با کسر ۱۰٪ کارمزد اداری و خدمات بانکی به کیف پول کاربر در سامانه مسترد می‌گردد.
                  </p>
                  <p className="text-xs text-amber-300">
                    * لغو کمتر از ۲۴ ساعت مانده به سانس به دلیل عدم امکان پر کردن ظرفیت زمین برای باشگاه، امکان استرداد وجه ندارد مگر با تایید مستقیم مدیریت مجموعه.
                  </p>
                </div>

                <div className="bg-[#071524] p-4 rounded-xl border border-white/5 space-y-2">
                  <h3 className="font-bold text-[#D7ED68]">ماده ۲: شرایط فورس‌ماژور و تغییرات جوی (کورت‌های روباز)</h3>
                  <p>
                    در صورت بارش باران، برف یا شرایط نامساعد جوی در زمین‌های روباز (مانند کورت‌های روباز مجموعه لفور)، سانس لغو و ۱۰۰٪ مبلغ رزرو بدون هیچ‌گونه کسورات به کیف پول کاربر بازگردانده شده یا با هماهنگی به ساعت جایگزین منتقل می‌گردد.
                  </p>
                </div>

                <div className="bg-[#071524] p-4 rounded-xl border border-white/5 space-y-2">
                  <h3 className="font-bold text-[#D7ED68]">ماده ۳: قوانین انضباطی ورود به کورت</h3>
                  <p>
                    استفاده از کفش ورزشی مخصوص پدل/تنیس با زیره مناسب جهت حفظ سلامت چمن مصنوعی کورت الزامی است. حضور بازیکنان ۱۵ دقیقه پیش از موعد سانس توصیه می‌گردد.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'shop' && (
            <div className="space-y-6">
              <div className="border-b border-white/10 pb-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#D7ED68]" />
                  شرایط خرید، ضمانت اصالت و رویه مرجوعی کالا در فروشگاه رالی
                </h2>
                <p className="text-xs text-slate-400 mt-1">منطبق با مواد ۳۷ و ۳۸ قانون تجارت الکترونیک (حق انصراف مصرف‌کننده)</p>
              </div>

              <div className="space-y-4">
                <div className="bg-[#071524] p-4 rounded-xl border border-white/5 space-y-2">
                  <h3 className="font-bold text-[#D7ED68]">ماده ۴: ضمانت ۷ روزه اصالت و سلامت کالا</h3>
                  <p>
                    کلیه راکت‌ها، توپ‌ها و تجهیزات ارائه شده در فروشگاه رالی دارای ضمانت ۱۰۰٪ اصالت برندهای معتبر بین‌المللی (Nox, Bullpadel, Head, Wilson) بوده و خریدار تا ۷ روز کاری پس از تحویل، حق انصراف و مرجوعی کالا را دارد.
                  </p>
                </div>

                <div className="bg-[#071524] p-4 rounded-xl border border-white/5 space-y-2">
                  <h3 className="font-bold text-[#D7ED68]">ماده ۵: شرایط پذیرش مرجوعی تجهیزات</h3>
                  <p>
                    کالای مرجوعی باید در شرایط اولیه، بدون اثر ضربه، خط‌وخش و با بسته‌بندی اصلی بازگردانده شود. پلمپ نایلونی گریپ و هولوگرام اصالت راکت نباید باز شده باشد.
                  </p>
                </div>

                <div className="bg-[#071524] p-4 rounded-xl border border-white/5 space-y-2">
                  <h3 className="font-bold text-[#D7ED68]">ماده ۶: شیوه بازگشت وجه خریدار</h3>
                  <p>
                    پس از دریافت کالای مرجوعی در انبار و تایید کارشناس فنی، مبلغ پرداختی ظرف مدت حداکثر ۲۴ الی ۴۸ ساعت کاری به شماره شبای اعلامی خریدار واریز خواهد شد.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'privacy' && (
            <div className="space-y-6">
              <div className="border-b border-white/10 pb-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#D7ED68]" />
                  بیانیه حفظ حریم خصوصی و امنیت اطلاعات کاربران
                </h2>
                <p className="text-xs text-slate-400 mt-1">تعهد پلتفرم رالی به حفاظت از حریم شخصی و داده‌های ورزشکاران</p>
              </div>

              <div className="space-y-4">
                <div className="bg-[#071524] p-4 rounded-xl border border-white/5 space-y-2">
                  <h3 className="font-bold text-[#D7ED68]">ماده ۷: گردآوری و نگهداری اطلاعات</h3>
                  <p>
                    پلتفرم رالی متعهد است اطلاعات هویتی و شماره همراه کاربران را صرفاً جهت احراز هویت، ارسال پیامک‌های وضعیت رزرو، کد ورود و پیگیری سفارشات فروشگاه استفاده نماید.
                  </p>
                </div>

                <div className="bg-[#071524] p-4 rounded-xl border border-white/5 space-y-2">
                  <h3 className="font-bold text-[#D7ED68]">ماده ۸: امنیت تبادلات مالی</h3>
                  <p>
                    کلیه تراکنش‌های بانکی از طریق درگاه‌های شاپرکی متصل به شبکه رسمی بانکی و با پروتکل امنیتی SSL/TLS رمزنگاری می‌شوند و هیچ‌گونه اطلاعات کارت یا رمز کاربران در سرورهای رالی ذخیره نمی‌شود.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'complaints' && (
            <div className="space-y-6">
              <div className="border-b border-white/10 pb-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#D7ED68]" />
                  رویه ثبت شکایات، انتقادات و حل اختلاف
                </h2>
                <p className="text-xs text-slate-400 mt-1">پاسخگویی سریع به دغدغه‌های کاربران و رسیدگی مطابق استانداردهای اینماد</p>
              </div>

              <div className="space-y-4">
                <div className="bg-[#071524] p-4 rounded-xl border border-white/5 space-y-2">
                  <h3 className="font-bold text-[#D7ED68]">ماده ۹: شیوه ارسال شکایت</h3>
                  <p>
                    کاربران گرامی در صورت بروز هرگونه مغایرت در خدمات کورت‌ها یا کالاهای ارسالی، می‌توانند از طریق صفحه تماس با ما، ارسال پیامک به پشتیبانی و یا تماس تلفنی با واحد بازرسی رالی ارتباط برقرار نمایند.
                  </p>
                </div>

                <div className="bg-[#071524] p-4 rounded-xl border border-white/5 space-y-2">
                  <h3 className="font-bold text-[#D7ED68]">ماده ۱۰: زمان‌بندی پاسخگویی و حل اختلاف</h3>
                  <p>
                    واحد بازرسی و پشتیبانی رالی موظف است ظرف حداکثر ۲۴ الی ۴۸ ساعت کاری به کلیه شکایات ثبت‌شده رسیدگی کرده و نتیجه را مستقیماً به کاربر اعلام کند.
                  </p>
                  <p className="text-xs text-slate-300">
                    همچنین کاربران در صورت عدم حصول توافق می‌توانند از طریق سامانه ثبت شکایات نماد اعتماد الکترونیکی (اینماد) در نشانی <a href="https://enamad.ir" target="_blank" rel="noreferrer" className="text-[#D7ED68] underline">enamad.ir</a> اقدام به ثبت درخواست داوری نمایند.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
