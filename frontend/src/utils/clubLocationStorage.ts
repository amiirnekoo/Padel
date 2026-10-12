import { MAP_COURTS, MapCourtItem } from '../data/courtsMapData';
import { CourtClub } from '../types/rally';

const STORAGE_KEY = 'rally_club_custom_locations';

export interface SavedClubLocation {
  clubId: string;
  lat: number;
  lng: number;
  address?: string;
  updatedAt?: string;
}

export const getSavedClubLocations = (): Record<string, SavedClubLocation> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
};

export const saveClubLocation = (
  clubId: string,
  lat: number,
  lng: number,
  address?: string
): SavedClubLocation => {
  const current = getSavedClubLocations();
  const entry: SavedClubLocation = {
    clubId,
    lat,
    lng,
    address,
    updatedAt: new Date().toISOString()
  };
  current[clubId] = entry;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    window.dispatchEvent(new CustomEvent('rally_club_locations_updated', { detail: entry }));
  } catch (e) {
    console.error('Failed to save club location to localStorage', e);
  }
  return entry;
};

export const getDynamicMapCourts = (baseCourts: MapCourtItem[] = MAP_COURTS): MapCourtItem[] => {
  const saved = getSavedClubLocations();
  return baseCourts.map((court) => {
    const custom = saved[court.id];
    if (custom) {
      return {
        ...court,
        lat: custom.lat,
        lng: custom.lng,
        address: custom.address || court.address
      };
    }
    return court;
  });
};

export const applySavedLocationsToClubs = (clubs: CourtClub[]): CourtClub[] => {
  const saved = getSavedClubLocations();
  return clubs.map((club) => {
    const custom = saved[club.id];
    if (custom) {
      return {
        ...club,
        latitude: custom.lat,
        longitude: custom.lng,
        address: custom.address || club.address
      };
    }
    return club;
  });
};
