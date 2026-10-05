import React, { useState } from 'react';
import { DrillDetail, DrillSport, DrillCategory, DrillLevel, DrillParticipation, DrillOriginSource, DrillStepItem } from '../../../../types/drills';
import { drillsApi } from '../../../../services/drillsApi';
import { AdminDrillStepsEditor } from './AdminDrillStepsEditor';
import { AdminDrillRightsSection } from './AdminDrillRightsSection';
import { X, Save, AlertTriangle } from 'lucide-react';

interface AdminDrillEditModalProps {
  drill: DrillDetail | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: (savedDrill: DrillDetail) => void;
  adminToken?: string;
}

export const AdminDrillEditModal: React.FC<AdminDrillEditModalProps> = ({
  drill,
  isOpen,
  onClose,
  onSaved,
  adminToken
}) => {
  const [title, setTitle] = useState(drill?.title || '');
  const [summary, setSummary] = useState(drill?.summary || '');
  const [objective, setObjective] = useState(drill?.objective || '');
  const [sport, setSport] = useState<DrillSport>(drill?.sport || 'padel');
  const [category, setCategory] = useState<DrillCategory>(drill?.category || 'technique');
  const [level, setLevel] = useState<DrillLevel>(drill?.level || 'beginner');
  const [durationMinutes, setDurationMinutes] = useState(drill?.duration_minutes || 20);
  const [participation, setParticipation] = useState<DrillParticipation>(drill?.participation_type || 'solo');
  const [minPlayers, setMinPlayers] = useState(drill?.min_players || 1);
  const [maxPlayers, setMaxPlayers] = useState(drill?.max_players || 4);
  const [originSource, setOriginSource] = useState<DrillOriginSource>(drill?.origin_source || 'original');
  const [rightsHolder, setRightsHolder] = useState(drill?.rights_holder || '');
  const [usageRightsConfirmed, setUsageRightsConfirmed] = useState(drill?.usage_rights_confirmed || false);
  const [courtSetup, setCourtSetup] = useState(drill?.court_setup_notes || '');

  const [steps, setSteps] = useState<DrillStepItem[]>(
    drill?.steps && drill.steps.length > 0
      ? drill.steps
      : [{ step_number: 1, title: 'آماده‌سازی', description: 'استقرار در موقعیت اولیه' }]
  );

  const [isSaving, setIsSaving] = useState(false);
  const [conflictError, setConflictError] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !summary.trim()) {
      setErrorMessage('عنوان و خلاصه تمرین الزامی است.');
      return;
    }

    setIsSaving(true);
    setConflictError(null);
    setErrorMessage(null);

    const payload = {
      title: title.trim(),
      summary: summary.trim(),
      objective: objective.trim(),
      sport,
      category,
      level,
      duration_minutes: Number(durationMinutes),
      participation_type: participation,
      min_players: Number(minPlayers),
      max_players: Number(maxPlayers),
      origin_source: originSource,
      rights_holder: rightsHolder.trim() || null,
      usage_rights_confirmed: usageRightsConfirmed,
      court_setup_notes: courtSetup.trim() || null,
      steps
    };

    try {
      if (drill) {
        const updated = await drillsApi.updateDrill(drill.id, payload, drill.content_version, adminToken);
        onSaved(updated);
        onClose();
      } else {
        const created = await drillsApi.createDraft(payload, adminToken);
        onSaved(created);
        onClose();
      }
    } catch (err: any) {
      if (err.message?.includes('CONFLICT')) {
        setConflictError(err.message);
      } else {
        setErrorMessage(err.message || 'خطا در ذخیره‌سازی تمرین');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-3 sm:p-4 overflow-y-auto" dir="rtl">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base sm:text-lg text-white">
              {drill ? `ویرایش تمرین: ${drill.title}` : 'ایجاد تمرین جدید (پیش‌نویس)'}
            </h3>
            {drill && (
              <span className="text-[11px] text-slate-400">
                نسخه محتوا: {drill.content_version} | وضعیت جاری: {drill.status}
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {drill?.status === 'published' && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong>توجه:</strong> با ویرایش تمرین منتشرشده، تمرین از دسترسی عمومی خارج شده و نیازمند بازبینی مجدد خواهد بود.
              </span>
            </div>
          )}

          {conflictError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>تعارض در نسخه (Version Conflict)</span>
              </p>
              <p>{conflictError}</p>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300">
              {errorMessage}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-bold mb-1">عنوان تمرین *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none"
                placeholder="مثال: تکنیک ضربه باندخا از انتهای کورت"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-bold mb-1">ورزش</label>
              <select
                value={sport}
                onChange={(e) => setSport(e.target.value as DrillSport)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
              >
                <option value="padel">پدل</option>
                <option value="tennis">تنیس</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-bold mb-1">خلاصه کوتاه *</label>
              <textarea
                rows={2}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-bold mb-1">هدف تمرین</label>
              <textarea
                rows={2}
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-slate-300 font-bold mb-1">دسته</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as DrillCategory)}
                className="w-full px-2.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
              >
                <option value="technique">تکنیک</option>
                <option value="tactics">تاکتیک</option>
                <option value="fitness">آمادگی بدنی</option>
                <option value="mental">مهارت‌های ذهنی</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-bold mb-1">سطح</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as DrillLevel)}
                className="w-full px-2.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
              >
                <option value="beginner">مبتدی</option>
                <option value="intermediate">متوسط</option>
                <option value="advanced">پیشرفته</option>
                <option value="pro">حرفه‌ای</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-bold mb-1">مدت اجرا (دقیقه)</label>
              <input
                type="number"
                min={5}
                max={180}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full px-2.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-bold mb-1">نوع مشارکت</label>
              <select
                value={participation}
                onChange={(e) => setParticipation(e.target.value as DrillParticipation)}
                className="w-full px-2.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
              >
                <option value="solo">انفرادی</option>
                <option value="pairs">دو نفره</option>
                <option value="four">چهار نفره</option>
                <option value="group">گروهی</option>
              </select>
            </div>
          </div>

          <AdminDrillRightsSection
            originSource={originSource}
            setOriginSource={setOriginSource}
            rightsHolder={rightsHolder}
            setRightsHolder={setRightsHolder}
            usageRightsConfirmed={usageRightsConfirmed}
            setUsageRightsConfirmed={setUsageRightsConfirmed}
          />

          <AdminDrillStepsEditor steps={steps} onChange={setSteps} />

          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-bold cursor-pointer"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-rally-primary hover:bg-rally-primary-hover text-white font-bold flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'در حال ذخیره...' : 'ذخیره تمرین'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
