import React, { useState, useEffect, useRef } from 'react';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { X, MapPin, Check, Navigation, Compass, Sparkles } from 'lucide-react';
import { CourtClub } from '../../../types/rally';
import { saveClubLocation } from '../../../utils/clubLocationStorage';
import { rallyApi } from '../../../services/rallyApi';

interface AdminClubLocationModalProps {
  isOpen: boolean;
  club: CourtClub | null;
  onClose: () => void;
  onSaveSuccess: (clubId: string, lat: number, lng: number, address: string) => void;
}

const QUICK_PRESETS = [
  { name: 'مجموعه انقلاب', lat: 35.7772, lng: 51.4053 },
  { name: 'آجودانیه (لفور)', lat: 35.8115, lng: 51.4889 },
  { name: 'مینی‌سیتی (ویوا)', lat: 35.7981, lng: 51.5032 },
  { name: 'نیاوران', lat: 35.8210, lng: 51.4720 },
  { name: 'شهرک غرب', lat: 35.7530, lng: 51.3680 },
  { name: 'ولنجک', lat: 35.8080, lng: 51.4110 },
  { name: 'نمک‌آبرود', lat: 36.6710, lng: 51.3020 },
  { name: 'اصفهان مشتاق', lat: 32.6320, lng: 51.7210 },
  { name: 'شیراز چمران', lat: 29.6450, lng: 52.5020 },
  { name: 'مشهد سجاد', lat: 36.3210, lng: 59.5480 },
  { name: 'تبریز ائل‌گلی', lat: 38.0250, lng: 46.3680 },
];

export const AdminClubLocationModal: React.FC<AdminClubLocationModalProps> = ({
  isOpen,
  club,
  onClose,
  onSaveSuccess
}) => {
  const [lat, setLat] = useState<number>(35.7981);
  const [lng, setLng] = useState<number>(51.5032);
  const [address, setAddress] = useState<string>('');
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Sync state when club changes
  useEffect(() => {
    if (club) {
      setLat(club.latitude || 35.7981);
      setLng(club.longitude || 51.5032);
      setAddress(club.address || '');
      setSavedSuccess(false);
    }
  }, [club]);

  // Initialize interactive Leaflet Map with White Background
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    const initialLat = club?.latitude || 35.7981;
    const initialLng = club?.longitude || 51.5032;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 14,
      zoomControl: true,
      attributionControl: false
    });

    // Universal OpenStreetMap Standard Light Tiles
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors',
      crossOrigin: true
    }).addTo(map);

    const pinHtml = `
      <div class="relative cursor-move" style="transform: translate(-50%, -100%);">
        <div class="px-3 py-1 rounded-full text-xs font-black bg-slate-900 text-white border-2 border-emerald-400 shadow-2xl flex items-center gap-1.5 whitespace-nowrap">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
          <span>موقعیت باشگاه</span>
        </div>
        <div class="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-slate-900 mx-auto"></div>
      </div>
    `;

    const marker = L.marker([initialLat, initialLng], {
      draggable: true,
      icon: L.divIcon({ className: 'custom-admin-marker', html: pinHtml, iconSize: [0, 0] })
    }).addTo(map);

    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      setLat(Number(pos.lat.toFixed(5)));
      setLng(Number(pos.lng.toFixed(5)));
    });

    map.on('click', (e: any) => {
      marker.setLatLng(e.latlng);
      setLat(Number(e.latlng.lat.toFixed(5)));
      setLng(Number(e.latlng.lng.toFixed(5)));
    });

    markerRef.current = marker;
    mapInstanceRef.current = map;

    // Guaranteed sizing
    const t1 = setTimeout(() => map.invalidateSize(), 80);
    const t2 = setTimeout(() => map.invalidateSize(), 300);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      map.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
    };
  }, [isOpen, club]);

  if (!isOpen || !club) return null;

  const handleApplyPreset = (pLat: number, pLng: number) => {
    setLat(pLat);
    setLng(pLng);
    if (mapInstanceRef.current && markerRef.current) {
      markerRef.current.setLatLng([pLat, pLng]);
      mapInstanceRef.current.flyTo([pLat, pLng], 15, { duration: 0.8 });
    }
  };

  const handleSave = () => {
    saveClubLocation(club.id, lat, lng, address);
    rallyApi.updateClubLocation(club.id, { latitude: lat, longitude: lng, address }).catch(() => {});
    setSavedSuccess(true);
    onSaveSuccess(club.id, lat, lng, address);
    setTimeout(() => {
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-2 sm:p-4" dir="rtl">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                <span>تنظیم موقعیت مکانی:</span>
                <span className="text-emerald-400">{club.name}</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                با کلیک یا جابجایی پین روی نقشه، موقعیت جغرافیایی دقیق کورت را مشخص کنید.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center cursor-pointer transition-all"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Quick Presets Bar */}
        <div className="px-4 py-2 bg-slate-950/80 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          <span className="text-[11px] font-bold text-slate-400 shrink-0 flex items-center gap-1">
            <Compass className="w-3 h-3 text-sky-400" />
            پرش سریع:
          </span>
          {QUICK_PRESETS.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => handleApplyPreset(p.lat, p.lng)}
              className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 cursor-pointer shrink-0 transition-colors"
            >
              {p.name}
            </button>
          ))}
        </div>

        {/* Interactive Map with White Background */}
        <div className="relative flex-1 min-h-[300px] sm:min-h-[360px] bg-white p-2">
          <div
            ref={mapContainerRef}
            className="w-full h-full min-h-[300px] sm:min-h-[360px] rounded-xl border border-slate-300 bg-white"
            style={{ backgroundColor: '#ffffff', minHeight: '300px' }}
          />
          <div className="absolute top-4 right-4 z-20 px-3 py-1.5 rounded-xl bg-slate-900/90 text-white border border-slate-700 text-xs font-bold shadow-lg pointer-events-none flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5 text-emerald-400" />
            <span>روی نقشه کلیک کنید یا پین را بکشید</span>
          </div>
        </div>

        {/* Coordinate & Address Controls */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 space-y-3 shrink-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">عرض جغرافیایی (Latitude):</label>
              <input
                type="number"
                step="0.0001"
                value={lat}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setLat(val);
                  if (mapInstanceRef.current && markerRef.current && !isNaN(val)) {
                    markerRef.current.setLatLng([val, lng]);
                  }
                }}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:border-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">طول جغرافیایی (Longitude):</label>
              <input
                type="number"
                step="0.0001"
                value={lng}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setLng(val);
                  if (mapInstanceRef.current && markerRef.current && !isNaN(val)) {
                    markerRef.current.setLatLng([lat, val]);
                  }
                }}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:border-emerald-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1">آدرس متنی و موقعیت محلی کورت:</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="تهران، منطقه ۱، خیابان..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:border-emerald-500 outline-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2">
            {savedSuccess ? (
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 animate-pulse">
                <Check className="w-4 h-4" />
                <span>موقعیت مکانی باشگاه با موفقیت در سامانه ذخیره و ثبت شد.</span>
              </span>
            ) : (
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                تغییرات بلافاصله روی نقشه اصلی کورت‌ها اعمال می‌شود.
              </span>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer transition-colors"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-emerald-600/30 cursor-pointer transition-all active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>ثبت و ذخیره لوکیشن باشگاه</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
