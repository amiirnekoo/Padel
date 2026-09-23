import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Zap, Award, Sparkles, Clock, CheckCircle2 } from 'lucide-react';

const PILLARS = [
  {
    icon: Zap,
    title: 'قفل اتمیک ۱۰ دقیقه‌ای',
    desc: 'ممانعت قطعی از رزرو دوبل با قفل‌های سیستمی',
    tag: 'Zero Collision',
    accent: 'border-rally-accent/30 text-rally-accent'
  },
  {
    icon: Award,
    title: 'برابری ۱۰۰٪ نرخ کلوپ',
    desc: 'نرخ مصوب باشگاه بدون هیچ کارمزد اضافه برای بازیکن',
    tag: 'Official Pricing',
    accent: 'border-emerald-500/30 text-emerald-400'
  },
  {
    icon: ShieldCheck,
    title: 'استرداد تضمینی ۲۴ ساعته',
    desc: 'عودت ۹۰٪ قبل از ۲۴ ساعت و ۱۰۰٪ در لغو اضطراری',
    tag: 'Auto Refund',
    accent: 'border-sky-500/30 text-sky-400'
  },
  {
    icon: Sparkles,
    title: 'تسویه خودکار پایا (۹۷٪)',
    desc: 'واریز امن و دوره‌ای سهم مالکان باشگاه در شبکه شتاب',
    tag: 'Paya Transfer',
    accent: 'border-amber-500/30 text-amber-400'
  },
];

export const PlatformHeroBanner: React.FC = () => {
  return (
    <div className="w-full bg-gradient-to-b from-slate-950 via-rally-dark-bg to-slate-950 border-b border-rally-border-subtle py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        
        {/* Top Status & Headline Row */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 text-xs font-black text-rally-accent bg-rally-accent/10 border border-rally-accent/30 px-2.5 py-1 rounded-pill">
                <CheckCircle2 className="w-3.5 h-3.5 text-rally-accent" />
                شبکه رسمی پدل و تنیس ایران
              </span>
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                رزرواسیون بی‌درنگ ۲۴/۷
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              موتور رزرواسیون اتمیک و تقویم زنده کورت‌های ورزشی
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl font-normal leading-relaxed">
              انتخاب آنلاین سانس، پرداخت مطمئن شاپرک با برابری کامل قیمت، پنل جامع باجه کلوپ و تسویه خودکار حساب‌ها
            </p>
          </div>

          {/* Quick System Badge */}
          <div className="flex items-center gap-3 self-start lg:self-center p-3 rounded-md bg-rally-dark-card border border-rally-border-subtle shadow-rally-card">
            <div className="w-3 h-3 rounded-pill bg-emerald-400 animate-ping" />
            <div className="text-right">
              <div className="text-xs font-bold text-white">سامانه فعال و پایدار</div>
              <div className="text-[11px] text-slate-400">اتصال مستقیم به درگاه شاپرک</div>
            </div>
          </div>
        </div>

        {/* 4 Architectural Pillar Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {PILLARS.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={idx}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
                className="p-4 rounded-md bg-rally-dark-card border border-rally-border-subtle hover:border-rally-border-active transition-all shadow-rally-card flex flex-col justify-between gap-3 group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className={`p-2 rounded bg-slate-900 border ${pillar.accent}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
                    {pillar.tag}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white group-hover:text-rally-accent transition-colors">
                    {pillar.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-normal">
                    {pillar.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
