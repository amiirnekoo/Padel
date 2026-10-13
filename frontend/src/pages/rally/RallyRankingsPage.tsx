import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Search, TrendingUp, TrendingDown, Minus, Award, Globe, Shield, Zap } from 'lucide-react';
import { IRAN_PADEL_RANKINGS, WORLD_PADEL_RANKINGS, RankingPlayer } from '../../data/mockRankingsData';
import { rallyApi } from '../../services/rallyApi';
import { EloPlayerLeaderboardItem } from '../../types/rally';

export const RallyRankingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'IRAN' | 'WORLD' | 'LIVE_ELO'>('IRAN');
  const [searchQuery, setSearchQuery] = useState('');
  const [liveEloPlayers, setLiveEloPlayers] = useState<EloPlayerLeaderboardItem[]>([]);
  const [eloLoading, setEloLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'LIVE_ELO') {
      setEloLoading(true);
      rallyApi.getEloLeaderboard().then((data) => {
        if (data && data.length > 0) {
          setLiveEloPlayers(data);
        } else {
          // Fallback initial seeded Elo leaderboard
          setLiveEloPlayers([
            { rank: 1, user_id: 'u-1', full_name: 'آرتین قهرمان', elo_rating: 1680, skill_tier: 'B', matches_played: 28, matches_won: 24, win_rate: 85.7, city: 'تهران' },
            { rank: 2, user_id: 'u-2', full_name: 'سهراب محمدی', elo_rating: 1540, skill_tier: 'C+', matches_played: 22, matches_won: 17, win_rate: 77.2, city: 'تهران' },
            { rank: 3, user_id: 'u-3', full_name: 'امیرحسین نکوزاده', elo_rating: 1460, skill_tier: 'C+', matches_played: 19, matches_won: 14, win_rate: 73.6, city: 'تهران' },
            { rank: 4, user_id: 'u-4', full_name: 'کیان رضایی', elo_rating: 1390, skill_tier: 'C', matches_played: 15, matches_won: 10, win_rate: 66.6, city: 'کرج' },
            { rank: 5, user_id: 'u-5', full_name: 'بردیا تهرانی', elo_rating: 1250, skill_tier: 'C', matches_played: 12, matches_won: 7, win_rate: 58.3, city: 'تهران' },
          ]);
        }
        setEloLoading(false);
      });
    }
  }, [activeTab]);

  const currentList = activeTab === 'IRAN' ? IRAN_PADEL_RANKINGS : WORLD_PADEL_RANKINGS;

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

  const getRankBadge = (rank: number) => {
    if (rank === 1) return { bg: 'bg-[#FFD700]', text: 'text-amber-950', label: 'طلا' };
    if (rank === 2) return { bg: 'bg-[#C0C0C0]', text: 'text-slate-900', label: 'نقره' };
    if (rank === 3) return { bg: 'bg-[#CD7F32]', text: 'text-amber-950', label: 'برنز' };
    return { bg: 'bg-gray-100', text: 'text-gray-700', label: '' };
  };

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {topThree.map((player) => {
          const badge = getRankBadge(player.rank);
          return (
            <div
              key={player.id}
              className={`bg-white rounded-2xl p-4 border relative overflow-hidden flex flex-col items-center text-center shadow-xs transition-transform hover:-translate-y-1 ${
                player.rank === 1 ? 'border-amber-300 ring-2 ring-amber-300/40 order-first md:order-2' : 'border-gray-200 order-2 md:order-1'
              }`}
            >
              <div className="absolute top-3 right-3">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${badge.bg} ${badge.text}`}>
                  رتبه {player.rank.toLocaleString('fa-IR')}
                </span>
              </div>

              {/* Player Avatar Placeholder */}
              <div className="relative mt-2 mb-3">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#172320]/10 to-[#172320]/25 border-2 border-white shadow-md flex items-center justify-center text-2xl font-black text-rally-charcoal overflow-hidden">
                  {player.avatarUrl ? (
                    <img src={player.avatarUrl} alt={player.name} className="w-full h-full object-cover" />
                  ) : (
                    <span>{player.name.slice(0, 2)}</span>
                  )}
                </div>
                <span className="absolute -bottom-1 -left-1 text-base">{player.countryFlag}</span>
              </div>

              <h3 className="text-base font-black text-rally-charcoal">{player.name}</h3>
              <p className="text-[11px] text-gray-400 font-medium mb-3">{player.englishName} • {player.club}</p>

              <div className="w-full grid grid-cols-2 gap-2 bg-[#F5F4EF] p-2.5 rounded-xl text-xs">
                <div>
                  <span className="text-[10px] text-gray-500 block">امتیاز کل</span>
                  <span className="font-black text-rally-primary">{player.points.toLocaleString('fa-IR')}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 block">درصد برد</span>
                  <span className="font-black text-emerald-700">{player.winRate}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

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
            <table className="w-full text-right text-xs table-fixed">
              <colgroup>
                <col style={{ width: '8%' }} />
                <col style={{ width: '36%' }} />
                <col style={{ width: '18%' }} />
                <col style={{ width: '18%' }} />
                <col style={{ width: '20%' }} />
              </colgroup>
              <thead className="bg-[#F5F4EF] text-[#66706D] font-bold border-b border-gray-200">
                <tr>
                  <th className="py-3 px-3 text-center">رتبه</th>
                  <th className="py-3 px-3">نام بازیکن و شهر</th>
                  <th className="py-3 px-3 text-center">سطح مهارتی</th>
                  <th className="py-3 px-3 text-center">بازی‌ها / برد</th>
                  <th className="py-3 px-3 text-center">ریتینگ زنده Elo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredEloPlayers.map((player) => (
                  <tr key={player.user_id} className="hover:bg-amber-50/40 transition-colors">
                    <td className="py-3 px-3 text-center">
                      <span className="font-black text-sm text-rally-charcoal">
                        {player.rank.toLocaleString('fa-IR')}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-black text-xs text-rally-charcoal">{player.full_name}</div>
                      <div className="text-[10px] text-gray-400 font-medium">{player.city} • نرخ برد: {player.win_rate}٪</div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-indigo-100 text-indigo-900 border border-indigo-200">
                        سطح {player.skill_tier}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-gray-600">
                      {player.matches_won} برد از {player.matches_played} بازی
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-950 border border-amber-300">
                        <Zap size={11} className="text-amber-600" />
                        {player.elo_rating.toLocaleString('fa-IR')} Elo
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
    </div>
  );
};
