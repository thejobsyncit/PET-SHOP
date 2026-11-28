import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Star, MapPin, Navigation } from 'lucide-react';
import { resolveItemCoordinates } from '../../utils/locationUtils.js';

// Custom clean SVG marker icons (avoids broken Vite asset paths for default Leaflet markers)
const createPinIcon = (color = '#0F2E23', label = '') =>
  L.divIcon({
    className: 'josh-custom-map-pin',
    html: `<div style="display:flex;flex-direction:column;align-items:center;transform:translate(-50%,-100%);">
      <div style="background:${color};color:#fff;font-weight:800;font-size:11px;padding:4px 8px;border-radius:999px;border:2px solid #fff;box-shadow:0 3px 10px rgba(0,0,0,0.28);white-space:nowrap;display:flex;align-items:center;gap:4px;">
        <span style="width:6px;height:6px;border-radius:50%;background:#A3E635;display:inline-block;"></span>
        ${label ? label : 'Provider'}
      </div>
      <div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:7px solid ${color};margin-top:-1px;"></div>
    </div>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0]
  });

const userPinIcon = L.divIcon({
  className: 'josh-user-map-pin',
  html: `<div style="transform:translate(-50%,-50%);width:20px;height:20px;border-radius:50%;background:#2563EB;border:3px solid #fff;box-shadow:0 0 0 6px rgba(37,99,235,0.25);"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

function MapViewportUpdater({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && Array.isArray(center) && Number.isFinite(center[0]) && Number.isFinite(center[1])) {
      map.setView(center, zoom, { animate: true });
    }
  }, [center?.[0], center?.[1], zoom]);
  return null;
}

export default function ProviderMapView({
  items = [],
  userLocation = null,
  radiusKm = 25,
  onSelectProvider = null,
  heightClass = 'h-[300px] sm:h-[320px]',
  actionLabel = 'View / Book'
}) {
  const mappedItems = useMemo(() => {
    return (items || [])
      .map((item) => {
        const coords = resolveItemCoordinates(item);
        if (!coords) return null;
        return { item, coords };
      })
      .filter(Boolean);
  }, [items]);

  const mapCenter = useMemo(() => {
    if (userLocation && Number.isFinite(Number(userLocation.latitude)) && Number.isFinite(Number(userLocation.longitude))) {
      return [Number(userLocation.latitude), Number(userLocation.longitude)];
    }
    if (mappedItems.length > 0) {
      return [mappedItems[0].coords.lat, mappedItems[0].coords.lng];
    }
    return [12.9716, 77.5946]; // Default Bangalore
  }, [userLocation, mappedItems]);

  const zoom = userLocation ? (radiusKm <= 10 ? 12 : radiusKm <= 25 ? 11 : radiusKm <= 60 ? 10 : 5) : 11;

  return (
    <div className={`w-full ${heightClass} rounded-2xl overflow-hidden border border-stone-200 shadow-sm relative z-0 bg-stone-100`}>
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%' }}
      >
        <MapViewportUpdater center={mapCenter} zoom={zoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User Location Pin & Radius Circle */}
        {userLocation && Number.isFinite(Number(userLocation.latitude)) && Number.isFinite(Number(userLocation.longitude)) && (
          <>
            <Marker
              position={[Number(userLocation.latitude), Number(userLocation.longitude)]}
              icon={userPinIcon}
            >
              <Popup>
                <div className="min-w-[180px] text-xs font-bold text-[#0F2E23] space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
                    <span>Your Location</span>
                  </div>
                  <div className="text-[11px] font-medium text-slate-600 leading-snug">
                    {userLocation.displayName || userLocation.label || [userLocation.area, userLocation.city, userLocation.state, userLocation.pincode].filter(Boolean).join(', ')}
                  </div>
                </div>
              </Popup>
            </Marker>

            {radiusKm < 500 && (
              <Circle
                center={[Number(userLocation.latitude), Number(userLocation.longitude)]}
                radius={radiusKm * 1000}
                pathOptions={{
                  color: '#0F2E23',
                  fillColor: '#10B981',
                  fillOpacity: 0.08,
                  weight: 1.5,
                  dashArray: '5, 5'
                }}
              />
            )}
          </>
        )}

        {/* Provider Markers */}
        {mappedItems.map(({ item, coords }, idx) => {
          const title = item.clinicName || item.name || item.businessName || 'Verified Provider';
          const shortLabel = title.length > 18 ? title.slice(0, 16) + '…' : title;
          const distLabel = item.distanceKm !== undefined && item.distanceKm !== null ? `${item.distanceKm} km` : '';

          return (
            <Marker
              key={item.id || idx}
              position={[coords.lat, coords.lng]}
              icon={createPinIcon('#0F2E23', distLabel || shortLabel)}
            >
              <Popup>
                <div className="min-w-[200px] space-y-1.5 py-0.5">
                  <div className="font-bold text-sm text-[#0F2E23] leading-snug">{title}</div>
                  {item.name && item.clinicName && item.name !== item.clinicName && (
                    <div className="text-xs text-slate-600 font-medium">{item.name}</div>
                  )}
                  <div className="flex items-center gap-1 text-[11px] text-slate-500">
                    <MapPin size={11} className="shrink-0 text-emerald-700" />
                    <span>{[item.area, item.city, item.state].filter(Boolean).join(', ')}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600">
                      <Star size={11} className="fill-amber-500 text-amber-500" />
                      {item.rating || 4.9}
                    </span>
                    {distLabel && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        <Navigation size={10} />
                        {distLabel} away
                      </span>
                    )}
                  </div>
                  {onSelectProvider && (
                    <button
                      type="button"
                      onClick={() => onSelectProvider(item)}
                      className="w-full mt-2 py-1.5 px-3 bg-[#0F2E23] text-white text-xs font-bold rounded-lg hover:bg-[#1D6D4E] transition cursor-pointer"
                    >
                      {actionLabel}
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {userLocation && (
        <div className="absolute bottom-2.5 left-2.5 z-[400] max-w-[75%] sm:max-w-sm bg-white/95 backdrop-blur-xs border border-stone-200 rounded-xl px-2.5 py-1.5 shadow-md flex items-start gap-1.5 pointer-events-none">
          <MapPin size={12} className="text-blue-600 shrink-0 mt-0.5" />
          <div className="text-[10px] leading-snug">
            <span className="font-bold text-[#0F2E23] block">Your Location:</span>
            <span className="text-slate-600 font-medium line-clamp-1">
              {userLocation.displayName || userLocation.label || [userLocation.area, userLocation.city, userLocation.state, userLocation.pincode].filter(Boolean).join(', ')}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
