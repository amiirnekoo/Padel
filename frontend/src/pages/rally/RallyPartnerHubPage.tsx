import React, { useState } from 'react';
import {
  LayoutDashboard,
  Wallet,
  Users,
  PlusCircle,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Building2
} from 'lucide-react';
import { OperatorPage } from '../OperatorPage';
import { ClubSettlementsPage } from '../ClubSettlementsPage';
import { CrmCustomersPage } from '../CrmCustomersPage';
import { VenueOnboardingPage } from '../VenueOnboardingPage';
import { NotificationLogsPage } from '../NotificationLogsPage';

export type PartnerTab =
  | 'operator'
  | 'settlements'
  | 'crm'
  | 'onboarding'
  | 'notifications';

interface TabItem {
  id: PartnerTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  tag?: string;
  badgeCount?: string;
}

export const RallyPartnerHubPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<PartnerTab>('operator');

  const TABS: TabItem[] = [
    { id: 'operator', label: 'میز کار باجه اپراتور', icon: LayoutDashboard, tag: 'زنده' },
    { id: 'settlements', label: 'تسویه‌حساب مالی و پایا', icon: Wallet },
    { id: 'crm', label: 'باشگاه مشتریان و CRM', icon: Users },
    { id: 'onboarding', label: 'ثبت و پذیرش باشگاه جدید', icon: PlusCircle, tag: 'سراسری' },
    { id: 'notifications', label: 'مانیتورینگ پیامک‌ها', icon: MessageSquare },
  ];

  return (
    <div className="space-y-6 max-w-7xl 2xl:max-w-[1600px] 3xl:max-w-[1800px] mx-auto pb-16">
      
      {/* 1. Apple-Style Announcement Bar */}
      <div className="text-center text-xs text-[#86868b] py-1 border-b border-black/[0.04]">
        <span>پنل یکپارچه مدیریت و توسعه کلوپ‌های پدل و تنیس ایران. تسویه اتوماتیک پایا ۹۷٪ سهم باشگاه و گزارش‌های بلادرنگ.</span>
      </div>

      {/* 2. Top Header & Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-1">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rally-primary/10 text-rally-primary text-[11px] font-bold mb-2">
            <Building2 className="w-3.5 h-3.5" />
            <span>پرتال تخصصی مالکان، کادر باجه و برگزارکنندگان مسابقات</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#1d1d1f] tracking-tight">
            مرکز همکاران رالی
          </h1>
          <p className="text-xs sm:text-sm text-[#86868b] mt-1.5 font-medium">
            دسترسی متمرکز به سامانه‌های ۵ گانه عملیاتی، مالی، ارتباط با مشتری و پذیرش آنلاین کلوپ‌ها.
          </p>
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200/60 self-start md:self-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>اتصال زنده به شبکه بانکی و پیامکی شاپرک</span>
        </div>
      </div>

      {/* 3. Apple Style Tab Navigation Bar */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-2 sm:p-3 border border-black/[0.05] shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 min-w-max">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-4 py-2.5 rounded-xl sm:rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer focus:outline-none ${
                  isActive
                    ? 'bg-rally-primary text-white shadow-xs scale-101'
                    : 'bg-transparent text-rally-charcoal/80 hover:bg-gray-100 hover:text-rally-primary'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-rally-primary'}`} />
                <span>{tab.label}</span>
                {tab.tag && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[9px] font-black ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-rally-primary/10 text-rally-primary'
                    }`}
                  >
                    {tab.tag}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Active Sub-Dashboard View Container */}
      <div className="bg-transparent rounded-3xl transition-all">
        {activeTab === 'operator' && (
          <div className="bg-white rounded-[28px] p-5 sm:p-7 border border-black/[0.05] shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
            <div className="mb-4 pb-3 border-b border-gray-100">
              <h2 className="text-lg font-black text-rally-charcoal">میز کار باجه و مدیریت زنده کورت‌ها</h2>
              <p className="text-xs text-gray-500">مسدودسازی اضطراری، آزادسازی فوری و تخصیص سانس‌های تورنمنت</p>
            </div>
            <OperatorPage />
          </div>
        )}

        {activeTab === 'settlements' && (
          <div className="bg-white rounded-[28px] p-5 sm:p-7 border border-black/[0.05] shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
            <div className="mb-4 pb-3 border-b border-gray-100">
              <h2 className="text-lg font-black text-rally-charcoal">سامانه تسویه‌حساب دوره‌ای پایا</h2>
              <p className="text-xs text-gray-500">تفکیک شفاف ۹۷٪ سهم باشگاه و ۳٪ کارمزد پلتفرم با خروجی فرمت استاندارد بانکی</p>
            </div>
            <ClubSettlementsPage />
          </div>
        )}

        {activeTab === 'crm' && (
          <div className="bg-white rounded-[28px] p-5 sm:p-7 border border-black/[0.05] shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
            <div className="mb-4 pb-3 border-b border-gray-100">
              <h2 className="text-lg font-black text-rally-charcoal">هوش تجاری و پایگاه داده مشتریان</h2>
              <p className="text-xs text-gray-500">شناسایی بازیکنان طلایی، تحلیل نرخ بازگشت و ارزش دوره عمر (LTV)</p>
            </div>
            <CrmCustomersPage />
          </div>
        )}

        {activeTab === 'onboarding' && (
          <div className="bg-white rounded-[28px] p-5 sm:p-7 border border-black/[0.05] shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
            <div className="mb-4 pb-3 border-b border-gray-100">
              <h2 className="text-lg font-black text-rally-charcoal">ثبت و پذیرش آنلاین مجموعه ورزشی</h2>
              <p className="text-xs text-gray-500">پیوستن به شبکه رزرواسیون پدل و تنیس با تعیین قیمت پایه و شماره شبا</p>
            </div>
            <VenueOnboardingPage />
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="bg-white rounded-[28px] p-5 sm:p-7 border border-black/[0.05] shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
            <div className="mb-4 pb-3 border-b border-gray-100">
              <h2 className="text-lg font-black text-rally-charcoal">مانیتورینگ اعلان‌ها و لاگ پیامک‌های خدماتی</h2>
              <p className="text-xs text-gray-500">رهگیری ارسال پیامک‌های کاوه‌نگار (تأیید رزرو، هشدار اپراتور و بازگشت وجه)</p>
            </div>
            <NotificationLogsPage />
          </div>
        )}
      </div>

    </div>
  );
};
