import React from 'react';
import {
  Shield,
  Layers,
  Sparkles,
  Sun,
  Car,
  Bath,
  Coffee,
  ShoppingBag,
  Info,
  ShieldCheck,
  CheckCircle2,
  Maximize2
} from 'lucide-react';
import { CourtClub } from '../../../types/rally';
import { ClubRichProfile } from '../../../data/clubsRichData';

interface ClubSpecsAndAmenitiesProps {
  club: CourtClub;
  richProfile: ClubRichProfile | null;
}

export const ClubSpecsAndAmenities: React.FC<ClubSpecsAndAmenitiesProps> = ({
  club,
  richProfile
}) => {
  const specs = richProfile?.specs;

  const getAmenityIcon = (iconName: string) => {
    switch (iconName) {
      case 'Car': return <Car className="w-5 h-5 text-sky-600" />;
      case 'Bath': return <Bath className="w-5 h-5 text-sky-600" />;
      case 'Coffee': return <Coffee className="w-5 h-5 text-sky-600" />;
      case 'Sun': return <Sun className="w-5 h-5 text-sky-600" />;
      case 'ShoppingBag': return <ShoppingBag className="w-5 h-5 text-sky-600" />;
      default: return <ShieldCheck className="w-5 h-5 text-sky-600" />;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Technical Specifications Grid */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
          <Sparkles className="w-5 h-5 text-sky-600" />
          <h2 className="text-lg sm:text-xl font-black text-slate-900">
            مشخصات فنی و استانداردهای کورت
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Structure */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2">
            <div className="flex items-center gap-2 text-sky-700">
              <Shield className="w-4 h-4" />
              <span className="text-xs font-black">نوع سازه و سقف</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {specs?.structureType || (club.courtType === 'INDOOR' ? 'مسقف سازه‌ای استاندارد با تهویه آزاد' : 'کورت روباز سوپر پانورامیک')}
            </p>
          </div>

          {/* Glass */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2">
            <div className="flex items-center gap-2 text-sky-700">
              <Maximize2 className="w-4 h-4" />
              <span className="text-xs font-black">دیواره‌های شیشه‌ای</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {specs?.glassType || 'شیشه سکوریت ۱۲ میل سوپر پانورامیک با شفافیت ۱۰۰٪'}
            </p>
          </div>

          {/* Turf */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2">
            <div className="flex items-center gap-2 text-sky-700">
              <Layers className="w-4 h-4" />
              <span className="text-xs font-black">چمن مصنوعی و کفپوش</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {specs?.turfType || club.surface}
            </p>
          </div>

          {/* Lighting */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2">
            <div className="flex items-center gap-2 text-sky-700">
              <Sun className="w-4 h-4" />
              <span className="text-xs font-black">سیستم روشنایی و نور</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {specs?.lightingType || 'پروژکتورهای قوسی مسابقاتی بدون سایه LED'}
            </p>
          </div>
        </div>
      </div>

      {/* Amenities & Club Rules Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Amenities Column (lg: 7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>امکانات رفاهی و خدمات باشگاه</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {club.amenities.map((amenity) => (
              <div
                key={amenity.id}
                className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs font-bold text-slate-800"
              >
                <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-xs border border-slate-200/60 shrink-0">
                  {getAmenityIcon(amenity.iconName)}
                </div>
                <span>{amenity.label}</span>
              </div>
            ))}
          </div>

          {richProfile?.parkingInfo && (
            <div className="mt-3 p-3.5 rounded-2xl bg-sky-50/80 border border-sky-100 text-xs text-sky-900 leading-relaxed">
              <strong>وضعیت پارکینگ: </strong>
              <span>{richProfile.parkingInfo}</span>
            </div>
          )}
        </div>

        {/* Rules & Cancellation Policy Column (lg: 5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <Info className="w-5 h-5 text-amber-500" />
              <span>قوانین بازی و استرداد وجه</span>
            </h3>

            <div className="space-y-2">
              {club.rules.map((rule, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                  <span>{rule}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Cancellation Box */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-950 space-y-1 mt-4">
            <span className="font-bold block text-amber-900">سیاست لغو و کنسلی رالی:</span>
            <p className="leading-relaxed">{club.cancellationPolicy}</p>
          </div>
        </div>

      </div>
    </div>
  );
};
