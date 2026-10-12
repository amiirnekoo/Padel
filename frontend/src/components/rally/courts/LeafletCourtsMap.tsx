import React, { useEffect, useRef } from 'react';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapCourtItem, MapCityConfig } from '../../../data/courtsMapData';

interface LeafletCourtsMapProps {
  courts: MapCourtItem[];
  selectedCity: MapCityConfig;
  selectedCourtId: string | null;
  onSelectCourt: (court: MapCourtItem) => void;
}

export const LeafletCourtsMap: React.FC<LeafletCourtsMapProps> = ({
  courts,
  selectedCity,
  selectedCourtId,
  onSelectCourt
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Initialize Map with White Background and Universal OpenStreetMap Tiles
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: selectedCity.center,
      zoom: selectedCity.zoom,
      zoomControl: false,
      attributionControl: false
    });

    // Universal OpenStreetMap Light Standard Tiles (High-contrast, White background, Zero Token)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors',
      crossOrigin: true
    }).addTo(map);

    // Zoom control on top-left
    L.control.zoom({ position: 'topleft' }).addTo(map);

    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;
    mapInstanceRef.current = map;

    // Multi-stage size invalidation to guarantee full tile rendering on mount
    const timer1 = setTimeout(() => map.invalidateSize(), 60);
    const timer2 = setTimeout(() => map.invalidateSize(), 200);
    const timer3 = setTimeout(() => map.invalidateSize(), 500);

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
      clearTimeout(timer3);
      if (resizeObserver) resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
      markersLayerRef.current = null;
    };
  }, []);

  // Handle City Change (Smooth flyTo animation)
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo(selectedCity.center, selectedCity.zoom, {
      duration: 1.2,
      easeLinearity: 0.25
    });
    const timer = setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 250);
    return () => clearTimeout(timer);
  }, [selectedCity]);

  // Update Markers with Sharp Contrast for White Background
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    const layer = markersLayerRef.current;
    layer.clearLayers();

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
      marker.on('click', () => {
        onSelectCourt(court);
      });

      layer.addLayer(marker);
    });
  }, [courts, selectedCourtId, onSelectCourt]);

  return (
    <div className="relative w-full h-full min-h-[420px] sm:min-h-[500px] bg-white overflow-hidden rounded-2xl border border-slate-200">
      <div
        ref={mapContainerRef}
        className="w-full h-full min-h-[420px] sm:min-h-[500px] z-10 bg-white"
        style={{ minHeight: '420px', height: '100%', width: '100%', backgroundColor: '#ffffff' }}
      />

      {/* OpenStreetMap Attribution Badge */}
      <div className="absolute bottom-2 left-2 z-20 px-2.5 py-1 rounded bg-white/95 text-[10px] text-slate-600 font-sans pointer-events-none border border-slate-300 shadow-sm flex items-center gap-1">
        <span>© OpenStreetMap contributors</span>
      </div>
    </div>
  );
};
