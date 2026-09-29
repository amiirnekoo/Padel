import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  CreditCard,
  Wallet,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Printer,
  Share2,
  HelpCircle,
  RefreshCw
} from 'lucide-react';
import { CourtClub, TimeSlotItem, BookingReceipt } from '../../types/rally';
import { rallyApi } from '../../services/rallyApi';

interface BookingFlowModalProps {
  club: CourtClub;
  slot: TimeSlotItem;
  onClose: () => void;
  walletBalance: number;
  onPaymentCompleted: (receipt: BookingReceipt) => void;
  simulateState?: 'NORMAL' | 'SLOT_LOST' | 'PAYMENT_PENDING';
}

export const BookingFlowModal: React.FC<BookingFlowModalProps> = ({
  club,
  slot,
  onClose,
  walletBalance,
  onPaymentCompleted,
  simulateState = 'NORMAL'
}) => {
  const [step, setStep] = useState<'REVIEW' | 'PAYING' | 'SUCCESS' | 'ERROR'>('REVIEW');
  const [paymentMethod, setPaymentMethod] = useState<'GATEWAY' | 'WALLET'>('GATEWAY');
  const [receipt, setReceipt] = useState<BookingReceipt | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fullName, setFullName] = useState('امیر نکوزاده');
  const [phoneNumber, setPhoneNumber] = useState('۰۹۱۲۳۴۵۶۷۸۹');

  const finalAmount = slot.price; // No hidden fees!

  const handleStartPayment = async () => {
    // Check if slot lost simulation is triggered
    if (simulateState === 'SLOT_LOST') {
      setErrorMessage('متأسفانه این سانس در حین فرآیند توسط کاربر دیگری رزرو شد. لطفاً سانس دیگری انتخاب کنید.');
      setStep('ERROR');
      return;
    }

    setStep('PAYING');
    if (slot.slotId) {
      await rallyApi.holdSlot(slot.slotId, 'usr-1');
    }
    setTimeout(() => {
      if (simulateState === 'PAYMENT_PENDING') {
        setErrorMessage('وضعیت تراکنش از سوی درگاه پرداخت نامشخص است. مبلغی از شما کسر نشده و نیازی به پرداخت مجدد نیست؛ می‌توانید از طریق پشتیبانی پیگیری کنید.');
        setStep('ERROR');
      } else {
        const generatedReceipt: BookingReceipt = {
          bookingId: `RLY-${Date.now().toString().slice(-6)}`,
          trackingCode: `TRK-${Math.floor(100000 + Math.random() * 900000)}`,
          clubName: club.name,
          courtName: 'کورت شماره ۱ سنترال',
          sport: club.sport,
          date: 'فردا - پنجشنبه',
          timeSlot: `${slot.startTime} تا ${slot.endTime}`,
          durationMinutes: slot.durationMinutes,
          totalAmount: finalAmount,
          taxAmount: 0,
          paidAt: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
          userName: fullName,
          userPhone: phoneNumber,
          cancellationTerms: club.cancellationPolicy
        };
        setReceipt(generatedReceipt);
        setStep('SUCCESS');
        onPaymentCompleted(generatedReceipt);
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-rally-charcoal/70 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden my-auto border border-gray-100 flex flex-col text-rally-charcoal">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rally-accent ring-2 ring-rally-primary" />
            <h3 className="text-base font-extrabold text-rally-charcoal">
              {step === 'REVIEW' && 'بازبینی و تأیید نهایی رزرو'}
              {step === 'PAYING' && 'در حال اتصال به درگاه پرداخت شاپرک'}
              {step === 'SUCCESS' && 'رسید نهایی رزرو قطعی'}
              {step === 'ERROR' && 'وضعیت سفارش و پیگیری'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-5">
          {step === 'REVIEW' && (
            <>
              {/* Booking Summary Box */}
              <div className="bg-rally-light-bg rounded-2xl p-4 border border-gray-200 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-extrabold text-rally-primary">{club.name}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">{club.area}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white text-rally-charcoal border border-gray-200">
                    {club.sport === 'PADEL' ? '🎾 پدل' : '🏸 تنیس'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200/60 text-xs">
                  <div>
                    <span className="text-gray-400 block text-[10px]">تاریخ و روز:</span>
                    <span className="font-bold text-gray-800">فردا (پنجشنبه)</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">ساعت و مدت:</span>
                    <span className="font-bold text-gray-800">{slot.startTime} تا {slot.endTime} (۹۰ دقیقه)</span>
                  </div>
                </div>
              </div>

              {/* Player details */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1">نام رزروکننده</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-gray-200 text-xs font-bold text-rally-charcoal"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1">شماره همراه (دریافت پیامک)</label>
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-gray-200 text-xs font-bold text-rally-charcoal"
                  />
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1.5">روش پرداخت</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('GATEWAY')}
                    className={`p-3 rounded-xl border text-right transition-all flex items-center justify-between ${
                      paymentMethod === 'GATEWAY'
                        ? 'border-rally-primary bg-rally-primary/5 text-rally-primary'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      <span className="text-xs font-bold">درگاه شتاب / شاپرک</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('WALLET')}
                    className={`p-3 rounded-xl border text-right transition-all flex items-center justify-between ${
                      paymentMethod === 'WALLET'
                        ? 'border-rally-primary bg-rally-primary/5 text-rally-primary'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Wallet className="w-4 h-4" />
                      <div>
                        <span className="text-xs font-bold block">کیف پول رالی</span>
                        <span className="text-[10px] text-gray-400">موجودی: {(walletBalance / 10).toLocaleString('fa-IR')} ت</span>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Transparent Price & Cancellation Terms */}
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="text-gray-500 font-medium">مبلغ نهایی قابل پرداخت (بدون کارمزد مخفی):</span>
                <div className="flex items-baseline gap-1 font-black text-rally-charcoal text-base">
                  <span>{(finalAmount / 10).toLocaleString('fa-IR')}</span>
                  <span className="text-xs font-medium text-gray-500">تومان</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 space-y-1">
                <p className="font-bold">قوانین لغو سانس:</p>
                <p className="text-amber-700 leading-relaxed">{club.cancellationPolicy}</p>
              </div>

              <button
                onClick={handleStartPayment}
                className="w-full py-3 rounded-xl bg-rally-primary hover:bg-rally-primary-light text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer min-h-[44px]"
              >
                <ShieldCheck className="w-4 h-4 text-rally-accent" />
                <span>پرداخت و ثبت نهایی رزرو</span>
              </button>
            </>
          )}

          {step === 'PAYING' && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <RefreshCw className="w-8 h-8 text-rally-primary animate-spin" />
              <p className="text-sm font-extrabold text-rally-charcoal">در حال ثبت اتمیک رزرو و پردازش پرداخت...</p>
              <p className="text-xs text-gray-400">لطفاً صفحه را نبندید.</p>
            </div>
          )}

          {step === 'SUCCESS' && receipt && (
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="text-base font-black text-rally-charcoal">رزرو با موفقیت قطعی شد</h4>
                <p className="text-xs text-gray-500">پیامک تأیید و شناسه ورود به کورت برای شما ارسال گردید.</p>
              </div>

              <div className="border border-dashed border-gray-300 rounded-2xl p-4 bg-gray-50 space-y-3 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                  <span className="text-gray-400">شناسه پیگیری (Tracking ID):</span>
                  <span className="font-black text-rally-primary font-mono">{receipt.trackingCode}</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-gray-400 block text-[10px]">کلوپ:</span>
                    <span className="font-bold text-gray-800">{receipt.clubName}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">ساعت سانس:</span>
                    <span className="font-bold text-gray-800">{receipt.timeSlot}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                  <span className="text-gray-500">مبلغ پرداخت‌شده:</span>
                  <span className="font-extrabold text-gray-900">{(receipt.totalAmount / 10).toLocaleString('fa-IR')} تومان</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl bg-rally-primary text-white text-xs font-bold"
                >
                  بازگشت به سایت
                </button>
              </div>
            </div>
          )}

          {step === 'ERROR' && (
            <div className="space-y-4 text-center">
              <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
              <h4 className="text-base font-bold text-gray-900">نیاز به بررسی وضعیت</h4>
              <p className="text-xs text-gray-600 leading-relaxed max-w-md mx-auto">{errorMessage}</p>

              <div className="pt-3 flex gap-2">
                <button
                  onClick={() => setStep('REVIEW')}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50"
                >
                  تلاش مجدد / تغییر سانس
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl bg-rally-primary text-white text-xs font-bold"
                >
                  پیگیری با پشتیبانی رالی
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
