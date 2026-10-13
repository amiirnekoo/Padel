import React from 'react';
import { Navigation, ExternalLink } from 'lucide-react';
import { NeshanIcon, BaladIcon, GoogleMapsIcon, WazeIcon } from './NavAppIcons';

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
  icon: React.ReactNode;
  compactIcon: React.ReactNode;
  getUrl: (lat: number, lng: number) => string;
  hoverColor: string;
  textColor: string;
  borderColor: string;
  bgColor: string;
}

const NAV_APPS: NavAppOption[] = [
  {
    id: 'neshan',
    name: 'Neshan',
    nameEn: 'نشان',
    icon: <NeshanIcon className="w-4 h-4 rounded shrink-0" />,
    compactIcon: <NeshanIcon className="w-3.5 h-3.5 rounded shrink-0" />,
    getUrl: (lat, lng) => `https://nshn.ir/?lat=${lat}&lng=${lng}`,
    bgColor: 'bg-blue-950/40',
    hoverColor: 'hover:bg-blue-900/60 hover:border-blue-400',
    textColor: 'text-blue-100',
    borderColor: 'border-blue-500/50'
  },
  {
    id: 'balad',
    name: 'Balad',
    nameEn: 'بلد',
    icon: <BaladIcon className="w-4 h-4 rounded shrink-0" />,
    compactIcon: <BaladIcon className="w-3.5 h-3.5 rounded shrink-0" />,
    getUrl: (lat, lng) => `https://balad.ir/location?latitude=${lat}&longitude=${lng}`,
    bgColor: 'bg-emerald-950/40',
    hoverColor: 'hover:bg-emerald-900/60 hover:border-emerald-400',
    textColor: 'text-emerald-100',
    borderColor: 'border-emerald-500/50'
  },
  {
    id: 'google',
    name: 'Google Maps',
    nameEn: 'گوگل مپس',
    icon: <GoogleMapsIcon className="w-4 h-4 rounded shrink-0" />,
    compactIcon: <GoogleMapsIcon className="w-3.5 h-3.5 rounded shrink-0" />,
    getUrl: (lat, lng) => `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
    bgColor: 'bg-slate-900',
    hoverColor: 'hover:bg-slate-800 hover:border-rose-400',
    textColor: 'text-slate-100',
    borderColor: 'border-slate-700 hover:border-rose-500/60'
  },
  {
    id: 'waze',
    name: 'Waze',
    nameEn: 'ویز',
    icon: <WazeIcon className="w-4 h-4 rounded shrink-0" />,
    compactIcon: <WazeIcon className="w-3.5 h-3.5 rounded shrink-0" />,
    getUrl: (lat, lng) => `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`,
    bgColor: 'bg-sky-950/40',
    hoverColor: 'hover:bg-sky-900/60 hover:border-sky-300',
    textColor: 'text-sky-100',
    borderColor: 'border-sky-500/50'
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
            className={`px-2 py-1 rounded-xl text-[11px] font-black border transition-all cursor-pointer flex items-center gap-1.5 ${app.borderColor} ${app.bgColor} ${app.textColor} ${app.hoverColor} active:scale-95 shadow-xs`}
            title={`مسیریابی مستقیم تا ${courtName} با ${app.name} (${app.nameEn})`}
            aria-label={`مسیریابی با ${app.name}`}
          >
            {app.compactIcon}
            <span>{app.name}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center gap-2.5 ${className}`} dir="rtl">
      <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 shrink-0">
        <Navigation className="w-3.5 h-3.5 text-sky-400" />
        <span>مسیریابی با اپلیکیشن:</span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {NAV_APPS.map((app) => (
          <button
            key={app.id}
            type="button"
            onClick={(e) => handleOpenNav(app, e)}
            className={`px-3 py-1.5 rounded-xl text-xs font-black border transition-all cursor-pointer flex items-center gap-2 shadow-sm ${app.bgColor} ${app.borderColor} ${app.textColor} ${app.hoverColor} active:scale-95`}
            title={`مسیریابی مستقیم با ${app.name} (${app.nameEn})`}
            aria-label={`مسیریابی با ${app.name}`}
          >
            {app.icon}
            <span>{app.name}</span>
            <ExternalLink className="w-3 h-3 opacity-60 shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
};
