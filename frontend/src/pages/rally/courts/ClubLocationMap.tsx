import React, { useEffect, useRef } from 'react';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, Phone, Car, Compass } from 'lucide-react';
import { CourtClub } from '../../../types/rally';
import { ClubRichProfile } from '../../../data/clubsRichData';
import { CourtNavigationActions } from '../../../components/rally/courts/CourtNavigationActions';

interface ClubLocationMapProps {
  club: CourtClub;
  richProfile: ClubRichProfile | null;
}

export const ClubLocationMap: React.FC<ClubLocationMapProps> = ({
  club,
  richProfile
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const lat = club.latitude || 35.7981;
  const lng = club.longitude || 51.5032;

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([lat, lng], 15);
      return;
    }

    const map = L.map(mapContainerRef.current, {
      center: [lat, lng],
      zoom: 15,
      zoomControl: false,
      attributionControl: false,
      preferCanvas: true
    });

    // Zero-Watermark Humanitarian OpenStreetMap CDN Tiles
    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      subdomains: ['a', 'b'],
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors',
      crossOrigin: true
    }).addTo(map);

    L.control.zoom({ position: 'topleft' }).addTo(map);

    // Custom marker icon
    const customIcon = L.divIcon({
      className: 'custom-court-marker',
      html: `
        <div style="background-color: #0B2238; border: 3px solid #D7ED68; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(0,0,0,0.4);">
          <span style="font-size: 18px;">🎾</span>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    L.marker([lat, lng], { icon: customIcon })
      .addTo(map)
      .bindPopup(`<strong>${club.name}</strong><br/>${club.address}`, { offset: [0, -15] })
      .openPopup();

    mapInstanceRef.current = map;

    const timer = setTimeout(() => map.invalidateSize(), 100);
    return () => {
      clearTimeout(timer);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [lat, lng, club.name, club.address]);

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
            <Compass className="w-5 h-5 text-sky-600" />
            <span>موقعیت مکانی و راه‌های دسترسی به باشگاه</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            مسیریابی هوشمند مستقیم با اپلیکیشن‌های نشان، بلد، گوگل مپس و ویز
          </p>
        </div>

        {/* 4 Navigation Apps Bar */}
        <CourtNavigationActions lat={lat} lng={lng} courtName={club.name} />
      </div>

      {/* Map + Location Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Map Container (lg: 8 cols) */}
        <div className="lg:col-span-8 h-72 sm:h-96 rounded-2xl overflow-hidden border border-slate-200 relative shadow-inner">
          <div ref={mapContainerRef} className="w-full h-full z-0" />
        </div>

        {/* Info Column (lg: 4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          
          {/* Address Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="flex items-center gap-2 text-sky-700">
              <MapPin className="w-4 h-4 shrink-0" />
              <span className="text-xs font-black">آدرس دقیق:</span>
            </div>
            <p className="text-xs text-slate-800 leading-relaxed font-medium">
              {club.address}
            </p>
          </div>

          {/* Access Guide */}
          {richProfile?.accessGuide && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="flex items-center gap-2 text-sky-700">
                <Navigation className="w-4 h-4 shrink-0" />
                <span className="text-xs font-black">راهنمای دسترسی:</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {richProfile.accessGuide}
              </p>
            </div>
          )}

          {/* Parking Info */}
          {richProfile?.parkingInfo && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="flex items-center gap-2 text-emerald-700">
                <Car className="w-4 h-4 shrink-0" />
                <span className="text-xs font-black">پارکینگ اختصاصی:</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {richProfile.parkingInfo}
              </p>
            </div>
          )}

          {/* Contact Hotline */}
          <div className="p-4 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-sky-700" />
              <span className="text-xs font-bold text-sky-900">پذیرش باشگاه:</span>
            </div>
            <a
              href="tel:02122050000"
              className="text-xs font-black text-sky-700 hover:underline"
            >
              ۰۲۱-۲۲۰۵۰۰۰۰
            </a>
          </div>

        </div>

      </div>

    </div>
  );
};
