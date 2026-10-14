import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Users, Filter, Sparkles, CheckCircle2 } from 'lucide-react';
import { MatchmakingGameItem } from '../../types/rally';
import { MatchmakingCard } from '../../components/rally/matchmaking/MatchmakingCard';
import { JoinMatchModal } from '../../components/rally/matchmaking/JoinMatchModal';
import { CreateMatchModal } from '../../components/rally/matchmaking/CreateMatchModal';
import { MatchResultModal } from '../../components/rally/matchmaking/MatchResultModal';
import { PlayerProfileModal } from '../../components/rally/player/PlayerProfileModal';
import { MatchChatModal } from '../../components/rally/matchmaking/MatchChatModal';
import { LastMinutePlayerModal } from '../../components/rally/matchmaking/LastMinutePlayerModal';
import { rallyApi } from '../../services/rallyApi';
import { useDragScroll } from '../../hooks/useDragScroll';
import { SKILL_FILTER_PILLS, FALLBACK_MATCHMAKING_GAMES } from '../../data/mockMatchmakingData';

interface RallyMatchmakingPageProps {
  userId: string;
  userName: string;
  walletBalance: number;
}

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
  const [activeChatGame, setActiveChatGame] = useState<MatchmakingGameItem | null>(null);
  const [activeLastMinuteGame, setActiveLastMinuteGame] = useState<MatchmakingGameItem | null>(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const {
    containerRef: filterTrackRef,
    hasDraggedRef,
    dragProps,
  } = useDragScroll<HTMLDivElement>();

  const [canScrollRight, setCanScrollRight] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(true);

  const checkScrollEdges = useCallback(() => {
    const el = filterTrackRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const absScroll = Math.abs(scrollLeft);
    const maxScroll = scrollWidth - clientWidth;
    setCanScrollRight(absScroll > 8);
    setCanScrollLeft(absScroll < maxScroll - 8);
  }, [filterTrackRef]);

  useEffect(() => {
    checkScrollEdges();
    window.addEventListener('resize', checkScrollEdges);
    return () => window.removeEventListener('resize', checkScrollEdges);
  }, [checkScrollEdges]);

  const fetchGames = useCallback(async () => {
    setLoading(true);
    const data = await rallyApi.getMatchmakingGames(selectedLevel === 'ALL' ? undefined : selectedLevel);
    if (data && data.length > 0) {
      setGames(data);
    } else {
      setGames(FALLBACK_MATCHMAKING_GAMES);
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
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-rally-accent shadow-sm">
              <Filter size={15} className="text-rally-accent stroke-[2.5]" />
            </div>
            <span className="text-sm sm:text-base font-black text-slate-900 tracking-wide">
              فیلتر سطح مهارتی مسابقه:
            </span>
          </div>
        </div>

        {/* Carousel Container with Interactive Edge Fade Masks and Sleek Scrollbar */}
        <div className="relative">
          {/* Subtle Overflow Fade Mask - Left Edge (RTL overflow) */}
          <div
            className={`pointer-events-none absolute left-0 top-0 bottom-2.5 w-14 sm:w-20 bg-gradient-to-r from-[#F5F4EF] via-[#F5F4EF]/90 to-transparent z-10 transition-opacity duration-300 ${
              canScrollLeft ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {/* Subtle Overflow Fade Mask - Right Edge */}
          <div
            className={`pointer-events-none absolute right-0 top-0 bottom-2.5 w-10 sm:w-16 bg-gradient-to-l from-[#F5F4EF] via-[#F5F4EF]/90 to-transparent z-10 transition-opacity duration-300 ${
              canScrollRight ? 'opacity-100' : 'opacity-0'
            }`}
          />

          <div
            ref={filterTrackRef}
            onScroll={checkScrollEdges}
            className="flex items-center gap-2.5 overflow-x-auto pb-2.5 scrollbar-subtle select-none cursor-grab active:cursor-grabbing px-0.5"
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
            onSelectPlayer={(pId) => setSelectedPlayerId(pId)}
            onOpenChat={(g) => setActiveChatGame(g)}
            onOpenLastMinute={(g) => setActiveLastMinuteGame(g)}
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

      {/* Match 4-Player Chat Modal */}
      {activeChatGame && (
        <MatchChatModal
          game={activeChatGame}
          isOpen={!!activeChatGame}
          onClose={() => setActiveChatGame(null)}
          currentUserId={userId}
          currentUserName={userName}
        />
      )}

      {/* Last Minute Player Emergency Modal */}
      {activeLastMinuteGame && (
        <LastMinutePlayerModal
          game={activeLastMinuteGame}
          isOpen={!!activeLastMinuteGame}
          onClose={() => setActiveLastMinuteGame(null)}
        />
      )}

      <PlayerProfileModal
        userId={selectedPlayerId}
        isOpen={!!selectedPlayerId}
        onClose={() => setSelectedPlayerId(null)}
      />
    </div>
  );
};
