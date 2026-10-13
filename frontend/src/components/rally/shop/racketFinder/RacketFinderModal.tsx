import React, { useState, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft, Sparkles, Loader2 } from 'lucide-react';
import { RacketQuizStepView } from './RacketQuizStepView';
import { RacketQuizResultView } from './RacketQuizResultView';
import { rallyApi } from '../../../../services/rallyApi';

interface RacketFinderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (productId: string) => void;
  onAddToCart: (product: any) => void;
}

export const RacketFinderModal: React.FC<RacketFinderModalProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
  onAddToCart,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedValues, setSelectedValues] = useState({
    player_level: 'INTERMEDIATE',
    playstyle: 'ALL_ROUND_BALANCED',
    physical_priority: 'BALANCED',
    budget_tier: 'ANY',
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // بستن با Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelectOption = (field: string, value: string) => {
    setSelectedValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleNextStep = async () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
      return;
    }

    // ارسال به API برای دریافت پیشنهاد
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await rallyApi.recommendRackets(selectedValues);
      if (res.success && res.data) {
        setResult(res.data);
      } else {
        setErrorMessage(res.error || 'خطا در تحلیل بیومکانیک و دریافت پیشنهاد راکت');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'خطا در اتصال به سرور');
    } finally {
      setLoading(false);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleRetake = () => {
    setResult(null);
    setCurrentStep(1);
  };

  const handleProductSelectAndClose = (productId: string) => {
    onSelectProduct(productId);
    onClose();
  };

  const progressPercent = ((currentStep - 1) / 3) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-slate-950/85">
      <div 
        className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto animate-in fade-in zoom-in-95 duration-200"
        dir="rtl"
      >
        {/* هدر مودال */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rally-primary/10 border border-rally-primary/20 flex items-center justify-center text-rally-primary">
              <Sparkles className="w-5 h-5 text-rally-primary" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                راکت‌سنج هوشمند رالی
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rally-primary/10 text-rally-primary border border-rally-primary/20">
                  بیومکانیک Testea
                </span>
              </h2>
              <p className="text-xs text-slate-400">کشف دقیق‌ترین راکت سازگار با دست، فیزیک و سبک بازی شما</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="بستن"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* نوار پیشرفت مراحل (تنها در حالت کوئیز فعال) */}
        {!result && (
          <div className="w-full bg-slate-950 h-1.5 shrink-0 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-rally-primary to-lime-400 transition-all duration-300"
              style={{ width: `${Math.max(10, progressPercent)}%` }}
            />
          </div>
        )}

        {/* محتوای بدنه مودال */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="py-16 text-center space-y-4">
              <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-rally-primary animate-spin" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-black text-white">در حال تحلیل بیومکانیک و هندسه فریم...</h4>
                <p className="text-xs text-slate-400">
                  تطابق شاخص‌های شاسی، جذب شوک و کاتالوگ با پایگاه داده PadelVerdict
                </p>
              </div>
            </div>
          ) : errorMessage ? (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center space-y-3">
              <p className="text-sm text-rose-300">{errorMessage}</p>
              <button
                type="button"
                onClick={handleNextStep}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold"
              >
                تلاش مجدد
              </button>
            </div>
          ) : result ? (
            <RacketQuizResultView
              result={result}
              onRetake={handleRetake}
              onSelectProduct={handleProductSelectAndClose}
              onAddToCart={(product) => {
                onAddToCart(product);
                onClose();
              }}
            />
          ) : (
            <RacketQuizStepView
              currentStep={currentStep}
              selectedValues={selectedValues}
              onSelectOption={handleSelectOption}
            />
          )}
        </div>

        {/* فوتر مودال (تنها در حالت کوئیز) */}
        {!result && !loading && (
          <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between shrink-0">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowRight className="w-4 h-4" />
                گام قبل
              </button>
            ) : (
              <span />
            )}

            <button
              type="button"
              onClick={handleNextStep}
              className="px-6 py-2.5 rounded-xl bg-rally-primary hover:bg-lime-400 text-black text-xs font-black flex items-center gap-2 transition-all shadow-md cursor-pointer"
            >
              <span>{currentStep === 4 ? 'مشاهده پیشنهاد هوشمند' : 'گام بعدی'}</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
