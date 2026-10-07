import React, { useState } from 'react';
import { X, ShieldCheck, Award, Building2, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { UserSession } from '../../AuthModal';
import { rallyApi } from '../../../services/rallyApi';

interface PortalRoleUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userSession: UserSession;
}

export const PortalRoleUpgradeModal: React.FC<PortalRoleUpgradeModalProps> = ({
  isOpen,
  onClose,
  userSession
}) => {
  const [requestedRole, setRequestedRole] = useState<'COACH' | 'CLUB_OPERATOR'>('COACH');
  const [fullName, setFullName] = useState(userSession.fullName || '');
  const [phoneNumber, setPhoneNumber] = useState(userSession.phoneNumber || '');
  const [nationalCode, setNationalCode] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [experienceYears, setExperienceYears] = useState<number>(3);
  const [licenseNumber, setLicenseNumber] = useState('');
  const [description, setDescription] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successTrackingId, setSuccessTrackingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await rallyApi.requestRoleUpgrade({
        requested_role: requestedRole,
        full_name: fullName,
        phone_number: phoneNumber,
        national_code: nationalCode || undefined,
        organization_name: requestedRole === 'CLUB_OPERATOR' ? organizationName : undefined,
        experience_years: Number(experienceYears) || 0,
        license_number: licenseNumber || undefined,
        description: description || undefined
      });

      if (res.success && res.tracking_id) {
        setSuccessTrackingId(res.tracking_id);
      } else {
        setErrorMsg(res.error || 'خطا در ثبت درخواست');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 animate-in fade-in duration-150"
      onClick={onClose}
      dir="rtl"
    >
      <div
        className="w-full max-w-lg bg-[#0B1E30] border border-white/10 rounded-3xl p-6 sm:p-7 shadow-2xl relative my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 left-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {successTrackingId ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-white">درخواست شما با موفقیت ثبت شد</h3>
            <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
              مدارک ارسالی شما جهت ارتقای سطح حساب کاربری بررسی خواهد شد. پس از تایید، دسترسی به پنل ویژه فعال می‌گردد.
            </p>
            <div className="p-3 bg-[#07131F] border border-white/10 rounded-2xl inline-block">
              <span className="text-[10px] text-slate-400 block">کد پیگیری درخواست:</span>
              <span className="text-sm font-black text-[#D7ED68] font-mono mt-0.5 block">{successTrackingId}</span>
            </div>
            <div className="pt-2">
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-[#D7ED68] text-[#07131F] font-black text-xs cursor-pointer hover:brightness-110"
              >
                متوجه شدم
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-[#D7ED68]/10 border border-[#D7ED68]/20 text-[#D7ED68] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">درخواست ارتقای سطح کاربری</h3>
                <p className="text-[11px] text-slate-300">پیوستن به جمع مربیان رسمی یا مدیران باشگاه‌های رالی</p>
              </div>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Role Type Selector */}
            <div className="grid grid-cols-2 gap-2 mb-4 p-1 bg-[#07131F] rounded-2xl border border-white/10">
              <button
                type="button"
                onClick={() => setRequestedRole('COACH')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  requestedRole === 'COACH' ? 'bg-[#D7ED68] text-[#07131F] font-black shadow-md' : 'text-slate-300 hover:text-white'
                }`}
              >
                <Award className="w-4 h-4" />
                <span>مربی رسمی (Coach)</span>
              </button>

              <button
                type="button"
                onClick={() => setRequestedRole('CLUB_OPERATOR')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  requestedRole === 'CLUB_OPERATOR' ? 'bg-[#D7ED68] text-[#07131F] font-black shadow-md' : 'text-slate-300 hover:text-white'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>مدیر باشگاه (Club)</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">نام و نام خانوادگی</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full bg-[#07131F] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D7ED68]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">شماره همراه</label>
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                    className="w-full bg-[#07131F] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D7ED68] font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">کد ملی</label>
                  <input
                    type="text"
                    value={nationalCode}
                    onChange={(e) => setNationalCode(e.target.value)}
                    placeholder="۱۰ رقم بدون خط تیره"
                    className="w-full bg-[#07131F] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D7ED68] font-mono"
                  />
                </div>

                {requestedRole === 'CLUB_OPERATOR' ? (
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">نام باشگاه / مجموعه</label>
                    <input
                      type="text"
                      value={organizationName}
                      onChange={(e) => setOrganizationName(e.target.value)}
                      placeholder="مثال: باشگاه پدل انقلاب"
                      required
                      className="w-full bg-[#07131F] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D7ED68]"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">شماره مدرک مربیگری</label>
                    <input
                      type="text"
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                      placeholder="شماره گواهی فدراسیون"
                      className="w-full bg-[#07131F] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D7ED68] font-mono"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">سابقه و توضیحات تکمیلی</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="سوابق ورزشی، شهر و منطقه فعالیت..."
                  className="w-full bg-[#07131F] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#D7ED68]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#D7ED68] text-[#07131F] font-black text-xs hover:brightness-110 flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{isSubmitting ? 'در حال ارسال...' : 'ثبت نهایی درخواست'}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
