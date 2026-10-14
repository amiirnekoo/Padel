import React, { useState } from 'react';
import { X, Siren, Share2, Copy, Check, Users, Clock, MapPin, Zap } from 'lucide-react';
import { MatchmakingGameItem } from '../../../types/rally';

interface LastMinutePlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  game: MatchmakingGameItem;
}

export const LastMinutePlayerModal: React.FC<LastMinutePlayerModalProps> = ({
  isOpen,
  onClose,
  game,
}) => {
  const [copied, setCopied] = useState(false);
  const [isBroadcasted, setIsBroadcasted] = useState(false);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    const url = `${window.location.origin}/matchmaking?game=${game.id}&urgent=1`;
    navigator.clipboard?.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBroadcast = () => {
    setIsBroadcasted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70" dir="rtl">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden my-auto border border-rose-100 flex flex-col text-rally-charcoal">
        
        {/* Urgent Header */}
        <div className="p-5 bg-gradient-to-l from-rose-600 to-rose-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center animate-bounce">
              <Siren className="w-5 h-5 text-yellow-300" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">فراخوان فوری بازیکن جایگزین</h3>
              <p className="text-[11px] text-rose-100 mt-0.5">جلوگیری از لغو سانس با دعوت بازیکن هم‌سطح</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Match Details Card */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
            <div className="flex items-center justify-between font-bold text-slate-800">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rally-primary" />
                {game.club_name}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-black text-[10px]">
                نیاز به ۱ نفر
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 text-[11px]">
              <div>
                <span className="text-gray-400 block text-[10px]">زمان سانس:</span>
                <span className="font-bold text-slate-800">{game.start_time} تا {game.end_time} (۱ ساعت)</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px]">سطح مورد نیاز:</span>
                <span className="font-extrabold text-rally-primary">سطح {game.skill_level}</span>
              </div>
            </div>
          </div>

          {/* Action 1: Broadcast */}
          {!isBroadcasted ? (
            <button
              onClick={handleBroadcast}
              className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
            >
              <Zap className="w-4 h-4 text-yellow-300" />
              <span>ارسال نوتیفیکیشن فوری به بازیکنان هم‌سطح</span>
            </button>
          ) : (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold text-center space-y-1">
              <p>✅ اعلان فوری برای ۳۵ بازیکن هم‌سطح فعال ارسال شد!</p>
              <p className="text-[10px] text-emerald-600 font-normal">به محض پیوستن بازیکن، پیامک تایید دریافت خواهید کرد.</p>
            </div>
          )}

          {/* Action 2: Share Link */}
          <div className="space-y-1.5 pt-2 border-t border-gray-100">
            <span className="text-[11px] font-bold text-gray-500 block">اشتراک‌گذاری در گروه‌های تلگرام و واتساپ پدل:</span>
            <button
              onClick={handleCopyLink}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 border border-slate-200 cursor-pointer transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-600" />}
              <span>{copied ? 'لینک فراخوان کپی شد!' : 'کپی لینک مستقیم دعوت بازیکن'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
