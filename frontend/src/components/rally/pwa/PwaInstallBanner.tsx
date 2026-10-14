import React, { useState } from 'react';
import { Download, X, Share2, PlusSquare, Sparkles, Smartphone } from 'lucide-react';
import { usePwaInstall } from '../../../hooks/usePwaInstall';

export const PwaInstallBanner: React.FC = () => {
  const { shouldShowBanner, isIOS, installApp, dismissBanner } = usePwaInstall();
  const [showIosGuide, setShowIosGuide] = useState(false);

  if (!shouldShowBanner) return null;

  const handleInstallClick = async () => {
    const res = await installApp();
    if (res === 'ios_manual') {
      setShowIosGuide(true);
    }
  };

  return (
    <>
      {/* Floating Bottom Banner */}
      <aside 
        aria-label="نصب اپلیکیشن رالی پدل"
        className="fixed bottom-20 lg:bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-40 bg-[#0f172a] border border-slate-700/80 rounded-2xl p-3.5 shadow-2xl flex items-center justify-between gap-3 animate-in slide-in-from-bottom duration-300" 
        dir="rtl"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rally-accent/15 border border-rally-accent/30 flex items-center justify-center shrink-0">
            <img src="/images/rally_icon_192.png" alt="آیکون رالی پدل" className="w-7 h-7 object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs sm:text-sm font-black text-white">نصب اپلیکیشن رالی پدل</h4>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-rally-accent text-slate-950 font-bold">PWA</span>
            </div>
            <p className="text-[11px] text-slate-400">
              دسترسی سریع، بدون فیلتر و بدون نیاز به اپ‌استور
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleInstallClick}
            className="px-3.5 py-2 rounded-xl bg-rally-accent hover:bg-lime-400 text-slate-950 text-xs font-black transition-all flex items-center gap-1.5 shadow-md cursor-pointer active:scale-95"
          >
            <Download size={14} />
            <span>نصب فوری</span>
          </button>
          <button
            type="button"
            onClick={dismissBanner}
            title="بستن"
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X size={15} />
          </button>
        </div>
      </aside>

      {/* iOS Safari Guide Modal */}
      {showIosGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80" dir="rtl">
          <div className="bg-[#0f172a] border border-slate-700 rounded-3xl p-5 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-rally-accent" />
                <h3 className="font-extrabold text-sm text-white">راهنمای نصب در آیفون (iOS)</h3>
              </div>
              <button
                onClick={() => setShowIosGuide(false)}
                className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-rally-accent font-bold flex items-center justify-center shrink-0">۱</span>
                <div>
                  در پایین مرورگر سافاری روی دکمه <span className="text-rally-accent font-bold">Share (اشتراک‌گذاری)</span> با آیکون <Share2 size={12} className="inline mx-1 text-blue-400" /> بزنید.
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-rally-accent font-bold flex items-center justify-center shrink-0">۲</span>
                <div>
                  صفحه را کمی به پایین بکشید و گزینه <span className="text-white font-bold">«Add to Home Screen»</span> (افزودن به صفحه اصلی) با آیکون <PlusSquare size={12} className="inline mx-1 text-emerald-400" /> را لمس کنید.
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-rally-accent font-bold flex items-center justify-center shrink-0">۳</span>
                <div>
                  در گوشه بالای صفحه روی گزینه <span className="text-rally-accent font-bold">«Add»</span> بزنید تا آیکون رالی به گوشی شما اضافه شود.
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIosGuide(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black text-xs cursor-pointer transition-colors"
            >
              متوجه شدم
            </button>
          </div>
        </div>
      )}
    </>
  );
};
