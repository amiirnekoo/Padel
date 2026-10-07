import React from 'react';
import { Award, Target, Users, Sparkles, Building, CheckCircle2 } from 'lucide-react';
import { RallyLogo } from '../../../components/rally/RallyLogo';

export const RallyAboutPage: React.FC = () => {
  return (
    <div className="w-full bg-[#071524] text-[#F5F4EF] min-h-screen py-10 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* Hero Section */}
        <div className="text-center space-y-4 bg-[#0B2238] border border-[#0F3960] rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="flex justify-center mb-2">
            <RallyLogo className="h-12 w-auto" />
          </div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#D7ED68]/10 text-[#D7ED68] text-xs font-bold border border-[#D7ED68]/20">
            <Sparkles className="w-4 h-4" />
            <span>مرجع یکپارچه و هوشمند ورزش‌های راکتی ایران</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white">
            درباره پلتفرم تخصصی رالی (Raally)
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            رالی یک اکوسیستم نوین ورزشی است که با هدف ارتقای استانداردهای ورزش پدل و تنیس، حذف واسطه‌ها، و ایجاد دسترسی سریع و شفاف به سانس‌ها، تجهیزات اورجینال و رویدادهای قهرمانی کشور پایه‌گذاری شده است.
          </p>
        </div>

        {/* Pillars / Values Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#0B2238] border border-[#0F3960] rounded-2xl p-6 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-[#D7ED68]/15 text-[#D7ED68] flex items-center justify-center font-bold">
              <Target className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-black text-white">ماموریت رالی</h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              تسهیل و لذت‌بخش کردن ورزش با فراهم کردن سامانه رزرو آنی بدون نیاز به تماس تلفنی، ارزیابی هوشمند سطح بازیکنان و برگزاری رقابت‌های استاندارد.
            </p>
          </div>

          <div className="bg-[#0B2238] border border-[#0F3960] rounded-2xl p-6 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-[#D7ED68]/15 text-[#D7ED68] flex items-center justify-center font-bold">
              <Award className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-black text-white">اصالت و تضمین کیفیت</h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              ارائه تجهیزات ورزشی و راکت‌های پدل با ضمانت ۱۰۰٪ اصالت از برندهای بین‌المللی و همکاری با کورت‌های دارای گواهی استاندارد فنی فدراسیون جهانی.
            </p>
          </div>

          <div className="bg-[#0B2238] border border-[#0F3960] rounded-2xl p-6 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-[#D7ED68]/15 text-[#D7ED68] flex items-center justify-center font-bold">
              <Users className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-black text-white">جامعه ورزشکاران</h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              ایجاد بستری پویا برای حریف‌یابی، ارتباط با مربیان رسمی تراز اول، و دسترسی به رنکینگ رسمی بازیکنان و مقالات آموزشی تخصصی.
            </p>
          </div>
        </div>

        {/* Featured Clubs & Network */}
        <div className="bg-[#0B2238] border border-[#0F3960] rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="border-b border-white/10 pb-4">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Building className="w-5 h-5 text-[#D7ED68]" />
              باشگاه‌ها و کورت‌های همکار رالی
            </h2>
            <p className="text-xs text-slate-400 mt-1">گزیده‌ای از برترین مجموعه‌های استاندارد پدل تهران متصل به تقویم رالی</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#071524] p-4 rounded-xl border border-white/5 space-y-2">
              <div className="text-sm font-bold text-white">آرنا FGB باشگاه انقلاب</div>
              <p className="text-xs text-slate-300">کورت‌های مسقف و سالنی با چمن استاندارد مسابقات بین‌المللی در خیابان سئول.</p>
              <div className="flex items-center gap-1.5 text-xs text-[#D7ED68]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>همکار رسمی رالی</span>
              </div>
            </div>

            <div className="bg-[#071524] p-4 rounded-xl border border-white/5 space-y-2">
              <div className="text-sm font-bold text-white">باشگاه پدل لفور (Lafour)</div>
              <p className="text-xs text-slate-300">کورت‌های سوپر پانورامیک روباز با چمن مونت‌کارلو و امکانات VIP در آجودانیه.</p>
              <div className="flex items-center gap-1.5 text-xs text-[#D7ED68]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>همکار رسمی رالی</span>
              </div>
            </div>

            <div className="bg-[#071524] p-4 rounded-xl border border-white/5 space-y-2">
              <div className="text-sm font-bold text-white">باشگاه پدل ویوا (VIVA)</div>
              <p className="text-xs text-slate-300">کورت سازه‌ای مسقف با دیواره‌های سکوریت و گردش هوای طبیعی در بلوار ارتش.</p>
              <div className="flex items-center gap-1.5 text-xs text-[#D7ED68]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>همکار رسمی رالی</span>
              </div>
            </div>
          </div>
        </div>

        {/* Legal & Security Statement */}
        <div className="bg-[#0A2640] border border-[#124B80] rounded-2xl p-6 text-center space-y-2">
          <h3 className="text-sm font-bold text-white">مجوزها و پایبندی به قوانین</h3>
          <p className="text-xs text-slate-300 max-w-2xl mx-auto leading-relaxed">
            کلیه فعالیت‌های پلتفرم رالی تحت نظارت و منطبق با قوانین تجارت الکترونیک، قوانین حمایت از حقوق مصرف‌کنندگان و ضوابط نماد اعتماد الکترونیکی (اینماد) مرکز توسعه تجارت الکترونیکی وزارت صمت انجام می‌پذیرد.
          </p>
        </div>

      </div>
    </div>
  );
};
