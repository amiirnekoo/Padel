import React from 'react';
import { Wind, Sun, ShieldCheck } from 'lucide-react';
import { CourtClub } from '../../../types/rally';

interface OutdoorWeatherWidgetProps {
  club: CourtClub;
}

// Map city/location to mock live weather conditions
const getWeatherForCourt = (club: CourtClub) => {
  const isIndoor = club.amenities?.some(a => a.label.includes('سرپوشیده') || a.id.includes('indoor')) ||
    club.name.includes('سرپوشیده');
  
  if (isIndoor) {
    return {
      isIndoor: true,
      temp: 22,
      condition: 'کنترل دما و تهویه',
      windSpeed: 0,
      windStatus: 'SAFE' as const,
      statusText: 'محیط سرپوشیده کاملاً استاندارد بدون تاثیرپذیری از شرایط جوی',
    };
  }

  // Outdoor calculations
  const city = club.city || club.address || 'تهران';
  let temp = 24;
  let windSpeed = 12; // km/h
  let condition = 'آفتابی و صاف';

  if (city.includes('مازندران') || city.includes('چالوس') || city.includes('بابلسر')) {
    temp = 21;
    windSpeed = 16;
    condition = 'هوای معتدل ساحلی';
  } else if (city.includes('تبریز')) {
    temp = 18;
    windSpeed = 14;
    condition = 'خنک و ملایم';
  } else if (city.includes('مشهد')) {
    temp = 22;
    windSpeed = 10;
    condition = 'صاف و بدون ابر';
  }

  const isWindSafe = windSpeed < 20;

  return {
    isIndoor: false,
    temp,
    condition,
    windSpeed,
    windStatus: isWindSafe ? ('IDEAL' as const) : ('CAUTION' as const),
    statusText: isWindSafe
      ? 'شرایط ایده‌آل برای بازی پدل و تنیس در کورت روباز'
      : 'هشدار وزش باد متوسط: چرخش توپ ممکن است کمی منحرف شود',
  };
};

export const OutdoorWeatherWidget: React.FC<OutdoorWeatherWidgetProps> = React.memo(({ club }) => {
  const weather = getWeatherForCourt(club);

  if (weather.isIndoor) {
    return (
      <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900 text-white text-xs border border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-white block">کورت سرپوشیده (Indoor)</span>
            <span className="text-[11px] text-slate-400">دمای کنترل‌شده ۲۲°C • بدون اثرگذاری باد</span>
          </div>
        </div>
        <span className="bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-lg text-[10px]">
          ۱۰۰٪ ایمن در همه فصول
        </span>
      </div>
    );
  }

  return (
    <div className="p-3 rounded-2xl bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-100 text-slate-800 text-xs flex flex-col sm:flex-row items-center justify-between gap-2.5">
      <div className="flex items-center gap-2.5 w-full sm:w-auto">
        <div className="w-8 h-8 rounded-xl bg-white text-amber-500 shadow-xs flex items-center justify-center border border-amber-100 shrink-0">
          <Sun className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 text-xs">وضعیت جوی کورت روباز:</span>
            <span className="font-bold text-sky-800">{weather.temp}°C ({weather.condition})</span>
          </div>
          <span className="text-[11px] text-slate-500 block">{weather.statusText}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
        <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-xl border border-sky-200 text-slate-700 font-bold">
          <Wind className="w-3.5 h-3.5 text-sky-600" />
          <span>سرعت باد:</span>
          <span className="text-sky-900 font-mono">{weather.windSpeed} km/h</span>
        </div>
        <span className={`text-[10px] font-black px-2 py-1 rounded-xl ${
          weather.windStatus === 'IDEAL'
            ? 'bg-emerald-100 text-emerald-800'
            : 'bg-amber-100 text-amber-800'
        }`}>
          {weather.windStatus === 'IDEAL' ? 'شرایط باد ایده‌آل' : 'باد نسبی'}
        </span>
      </div>
    </div>
  );
});

OutdoorWeatherWidget.displayName = 'OutdoorWeatherWidget';
