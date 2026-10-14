import React, { useState } from 'react';
import {
  X,
  Award,
  Star,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  HelpCircle,
  Send,
  User,
  Phone,
  AlertCircle
} from 'lucide-react';
import { Coach } from '../../types/rally';
import { rallyApi } from '../../services/rallyApi';

interface CoachDetailsModalProps {
  coach: Coach;
  onClose: () => void;
  onRequestSubmitted: (coach: Coach, date: string, level: string, goal: string) => void;
}

export const CoachDetailsModal: React.FC<CoachDetailsModalProps> = ({
  coach,
  onClose,
  onRequestSubmitted
}) => {
  const getInitialUser = () => {
    try {
      const saved = localStorage.getItem('padel_auth');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  };
  const activeUser = getInitialUser();

  const [studentName, setStudentName] = useState(activeUser?.fullName || '');
  const [studentPhone, setStudentPhone] = useState(activeUser?.phoneNumber || '');
  const [selectedClub, setSelectedClub] = useState(coach.clubs?.[0] || 'باشگاه پدل انقلاب');
  const [selectedDate, setSelectedDate] = useState('فردا عصر');
  const [userLevel, setUserLevel] = useState('BEGINNER');
  const [trainingGoal, setTrainingGoal] = useState('یادگیری اصول اولیه و بازی با دیواره‌ها');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [trackingId, setTrackingId] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !studentPhone.trim()) {
      setServerError('لطفاً نام و شماره تماس خود را وارد نمایید.');
      return;
    }

    setIsSubmitting(true);
    setServerError(null);

    const res = await rallyApi.createCoachRequest(coach.id, {
      student_name: studentName.trim(),
      student_phone: studentPhone.trim(),
      requested_date: `${selectedDate} (${selectedClub})`,
      skill_level: userLevel,
      training_goal: trainingGoal.trim(),
      club_name: selectedClub,
      user_id: activeUser?.userId
    });

    setIsSubmitting(false);

    if (res.success) {
      setTrackingId(res.request?.id || `REQ-${Date.now().toString().slice(-6)}`);
      setIsSuccess(true);
      onRequestSubmitted(coach, `${selectedDate} (${selectedClub})`, userLevel, trainingGoal);
    } else {
      setServerError(res.error || 'خطا در ثبت درخواست. لطفاً مجدداً تلاش نمایید.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-rally-charcoal/70 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden my-auto border border-gray-100 flex flex-col text-rally-charcoal">
        
        {/* Top Header with Coach Banner */}
        <div className="p-5 sm:p-6 bg-rally-primary text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-4">
            <img
              src={coach.avatarUrl || '/images/rally_coach.jpg'}
              alt={coach.name}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-rally-accent shrink-0 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-white">{coach.name}</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rally-accent text-rally-charcoal">
                  مربی رسمی
                </span>
              </div>
              <p className="text-xs text-gray-200 mt-1">{coach.title}</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-rally-accent font-bold">
                <span className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-rally-accent" />
                  {coach.rating} ({coach.sessionsCount} جلسه موفق)
                </span>
                <span>• {coach.experienceYears} سال سابقه</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto max-h-[70vh]">
          
          {/* Suitability Guide (Spec requirement) */}
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-emerald-800">
              <HelpCircle className="w-4 h-4 text-emerald-700" />
              <span>راهنمای انتخاب: آیا این مربی برای شما مناسب است؟</span>
            </div>
            <p className="text-emerald-900 leading-relaxed">
              {coach.bio}
            </p>
          </div>

          {/* Booking type indicator */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs">
            <span className="text-gray-500 font-medium">نوع هماهنگی جلسه:</span>
            <span className={`px-2.5 py-1 rounded-full font-bold text-xs ${
              coach.bookingType === 'APPROVAL_REQUIRED'
                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
            }`}>
              {coach.bookingType === 'APPROVAL_REQUIRED'
                ? '⏳ نیازمند تأیید مربی (پاسخ حداکثر ۲ ساعت)'
                : '⚡ رزرو آنی و قطعی'}
            </span>
          </div>

          {/* Coach Clubs Badge */}
          {coach.clubs && coach.clubs.length > 0 && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <MapPin className="w-4 h-4 text-rally-primary shrink-0" />
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-gray-700">باشگاه‌های محل تدریس:</span>
                {coach.clubs.map((c, i) => (
                  <span key={i} className="px-2 py-0.5 bg-white border border-slate-200 rounded-md font-bold text-slate-800 text-[11px]">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Form */}
          {!isSuccess ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {serverError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{serverError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1">نام و نام خانوادگی متقاضی *</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute right-3 top-3" />
                    <input
                      type="text"
                      required
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="مثال: کیانوش اسدی"
                      className="w-full h-10 pr-9 pl-3 rounded-xl border border-gray-200 text-xs font-bold text-rally-charcoal"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1">شماره تماس جهت هماهنگی *</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gray-400 absolute right-3 top-3" />
                    <input
                      type="tel"
                      required
                      dir="ltr"
                      value={studentPhone}
                      onChange={(e) => setStudentPhone(e.target.value)}
                      placeholder="09121234567"
                      className="w-full h-10 pr-9 pl-3 rounded-xl border border-gray-200 text-xs font-bold text-rally-charcoal font-mono"
                    />
                  </div>
                </div>
              </div>

              {coach.clubs && coach.clubs.length > 0 && (
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1">انتخاب باشگاه محل تمرین</label>
                  <select
                    value={selectedClub}
                    onChange={(e) => setSelectedClub(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-gray-200 text-xs font-bold text-rally-charcoal cursor-pointer"
                  >
                    {coach.clubs.map((c, idx) => (
                      <option key={idx} value={c}>باشگاه {c}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1">سطح فعلی شما</label>
                <select
                  value={userLevel}
                  onChange={(e) => setUserLevel(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 text-xs font-bold text-rally-charcoal"
                >
                  <option value="BEGINNER">مبتدی (اولین بار در کورت یا کمتر از ۳ ماه سابقه)</option>
                  <option value="INTERMEDIATE">متوسط (آشنایی با ضربات و بازی هفتگی)</option>
                  <option value="ADVANCED">پیشرفته و آماده‌سازی مسابقات</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1">زمان مد نظر برای جلسه</label>
                <select
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 text-xs font-bold text-rally-charcoal"
                >
                  <option value="فردا عصر">فردا عصر (ساعت ۱۸:۰۰ تا ۱۹:۳۰)</option>
                  <option value="آخر هفته صبح">جمعه صبح (ساعت ۰۹:۰۰ تا ۱۰:۳۰)</option>
                  <option value="هفته آینده با هماهنگی">هفته آینده با هماهنگی مربی</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1">هدف اصلی شما از تمرین</label>
                <input
                  type="text"
                  value={trainingGoal}
                  onChange={(e) => setTrainingGoal(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 text-xs font-bold text-rally-charcoal"
                />
              </div>

              <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-400 block font-medium">شهریه هر جلسه اختصاصی:</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-base font-black text-rally-primary">
                      {(coach.hourlyRate / 10).toLocaleString('fa-IR')}
                    </span>
                    <span className="text-xs text-gray-500">تومان</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-rally-primary hover:bg-rally-primary-light disabled:opacity-50 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md cursor-pointer min-h-[44px]"
                >
                  <Send className="w-3.5 h-3.5 text-rally-accent" />
                  <span>{isSubmitting ? 'در حال ثبت...' : 'ثبت درخواست جلسه تمرینی'}</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="py-8 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h4 className="text-base font-black text-rally-charcoal">درخواست شما با موفقیت در دیتابیس رالی ثبت شد</h4>
              <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
                درخواست شما در کارتابل اختصاصی مربی قرار گرفت و پیامک اطلاع‌رسانی ارسال گردید.
              </p>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 inline-block font-bold">
                شناسه پیگیری: <span className="text-rally-primary">{trackingId}</span>
              </div>
              <div>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold cursor-pointer hover:bg-slate-800"
                >
                  بستن پنجره
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
