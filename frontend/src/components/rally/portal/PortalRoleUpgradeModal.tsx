import React, { useState } from 'react';
import { X, Building2, UserCheck, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
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
  const [targetRole, setTargetRole] = useState<'COACH' | 'CLUB_MANAGER'>('CLUB_MANAGER');
  const [clubName, setClubName] = useState('');
  const [licenseNo, setLicenseNo] = useState('');
  const [bio, setBio] = useState('');
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
        requested_role: targetRole,
        full_name: userSession.fullName || 'کاربر متقاضی',
        phone_number: userSession.phoneNumber,
        organization_name: clubName.trim(),
        license_number: licenseNo.trim(),
        description: bio.trim(),
      });

      if (res && res.success) {
        setSuccessTrackingId(res.tracking_id || 'RALLY-UPG-OK');
      } else {
        setErrorMsg(res?.error || 'خطا در ثبت درخواست');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'خطا در اتصال به سرور');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-[#0B1E30] border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute left-4 top-4 p-1 rounded-full text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 pb-2 border-b border-white/10">
          <ShieldCheck className="w-6 h-6 text-rally-primary" />
          <div>
            <h3 className="font-bold text-white text-base">درخواست ارتقای سطح حساب کاربری</h3>
            <p className="text-xs text-slate-400">پیوستن به جمع مربیان یا مجموعه‌های ورزشی رسمی رالی</p>
          </div>
        </div>

        {successTrackingId ? (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-3 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <h4 className="font-bold text-white text-sm">درخواست شما با موفقیت ثبت شد</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              مدارک شما در پنل مدیریت رالی بررسی خواهد شد و پس از احراز هویت، دسترسی پنل برای شما فعال می‌شود.
            </p>
            <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-xs text-slate-300 font-mono">
              کد پیگیری: <strong className="text-[#D7ED68]">{successTrackingId}</strong>
            </div>
            <button
              onClick={onClose}
              className="w-full py-2 bg-rally-primary text-white rounded-xl text-xs font-bold"
            >
              متوجه شدم
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="text-xs text-slate-300 font-bold block mb-1.5">نوع درخواست ارتقا:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTargetRole('CLUB_MANAGER')}
                  className={`py-2 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 ${
                    targetRole === 'CLUB_MANAGER'
                      ? 'bg-emerald-600 text-white border-emerald-500'
                      : 'bg-slate-900 text-slate-400 border-white/10'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>مدیر باشگاه</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTargetRole('COACH')}
                  className={`py-2 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 ${
                    targetRole === 'COACH'
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'bg-slate-900 text-slate-400 border-white/10'
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  <span>مربی پدل</span>
                </button>
              </div>
            </div>

            {targetRole === 'CLUB_MANAGER' ? (
              <div>
                <label className="text-xs text-slate-300 font-bold block mb-1">نام مجموعه ورزشی / باشگاه:</label>
                <input
                  type="text"
                  required
                  value={clubName}
                  onChange={(e) => setClubName(e.target.value)}
                  placeholder="مثال: باشگاه پدل پادجی"
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rally-primary"
                />
              </div>
            ) : (
              <div>
                <label className="text-xs text-slate-300 font-bold block mb-1">شماره پروانه مربیگری فدراسیون:</label>
                <input
                  type="text"
                  required
                  value={licenseNo}
                  onChange={(e) => setLicenseNo(e.target.value)}
                  placeholder="مثال: IR-PADEL-1403-998"
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rally-primary font-mono"
                />
              </div>
            )}

            <div>
              <label className="text-xs text-slate-300 font-bold block mb-1">توضیحات و سوابق فعالیت:</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="تعداد کورت‌ها، آدرس مجموعه، تجهیزات یا تجربیات مربیگری..."
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rally-primary resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-rally-primary hover:bg-rally-primary/80 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              {isSubmitting ? 'در حال ارسال اطلاعات...' : 'ثبت درخواست رسمی ارتقای حساب'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
