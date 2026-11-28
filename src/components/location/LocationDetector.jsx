import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Search, X, List, Map as MapIcon, Loader2, LocateFixed } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiRequest } from '../../services/api.js';
import {
  getStoredUserLocation,
  saveUserLocation,
  clearUserLocation,
  CITY_COORDINATES
} from '../../utils/locationUtils.js';

export const RADIUS_OPTIONS = [
  { value: 5, label: 'Within 5 km' },
  { value: 10, label: 'Within 10 km' },
  { value: 25, label: 'Within 25 km' },
  { value: 50, label: 'Within 50 km' },
  { value: 99999, label: 'All India' }
];

export default function LocationDetector({
  userLocation,
  onLocationChange,
  radiusKm = 25,
  onRadiusChange,
  viewMode = 'list',
  onViewModeChange,
  showMapToggle = true,
  resultCount = null,
  className = ''
}) {
  const [query, setQuery] = useState('');
  const [detecting, setDetecting] = useState(false);
  const [searching, setSearching] = useState(false);

  // Sync with stored location on mount if parent didn't pass one
  useEffect(() => {
    if (!userLocation) {
      const stored = getStoredUserLocation();
      if (stored && onLocationChange) {
        onLocationChange(stored);
      }
    }
    const handleSync = (e) => {
      if (onLocationChange) {
        onLocationChange(e.detail || null);
      }
    };
    window.addEventListener('user-location-updated', handleSync);
    return () => window.removeEventListener('user-location-updated', handleSync);
  }, []);

  const tryIpLocationFallback = async (reasonMsg = '') => {
    try {
      const res = await apiRequest('/location/ip-locate');
      if (res?.success && res?.data) {
        const d = res.data;
        const shortLabel = [d.area, d.city, d.pincode].filter(Boolean).join(', ') || d.city || d.state || 'Detected';
        const locObj = {
          latitude: d.latitude,
          longitude: d.longitude,
          city: d.city || '',
          area: d.area || '',
          state: d.state || '',
          pincode: d.pincode || '',
          displayName: d.displayName || shortLabel,
          label: shortLabel,
          source: 'ip'
        };
        saveUserLocation(locObj);
        onLocationChange?.(locObj);
        toast.success(`Location detected: ${locObj.label}`);
        return true;
      }
    } catch {
      // Fallback failed
    }
    toast.error(reasonMsg || 'Could not detect location automatically. Please enter your 6-digit pincode or city.');
    return false;
  };

  const handleDetectGps = async () => {
    setDetecting(true);
    if (!navigator.geolocation) {
      await tryIpLocationFallback('Browser GPS unavailable. Enter your 6-digit pincode or city.');
      setDetecting(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        let locObj = {
          latitude,
          longitude,
          city: 'Your Location',
          area: '',
          state: '',
          pincode: '',
          displayName: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
          label: `${latitude.toFixed(3)}, ${longitude.toFixed(3)}`,
          source: 'gps'
        };

        try {
          const res = await apiRequest(`/location/reverse?lat=${latitude}&lng=${longitude}`);
          if (res?.success && res?.data) {
            const d = res.data;
            const shortLabel = [d.area, d.city, d.pincode].filter(Boolean).join(', ') || d.displayName;
            locObj = {
              latitude,
              longitude,
              city: d.city || 'Detected City',
              area: d.area || '',
              state: d.state || '',
              pincode: d.pincode || '',
              displayName: d.displayName || shortLabel,
              label: shortLabel,
              source: 'gps'
            };
          }
        } catch {
          // Keep GPS coords even if reverse geocoding failed
        }

        saveUserLocation(locObj);
        onLocationChange?.(locObj);
        toast.success(`Location detected: ${locObj.label}`);
        setDetecting(false);
      },
      async () => {
        // Browser GPS denied/unavailable/timed out -> seamless IP geolocation fallback
        await tryIpLocationFallback('Location access denied. Enter your 6-digit pincode or city name.');
        setDetecting(false);
      },
      { enableHighAccuracy: false, timeout: 6000, maximumAge: 60000 }
    );
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    setSearching(true);
    try {
      const isPincode = /^\d{6}$/.test(trimmed);
      if (isPincode) {
        const res = await apiRequest(`/location/pincode/${trimmed}`);
        if (res?.success && res?.data) {
          const d = res.data;
          const locObj = {
            latitude: d.latitude,
            longitude: d.longitude,
            city: d.city || d.district || '',
            area: d.area || '',
            state: d.state || '',
            pincode: d.pincode || trimmed,
            displayName: d.displayName || `${d.area ? d.area + ', ' : ''}${d.district || d.city}, ${d.state} - ${trimmed}`,
            label: `${d.area ? d.area + ', ' : ''}${d.district || d.city} (${trimmed})`
          };
          saveUserLocation(locObj);
          onLocationChange?.(locObj);
          setQuery('');
          toast.success(`Set location to ${locObj.label}`);
          setSearching(false);
          return;
        }
      }

      // Try backend geocode (Nominatim + city fallback)
      const res = await apiRequest(`/location/geocode?q=${encodeURIComponent(trimmed)}`);
      if (res?.success && res?.data) {
        const d = res.data;
        const locObj = {
          latitude: d.latitude,
          longitude: d.longitude,
          city: d.city || trimmed,
          area: d.area || '',
          state: d.state || '',
          pincode: d.pincode || '',
          displayName: d.displayName || [d.area, d.city || trimmed, d.state].filter(Boolean).join(', '),
          label: [d.area, d.city || trimmed, d.state].filter(Boolean).slice(0, 2).join(', ')
        };
        saveUserLocation(locObj);
        onLocationChange?.(locObj);
        setQuery('');
        toast.success(`Set location to ${locObj.label}`);
        setSearching(false);
        return;
      }

      // Local dictionary fallback
      const lower = trimmed.toLowerCase();
      const matchedEntry = Object.entries(CITY_COORDINATES).find(([k]) => lower.includes(k));
      if (matchedEntry) {
        const [cityKey, coords] = matchedEntry;
        const capCity = cityKey.charAt(0).toUpperCase() + cityKey.slice(1);
        const locObj = {
          latitude: coords.lat,
          longitude: coords.lng,
          city: capCity,
          area: '',
          state: '',
          pincode: '',
          label: capCity
        };
        saveUserLocation(locObj);
        onLocationChange?.(locObj);
        setQuery('');
        toast.success(`Set location to ${capCity}`);
      } else {
        toast.error('Could not find that pincode or city. Try e.g. 560034 or Bangalore.');
      }
    } catch {
      toast.error('Unable to look up location right now.');
    } finally {
      setSearching(false);
    }
  };

  const handleClear = () => {
    clearUserLocation();
    onLocationChange?.(null);
    toast.success('Location filter cleared');
  };

  return (
    <div
      className={`bg-white border border-stone-200/90 rounded-2xl p-3.5 sm:p-4 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-3 ${className}`}
    >
      {/* Left: Detect GPS + Pincode/City Input */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 flex-1">
        <button
          type="button"
          onClick={handleDetectGps}
          disabled={detecting}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F2E23] text-white text-xs font-bold hover:bg-[#1D6D4E] transition shadow-xs disabled:opacity-60 shrink-0 cursor-pointer"
        >
          {detecting ? <Loader2 size={14} className="animate-spin" /> : <LocateFixed size={14} />}
          {detecting ? 'Detecting GPS...' : 'Near Me (GPS)'}
        </button>

        <form onSubmit={handleSearchSubmit} className="flex items-center gap-1.5 flex-1 max-w-md">
          <div className="relative flex-1">
            <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter 6-digit Pincode or City (e.g. 560034)"
              className="w-full pl-8 pr-3 py-2 bg-[#F8FAF9] border border-stone-200 rounded-xl text-xs font-medium text-[#0F2E23] placeholder:text-slate-400 focus:outline-none focus:border-[#0F2E23]"
            />
          </div>
          <button
            type="submit"
            disabled={searching || !query.trim()}
            className="px-3.5 py-2 rounded-xl bg-emerald-50 text-[#0F2E23] border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition disabled:opacity-50 shrink-0 cursor-pointer"
          >
            {searching ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
          </button>
        </form>

        {/* Active Location Pill */}
        {userLocation && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[#0F2E23] text-xs font-bold shrink-0">
            <Navigation size={12} className="text-emerald-700 shrink-0" />
            <span className="truncate max-w-[180px]">{userLocation.label || userLocation.city}</span>
            <button
              type="button"
              onClick={handleClear}
              title="Clear location"
              className="p-0.5 rounded-full hover:bg-emerald-200/70 text-emerald-800 transition cursor-pointer"
            >
              <X size={12} />
            </button>
          </div>
        )}
      </div>

      {/* Right: Radius Selector + List/Map Toggle */}
      <div className="flex flex-wrap items-center gap-2.5 justify-between sm:justify-end">
        {userLocation && onRadiusChange && (
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Radius:</span>
            <select
              value={radiusKm}
              onChange={(e) => onRadiusChange(Number(e.target.value))}
              aria-label="Search radius"
              className="px-2.5 py-2 bg-[#F8FAF9] border border-stone-200 rounded-xl text-xs font-bold text-[#0F2E23] focus:outline-none focus:border-[#0F2E23] cursor-pointer"
            >
              {RADIUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {resultCount !== null && (
          <span className="text-xs font-bold text-slate-500 px-1">
            {resultCount} {resultCount === 1 ? 'result' : 'results'}
          </span>
        )}

        {showMapToggle && onViewModeChange && (
          <div className="inline-flex bg-[#F3F5F4] p-1 rounded-xl border border-stone-200">
            <button
              type="button"
              onClick={() => onViewModeChange('list')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-[#0F2E23] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#0F2E23]'
              }`}
            >
              <List size={13} />
              List
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('map')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                viewMode === 'map'
                  ? 'bg-[#0F2E23] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#0F2E23]'
              }`}
            >
              <MapIcon size={13} />
              Map View
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
