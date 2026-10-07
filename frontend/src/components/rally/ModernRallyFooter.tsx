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

          {/* Quick Navigation 2: Corporate & Legal */}
          <div className="space-y-3">
            <h4 className="text-sm font-black text-white border-r-2 border-[#D7ED68] pr-2.5">
              باشگاه‌ها و قوانین
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
                  onClick={() => onNavigateTab?.('terms')}
                  className="hover:text-[#D7ED68] transition-colors cursor-pointer text-right text-[#D7ED68]"
                >
                  قوانین و رویه استرداد وجه
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab?.('about')}
                  className="hover:text-[#D7ED68] transition-colors cursor-pointer text-right"
                >
                  درباره پلتفرم رالی
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab?.('contact')}
                  className="hover:text-[#D7ED68] transition-colors cursor-pointer text-right"
                >
                  ثبت شکایات و پشتیبانی
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Details & Enamad */}
          <div className="space-y-4">
            <h4 className="text-sm font-black text-white border-r-2 border-[#D7ED68] pr-2.5">
              ارتباط و نماد اعتماد
            </h4>
            <div className="space-y-2 text-xs text-[#F5F4EF]/80 font-medium">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#D7ED68] shrink-0" />
                <span dir="ltr">۰۲۱ - ۲۲۶۶۷۷۸۸</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#D7ED68] shrink-0" />
                <span>info@raally.ir</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#D7ED68] shrink-0 mt-0.5" />
                <span>تهران، خ سئول، م ورزشی انقلاب</span>
              </div>
            </div>

            {/* Official Enamad Badge */}
            <div className="pt-2">
              <div 
                className="relative w-20 h-24 bg-white rounded-xl p-2 flex flex-col items-center justify-center shadow-md border border-slate-200/20 hover:scale-105 transition-transform duration-200 shrink-0 overflow-hidden cursor-pointer group"
                title="نماد اعتماد الکترونیکی (اینماد)"
              >
                {/* Fallback emblem with stars */}
                <div className="flex flex-col items-center justify-center w-full h-full pointer-events-none select-none">
                  <div className="flex items-center gap-0.5 mb-1 text-amber-500 font-bold">
                    <span className="text-[10px] leading-none">★</span>
                    <span className="text-[10px] leading-none">★</span>
                  </div>
                  <img 
                    src="/images/enamad_icon.svg" 
                    alt="" 
                    className="w-9 h-9 object-contain drop-shadow-sm opacity-90 group-hover:opacity-100 transition-opacity" 
                  />
                  <span className="text-[8px] font-black text-[#1A365D] mt-1 tracking-tight">
                    اینماد
                  </span>
                </div>

                {/* Live Dynamic Seal Layer */}
                <div 
                  className="absolute inset-0 flex items-center justify-center w-full h-full [&>a]:flex [&>a]:items-center [&>a]:justify-center [&>a]:w-full [&>a]:h-full [&>a>img]:max-h-16 [&>a>img]:w-auto [&>a>img]:object-contain z-10"
                  dangerouslySetInnerHTML={{
                    __html: `<a referrerpolicy='origin' target='_blank' href='https://trustseal.enamad.ir/?id=6070546&Code=BqINEDxQIOxO7B1XzLdqc0zem1ShxPML'><img referrerpolicy='origin' src='https://trustseal.enamad.ir/logo.aspx?id=6070546&Code=BqINEDxQIOxO7B1XzLdqc0zem1ShxPML' alt='' style='cursor:pointer' code='BqINEDxQIOxO7B1XzLdqc0zem1ShxPML' onerror="this.style.display='none'"></a>`
                  }}
                />
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Safety */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#66706D]">
          <div className="flex items-center gap-2 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-[#D7ED68]" />
            <span>کلیه حقوق این سامانه متعلق به پلتفرم ورزشی رالی (سال ۱۴۰۵) است.</span>
          </div>
          <div className="flex items-center gap-3 text-slate-400 font-medium">
            <button
              onClick={() => onNavigateTab?.('terms')}
              className="hover:text-[#D7ED68] transition-colors cursor-pointer"
            >
              حفظ حریم خصوصی
            </button>
            <span>•</span>
            <button
              onClick={() => onNavigateTab?.('terms')}
              className="hover:text-[#D7ED68] transition-colors cursor-pointer"
            >
              شرایط استفاده و استرداد وجه
            </button>
            <span>•</span>
            <button
              onClick={() => onNavigateTab?.('about')}
              className="hover:text-[#D7ED68] transition-colors cursor-pointer"
            >
              درباره ما
            </button>
            <span>•</span>
            <button
              onClick={() => onNavigateTab?.('contact')}
              className="hover:text-[#D7ED68] transition-colors cursor-pointer"
            >
              تماس و شکایات
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
