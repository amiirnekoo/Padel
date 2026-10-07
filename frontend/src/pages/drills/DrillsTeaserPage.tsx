import React, { useState } from 'react';
import { 
  Sparkles, 
  Video, 
  ShieldCheck, 
  Trophy, 
  Bot, 
  ArrowLeft, 
  Bell, 
  CheckCircle2, 
  Flame,
  Calendar
} from 'lucide-react';

interface DrillsTeaserPageProps {
  onNavigateToCourts?: () => void;
  onNavigateToTournaments?: () => void;
}

export const DrillsTeaserPage: React.FC<DrillsTeaserPageProps> = ({
  onNavigateToCourts,
  onNavigateToTournaments
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.trim().length < 10) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 600);
  };

  const featureCards = [
    {
      icon: <Video className="w-6 h-6 text-[#D7ED68]" />,
      title: 'ویدیوهای تکنیکال گام‌به‌گام',
      desc: 'آموزش‌های ویدیویی استاندارد ضربات طلایی: باندیخا، ویبورا، بازی با شیشه‌ها، اسمش و والِی از بهترین مربیان بین‌المللی.'
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-[#D7ED68]" />,
      title: 'تحلیل اشتباهات رایج و نکات ایمنی',
      desc: 'تشریح دقیق خطاهای بازیکنان در هر ضربه همراه با الگوهای اصلاحی و پیشگیری از آسیب‌های مچ، آرنج و شانه.'
    },
    {
      icon: <Trophy className="w-6 h-6 text-[#D7ED68]" />,
      title: 'رهگیری پیشرفت و برنامه‌های هدفمند',
      desc: 'ثبت تمرینات اجراشده در کورت، تعیین سطح مهارت از مبتدی تا قهرمانی و ارتقای رکورد بازی با دریل‌های انفرادی و تیمی.'
    },
    {
      icon: <Bot className="w-6 h-6 text-[#D7ED68]" />,
      title: 'دستیار هوشمند ارزیابی تمرین',
      desc: 'پیشنهاد روزانه دریل‌های متناسب با نقاط ضعف شما در بازی، بر اساس تحلیل نتایج بازی‌ها و رکوردهای ثبت‌شده.'
    }
  ];

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 text-center" dir="rtl">
      {/* Decorative Glow Elements (No blur filter used, clean radial gradient) */}
      <div 
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] pointer-events-none opacity-20"
        style={{
          background: 'radial-gradient(circle, #D7ED68 0%, rgba(11,34,56,0) 70%)'
        }}
      />

      {/* Main Teaser Hero Container */}
      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
        
        {/* Top Floating Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D7ED68]/15 border border-[#D7ED68]/50 text-[#D7ED68] text-xs sm:text-sm font-black mb-6 shadow-[0_0_20px_rgba(215,237,104,0.25)] animate-pulse">
          <Sparkles className="w-4 h-4 text-[#D7ED68]" />
          <span>پروژه ویژه و انقلابی رالی در پدل ایران</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#D7ED68]" />
          <span>افتتاح به‌زودی</span>
        </div>

        {/* Central Giant Title */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.2] mb-6">
          سامانه هوشمند{' '}
          <span className="text-[#D7ED68] drop-shadow-[0_0_25px_rgba(215,237,104,0.45)]">
            تمرینات تخصصی
          </span>{' '}
          رالی
        </h1>

        {/* Big Catchy Announcement Subtitle */}
        <p className="text-lg sm:text-2xl md:text-3xl font-black text-white/90 mb-4 max-w-2xl leading-relaxed">
          یک سورپرایز بزرگ و کم‌نظیر در راه است!
        </p>

        <p className="text-sm sm:text-base md:text-lg text-slate-300 max-w-2xl leading-relaxed mb-10">
          برای اولین بار در ایران، جامع‌ترین پایگاه دریل‌های فنی، ویدیوهای آموزشی ضربات کلیدی پدل، سیستم آنالیز و برنامه‌ریزی اختصاصی پیشرفت کورت به زودی در دسترس شما قهرمانان و علاقه‌مندان قرار خواهد گرفت.
        </p>

        {/* Status Pill */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0B2238] border border-[#0C3E6E] text-slate-200 text-xs sm:text-sm font-bold shadow-md">
            <Flame className="w-4 h-4 text-[#D7ED68]" />
            <span>در مرحله ضبط و تست میدانی توسط مربیان برتر</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0B2238] border border-[#0C3E6E] text-slate-200 text-xs sm:text-sm font-bold shadow-md">
            <Calendar className="w-4 h-4 text-[#D7ED68]" />
            <span>رونمایی عمومی در فاز بعدی</span>
          </div>
        </div>

        {/* Early Access Notification Form */}
        <div className="w-full max-w-lg mb-14">
          <div className="bg-[#0B2238] border border-[#0C3E6E] rounded-2xl p-6 sm:p-7 shadow-xl text-right">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#D7ED68]/20 flex items-center justify-center text-[#D7ED68]">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-white text-base sm:text-lg font-black">
                  اولین نفری باشید که باخبر می‌شود!
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  شماره موبایل خود را ثبت کنید تا در لحظه رونمایی، دسترسی ویژه دریافت کنید.
                </p>
              </div>
            </div>

            {isSubmitted ? (
              <div className="mt-4 p-4 rounded-xl bg-[#D7ED68]/15 border border-[#D7ED68]/50 flex items-center gap-3 text-right">
                <CheckCircle2 className="w-6 h-6 text-[#D7ED68] shrink-0" />
                <div>
                  <p className="text-[#D7ED68] text-sm font-black">
                    شماره شما با موفقیت در لیست دسترسی زودهنگام ثبت شد!
                  </p>
                  <p className="text-xs text-slate-300 mt-0.5">
                    به محض فعال‌سازی بخش تمرینات، پیامک اختصاصی برای شما ارسال خواهد شد.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-4 flex flex-col sm:flex-row gap-2.5">
                <input
                  type="tel"
                  dir="ltr"
                  placeholder="09123456789"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  maxLength={11}
                  className="flex-1 px-4 py-3 rounded-xl bg-[#071524] border border-[#0C3E6E] text-white text-sm focus:outline-none focus:border-[#D7ED68] placeholder:text-slate-500 font-mono text-center sm:text-left transition-colors"
                  required
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 rounded-xl bg-[#D7ED68] hover:bg-[#c9df5b] text-[#0B2238] text-sm font-black transition-all cursor-pointer shadow-[0_0_15px_rgba(215,237,104,0.3)] hover:shadow-[0_0_22px_rgba(215,237,104,0.5)] active:scale-98 shrink-0 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <span>در حال ثبت...</span>
                  ) : (
                    <>
                      <span>ثبت‌نام در لیست انتظار</span>
                      <ArrowLeft className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 text-right mb-12">
          {featureCards.map((card, idx) => (
            <div 
              key={idx}
              className="p-5 rounded-2xl bg-[#0B2238] border border-[#0C3E6E]/70 hover:border-[#D7ED68]/50 transition-all duration-200 shadow-md group"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 group-hover:bg-[#D7ED68]/15 group-hover:border-[#D7ED68]/40 transition-colors">
                  {card.icon}
                </div>
                <h4 className="text-white text-base font-black group-hover:text-[#D7ED68] transition-colors">
                  {card.title}
                </h4>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pr-1">
                {card.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom Navigation Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {onNavigateToCourts && (
            <button
              onClick={onNavigateToCourts}
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-bold border border-white/20 transition-all cursor-pointer flex items-center gap-2 active:scale-98"
            >
              <span>مشاهده و رزرو زمین‌های پدل</span>
              <ArrowLeft className="w-4 h-4 text-[#D7ED68]" />
            </button>
          )}
          {onNavigateToTournaments && (
            <button
              onClick={onNavigateToTournaments}
              className="px-6 py-3 rounded-xl bg-[#0B2238] hover:bg-[#0f2c47] text-slate-200 text-sm font-bold border border-[#0C3E6E] transition-all cursor-pointer flex items-center gap-2 active:scale-98"
            >
              <span>مشاهده تورنمنت‌ها و مسابقات</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
