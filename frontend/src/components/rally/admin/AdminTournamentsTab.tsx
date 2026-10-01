import React, { useState, useEffect } from 'react';
import { Trophy, Award, Plus, Edit, Trash2, Calendar, MapPin, DollarSign, Users, RefreshCw, X } from 'lucide-react';
import { rallyApi } from '../../../services/rallyApi';

interface TournamentItem {
  id: string;
  title: string;
  slug: string;
  cover_image: string;
  sport_type: string;
  tournament_format: string;
  gender: string;
  level: string;
  status: string;
  venue_name: string;
  start_date: string;
  end_date: string;
  entry_fee: number;
  prize_pool: string;
  max_teams: number;
  registered_teams_count: number;
}

interface RankingItem {
  id: string;
  player_name: string;
  category: string;
  rank: number;
  points: number;
  tournaments_played: number;
  matches_won: number;
  matches_lost: number;
  win_rate: number;
}

export const AdminTournamentsTab: React.FC = () => {
  const [subTab, setSubTab] = useState<'tournaments' | 'rankings'>('tournaments');
  const [tournaments, setTournaments] = useState<TournamentItem[]>([]);
  const [rankings, setRankings] = useState<RankingItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTournModalOpen, setIsTournModalOpen] = useState(false);
  const [isRankModalOpen, setIsRankModalOpen] = useState(false);
  const [editingTourn, setEditingTourn] = useState<TournamentItem | null>(null);
  const [editingRank, setEditingRank] = useState<RankingItem | null>(null);

  const [tournForm, setTournForm] = useState({
    title: '',
    cover_image: '/images/real_padel_hero.jpg',
    tournament_format: 'KING_OF_COURT',
    venue_name: 'باشگاه تنیس و پدل انقلاب',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    entry_fee: 1500000,
    prize_pool: '۵۰,۰۰۰,۰۰۰ تومان',
    max_teams: 16,
    status: 'REGISTRATION_OPEN'
  });

  const [rankForm, setRankForm] = useState({
    player_name: '',
    category: 'MEN_PRO',
    rank: 1,
    points: 1000,
    tournaments_played: 1,
    matches_won: 5,
    matches_lost: 1,
    win_rate: 83.3
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (subTab === 'tournaments') {
        const res = await rallyApi.getAdminTournaments();
        setTournaments(Array.isArray(res) ? res : []);
      } else {
        const res = await rallyApi.getAdminRankings();
        setRankings(Array.isArray(res) ? res : []);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [subTab]);

  const handleSaveTourn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTourn) {
      await rallyApi.updateAdminTournament(editingTourn.id, tournForm);
    } else {
      await rallyApi.createAdminTournament(tournForm);
    }
    setIsTournModalOpen(false);
    setEditingTourn(null);
    fetchData();
  };

  const handleDeleteTourn = async (id: string, title: string) => {
    if (!window.confirm(`حذف تورنمنت "${title}"؟`)) return;
    await rallyApi.deleteAdminTournament(id);
    fetchData();
  };

  const handleSaveRank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRank) {
      await rallyApi.updateAdminRanking(editingRank.id, rankForm);
    } else {
      await rallyApi.createAdminRanking(rankForm);
    }
    setIsRankModalOpen(false);
    setEditingRank(null);
    fetchData();
  };

  const handleDeleteRank = async (id: string, name: string) => {
    if (!window.confirm(`حذف رنکینگ "${name}"؟`)) return;
    await rallyApi.deleteAdminRanking(id);
    fetchData();
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h2 className="text-base font-black text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span>مدیریت مسابقات، لیگ‌ها و رنکینگ کشوری</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            تنظیم رویدادهای کینگ آف کورت، آدینه، لیگ مل اند موج و جدول امتیازات بازیکنان
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (subTab === 'tournaments') {
                setEditingTourn(null);
                setIsTournModalOpen(true);
              } else {
                setEditingRank(null);
                setIsRankModalOpen(true);
              }
            }}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{subTab === 'tournaments' ? 'افزودن تورنمنت جدید' : 'افزودن بازیکن به رنکینگ'}</span>
          </button>
          <button onClick={fetchData} className="p-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white">
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setSubTab('tournaments')}
          className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer ${
            subTab === 'tournaments' ? 'bg-slate-800 text-white border border-slate-700' : 'text-slate-400'
          }`}
        >
          تورنمنت‌ها و رویدادها ({tournaments.length})
        </button>
        <button
          onClick={() => setSubTab('rankings')}
          className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer ${
            subTab === 'rankings' ? 'bg-slate-800 text-white border border-slate-700' : 'text-slate-400'
          }`}
        >
          جدول رنکینگ و امتیازات ({rankings.length})
        </button>
      </div>

      {/* Tournaments Grid */}
      {subTab === 'tournaments' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tournaments.map((t) => (
            <div key={t.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between">
              <div className="aspect-video bg-slate-950 relative overflow-hidden">
                <img src={t.cover_image} alt={t.title} className="w-full h-full object-cover" />
                <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500 text-slate-950">
                  {t.tournament_format}
                </span>
              </div>
              <div className="p-4 space-y-2">
                <h3 className="font-bold text-sm text-white line-clamp-1">{t.title}</h3>
                <div className="text-xs text-slate-400 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-500" /> {t.venue_name}</div>
                <div className="text-xs text-slate-400 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-slate-500" /> {t.start_date} تا {t.end_date}</div>
                <div className="text-xs text-amber-400 font-bold flex items-center gap-1.5"><Trophy className="w-3.5 h-3.5" /> جایزه: {t.prize_pool}</div>
              </div>
              <div className="p-4 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-mono">تیم‌ها: {t.registered_teams_count} / {t.max_teams}</span>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => { setEditingTourn(t); setTournForm({ ...t }); setIsTournModalOpen(true); }} className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300">
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDeleteTourn(t.id, t.title)} className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Rankings Table */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full table-fixed text-right">
            <colgroup>
              <col className="w-16" />
              <col className="w-44" />
              <col className="w-32" />
              <col className="w-28" />
              <col className="w-28" />
              <col className="w-24" />
              <col className="w-20" />
            </colgroup>
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-bold text-slate-400">
                <th className="p-3">رتبه</th>
                <th className="p-3">نام بازیکن</th>
                <th className="p-3">دسته</th>
                <th className="p-3">امتیاز رالی</th>
                <th className="p-3">برد / باخت</th>
                <th className="p-3">درصد پیروزی</th>
                <th className="p-3 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {rankings.map((r) => (
                <tr key={r.id} className="hover:bg-slate-800/40">
                  <td className="p-3 font-black text-amber-400 text-sm">#{r.rank}</td>
                  <td className="p-3 font-bold text-white truncate">{r.player_name}</td>
                  <td className="p-3 text-slate-400 font-mono text-[11px]">{r.category}</td>
                  <td className="p-3 font-black text-rally-primary">{r.points.toLocaleString('fa-IR')}</td>
                  <td className="p-3 text-slate-300 font-mono">{r.matches_won}W - {r.matches_lost}L</td>
                  <td className="p-3 text-slate-300 font-mono">%{r.win_rate}</td>
                  <td className="p-3 text-center">
                    <button onClick={() => handleDeleteRank(r.id, r.player_name)} className="p-1 rounded-lg text-rose-400 hover:bg-rose-500/10">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tournament Modal */}
      {isTournModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 relative max-h-[90vh] overflow-y-auto space-y-4">
            <button onClick={() => setIsTournModalOpen(false)} className="absolute top-4 left-4 p-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl"><X className="w-4 h-4" /></button>
            <h3 className="text-base font-bold text-white">{editingTourn ? 'ویرایش تورنمنت' : 'تعریف تورنمنت جدید'}</h3>
            <form onSubmit={handleSaveTourn} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">عنوان تورنمنت</label>
                <input type="text" value={tournForm.title} onChange={(e) => setTournForm({ ...tournForm, title: e.target.value })} required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">نام باشگاه / محل</label>
                  <input type="text" value={tournForm.venue_name} onChange={(e) => setTournForm({ ...tournForm, venue_name: e.target.value })} required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white" />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">جایزه نقدی / غیرنقدی</label>
                  <input type="text" value={tournForm.prize_pool} onChange={(e) => setTournForm({ ...tournForm, prize_pool: e.target.value })} required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">تاریخ شروع</label>
                  <input type="date" value={tournForm.start_date} onChange={(e) => setTournForm({ ...tournForm, start_date: e.target.value })} required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono" />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">تاریخ پایان</label>
                  <input type="date" value={tournForm.end_date} onChange={(e) => setTournForm({ ...tournForm, end_date: e.target.value })} required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono" />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-300 mb-1">تصویر کاور</label>
                <input type="text" value={tournForm.cover_image} onChange={(e) => setTournForm({ ...tournForm, cover_image: e.target.value })} required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsTournModalOpen(false)} className="px-4 py-2 bg-slate-800 rounded-xl text-slate-300 font-bold">انصراف</button>
                <button type="submit" className="px-5 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl">ذخیره تورنمنت</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ranking Modal */}
      {isRankModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 relative space-y-4">
            <button onClick={() => setIsRankModalOpen(false)} className="absolute top-4 left-4 p-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl"><X className="w-4 h-4" /></button>
            <h3 className="text-base font-bold text-white">ثبت بازیکن در رنکینگ</h3>
            <form onSubmit={handleSaveRank} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">نام و نام خانوادگی بازیکن</label>
                <input type="text" value={rankForm.player_name} onChange={(e) => setRankForm({ ...rankForm, player_name: e.target.value })} required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">رتبه (Rank)</label>
                  <input type="number" value={rankForm.rank} onChange={(e) => setRankForm({ ...rankForm, rank: Number(e.target.value) })} required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono" />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">امتیاز (Points)</label>
                  <input type="number" value={rankForm.points} onChange={(e) => setRankForm({ ...rankForm, points: Number(e.target.value) })} required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsRankModalOpen(false)} className="px-4 py-2 bg-slate-800 rounded-xl text-slate-300 font-bold">انصراف</button>
                <button type="submit" className="px-5 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl">ذخیره</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
