import React, { useState } from 'react';
import { Handshake, Trophy, Award, Send, CheckCircle2, ShieldCheck } from 'lucide-react';

export const RallySponsorsPage: React.FC = () => {
  const [brandName, setBrandName] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [collaborationType, setCollaborationType] = useState('حمایت مالی از مسابقات کشوری');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-4">
      
      {/* Header */}
      <div className="bg-rally-primary text-white rounded-3xl p-6 sm:p-8 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-bold text-rally-accent">
          <Handshake className="w-3.5 h-3.5" />
          <span>همکاری تجاری و اسپانسرینگ</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black">
          همکاری برندها و حامیان مالی با جامعه پدل و تنیس
        </h1>
        <p className="text-xs sm:text-sm text-gray-200 leading-relaxed max-w-2xl">
          فرصت حضور هدفمند و مستقیم برند شما در مسابقات، کورت‌های اختصاصی و بسته‌های حمایتی ورزشکاران، شفاف و بدون واسطه.
        </p>
      </div>

      {/* Opportunities Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs space-y-2">
          <Trophy className="w-6 h-6 text-rally-primary" />
          <h3 className="text-sm font-extrabold text-rally-charcoal">اسپانسر رسمی مسابقات</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            قرارگیری نام تجاری شما روی بنرها، پیراهن داوران و جدول رسمی مسابقات در باشگاه‌های برتر.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs space-y-2">
          <Award className="w-6 h-6 text-rally-primary" />
          <h3 className="text-sm font-extrabold text-rally-charcoal">جوایز و هدایای برندگان</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            تأمین جوایز ورزشی و بن‌های اختصاصی خرید برای تیم‌های قهرمان و بازیکنان برگزیده.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs space-y-2">
          <ShieldCheck className="w-6 h-6 text-rally-primary" />
          <h3 className="text-sm font-extrabold text-rally-charcoal">تبلیغات هدفمند</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            جایگاه‌های مشخص و با برچسب رسمی «حامی رویداد» در پلتفرم دیجیتال رالی.
          </p>
        </div>
      </div>

      {/* Partnership Request Form */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs">
        <h2 className="text-lg font-black text-rally-charcoal mb-4">فرم ثبت درخواست جلسه همکاری</h2>
        
        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">نام برند / شرکت</label>
                <input
                  type="text"
                  required
                  placeholder="مثلاً: بول‌پدل ایران"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">نام نماینده یا رابط</label>
                <input
                  type="text"
                  required
                  placeholder="مثلاً: سارا ناصری"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-xs font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">شماره تماس مستقیم</label>
                <input
                  type="tel"
                  required
                  placeholder="۰۹۱۲..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">زمینه مد نظر همکاری</label>
                <select
                  value={collaborationType}
                  onChange={(e) => setCollaborationType(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-xs font-bold"
                >
                  <option value="حمایت مالی از مسابقات کشوری">حمایت مالی از مسابقات کشوری</option>
                  <option value="تأمین پوشاک و تجهیزات مسابقه">تأمین پوشاک و تجهیزات مسابقه</option>
                  <option value="برندینگ کورت اختصاصی">برندینگ کورت اختصاصی</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="px-8 py-3 rounded-xl bg-rally-primary hover:bg-rally-primary-light text-white font-black text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer min-h-[44px]"
            >
              <Send className="w-4 h-4 text-rally-accent" />
              <span>ارسال مشخصات جهت تماس تیم توسعه بازار</span>
            </button>
          </form>
        ) : (
          <div className="py-6 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h4 className="text-base font-black text-rally-charcoal">درخواست شما دریافت شد</h4>
            <p className="text-xs text-gray-500">
              همکاران بخش توسعه بازار رالی ظرف ۲۴ ساعت آینده با شما تماس خواهند گرفت.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
