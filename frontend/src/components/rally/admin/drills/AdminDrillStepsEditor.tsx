import React from 'react';
import { DrillStepItem } from '../../../../types/drills';
import { Plus, Trash2 } from 'lucide-react';

interface AdminDrillStepsEditorProps {
  steps: DrillStepItem[];
  onChange: (steps: DrillStepItem[]) => void;
}

export const AdminDrillStepsEditor: React.FC<AdminDrillStepsEditorProps> = ({ steps, onChange }) => {
  const handleAddStep = () => {
    onChange([
      ...steps,
      { step_number: steps.length + 1, title: '', description: '' }
    ]);
  };

  const handleRemoveStep = (idx: number) => {
    onChange(steps.filter((_, i) => i !== idx).map((s, i) => ({ ...s, step_number: i + 1 })));
  };

  const handleUpdateStep = (idx: number, field: keyof DrillStepItem, val: any) => {
    onChange(steps.map((s, i) => (i === idx ? { ...s, [field]: val } : s)));
  };

  return (
    <div className="space-y-2 pt-2" dir="rtl">
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-slate-300">مراحل اجرای تمرین</h4>
        <button
          type="button"
          onClick={handleAddStep}
          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg flex items-center gap-1 font-bold cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>افزودن مرحله</span>
        </button>
      </div>

      {steps.map((st, idx) => (
        <div key={idx} className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="font-bold text-rally-primary text-[11px]">مرحله {idx + 1}</span>
            {steps.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveStep(idx)}
                className="text-rose-400 hover:text-rose-300 p-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <input
            type="text"
            value={st.title}
            onChange={(e) => handleUpdateStep(idx, 'title', e.target.value)}
            placeholder="عنوان این مرحله"
            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
          />
          <textarea
            rows={2}
            value={st.description}
            onChange={(e) => handleUpdateStep(idx, 'description', e.target.value)}
            placeholder="شرح جزئیات اجرای این مرحله..."
            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
          />
        </div>
      ))}
    </div>
  );
};
