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

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: selectedCity.center,
      zoom: selectedCity.zoom,
      zoomControl: false,
      attributionControl: false
    });

    // Dark Matter Luxurious CartoDB Tiles (Zero Token, Fast CDN, Worldwide Coverage)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    // Zoom control on top-left
    L.control.zoom({ position: 'topleft' }).addTo(map);

    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;
    mapInstanceRef.current = map;

    // Invalidate size once container rendered
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => {
      clearTimeout(timer);
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
  }, [selectedCity]);

  // Update Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    const layer = markersLayerRef.current;
    layer.clearLayers();

    courts.forEach((court) => {
      const isSelected = court.id === selectedCourtId;
      const isActive = court.status === 'ACTIVE';

      const markerHtml = `
        <div class="relative group cursor-pointer" dir="rtl" style="transform: translate(-50%, -100%);">
          ${isSelected ? `<span class="absolute -inset-2 rounded-full animate-ping opacity-70" style="background-color: ${court.color};"></span>` : ''}
          <div class="px-2.5 py-1 rounded-full text-[11px] font-black flex items-center gap-1.5 shadow-2xl transition-all ${
            isSelected
              ? 'scale-110 text-white ring-2 ring-white shadow-cyan-500/50'
              : isActive
              ? 'text-slate-100 bg-slate-900/95 border border-slate-700 hover:scale-105'
              : 'text-amber-300 bg-slate-950/95 border border-amber-500/40 opacity-90'
          }" style="background-color: ${isSelected ? court.color : undefined}">
            <span class="w-2 h-2 rounded-full shrink-0 ${isActive ? 'bg-emerald-400' : 'bg-amber-400'}"></span>
            <span class="whitespace-nowrap">${court.name.split(' (')[0]}</span>
            ${isActive ? '<span class="text-[9px] bg-black/40 px-1 py-0.2 rounded text-emerald-300">فعال</span>' : '<span class="text-[9px] bg-black/40 px-1 py-0.2 rounded text-amber-300">به‌زودی</span>'}
          </div>
          <div class="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] mx-auto" style="border-t-color: ${isSelected ? court.color : '#0f172a'};"></div>
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
    <div className="relative w-full h-full min-h-[320px] sm:min-h-[420px] bg-slate-950 overflow-hidden">
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* CartoDB / OSM Attribution Badge */}
      <div className="absolute bottom-2 left-2 z-20 px-2 py-0.5 rounded bg-slate-950/80 text-[10px] text-slate-500 font-sans pointer-events-none border border-slate-800">
        © OpenStreetMap & CartoDB Dark
      </div>
    </div>
  );
};
