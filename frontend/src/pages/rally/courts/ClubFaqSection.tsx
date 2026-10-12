import React, { useState } from 'react';
import { HelpCircle, ChevronDown, UserCheck } from 'lucide-react';
import { ClubRichProfile } from '../../../data/clubsRichData';

interface ClubFaqSectionProps {
  richProfile: ClubRichProfile | null;
}

export const ClubFaqSection: React.FC<ClubFaqSectionProps> = ({ richProfile }) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  if (!richProfile || (!richProfile.faqs?.length && !richProfile.coaches?.length)) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* FAQs Column (lg: 7 cols) */}
      {richProfile.faqs?.length > 0 && (
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-sky-600" />
            <span>سوالات متداول بازیکنان درباره این مجموعه</span>
          </h3>

          <div className="space-y-2.5 pt-1">
            {richProfile.faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200/70 overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-4 text-right flex items-center justify-between gap-3 bg-slate-50 hover:bg-slate-100/80 transition-colors cursor-pointer"
                  >
                    <span className="text-xs font-bold text-slate-800">{faq.question}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                        isOpen ? 'rotate-180 text-sky-600' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="p-4 bg-white text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Resident Coaches Column (lg: 5 cols) */}
      {richProfile.coaches?.length > 0 && (
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-600" />
            <span>مربیان رسمی و مقیم در این کلوپ</span>
          </h3>

          <div className="space-y-3 pt-1">
            {richProfile.coaches.map((c, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3"
              >
                <div>
                  <h4 className="text-xs font-black text-slate-900">{c.name}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">{c.role}</p>
                </div>
                {c.phone && (
                  <span className="text-[11px] font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-xl border border-sky-100">
                    هماهنگی با رالی
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
