import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Building2 } from 'lucide-react';

export interface VenueSummary {
  id: string;
  name: string;
  city: string;
  province: string;
  address: string;
  phone: string;
  sports_supported: string;
  default_hourly_rate: number;
}

interface ClubSelectorProps {
  selectedClubId: string;
  onSelectClub: (club: VenueSummary) => void;
}

const CITIES = ['همه شهرها', 'تهران'];

export const ClubSelector: React.FC<ClubSelectorProps> = ({ selectedClubId, onSelectClub }) => {
  const [venues, setVenues] = useState<VenueSummary[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>('همه شهرها');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchVenues = async () => {
      setLoading(true);
      try {
        const cityParam = selectedCity !== 'همه شهرها' ? `?city=${encodeURIComponent(selectedCity)}` : '';
        const res = await fetch(`/api/v1/venues/public${cityParam}`);
        if (res.ok) {
          const data: VenueSummary[] = await res.json();
          setVenues(data);
          if (data.length > 0 && !data.some(c => c.id === selectedClubId)) {
            onSelectClub(data[0]);
          }
        }
      } catch {
        // Fallback demo clubs
      } finally {
        setLoading(false);
      }
    };
    fetchVenues();
  }, [selectedCity]);

  const activeVenue = venues.find(v => v.id === selectedClubId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '0.85rem' }}>
          <Building2 size={16} color="#10b981" />
          <span>انتخاب باشگاه:</span>
        </div>

        {/* City Filter Pills */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {CITIES.map(c => (
            <button
              key={c}
              onClick={() => setSelectedCity(c)}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                background: selectedCity === c ? '#047857' : 'rgba(255, 255, 255, 0.05)',
                color: selectedCity === c ? '#ffffff' : '#94a3b8',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Club Dropdown */}
        <select
          value={selectedClubId}
          disabled={loading}
          onChange={(e) => {
            const found = venues.find(v => v.id === e.target.value);
            if (found) onSelectClub(found);
          }}
          style={{
            background: '#0f172a',
            color: '#f8fafc',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            padding: '6px 12px',
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: 'pointer',
            minWidth: '220px'
          }}
        >
          {venues.length > 0 ? (
            venues.map(v => (
              <option key={v.id} value={v.id}>
                {v.name} ({v.city})
              </option>
            ))
          ) : (
            <>
              <option value="club-enghelab">مجموعه پدل FGB انقلاب (تهران)</option>
              <option value="club-lafour">باشگاه پدل لفور (تهران)</option>
              <option value="club-viva">باشگاه پدل ویوا (تهران)</option>
            </>
          )}
        </select>
      </div>

      {activeVenue && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MapPin size={15} color="#10b981" /> {activeVenue.city}، {activeVenue.address}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Phone size={15} color="#38bdf8" /> {activeVenue.phone}
          </span>
        </div>
      )}
    </div>
  );
};
