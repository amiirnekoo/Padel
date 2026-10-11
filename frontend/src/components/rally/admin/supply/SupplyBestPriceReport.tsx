import React, { useState, useEffect } from 'react';
import { Award, TrendingDown, RefreshCw, AlertCircle } from 'lucide-react';
import { rallyApi } from '../../../../services/rallyApi';

interface QuoteItem {
  source_id: string;
  source_name: string;
  base_url: string;
  raw_price: number;
  currency: string;
  raw_price_toman: number;
  markup_percent: number;
  final_price_toman: number;
  delivery_time: string;
  is_lowest: boolean;
  diff_from_lowest_toman: number;
}

interface BestPriceResult {
  product_id: string;
  supply_mode: string;
  best_source_id: string;
  best_source_name: string;
  raw_price: number;
  currency: string;
  lowest_base_price_toman: number;
  markup_percent: number;
  final_rally_price: number;
  delivery_time: string;
  all_quotes: QuoteItem[];
}

interface SupplyBestPriceReportProps {
  mode: 'INSTANT' | 'EUROPE';
}

export const SupplyBestPriceReport: React.FC<SupplyBestPriceReportProps> = ({ mode }) => {
  const [data, setData] = useState<Record<string, BestPriceResult>>({});
  const [loading, setLoading] = useState(false);

  const fetchBestPrices = async () => {
    setLoading(true);
    const res = await rallyApi.getBestPrices(undefined, mode);
    if (res?.success && res.results) {
      setData(res.results);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBestPrices();
  }, [mode]);

  const productKeys = Object.keys(data);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-slate-900/60 border border-slate-800 p-3.5 rounded-2xl">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-400" />
          <div>
            <h4 className="text-xs font-bold text-white">
              جدول مقایسه هوشمند ارزان‌ترین قیمت (Best Price Arbitrage)
            </h4>
            <p className="text-[10px] text-slate-400">
              سیستم به صورت خودکار قیمت تمام سورس‌های فعال را بررسی کرده و ارزان‌ترین قیمت را مبنا قرار می‌دهد.
            </p>
          </div>
        </div>
        <button
          onClick={fetchBestPrices}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-white transition-colors cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>به‌روزرسانی مقایسه</span>
        </button>
      </div>

      {productKeys.length === 0 ? (
        <div className="p-8 text-center text-slate-400 bg-slate-900/30 rounded-2xl border border-slate-800 text-xs">
          {loading ? 'در حال ارزیابی بهترین قیمت‌ها...' : 'هنوز قیمت استعلام‌شده‌ای برای مقایسه در این مود ثبت نشده است.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {productKeys.map((pid) => {
            const item = data[pid];
            return (
              <div
                key={pid}
                className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{pid}</span>
                    <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-amber-400/10 text-amber-400 border border-amber-400/20 flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      <span>ارزان‌ترین منبع: {item.best_source_name}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-slate-400 text-[11px]">
                      قیمت خام برنده:{' '}
                      <strong className="text-white">
                        {item.currency === 'EUR' ? `${item.raw_price} €` : `${item.lowest_base_price_toman.toLocaleString('fa-IR')} ت`}
                      </strong>
                    </span>
                    <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                      فروش رالی: {item.final_rally_price.toLocaleString('fa-IR')} تومان ({item.markup_percent}٪ سود)
                    </span>
                  </div>
                </div>

                {/* Quotes Breakdown */}
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-[11px] table-fixed">
                    <colgroup>
                      <col className="w-44" />
                      <col className="w-32" />
                      <col className="w-32" />
                      <col className="w-36" />
                    </colgroup>
                    <thead>
                      <tr className="text-slate-500 text-[10px]">
                        <th className="pb-1.5">نام سورس</th>
                        <th className="pb-1.5">قیمت خام سورس</th>
                        <th className="pb-1.5">اختلاف با ارزان‌ترین</th>
                        <th className="pb-1.5">وضعیت در الگوریتم</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40 font-medium">
                      {item.all_quotes.map((q) => (
                        <tr key={q.source_id} className={q.is_lowest ? 'bg-emerald-950/20 text-emerald-200' : 'text-slate-400'}>
                          <td className="py-1.5 truncate font-semibold">{q.source_name}</td>
                          <td className="py-1.5 font-mono">
                            {q.currency === 'EUR' ? `${q.raw_price} €` : `${q.raw_price_toman.toLocaleString('fa-IR')} ت`}
                          </td>
                          <td className="py-1.5">
                            {q.is_lowest ? (
                              <span className="text-emerald-400 text-[10px] font-bold">۰ ت (پایین‌ترین قیمت)</span>
                            ) : (
                              <span className="text-rose-400 text-[10px]">
                                +{q.diff_from_lowest_toman.toLocaleString('fa-IR')} تومان گران‌تر
                              </span>
                            )}
                          </td>
                          <td className="py-1.5">
                            {q.is_lowest ? (
                              <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300">
                                منبع مبنای قیمت فروش رالی
                              </span>
                            ) : (
                              <span className="text-slate-600 text-[9px]">کنار گذاشته شد (قیمت بالاتر)</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
