import React, { useState } from 'react';
import { X, Send, MessageCircle, MapPin, Clock, Users, CheckCheck } from 'lucide-react';
import { MatchmakingGameItem } from '../../../types/rally';

interface MatchChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  game: MatchmakingGameItem;
  currentUserId?: string;
  currentUserName?: string;
  currentUser?: { fullName?: string; phoneNumber?: string } | null;
}

interface ChatMessage {
  id: string;
  senderName: string;
  senderSide: string;
  isMe: boolean;
  time: string;
  text: string;
}

const QUICK_MESSAGES = [
  'من وارد کلوپ شدم 📍',
  'توپ نو مسابقه‌ای همراه من هست 🎾',
  'حدود ۵ دقیقه تاخیر در ترافیک دارم ⏳',
  'لباس تیره / مشکی پوشیدم 👕',
  'آماده یک بازی پرانرژی هستیم! 🔥',
];

export const MatchChatModal: React.FC<MatchChatModalProps> = ({
  isOpen,
  onClose,
  game,
  currentUserId,
  currentUserName,
  currentUser,
}) => {
  const hostName = game.positions?.team_a_right?.user_name || 'کاپیتان سانس';
  const player2Name = game.positions?.team_a_left?.user_name || 'پارتنر ۱';

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      senderName: hostName,
      senderSide: 'میزبان سانس',
      isMe: false,
      time: '۱۶:۴۵',
      text: 'سلام بچه‌ها، سانس قطعیه و کورت سنترال رزرو شده. لطفاً ۱۰ دقیقه زودتر برای گرم کردن حاضر باشید.',
    },
    {
      id: 'm2',
      senderName: player2Name,
      senderSide: 'تیم ۱ - راست',
      isMe: false,
      time: '۱۶:۵۰',
      text: 'سلام، عالیه. من قوطی توپ نو Head Padel Pro هم می‌آرم.',
    },
  ]);

  const [inputMsg, setInputMsg] = useState('');

  if (!isOpen) return null;

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputMsg).trim();
    if (!text) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderName: currentUser?.fullName || 'شما',
      senderSide: 'تیم ۲',
      isMe: true,
      time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
      text,
    };

    setMessages((prev) => [...prev, newMsg]);
    if (!textToSend) setInputMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70" dir="rtl">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden my-auto border border-gray-100 flex flex-col max-h-[85vh] text-rally-charcoal">
        
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rally-primary/20 border border-rally-primary/40 flex items-center justify-center text-[#D7ED68]">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-white">اتاق هماهنگی مسابقه ۴ نفره</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#D7ED68] text-slate-950">
                  سطح {game.skill_level}
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-300 mt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#D7ED68]" />
                  {game.club_name}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {game.start_time} تا {game.end_time} (۱ ساعت)
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Players Pill Bar */}
        <div className="bg-slate-50 border-b border-gray-200 px-4 py-2 flex items-center gap-1.5 overflow-x-auto text-[11px]">
          <Users className="w-3.5 h-3.5 text-gray-400 ml-1 shrink-0" />
          <span className="text-gray-400 font-bold shrink-0">حاضرین:</span>
          {[
            game.positions?.team_a_right?.user_name,
            game.positions?.team_a_left?.user_name,
            game.positions?.team_b_right?.user_name,
            game.positions?.team_b_left?.user_name,
          ].filter(Boolean).map((name, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 rounded-md bg-white border border-gray-200 text-slate-700 font-bold whitespace-nowrap shadow-xs"
            >
              {name}
            </span>
          ))}
        </div>

        {/* Chat Messages Timeline */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1 bg-slate-50/50 min-h-[220px]">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.isMe ? 'items-start' : 'items-end'}`}
            >
              <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mb-1 px-1">
                <span className="font-bold text-gray-700">{m.senderName}</span>
                <span>• {m.senderSide}</span>
                <span>• {m.time}</span>
              </div>
              <div
                className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed font-medium shadow-xs ${
                  m.isMe
                    ? 'bg-rally-primary text-white rounded-tr-none'
                    : 'bg-white border border-gray-200 text-slate-800 rounded-tl-none'
                }`}
              >
                <p>{m.text}</p>
                <div className="flex items-center justify-end gap-1 mt-1 opacity-70 text-[9px]">
                  <CheckCheck className="w-3 h-3" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Message Chips */}
        <div className="p-2.5 bg-white border-t border-gray-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {QUICK_MESSAGES.map((qm, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(qm)}
              className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold whitespace-nowrap shrink-0 transition-colors cursor-pointer"
            >
              {qm}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
          className="p-3 bg-white border-t border-gray-200 flex items-center gap-2"
        >
          <input
            type="text"
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            placeholder="پیامی برای هم‌تیمی‌ها بنویسید..."
            className="flex-1 h-10 px-3.5 rounded-xl border border-gray-200 text-xs font-bold text-slate-800 focus:border-rally-primary focus:outline-none"
          />
          <button
            type="submit"
            disabled={!inputMsg.trim()}
            className="h-10 px-4 rounded-xl bg-rally-primary hover:bg-rally-primary-light disabled:opacity-40 text-white text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0"
          >
            <span>ارسال</span>
            <Send className="w-3.5 h-3.5 rotate-180" />
          </button>
        </form>
      </div>
    </div>
  );
};
