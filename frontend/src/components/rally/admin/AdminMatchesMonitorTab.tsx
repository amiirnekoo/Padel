import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, Users, Calendar, Clock, DollarSign, CheckCircle2 } from 'lucide-react';
import { MatchmakingGameItem } from '../../../types/rally';
import { rallyApi } from '../../../services/rallyApi';

interface AdminMatchesMonitorTabProps {
  matches: MatchmakingGameItem[];
  onRefresh: () => void;
}

export const AdminMatchesMonitorTab: React.FC<AdminMatchesMonitorTabProps> = ({
  matches,
  onRefresh
}) => {
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleEmergencyCancel = async (gameId: string) => {
    if (!cancelReason.trim()) {
      alert('لطفاً دلیل لغو اضطراری را مشخص کنید.');
      return;
    }

    setIsProcessing(true);
    const res = await rallyApi.emergencyCancelMatch(gameId, cancelReason, 'ادمین عملیاتی');
    setIsProcessing(false);

    if (res.success) {
      setFeedback({ type: 'success', message: 'بازی با موفقیت لغو شد و ۱۰۰٪ وجه به کیف پول بازیکنان مسترد گردید.' });
      setCancellingId(null);
      setCancelReason('');
      onRefresh();
      setTimeout(() => setFeedback(null), 4000);
    } else {
      setFeedback({ type: 'error', message: res.error || 'خطا در لغو اضطراری' });
    }
  };

  return (
    <div className="space-y-4">
      {feedback && (
        <div
          className={`p-3 rounded-2xl text-xs font-bold flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-300'
              : 'bg-red-950/80 border border-red-800 text-red-300'
          }`}
        >
          {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          <span>{feedback.message}</span>
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
        <div>
          <h3 className="font-bold text-white text-sm">مانیتورینگ بازی‌های مچ‌میکینگ دابلز</h3>
          <p className="text-[11px] text-slate-400">امکان لغو اضطراری سانس‌ها به دلیل خرابی زمین، قطعی برق و استرداد آنی وجه</p>
        </div>
        <span className="text-xs font-mono font-bold text-rally-primary bg-rally-primary/10 border border-rally-primary/20 px-3 py-1 rounded-xl">
          {matches.length} مسابقه ثبت‌شده
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {matches.map((m) => {
          const enrolledCount = m.filled_count ?? [
            m.positions?.team_a_right?.user_id,
            m.positions?.team_a_left?.user_id,
            m.positions?.team_b_right?.user_id,
            m.positions?.team_b_left?.user_id
          ].filter(Boolean).length;
          const isCancelled = m.status === 'CANCELLED';
          const isSelected = cancellingId === m.id;

          return (
            <div
              key={m.id}
              className={`p-4 rounded-2xl border transition-all ${
                isCancelled
                  ? 'bg-slate-950/50 border-slate-900 opacity-60'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h4 className="font-bold text-white text-xs sm:text-sm">{m.title}</h4>
                  <span className="text-[11px] text-slate-400 font-mono">شناسه: {m.id}</span>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    isCancelled
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : m.status === 'CONFIRMED'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {isCancelled ? 'لغو شده' : m.status === 'CONFIRMED' ? 'تکمیل ظرفیت (قطعی)' : 'در حال تکمیل'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 my-3 text-[11px] text-slate-300">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>{m.slot_date}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>{m.start_time} تا {m.end_time}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-500" />
                  <span>{enrolledCount} از ۴ بازیکن</span>
                </div>
              </div>

              {/* Positions Preview */}
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-[11px] mb-3">
                <div className="text-[10px] text-slate-500 font-bold mb-1">ترکیب بازیکنان:</div>
                <div className="grid grid-cols-2 gap-1.5 text-slate-300">
                  <div>تیم الف: راست ({m.positions?.team_a_right?.user_name || 'خالی'}) / چپ ({m.positions?.team_a_left?.user_name || 'خالی'})</div>
                  <div>تیم ب: راست ({m.positions?.team_b_right?.user_name || 'خالی'}) / چپ ({m.positions?.team_b_left?.user_name || 'خالی'})</div>
                </div>
              </div>

              {/* Actions */}
              {!isCancelled && (
                <div>
                  {isSelected ? (
                    <div className="p-3 bg-red-950/40 border border-red-900/60 rounded-xl space-y-2.5">
                      <div className="text-xs font-bold text-red-300 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4" />
                        <span>لغو اضطراری سانس با استرداد ۱۰۰٪ وجه</span>
                      </div>
                      <input
                        type="text"
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        placeholder="دلیل لغو (مثلاً شکستگی شیشه کورت)..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-red-500"
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setCancellingId(null)}
                          className="px-2.5 py-1 rounded-lg text-[11px] text-slate-400 hover:text-white bg-slate-800"
                        >
                          انصراف
                        </button>
                        <button
                          onClick={() => handleEmergencyCancel(m.id)}
                          disabled={isProcessing}
                          className="px-3 py-1 rounded-lg text-[11px] font-bold text-white bg-red-600 hover:bg-red-700"
                        >
                          {isProcessing ? 'در حال لغو...' : 'تأیید لغو و عودت وجه'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setCancellingId(m.id);
                        setCancelReason('نقص فنی کورت');
                      }}
                      className="w-full py-2 px-3 rounded-xl text-xs font-bold text-red-400 hover:text-white bg-red-500/10 hover:bg-red-600 border border-red-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>لغو اضطراری بازی و بازگشت وجه</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
