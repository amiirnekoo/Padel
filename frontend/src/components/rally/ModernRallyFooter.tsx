import React from 'react';
import { RallyLogo } from './RallyLogo';
import { Phone, Mail, MapPin, Instagram, Send, ShieldCheck } from 'lucide-react';

interface ModernRallyFooterProps {
  onNavigateTab?: (tab: string) => void;
}

export const ModernRallyFooter: React.FC<ModernRallyFooterProps> = ({
  onNavigateTab
}) => {
  return (
    <footer className="w-full bg-[#091B2F] text-[#F5F4EF] border-t border-[#0B4278] pt-14 pb-20 md:pb-12" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          
          {/* Brand Info (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <RallyLogo className="h-9 w-auto" />
            </div>
            <p className="text-sm text-[#F5F4EF]/80 font-medium leading-relaxed max-w-sm">
              رالی، مرجع تخصصی ورزش‌های راکتی ایران؛ پلتفرم یکپارچه رزرو زمین، آکادمی‌های تخصصی، مربیان حرفه‌ای و مسابقات رسمی پدل و تنیس.
            </p>
            <div className="flex items-center gap-3 pt-2 text-[#D7ED68]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D7ED68]" />
              <span className="text-xs font-bold text-[#F5F4EF]">سامانه در دسترس ۲۴ ساعته در سراسر کشور</span>
            </div>
          </div>

          {/* Quick Navigation 1 */}
          <div className="space-y-3">
            <h4 className="text-sm font-black text-white border-r-2 border-[#D7ED68] pr-2.5">
              خدمات رالی
            </h4>
            <ul className="space-y-2 text-xs font-semibold text-[#F5F4EF]/75">
              <li>
                <button
                  onClick={() => onNavigateTab?.('courts')}
                  className="hover:text-[#D7ED68] transition-colors cursor-pointer text-right"
                >
                  رزرو زمین‌های پدل
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab?.('courts')}
                  className="hover:text-[#D7ED68] transition-colors cursor-pointer text-right"
                >
                  زمین‌های تنیس خاکی و هاردکورت
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab?.('coaches')}
                  className="hover:text-[#D7ED68] transition-colors cursor-pointer text-right"
                >
                  مربیان تأییدشده و آکادمی‌ها
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab?.('tournaments')}
                  className="hover:text-[#D7ED68] transition-colors cursor-pointer text-right"
                >
                  تقویم مسابقات کشوری
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab?.('rankings')}
                  className="hover:text-[#D7ED68] transition-colors cursor-pointer text-right"
                >
                  رنکینگ رسمی بازیکنان ایران و جهان
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab?.('magazine')}
                  className="hover:text-[#D7ED68] transition-colors cursor-pointer text-right"
                >
                  مجله تخصصی و مقالات آموزشی
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab?.('shop')}
                  className="hover:text-[#D7ED68] transition-colors cursor-pointer text-right text-[#D7ED68]"
                >
                  فروشگاه راکت و تجهیزات
                </button>
              </li>
            </ul>
          </div>

          {/* Quick Navigation 2: B2B */}
          <div className="space-y-3">
            <h4 className="text-sm font-black text-white border-r-2 border-[#D7ED68] pr-2.5">
              باشگاه‌ها و شرکا
            </h4>
            <ul className="space-y-2 text-xs font-semibold text-[#F5F4EF]/75">
              <li>
                <button
                  onClick={() => onNavigateTab?.('partners')}
                  className="hover:text-[#D7ED68] transition-colors cursor-pointer text-right"
                >
                  ثبت باشگاه و مدیریت سانس‌ها
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab?.('sponsors')}
                  className="hover:text-[#D7ED68] transition-colors cursor-pointer text-right"
                >
                  فرصت‌های اسپانسری و تبلیغات
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab?.('partners')}
                  className="hover:text-[#D7ED68] transition-colors cursor-pointer text-right"
                >
                  قوانین و استانداردهای کورت
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="text-sm font-black text-white border-r-2 border-[#D7ED68] pr-2.5">
              ارتباط با ما
            </h4>
            <div className="space-y-2.5 text-xs text-[#F5F4EF]/80 font-medium">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#D7ED68] shrink-0" />
                <span dir="ltr">۰۲۱ - ۲۲۶۶۷۷۸۸</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#D7ED68] shrink-0" />
                <span>support@rallysports.ir</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#D7ED68] shrink-0 mt-0.5" />
                <span>تهران، خیابان سئول، برج ورزشی رالی</span>
              </div>
            </div>
          </div>

        </div>

        {/* Trust Badges & Licenses Row */}
        <div className="py-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Enamad Trust Seal Card */}
            <div 
              className="w-24 h-28 bg-white rounded-2xl p-2.5 flex items-center justify-center shadow-lg border border-slate-200/20 hover:scale-105 transition-transform duration-200 shrink-0"
              title="نماد اعتماد الکترونیکی (اینماد)"
            >
              <div 
                className="flex items-center justify-center w-full h-full [&>a]:flex [&>a]:items-center [&>a]:justify-center [&>a]:w-full [&>a]:h-full [&>a>img]:max-h-20 [&>a>img]:w-auto [&>a>img]:object-contain"
                dangerouslySetInnerHTML={{
                  __html: `<a referrerpolicy='origin' target='_blank' href='https://trustseal.enamad.ir/?id=6070546&Code=BqINEDxQIOxO7B1XzLdqc0zem1ShxPML'><img referrerpolicy='origin' src='https://trustseal.enamad.ir/logo.aspx?id=6070546&Code=BqINEDxQIOxO7B1XzLdqc0zem1ShxPML' alt='' style='cursor:pointer' code='BqINEDxQIOxO7B1XzLdqc0zem1ShxPML'></a>`
                }}
              />
            </div>
            
            <div className="space-y-1.5 text-right">
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-white">نماد اعتماد الکترونیکی (اینماد)</span>
                <span className="text-[11px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold">
                  احراز هویت رسمی
                </span>
              </div>
              <p className="text-xs text-[#F5F4EF]/75 max-w-lg leading-relaxed font-medium">
                پلتفرم رالی دارای مجوز و تاییدیه رسمی از مرکز توسعه تجارت الکترونیکی وزارت صنعت، معدن و تجارت است. کلیه تراکنش‌ها از طریق درگاه‌های امن شاپرک پردازش و تضمین می‌گردند.
              </p>
            </div>
          </div>

          {/* Security & Payment Badges */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
            <div className="flex items-center gap-2 bg-[#0C243B] px-3.5 py-2.5 rounded-xl border border-white/5 font-semibold">
              <ShieldCheck className="w-4 h-4 text-[#D7ED68]" />
              <span>پرداخت امن شاپرک</span>
            </div>
            <div className="flex items-center gap-2 bg-[#0C243B] px-3.5 py-2.5 rounded-xl border border-white/5 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>رمزنگاری سراسری ۲۵۶ بیتی SSL</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Safety */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#66706D]">
          <div className="flex items-center gap-2 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-[#D7ED68]" />
            <span>کلیه حقوق این سامانه متعلق به پلتفرم ورزشی رالی (سال ۱۴۰۵) است.</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400 font-medium">
            <span>حفظ حریم خصوصی</span>
            <span>•</span>
            <span>شرایط استفاده از خدمات</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
