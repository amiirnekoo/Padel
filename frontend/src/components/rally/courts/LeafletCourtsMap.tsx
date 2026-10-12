import React, { useEffect, useRef } from 'react';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapCourtItem, MapCityConfig } from '../../../data/courtsMapData';

interface LeafletCourtsMapProps {
  courts: MapCourtItem[];
  selectedCity: MapCityConfig;
  selectedCourtId: string | null;
  onSelectCourt: (court: MapCourtItem) => void;
  isVisible?: boolean;
}

export const LeafletCourtsMap: React.FC<LeafletCourtsMapProps> = ({
  courts,
  selectedCity,
  selectedCourtId,
  onSelectCourt,
  isVisible = true
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const markersMapRef = useRef<Map<string, L.Marker>>(new Map());

  // Initialize Map with White Background and High-speed CDN Tiles
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: selectedCity.center,
      zoom: selectedCity.zoom,
      zoomControl: false,
      attributionControl: false,
      preferCanvas: true
    });

    // 100% Free, Zero-Watermark, Fast Multi-Server Tiles (Humanitarian OpenStreetMap CDN)
    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      subdomains: ['a', 'b'],
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors',
      crossOrigin: true,
      keepBuffer: 10,
      updateWhenIdle: true,
      updateWhenZooming: false
    }).addTo(map);

    // Zoom control on top-left
    L.control.zoom({ position: 'topleft' }).addTo(map);

    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;
    mapInstanceRef.current = map;

    // Fast invalidate size on mount
    const timer1 = setTimeout(() => map.invalidateSize(), 30);
    const timer2 = setTimeout(() => map.invalidateSize(), 150);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && mapContainerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        map.invalidateSize();
      });
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      if (resizeObserver) resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
      markersLayerRef.current = null;
      markersMapRef.current.clear();
    };
  }, []);

  // Recalculate size instantly when modal visibility becomes active
  useEffect(() => {
    if (isVisible && mapInstanceRef.current) {
      mapInstanceRef.current.invalidateSize();
      const t = setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 60);
      return () => clearTimeout(t);
    }
  }, [isVisible]);

  // Handle City Change (Snappy transition without unnecessary tile churn)
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo(selectedCity.center, selectedCity.zoom, {
      duration: 0.5,
      easeLinearity: 0.25
    });
    const timer = setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 120);
    return () => clearTimeout(timer);
  }, [selectedCity]);

  // Update Markers with Sharp Contrast & Quick Navigation Popup
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    const layer = markersLayerRef.current;
    layer.clearLayers();
    markersMapRef.current.clear();

    courts.forEach((court) => {
      const isSelected = court.id === selectedCourtId;
      const isActive = court.status === 'ACTIVE';

      const markerHtml = `
        <div class="relative group cursor-pointer" dir="rtl" style="transform: translate(-50%, -100%);">
          ${isSelected ? '<span class="absolute -inset-2.5 rounded-full animate-ping opacity-75 bg-sky-500"></span>' : ''}
          <div class="px-3 py-1.5 rounded-full text-[11px] font-black flex items-center gap-1.5 shadow-xl transition-all border ${
            isSelected
              ? 'scale-110 text-white bg-sky-600 border-sky-400 ring-2 ring-sky-300 shadow-sky-500/50'
              : isActive
              ? 'text-slate-900 bg-white border-emerald-500 shadow-md hover:scale-105'
              : 'text-slate-800 bg-amber-50 border-amber-400 shadow-md opacity-95'
          }">
            <span class="w-2.5 h-2.5 rounded-full shrink-0 ${isActive ? 'bg-emerald-500 ring-2 ring-emerald-200' : 'bg-amber-500'}"></span>
            <span class="whitespace-nowrap font-black">${court.name.split(' (')[0]}</span>
            ${
              isActive
                ? '<span class="text-[9px] bg-emerald-100 text-emerald-800 font-black px-1.5 py-0.5 rounded-full">فعال</span>'
                : '<span class="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded-full">به‌زودی</span>'
            }
          </div>
          <div class="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] mx-auto ${
            isSelected ? 'border-t-sky-600' : isActive ? 'border-t-emerald-500' : 'border-t-amber-500'
          }"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-padel-marker',
        html: markerHtml,
        iconSize: [0, 0]
      });

      const marker = L.marker([court.lat, court.lng], { icon: customIcon });

      const popupHtml = `
        <div dir="rtl" class="p-1 text-right font-sans" style="min-width: 180px;">
          <div class="font-black text-xs text-slate-900 mb-0.5">${court.name.split(' (')[0]}</div>
          <div class="text-[10px] text-slate-500 mb-2">${court.area} • ${court.courtType === 'INDOOR' ? 'مسقف' : 'روباز'}</div>
          <div class="text-[10px] font-bold text-slate-700 mb-1">مسیریابی با اپلیکیشن:</div>
          <div class="flex items-center gap-1 justify-between">
            <a href="https://nshn.ir/?lat=${court.lat}&lng=${court.lng}" target="_blank" rel="noopener noreferrer" style="text-decoration:none; display:inline-block; padding:3px 6px; border-radius:6px; background:#2563eb; color:#fff; font-size:10px; font-weight:900;">Neshan</a>
            <a href="https://balad.ir/location?latitude=${court.lat}&longitude=${court.lng}" target="_blank" rel="noopener noreferrer" style="text-decoration:none; display:inline-block; padding:3px 6px; border-radius:6px; background:#059669; color:#fff; font-size:10px; font-weight:900;">Balad</a>
            <a href="https://www.google.com/maps/dir/?api=1&destination=${court.lat},${court.lng}" target="_blank" rel="noopener noreferrer" style="text-decoration:none; display:inline-block; padding:3px 6px; border-radius:6px; background:#e11d48; color:#fff; font-size:10px; font-weight:900;">Google</a>
            <a href="https://waze.com/ul?ll=${court.lat},${court.lng}&navigate=yes" target="_blank" rel="noopener noreferrer" style="text-decoration:none; display:inline-block; padding:3px 6px; border-radius:6px; background:#0284c7; color:#fff; font-size:10px; font-weight:900;">Waze</a>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        closeButton: false,
        className: 'custom-padel-popup',
        offset: [0, -32]
      });

      marker.on('click', () => {
        onSelectCourt(court);
      });

      layer.addLayer(marker);
      markersMapRef.current.set(court.id, marker);

      if (isSelected && mapInstanceRef.current) {
        marker.openPopup();
      }
    });
  }, [courts, selectedCourtId, onSelectCourt]);

  return (
    <div className="relative w-full h-full min-h-[420px] sm:min-h-[500px] bg-white overflow-hidden rounded-2xl border border-slate-200">
      <div
        ref={mapContainerRef}
        className="w-full h-full min-h-[420px] sm:min-h-[500px] z-10 bg-white"
        style={{ minHeight: '420px', height: '100%', width: '100%', backgroundColor: '#ffffff' }}
      />

      {/* Zero-Token OpenStreetMap Attribution Badge */}
      <div className="absolute bottom-2 left-2 z-20 px-2.5 py-1 rounded bg-white/95 text-[10px] text-slate-600 font-sans pointer-events-none border border-slate-300 shadow-sm flex items-center gap-1">
        <span>© OpenStreetMap contributors</span>
      </div>
    </div>
  );
};
