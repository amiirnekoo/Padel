import React from 'react';
import { Navigation, Compass, ExternalLink } from 'lucide-react';

interface CourtNavigationActionsProps {
  lat: number;
  lng: number;
  courtName: string;
  className?: string;
  compact?: boolean;
}

interface NavAppOption {
  id: 'neshan' | 'balad' | 'google' | 'waze';
  name: string;
  nameEn: string;
  getUrl: (lat: number, lng: number) => string;
  badgeColor: string;
  hoverColor: string;
  iconBg: string;
  textColor: string;
  borderColor: string;
}

const NAV_APPS: NavAppOption[] = [
  {
    id: 'neshan',
    name: 'نشان',
    nameEn: 'Neshan',
    getUrl: (lat, lng) => `https://nshn.ir/?lat=${lat}&lng=${lng}`,
    badgeColor: 'bg-blue-600',
    hoverColor: 'hover:bg-blue-500 hover:border-blue-400',
    iconBg: 'bg-blue-500/20 text-blue-400',
    textColor: 'text-blue-100',
    borderColor: 'border-blue-500/40'
  },
  {
    id: 'balad',
    name: 'بلد',
    nameEn: 'Balad',
    getUrl: (lat, lng) => `https://balad.ir/location?latitude=${lat}&longitude=${lng}`,
    badgeColor: 'bg-emerald-600',
    hoverColor: 'hover:bg-emerald-500 hover:border-emerald-400',
    iconBg: 'bg-emerald-500/20 text-emerald-400',
    textColor: 'text-emerald-100',
    borderColor: 'border-emerald-500/40'
  },
  {
    id: 'google',
    name: 'گوگل مپ',
    nameEn: 'Google Maps',
    getUrl: (lat, lng) => `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
    badgeColor: 'bg-rose-600',
    hoverColor: 'hover:bg-rose-500 hover:border-rose-400',
    iconBg: 'bg-rose-500/20 text-rose-400',
    textColor: 'text-rose-100',
    borderColor: 'border-rose-500/40'
  },
  {
    id: 'waze',
    name: 'ویز',
    nameEn: 'Waze',
    getUrl: (lat, lng) => `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`,
    badgeColor: 'bg-sky-500',
    hoverColor: 'hover:bg-sky-400 hover:border-sky-300',
    iconBg: 'bg-sky-500/20 text-sky-400',
    textColor: 'text-sky-100',
    borderColor: 'border-sky-500/40'
  }
];

export const CourtNavigationActions: React.FC<CourtNavigationActionsProps> = ({
  lat,
  lng,
  courtName,
  className = '',
  compact = false
}) => {
  const handleOpenNav = (app: NavAppOption, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = app.getUrl(lat, lng);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (compact) {
    return (
      <div className={`flex items-center gap-1.5 ${className}`} dir="rtl">
        {NAV_APPS.map((app) => (
          <button
            key={app.id}
            type="button"
            onClick={(e) => handleOpenNav(app, e)}
            className={`px-2 py-1 rounded-lg text-[10px] font-black border transition-all cursor-pointer flex items-center gap-1 ${app.borderColor} bg-slate-800/90 ${app.textColor} ${app.hoverColor} active:scale-95`}
            title={`مسیریابی مستقیم تا ${courtName} با ${app.name}`}
            aria-label={`مسیریابی با ${app.name}`}
          >
            <span>{app.name}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center gap-2 ${className}`} dir="rtl">
      <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 shrink-0">
        <Navigation className="w-3.5 h-3.5 text-sky-400" />
        <span>مسیریابی با اپلیکیشن:</span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {NAV_APPS.map((app) => (
          <button
            key={app.id}
            type="button"
            onClick={(e) => handleOpenNav(app, e)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-black border transition-all cursor-pointer flex items-center gap-1.5 shadow-sm bg-slate-900 ${app.borderColor} ${app.textColor} ${app.hoverColor} active:scale-95`}
            title={`مسیریابی با ${app.name} (${app.nameEn})`}
            aria-label={`مسیریابی مستقیم با ${app.name}`}
          >
            <span className={`w-2 h-2 rounded-full shrink-0 ${app.badgeColor}`}></span>
            <span>{app.name}</span>
            <ExternalLink className="w-3 h-3 opacity-60 shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
};
