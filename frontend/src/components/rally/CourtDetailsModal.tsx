import React, { useState } from 'react';
import {
  X,
  MapPin,
  Clock,
  ShieldCheck,
  Info,
  Car,
  Bath,
  Coffee,
  Sun,
  ShoppingBag,
  CheckCircle2,
  Phone,
  CloudSun
} from 'lucide-react';
import { CourtClub, TimeSlotItem } from '../../types/rally';

interface CourtDetailsModalProps {
  club: CourtClub;
  onClose: () => void;
  onProceedBooking: (club: CourtClub, slot: TimeSlotItem) => void;
  initialSelectedSlot?: TimeSlotItem | null;
}

export const CourtDetailsModal: React.FC<CourtDetailsModalProps> = ({
  club,
  onClose,
  onProceedBooking,
  initialSelectedSlot
}) => {
  const [selectedSlot, setSelectedSlot] = useState<TimeSlotItem | null>(
    initialSelectedSlot || club.slots.find((s) => s.status === 'AVAILABLE') || null
  );

  const getAmenityIcon = (name: string) => {
    switch (name) {
      case 'Car': return <Car className="w-4 h-4 text-rally-primary" />;
      case 'Bath': return <Bath className="w-4 h-4 text-rally-primary" />;
      case 'Coffee': return <Coffee className="w-4 h-4 text-rally-primary" />;
      case 'Sun': return <Sun className="w-4 h-4 text-rally-primary" />;
      case 'ShoppingBag': return <ShoppingBag className="w-4 h-4 text-rally-primary" />;
      default: return <ShieldCheck className="w-4 h-4 text-rally-primary" />;
    }
  };

  const isIndoor = club.courtType === 'INDOOR';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-rally-charcoal/80 overflow-y-auto" dir="rtl">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto border border-gray-100">
        
        {/* Modal Top Header with Close Button */}
        <div className="relative aspect-[16/7] w-full bg-gray-100 shrink-0">
          <img
            src={club.images[0] || '/images/real_padel_hero.jpg'}
            alt={club.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          
          <button
            onClick={onClose}
            className="absolute top-4 left-4 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors cursor-pointer"
            aria-label="بستن"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 right-4 left-4 text-white">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#D7ED68] text-rally-charcoal">
                🎾 کورت اختصاصی پدل
              </span>
              <span className="text-xs text-gray-200">
                {isIndoor ? '🏢 سالن مسقف سازه‌ای' : '🌤️ کورت روباز / سوپر پانورامیک'}
              </span>
            </div>
            <h2 className="text-lg sm:text-2xl font-black text-white">{club.name}</h2>
            <div className="flex items-center gap-1.5 text-xs text-gray-200 mt-1">
              <MapPin className="w-3.5 h-3.5 text-[#D7ED68]" />
              <span>{club.address}</span>
            </div>
          </div>
        </div>

        {/* Scrollable Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-rally-charcoal">
          
          {/* Section: Amenities & Club Contact */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h4 className="text-xs font-bold text-gray-500">امکانات رفاهی و خدمات مجموعه</h4>
              <div className="flex items-center gap-1 text-xs text-rally-primary font-bold">
                <Phone className="w-3.5 h-3.5" />
                <span>پذیرش رسمی: ۰۲۱-۲۲۰۵۰۰۰۰</span>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {club.amenities.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-gray-100 bg-gray-50 text-xs font-bold text-gray-700"
                >
                  {getAmenityIcon(item.iconName)}
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Interactive Slot Timetable */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-sm font-extrabold text-rally-charcoal">
                  انتخاب سانس بازی (مدت استاندارد: ۹۰ دقیقه)
                </h4>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  کورت سنترال رسمی با کفپوش WPT و قفل موقت اتمیک ۱۰ دقیقه‌ای
                </p>
              </div>
            </div>

            {/* Table with fixed layout for performance */}
            <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
              <table className="w-full table-fixed text-xs text-right">
                <colgroup>
                  <col className="w-2/5" />
                  <col className="w-2/5" />
                  <col className="w-1/5" />
                </colgroup>
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold">
                  <tr>
                    <th className="py-2.5 px-3">ساعت سانس</th>
                    <th className="py-2.5 px-3">تعرفه ۹۰ دقیقه</th>
                    <th className="py-2.5 px-3 text-center">وضعیت</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {club.slots.map((slot) => {
                    const isSelected = selectedSlot?.slotId === slot.slotId;
                    const isAvailable = slot.status === 'AVAILABLE';
                    const isHold = slot.status === 'HOLD';
                    const isBlocked = slot.status === 'MAINTENANCE' || slot.status === 'BLOCKED' || slot.status === 'TOURNAMENT' || slot.status === 'TOURNAMENT_HOLD';

                    return (
                      <tr
                        key={slot.slotId}
                        onClick={() => isAvailable && setSelectedSlot(slot)}
                        className={`transition-colors ${
                          isAvailable
                            ? 'cursor-pointer hover:bg-gray-50'
                            : 'opacity-60 bg-gray-50/70 cursor-not-allowed'
                        } ${isSelected ? 'bg-rally-primary/5 font-bold' : ''}`}
                      >
                        <td className="py-3 px-3 flex items-center gap-1.5 font-bold">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          <span>{slot.startTime} تا {slot.endTime}</span>
                        </td>
                        <td className="py-3 px-3 font-extrabold text-rally-charcoal">
                          {slot.price.toLocaleString('fa-IR')} <span className="text-[10px] text-gray-500 font-normal">تومان</span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          {isAvailable ? (
                            <button
                              type="button"
                              className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-rally-primary text-white shadow-xs'
                                  : 'border border-rally-primary text-rally-primary bg-white hover:bg-rally-primary/10'
                              }`}
                            >
                              {isSelected ? 'انتخاب شده' : 'انتخاب'}
                            </button>
                          ) : isHold ? (
                            <span className="text-[10px] bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded font-bold">
                              در حال رزرو
                            </span>
                          ) : isBlocked ? (
                            <span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded font-medium">
                              مسدود باشگاه
                            </span>
                          ) : (
                            <span className="text-[11px] text-gray-400 font-medium">
                              رزرو شده
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section: Cancellation Policy & Weather Conditions */}
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-3">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-rally-primary shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-extrabold text-rally-charcoal">شرایط استرداد وجه و لغو سانس:</p>
                <p className="text-gray-600 leading-relaxed">{club.cancellationPolicy}</p>
              </div>
            </div>

            {!isIndoor && (
              <div className="pt-2 border-t border-gray-200/60 flex items-start gap-2 text-xs text-amber-800">
                <CloudSun className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>شرایط کورت روباز:</strong> در صورت وقوع بارندگی شدید یا شرایط نامساعد جوی که مانع از بازی شود، سانس با توافق طرفین جابجا شده یا کل وجه به کیف پول شما مسترد خواهد شد.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sticky Bottom Action Bar with Complete Selection Summary */}
        <div className="p-4 sm:p-5 bg-white border-t border-gray-200 shrink-0 flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] text-gray-400 block font-medium">
              {selectedSlot
                ? `سانس انتخابی: ${selectedSlot.startTime} تا ${selectedSlot.endTime} (${selectedSlot.durationMinutes || 90} دقیقه)`
                : 'لطفاً یک سانس آزاد را انتخاب کنید'}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-black text-rally-primary">
                {selectedSlot ? selectedSlot.price.toLocaleString('fa-IR') : '۰'}
              </span>
              <span className="text-xs text-gray-500 font-medium">تومان</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              انصراف
            </button>
            <button
              disabled={!selectedSlot}
              onClick={() => selectedSlot && onProceedBooking(club, selectedSlot)}
              className="px-6 py-2.5 rounded-xl bg-rally-primary hover:bg-rally-primary-light disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md transition-all cursor-pointer min-h-[44px]"
            >
              <CheckCircle2 className="w-4 h-4 text-[#D7ED68]" />
              <span>ادامه رزرو و پرداخت</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
