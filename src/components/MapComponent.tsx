'use client';

import { useState, useMemo } from 'react';
import Map, { Marker, NavigationControl, Popup } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { FiMapPin } from 'react-icons/fi';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  category: string;
}

interface MapComponentProps {
  markers?: MapMarker[];
  initialViewState?: {
    latitude: number;
    longitude: number;
    zoom: number;
  };
  onMapClick?: (coords: { lat: number; lng: number }) => void;
  interactive?: boolean;
}

export default function MapComponent({ 
  markers = [], 
  initialViewState = { latitude: 20.5937, longitude: 78.9629, zoom: 4 }, // Center of India
  onMapClick,
  interactive = true
}: MapComponentProps) {
  const [popupInfo, setPopupInfo] = useState<MapMarker | null>(null);

  if (!MAPBOX_TOKEN) {
    return (
      <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center rounded-[2.5rem] border border-slate-200">
        <FiMapPin size={48} className="text-slate-300 mb-4" />
        <p className="text-slate-500 font-black uppercase text-[10px] tracking-widest text-center px-10">
          Mapbox Token Missing in .env.local<br/>
          (NEXT_PUBLIC_MAPBOX_TOKEN)
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-inner group">
      <Map
        initialViewState={initialViewState}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={MAPBOX_TOKEN}
        onClick={(e: any) => onMapClick?.({ lat: e.lngLat.lat, lng: e.lngLat.lng })}
        interactive={interactive}
      >
        <NavigationControl position="top-right" />

        {markers.map((marker) => (
          <Marker
            key={marker.id}
            latitude={marker.lat}
            longitude={marker.lng}
            anchor="bottom"
            onClick={(e: any) => {
              e.originalEvent.stopPropagation();
              setPopupInfo(marker);
            }}
          >
            <div className="cursor-pointer hover:scale-110 transition-transform">
              <FiMapPin size={32} className={`${marker.category === 'urgent' ? 'text-red-500' : 'text-green-600'} drop-shadow-lg`} />
            </div>
          </Marker>
        ))}

        {popupInfo && (
          <Popup
            anchor="top"
            longitude={popupInfo.lng}
            latitude={popupInfo.lat}
            onClose={() => setPopupInfo(null)}
            closeButton={false}
            className="rounded-2xl overflow-hidden"
          >
            <div className="p-2">
              <p className="text-xs font-black text-slate-900">{popupInfo.title}</p>
              <p className="text-[10px] uppercase font-bold text-slate-400">{popupInfo.category}</p>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}
