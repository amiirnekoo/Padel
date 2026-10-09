import React, { useState } from 'react';
import { Award, BarChart3, HelpCircle } from 'lucide-react';
import { ShopProduct } from '../../../../types/rally';
import { getRacketVerdict } from '../../../../data/racketVerdictData';
import { RacketVerdictCard } from './RacketVerdictCard';
import { RacketRadarChart } from './RacketRadarChart';
import { RacketParametersBreakdown } from './RacketParametersBreakdown';
import { RacketCommunityReviews } from './RacketCommunityReviews';

interface RacketVerdictSectionProps {
  product: ShopProduct;
}

export const RacketVerdictSection: React.FC<RacketVerdictSectionProps> = React.memo(({
  product
}) => {
  const [hoveredParam, setHoveredParam] = useState<string | null>(null);

  // فقط برای دسته‌بندی راکت پدل نمایش داده می‌شود
  const isPadelRacket = product.category === 'PADEL_RACKET' || (product.sport === 'PADEL' && (product.shape || product.weight));
  if (!isPadelRacket) {
    return null;
  }

  const verdict = getRacketVerdict(product);

  return (
    <section className="flex flex-col gap-6 w-full mt-4">
      {/* ۱. کارت اصلی ارزیابی و امتیاز کلی (Rally Verdict Card) */}
      <RacketVerdictCard product={product} verdict={verdict} />

      {/* ۲. بخش رادار عملکرد و تفکیک ۸ پارامتر (Performance Radar & Breakdown) */}
      <div className="bg-[#0b1329] text-white rounded-3xl p-5 sm:p-7 border border-cyan-500/20 shadow-xl flex flex-col gap-5">
        
        {/* سربرگ خروجی الگوریتم */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cyan-500/20 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-950 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] tracking-widest font-black text-cyan-400 block">
                ALGORITHM OUTPUT
              </span>
              <h3 className="text-sm sm:text-base font-black text-white">
                خروجی آزمایشگاهی و ۸ پارامتر اختصاصی عملکرد
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>نمره‌دهی براساس تست فیزیکی و فیدبک مربیان</span>
          </div>
        </div>

        {/* گرید ۲ ستونه: سمت چپ رادار، سمت راست نوارهای تفکیکی */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* ستون رادار چارت (۵ ستون) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
            <RacketRadarChart
              parameters={verdict.parameters}
              activeKey={hoveredParam}
              onHoverParam={setHoveredParam}
            />
          </div>

          {/* ستون نوارهای افقی و گیج سفتی (۷ ستون) */}
          <div className="lg:col-span-7">
            <RacketParametersBreakdown
              parameters={verdict.parameters}
              stiffness={verdict.stiffness}
              hoveredKey={hoveredParam}
              onHoverParam={setHoveredParam}
            />
          </div>
        </div>

        {/* راهنمای کوتاه پارامترها */}
        <div className="flex items-center gap-2 p-3 bg-slate-900/50 rounded-xl border border-slate-800 text-[11px] text-slate-400">
          <HelpCircle className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <span>
            امتیاز هر پارامتر حاصل تلفیق جنس کربن، دانسیته فوم داخلی، گرانیگاه (Balance) و ضریب درگ آیرودینامیک شاسی راکت است.
          </span>
        </div>
      </div>

      {/* ۳. بخش نظرات و امتیازدهی جامعه پدل‌بازان */}
      <RacketCommunityReviews
        productId={product.id}
        productName={product.name_fa}
      />
    </section>
  );
});

RacketVerdictSection.displayName = 'RacketVerdictSection';
