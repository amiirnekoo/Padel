import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Search, TrendingUp, TrendingDown, Minus, Award, Globe, Shield, Zap } from 'lucide-react';
import { IRAN_PADEL_RANKINGS, WORLD_PADEL_RANKINGS, RankingPlayer } from '../../data/mockRankingsData';
import { rallyApi } from '../../services/rallyApi';
import { EloPlayerLeaderboardItem } from '../../types/rally';
import { EloLeaderboardTable } from '../../components/rally/rankings/EloLeaderboardTable';
import { RankingsPodium } from '../../components/rally/rankings/RankingsPodium';
import { PlayerProfileModal } from '../../components/rally/player/PlayerProfileModal';

interface RallyRankingsPageProps {
  initialPlayerId?: string | null;
  onClosePlayerModal?: () => void;
}

export const RallyRankingsPage: React.FC<RallyRankingsPageProps> = ({
  initialPlayerId,
  onClosePlayerModal,
}) => {
  const [activeTab, setActiveTab] = useState<'IRAN' | 'WORLD' | 'LIVE_ELO'>('IRAN');
  const [searchQuery, setSearchQuery] = useState('');
  const [liveEloPlayers, setLiveEloPlayers] = useState<EloPlayerLeaderboardItem[]>([]);
  const [iranRankings, setIranRankings] = useState<RankingPlayer[]>(IRAN_PADEL_RANKINGS);
  const [worldRankings, setWorldRankings] = useState<RankingPlayer[]>(WORLD_PADEL_RANKINGS);
  const [eloLoading, setEloLoading] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(initialPlayerId || null);

  useEffect(() => {
    if (initialPlayerId) {
      setSelectedPlayerId(initialPlayerId);
      setActiveTab('LIVE_ELO');
    }
  }, [initialPlayerId]);

  useEffect(() => {
    let isMounted = true;
    if (activeTab === 'LIVE_ELO') {
      setEloLoading(true);
      rallyApi.getEloLeaderboard().then((data) => {
        if (!isMounted) return;
        if (data && data.length > 0) setLiveEloPlayers(data);
        setEloLoading(false);
      }).catch(() => setEloLoading(false));
    } else {
      const cat = activeTab === 'IRAN' ? 'IRAN_PADEL' : 'WORLD_PADEL';
      rallyApi.getPublicRankings(cat).then((data) => {
        if (!isMounted || !Array.isArray(data) || data.length === 0) return;
        const mapped: RankingPlayer[] = data.map((p: any, idx: number) => ({
          id: p.id || `p-${idx + 1}`,
          rank: p.rank || idx + 1,
          previousRank: Number(p.previous_rank || p.rank || idx + 1),
          name: p.name || p.full_name || 'بازیکن پدل',
          englishName: p.english_name || p.name || 'Padel Player',
          country: p.country || (activeTab === 'IRAN' ? 'ایران' : 'اسپانیا'),
          countryFlag: p.country_flag || (activeTab === 'IRAN' ? '🇮🇷' : '🇪🇸'),
          points: Number(p.points || 1000),
          tournamentsCount: Number(p.tournaments_count || 5),
          winRate: p.win_rate ? `${p.win_rate}%` : '75%',
          trend: p.trend || 'STABLE',
          club: p.club || 'باشگاه پدل',
          hand: p.hand || 'راست‌دست',
          avatarUrl: p.avatar_url || '',
          category: activeTab === 'IRAN' ? 'IRAN' : 'WORLD',
        }));
        if (activeTab === 'IRAN') setIranRankings(mapped);
        else setWorldRankings(mapped);
      }).catch(() => {});
    }
    return () => { isMounted = false; };
  }, [activeTab]);

  const currentList = activeTab === 'IRAN' ? iranRankings : (activeTab === 'WORLD' ? worldRankings : []);

  const filteredPlayers = currentList.filter(
    (p) =>
      p.name.includes(searchQuery) ||
      p.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.club.includes(searchQuery)
  );

  const filteredEloPlayers = liveEloPlayers.filter(
    (p) => p.full_name.includes(searchQuery) || p.city.includes(searchQuery)
  );

  const topThree = currentList.slice(0, 3);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-rally-primary" />
            <h1 className="text-xl sm:text-2xl font-black text-rally-charcoal">
              جدول رنکینگ رسمی بازیکنان برتر پدل
            </h1>
          </div>
          <p className="text-xs text-gray-500">
            بروزرسانی هفتگی بر اساس نتایج مسابقات رسمی رالی و فدراسیون بین‌المللی پدل (FIP)
          </p>
        </div>

        {/* Tab Switcher: Iran vs World vs Live Elo */}
        <div className="flex bg-[#F5F4EF] p-1 rounded-xl border border-[#E8E6DD] self-start md:self-auto flex-wrap gap-1">
          <button
            onClick={() => setActiveTab('IRAN')}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'IRAN'
                ? 'bg-rally-primary text-white shadow-xs'
                : 'text-gray-600 hover:text-black'
            }`}
          >
            <span>🇮🇷</span>
            <span>رنکینگ ایران</span>
          </button>
          <button
            onClick={() => setActiveTab('LIVE_ELO')}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'LIVE_ELO'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-gray-600 hover:text-black'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>لیدربورد زنده مسابقات (Elo)</span>
          </button>
          <button
            onClick={() => setActiveTab('WORLD')}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'WORLD'
                ? 'bg-rally-primary text-white shadow-xs'
                : 'text-gray-600 hover:text-black'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>رنکینگ جهانی (FIP)</span>
          </button>
        </div>
      </div>

      {/* Top 3 Podium Highlights */}
      <RankingsPodium topThree={topThree} />

      {/* Search and Table Section */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-rally-primary" />
            <h2 className="text-sm font-black text-rally-charcoal">
              جدول کامل رده‌بندی {activeTab === 'IRAN' ? 'کشوری ایران' : 'بین‌المللی FIP'}
            </h2>
            <span className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-bold">
              {filteredPlayers.length.toLocaleString('fa-IR')} بازیکن
            </span>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجوی نام بازیکن یا باشگاه..."
              className="w-full pr-8 pl-3 py-1.5 rounded-xl border border-gray-200 text-xs focus:outline-hidden focus:border-rally-primary"
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          {activeTab === 'LIVE_ELO' ? (
            <EloLeaderboardTable
              players={filteredEloPlayers}
              onSelectPlayer={(p) => setSelectedPlayerId(p.user_id)}
            />
          ) : (
            <table className="w-full text-right text-xs table-fixed">
              <colgroup>
                <col style={{ width: '8%' }} />
                <col style={{ width: '38%' }} />
                <col style={{ width: '18%' }} />
                <col style={{ width: '14%' }} />
                <col style={{ width: '22%' }} />
              </colgroup>
              <thead className="bg-[#F5F4EF] text-[#66706D] font-bold border-b border-gray-200">
                <tr>
                  <th className="py-3 px-3 text-center">رتبه</th>
                  <th className="py-3 px-3">نام و مشخصات بازیکن</th>
                  <th className="py-3 px-3 text-center">تورنمنت‌ها</th>
                  <th className="py-3 px-3 text-center">درصد پیروزی</th>
                  <th className="py-3 px-3 text-center">امتیاز رنکینگ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPlayers.map((player) => {
                  const rankDiff = player.previousRank - player.rank;
                  return (
                    <tr key={player.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <span className="font-black text-sm text-rally-charcoal">
                            {player.rank.toLocaleString('fa-IR')}
                          </span>
                          {rankDiff > 0 && <TrendingUp className="w-3 h-3 text-emerald-600" />}
                          {rankDiff < 0 && <TrendingDown className="w-3 h-3 text-rose-500" />}
                          {rankDiff === 0 && <Minus className="w-2.5 h-2.5 text-gray-300" />}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center font-bold text-xs text-gray-700 shrink-0 overflow-hidden">
                            {player.avatarUrl ? (
                              <img src={player.avatarUrl} alt={player.name} className="w-full h-full object-cover" />
                            ) : (
                              <span>{player.name.slice(0, 2)}</span>
                            )}
                          </div>
                          <div className="truncate">
                            <div className="flex items-center gap-1.5">
                              <span className="font-black text-xs text-rally-charcoal">{player.name}</span>
                              <span>{player.countryFlag}</span>
                            </div>
                            <div className="text-[10px] text-gray-400 font-medium truncate">
                              {player.club} • دست: {player.hand}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-center font-bold text-gray-600">
                        {player.tournamentsCount.toLocaleString('fa-IR')} تورنمنت
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className="font-bold text-emerald-700">{player.winRate}</span>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-black bg-[#EBF2EA] text-[#0E3D38]">
                          {player.points.toLocaleString('fa-IR')} امتیاز
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <PlayerProfileModal
        userId={selectedPlayerId}
        isOpen={!!selectedPlayerId}
        onClose={() => {
          setSelectedPlayerId(null);
          onClosePlayerModal?.();
        }}
      />
    </div>
  );
};
