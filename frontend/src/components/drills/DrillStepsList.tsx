import React from 'react';
import { DrillStepItem, DrillOriginSource } from '../../types/drills';
import {
  ListOrdered,
  AlertOctagon,
  ShieldCheck,
  UserCheck,
  Copyright,
  Lightbulb,
  Clock
} from 'lucide-react';

interface DrillStepsListProps {
  steps: DrillStepItem[];
  commonMistakes?: string[] | null;
  safetyPrecautions?: string[] | null;
  authorName: string;
  reviewerName?: string | null;
  originSource: DrillOriginSource;
  rightsHolder?: string | null;
}

const ORIGIN_LABELS: Record<DrillOriginSource, string> = {
  original: 'تولید اختصاصی و تألیفی رالی',
  licensed: 'دارای مجوز رسمی نشر و لایسنس',
  public_domain: 'منابع استاندارد آزاد فدراسیونی'
};

export const DrillStepsList: React.FC<DrillStepsListProps> = ({
  steps,
  commonMistakes,
  safetyPrecautions,
  authorName,
  reviewerName,
  originSource,
  rightsHolder
}) => {
  return (
    <div className="space-y-6 sm:space-y-8" dir="rtl">
      {/* 1. Execution Steps */}
      <section className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
          <ListOrdered className="w-5 h-5 text-rally-primary" />
          <h2 className="text-base sm:text-lg font-black text-slate-900">
            مراحل اجرای تمرین
          </h2>
        </div>

        {steps.length === 0 ? (
          <p className="text-xs text-slate-500">دستورالعمل گام‌به‌گام برای این تمرین ثبت نشده است.</p>
        ) : (
          <div className="space-y-4">
            {steps.map((st) => (
              <div
                key={st.step_number}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-rally-primary text-white text-xs font-black flex items-center justify-center">
                      {st.step_number}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">{st.title}</h3>
                  </div>
                  {st.duration_seconds && (
                    <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {Math.round(st.duration_seconds / 60)} دقیقه
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mr-8">
                  {st.description}
                </p>

                {st.tips && (
                  <div className="mt-2.5 mr-8 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 flex items-start gap-1.5">
                    <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span><strong>نکته کلیدی:</strong> {st.tips}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 2. Common Mistakes & Safety */}
      {((commonMistakes && commonMistakes.length > 0) || (safetyPrecautions && safetyPrecautions.length > 0)) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {commonMistakes && commonMistakes.length > 0 && (
            <section className="bg-rose-50/60 border border-rose-200 rounded-2xl p-5 shadow-2xs">
              <div className="flex items-center gap-2 mb-3 text-rose-900">
                <AlertOctagon className="w-4 h-4 text-rose-600" />
                <h3 className="text-sm font-black">اشتباهات رایج در این تمرین</h3>
              </div>
              <ul className="space-y-2 text-xs text-rose-800 list-disc list-inside">
                {commonMistakes.map((m: any, idx) => {
                  const mistakeText = typeof m === 'string' ? m : (m?.mistake || JSON.stringify(m));
                  const correctionText = typeof m === 'object' && m?.correction ? m.correction : null;
                  return (
                    <li key={idx} className="leading-relaxed">
                      <span>{mistakeText}</span>
                      {correctionText && (
                        <span className="block text-emerald-800 font-medium text-[11px] mt-0.5 mr-4">
                          راهکار اصلاح: {correctionText}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {safetyPrecautions && safetyPrecautions.length > 0 && (
            <section className="bg-amber-50/60 border border-amber-200 rounded-2xl p-5 shadow-2xs">
              <div className="flex items-center gap-2 mb-3 text-amber-900">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-black">نکات ایمنی و پیشگیری از آسیب</h3>
              </div>
              <ul className="space-y-1.5 text-xs text-amber-800 list-disc list-inside">
                {safetyPrecautions.map((s: any, idx) => {
                  const text = typeof s === 'string' ? s : (s?.precaution || s?.tip || JSON.stringify(s));
                  return (
                    <li key={idx} className="leading-relaxed">{text}</li>
                  );
                })}
              </ul>
            </section>
          )}
        </div>
      )}

      {/* 3. Producer, Reviewer & Origin Information */}
      <section className="bg-white border border-slate-200/90 rounded-2xl p-5 text-xs text-slate-600 space-y-2.5 shadow-2xs">
        <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5 mb-2">
          <UserCheck className="w-4 h-4 text-rally-primary" />
          <span>شناسنامه و منشأ محتوای آموزشی</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-400 block mb-0.5">تهیه‌کننده / تدوین:</span>
            <span className="font-bold text-slate-800">{authorName || 'تیم فنی رالی'}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-400 block mb-0.5">کارشناس بازبین:</span>
            <span className="font-bold text-slate-800">{reviewerName || 'واحد بازبینی رالی'}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-400 block mb-0.5">حقوق استفاده و منشأ:</span>
            <span className="font-bold text-slate-800 flex items-center gap-1">
              <Copyright className="w-3 h-3 text-slate-400" />
              {ORIGIN_LABELS[originSource] || originSource}
              {rightsHolder ? ` (${rightsHolder})` : ''}
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};
