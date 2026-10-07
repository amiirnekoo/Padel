import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, MessageSquare, Send, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const RallyContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    subject: 'booking',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.message) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', phone: '', subject: 'booking', message: '' });
    }, 4000);
  };

  return (
    <div className="w-full bg-[#071524] text-[#F5F4EF] min-h-screen py-10 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Hero */}
        <div className="text-center space-y-3 bg-[#0B2238] border border-[#0F3960] rounded-2xl p-6 sm:p-8 shadow-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D7ED68]/10 text-[#D7ED68] text-xs font-bold border border-[#D7ED68]/20">
            <MessageSquare className="w-4 h-4" />
            <span>پاسخگویی سریع و پشتیبانی ۲۴ ساعته</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            تماس با ما و واحد رسیدگی به شکایات
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
            همکاران ما در واحد پشتیبانی و بازرسی رالی آماده پاسخگویی به پرسش‌ها، پیگیری رزروها و رسیدگی به شکایات شما هستند.
          </p>
        </div>

        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#0B2238] border border-[#0F3960] rounded-xl p-5 space-y-2">
            <div className="w-10 h-10 rounded-lg bg-[#D7ED68]/15 text-[#D7ED68] flex items-center justify-center">
              <Phone className="w-5 h-5" />
            </div>
            <div className="text-xs text-slate-400 font-bold">تلفن پشتیبانی و ثابت</div>
            <div className="text-sm font-black text-white" dir="ltr">۰۲۱ - ۲۲۶۶۷۷۸۸</div>
            <div className="text-xs text-slate-400">تماس مستقیم در ساعات کاری</div>
          </div>

          <div className="bg-[#0B2238] border border-[#0F3960] rounded-xl p-5 space-y-2">
            <div className="w-10 h-10 rounded-lg bg-[#D7ED68]/15 text-[#D7ED68] flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <div className="text-xs text-slate-400 font-bold">پست الکترونیکی رسمی</div>
            <div className="text-sm font-black text-white" dir="ltr">info@raally.ir</div>
            <div className="text-xs text-slate-400">پاسخگویی حداکثر ۲۴ ساعت</div>
          </div>

          <div className="bg-[#0B2238] border border-[#0F3960] rounded-xl p-5 space-y-2">
            <div className="w-10 h-10 rounded-lg bg-[#D7ED68]/15 text-[#D7ED68] flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div className="text-xs text-slate-400 font-bold">ساعات پاسخگویی</div>
            <div className="text-sm font-black text-white">۸:۰۰ الی ۲۳:۰۰</div>
            <div className="text-xs text-slate-400">تمام روزهای هفته و تعطیلات</div>
          </div>

          <div className="bg-[#0B2238] border border-[#0F3960] rounded-xl p-5 space-y-2">
            <div className="w-10 h-10 rounded-lg bg-[#D7ED68]/15 text-[#D7ED68] flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <div className="text-xs text-slate-400 font-bold">نشانی و کد پستی</div>
            <div className="text-xs font-bold text-white leading-relaxed">تهران، خیابان سئول، مجموعه ورزشی انقلاب</div>
            <div className="text-xs text-[#D7ED68]" dir="ltr">کد پستی: ۱۹۹۵۶۱۴۱۱۱</div>
          </div>
        </div>

        {/* Message and Complaint Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 bg-[#0B2238] border border-[#0F3960] rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="border-b border-white/10 pb-4">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Send className="w-5 h-5 text-[#D7ED68]" />
                فرم ثبت پیام، انتقاد یا شکایت
              </h2>
              <p className="text-xs text-slate-400 mt-1">کلیه پیام‌ها ظرف مدت ۲۴ ساعت کاری بررسی و پاسخ داده خواهند شد.</p>
            </div>

            {submitted ? (
              <div className="p-6 bg-[#071524] border border-[#D7ED68]/40 rounded-xl text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-[#D7ED68] mx-auto" />
                <h3 className="text-base font-bold text-white">پیام شما با موفقیت ثبت شد</h3>
                <p className="text-xs text-slate-300">کارشناسان پشتیبانی رالی به زودی از طریق تماس یا پیامک با شما ارتباط برقرار خواهند کرد.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-bold">نام و نام خانوادگی:</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="مثال: علی رضایی"
                      className="w-full bg-[#071524] border border-white/15 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-[#D7ED68]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-bold">شماره همراه:</label>
                    <input
                      type="tel"
                      required
                      dir="ltr"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="0912..."
                      className="w-full bg-[#071524] border border-white/15 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-[#D7ED68]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 font-bold">موضوع پیام / شکایت:</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-[#071524] border border-white/15 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#D7ED68]"
                  >
                    <option value="booking">پشتیبانی رزرو کورت و سانس</option>
                    <option value="shop">پیگیری سفارش و مرجوعی کالا در فروشگاه</option>
                    <option value="complaint">ثبت شکایت و تخلف باشگاه یا مربی</option>
                    <option value="partner">همکاری تجاری و ثبت باشگاه</option>
                    <option value="other">سایر موارد و پیشنهادات</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 font-bold">متن پیام یا شرح شکایت:</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="توضیحات کامل درخواست خود را بنویسید..."
                    className="w-full bg-[#071524] border border-white/15 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-[#D7ED68]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-[#D7ED68] text-black font-black rounded-xl hover:bg-[#c8de55] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                >
                  <Send className="w-4 h-4" />
                  <span>ارسال پیام به پشتیبانی</span>
                </button>
              </form>
            )}
          </div>

          {/* Enamad Complaints Information Box */}
          <div className="bg-[#0B2238] border border-[#0F3960] rounded-2xl p-6 space-y-4 text-xs leading-relaxed text-slate-300">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">سامانه حل اختلاف و شکایات اینماد</h3>
            <p>
              در راستای صیانت از حقوق مصرف‌کنندگان، چنانچه پس از گذشت ۴۸ ساعت کاری پاسخ مورد نظر خود را دریافت نکردید، می‌توانید از طریق درگاه رسمی نماد اعتماد الکترونیکی شکایت خود را ثبت نمایید.
            </p>
            <div className="pt-2">
              <a
                href="https://enamad.ir"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-[#D7ED68] font-bold hover:underline"
              >
                <span>ورود به سامانه ثبت شکایات اینماد</span>
                <span dir="ltr">→</span>
              </a>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
