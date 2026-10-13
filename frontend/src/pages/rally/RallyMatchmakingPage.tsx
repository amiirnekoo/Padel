import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Users, Filter, Sparkles, CheckCircle2, ChevronRight, ChevronLeft, MoveHorizontal } from 'lucide-react';
import { MatchmakingGameItem } from '../../types/rally';
import { MatchmakingCard } from '../../components/rally/matchmaking/MatchmakingCard';
import { JoinMatchModal } from '../../components/rally/matchmaking/JoinMatchModal';
import { CreateMatchModal } from '../../components/rally/matchmaking/CreateMatchModal';
import { MatchResultModal } from '../../components/rally/matchmaking/MatchResultModal';
import { rallyApi } from '../../services/rallyApi';
import { useDragScroll } from '../../hooks/useDragScroll';

interface RallyMatchmakingPageProps {
  userId: string;
  userName: string;
  walletBalance: number;
}

const SKILL_FILTER_PILLS = [
  { id: 'ALL', label: 'همه سطوح' }, { id: 'D-', label: 'سطح D- (تازه‌کار)' },
  { id: 'D', label: 'سطح D (مبتدی)' }, { id: 'D+', label: 'سطح D+ (نیمه‌مبتدی)' },
  { id: 'C-', label: 'سطح C- (متوسط مقدماتی)' }, { id: 'C', label: 'سطح C (متوسط)' },
  { id: 'C+', label: 'سطح C+ (نیمه‌پیشرفته)' }, { id: 'B-', label: 'سطح B- (پیشرفته مقدماتی)' },
  { id: 'B', label: 'سطح B (پیشرفته)' }, { id: 'B+', label: 'سطح B+ (پیشرفته عالی)' },
  { id: 'A-', label: 'سطح A- (حرفه‌ای مقدماتی)' }, { id: 'A', label: 'سطح A (حرفه‌ای)' },
  { id: 'A+', label: 'سطح A+ (الیت کشوری)' },
];

export const RallyMatchmakingPage: React.FC<RallyMatchmakingPageProps> = ({
  userId,
  userName,
  walletBalance,
}) => {
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL');
  const [games, setGames] = useState<MatchmakingGameItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeJoinGame, setActiveJoinGame] = useState<MatchmakingGameItem | null>(null);
  const [activeRecordResultGame, setActiveRecordResultGame] = useState<MatchmakingGameItem | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const {
    containerRef: filterTrackRef,
    hasDraggedRef,
    scrollStep,
    dragProps,
  } = useDragScroll<HTMLDivElement>();

  const fetchGames = useCallback(async () => {
    setLoading(true);
    const data = await rallyApi.getMatchmakingGames(selectedLevel === 'ALL' ? undefined : selectedLevel);
    if (data && data.length > 0) {
      setGames(data);
    } else {
      // High-fidelity fallback games for demo
      setGames([
        {
          id: 'mock-mm-1',
          title: 'بازی پرانرژی عصرگاهی پدل • سطح D+',
          skill_level: 'D+',
          gender_category: 'OPEN',
          total_price: 16000000,
          price_per_player: 4000000,
          status: 'OPEN',
          filled_count: 3,
          club_name: 'باشگاه پدل انقلاب',
          club_city: 'تهران',
          court_name: 'کورت ۱ پانورامیک',
          slot_date: 'امروز',
          start_time: '۱۸:۳۰',
          end_time: '۲۰:۰۰',
          positions: {
            team_a_right: { user_id: 'usr-1', user_name: 'امیرحسین (شما)', label: 'تیم ۱ • راست' },
            team_a_left: { user_id: 'usr-2', user_name: 'کیان رضایی', label: 'تیم ۱ • چپ' },
            team_b_right: { user_id: 'usr-3', user_name: 'بردیا تهرانی', label: 'تیم ۲ • راست' },
            team_b_left: { user_id: null, user_name: null, label: 'تیم ۲ • چپ' },
          },
        },
        {
          id: 'mock-mm-2',
          title: 'چلنج مچ پدل دابلز • سطح C',
          skill_level: 'C',
          gender_category: 'OPEN',
          total_price: 20000000,
          price_per_player: 5000000,
          status: 'OPEN',
          filled_count: 2,
          club_name: 'پدل سنتر پالادیوم',
          club_city: 'تهران',
          court_name: 'کورت VIP',
          slot_date: 'امشب',
          start_time: '۲۰:۳۰',
          end_time: '۲۲:۰۰',
          positions: {
            team_a_right: { user_id: 'usr-4', user_name: 'سهراب محمدی', label: 'تیم ۱ • راست' },
            team_a_left: { user_id: null, user_name: null, label: 'تیم ۱ • چپ' },
            team_b_right: { user_id: 'usr-5', user_name: 'ماهان پاشا', label: 'تیم ۲ • راست' },
            team_b_left: { user_id: null, user_name: null, label: 'تیم ۲ • چپ' },
          },
        },
        {
          id: 'mock-mm-3',
          title: 'بازی دوستانه پدل مبتدی • سطح D',
          skill_level: 'D',
          gender_category: 'OPEN',
          total_price: 12000000,
          price_per_player: 3000000,
          status: 'OPEN',
          filled_count: 1,
          club_name: 'مجموعه پدل شمیران',
          club_city: 'تهران',
          court_name: 'کورت ۲ شیشه‌ای',
          slot_date: 'فردا',
          start_time: '۱۷:۰۰',
          end_time: '۱۸:۳۰',
          positions: {
            team_a_right: { user_id: 'usr-6', user_name: 'نیما افشار', label: 'تیم ۱ • راست' },
            team_a_left: { user_id: null, user_name: null, label: 'تیم ۱ • چپ' },
            team_b_right: { user_id: null, user_name: null, label: 'تیم ۲ • راست' },
            team_b_left: { user_id: null, user_name: null, label: 'تیم ۲ • چپ' },
          },
        },
      ]);
    }
    setLoading(false);
  }, [selectedLevel]);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6" dir="rtl">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 p-3.5 rounded-2xl bg-emerald-950 border border-emerald-500 text-emerald-200 text-xs shadow-2xl">
          <CheckCircle2 size={16} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden mb-8 border border-slate-800 shadow-2xl bg-[#0f172a]">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/courts/matchmaking_hero.jpg?v=20261013_men"
            alt="مسابقه دابلز پدل آقایان رالی"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-[#0f172a] via-[#0f172a]/85 to-transparent" />
        </div>

        <div className="relative z-10 p-6 sm:p-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rally-accent/20 border border-rally-accent/40 text-rally-accent text-xs font-bold mb-3">
            <Sparkles size={13} />
            <span>سیستم مچ‌میکینگ هوشمند پدل رالی</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-3">
            پارتنر پدل نداری؟ در بازی‌های آزاد ۴ نفره هم‌سطح خودت شرکت کن!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
            کورت مورد علاقه‌ات را پیدا کن، سطح بازی (D+، C، B) و جایگاهت را (راست یا چپ) انتخاب کن، سهم ۱/۴ هزینه را بپرداز و با پدل‌بازهای حرفه‌ای شهر بازی کن.
          </p>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-6 py-3 rounded-2xl bg-rally-accent hover:bg-rally-accent-hover text-slate-950 text-xs sm:text-sm font-extrabold shadow-lg flex items-center gap-2 transition active:scale-95"
          >
            <Plus size={16} />
            برگزاری بازی آزاد جدید
          </button>
        </div>
      </div>

      {/* Level Filters with Ultra-smooth Mouse Drag to Scroll */}
      <div className="relative mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-rally-accent/20 border border-rally-accent/40 flex items-center justify-center text-rally-accent shadow-xs">
              <Filter size={15} className="text-rally-accent stroke-[2.5]" />
            </div>
            <span className="text-sm font-black text-white tracking-wide">فیلتر سطح مهارتی مسابقه:</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#0E2038] border border-slate-700/80 text-[11px] font-extrabold text-white shadow-xs select-none">
              <MoveHorizontal size={14} className="text-rally-accent" />
              <span>با ماوس بکشید</span>
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => scrollStep('right', 300)}
                className="w-7 h-7 rounded-xl bg-[#0E2038] hover:bg-[#163258] border border-slate-700 text-white flex items-center justify-center transition active:scale-90 cursor-pointer shadow-xs"
                title="مشاهده سطوح راست"
              >
                <ChevronRight size={15} />
              </button>
              <button
                type="button"
                onClick={() => scrollStep('left', 300)}
                className="w-7 h-7 rounded-xl bg-[#0E2038] hover:bg-[#163258] border border-slate-700 text-white flex items-center justify-center transition active:scale-90 cursor-pointer shadow-xs"
                title="مشاهده سطوح چپ"
              >
                <ChevronLeft size={15} />
              </button>
            </div>
          </div>
        </div>

        <div
          ref={filterTrackRef}
          className="flex items-center gap-2.5 overflow-x-auto pb-3 no-scrollbar select-none cursor-grab active:cursor-grabbing"
          {...dragProps}
        >
          {SKILL_FILTER_PILLS.map((pill) => (
            <button
              key={pill.id}
              type="button"
              draggable={false}
              onClick={() => {
                if (hasDraggedRef.current) return;
                setSelectedLevel(pill.id);
              }}
              className={`px-4 py-2.5 rounded-xl text-xs whitespace-nowrap transition-all select-none flex-shrink-0 cursor-pointer ${
                selectedLevel === pill.id
                  ? 'bg-rally-accent text-slate-950 shadow-md font-black ring-2 ring-rally-accent/60 scale-102'
                  : 'bg-[#0E223D] hover:bg-[#15345C] text-white hover:text-white font-extrabold border border-slate-600/90 hover:border-slate-400 shadow-xs'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.map((game) => (
          <MatchmakingCard
            key={game.id}
            game={game}
            currentUserId={userId}
            onJoinClick={(g) => setActiveJoinGame(g)}
            onRecordResult={(g) => setActiveRecordResultGame(g)}
          />
        ))}
      </div>

      {/* Modals */}
      {activeJoinGame && (
        <JoinMatchModal
          game={activeJoinGame}
          isOpen={!!activeJoinGame}
          onClose={() => setActiveJoinGame(null)}
          onSuccess={() => {
            showToast('جایگاه شما با موفقیت رزرو و سهم هزینه از کیف پول کسر شد.');
            fetchGames();
          }}
          userId={userId}
          userName={userName}
          walletBalance={walletBalance}
        />
      )}

      {activeRecordResultGame && (
        <MatchResultModal
          game={activeRecordResultGame}
          isOpen={!!activeRecordResultGame}
          onClose={() => setActiveRecordResultGame(null)}
          onSuccess={() => {
            showToast('نتیجه مسابقه با موفقیت ثبت شد و ریتینگ Elo بازیکنان بروزرسانی گردید.');
            fetchGames();
          }}
        />
      )}

      {isCreateOpen && (
        <CreateMatchModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onSuccess={() => {
            showToast('بازی مچ‌میکینگ با موفقیت منتشر شد.');
            fetchGames();
          }}
          userId={userId}
          userName={userName}
        />
      )}
    </div>
  );
};
