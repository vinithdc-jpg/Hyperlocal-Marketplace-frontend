'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';

const MapContainer = dynamic(() => import('react-leaflet').then((m) => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((m) => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((m) => m.Marker), { ssr: false });

export default function LocationMap({ lat, lng, zoom = 13, height = '300px', onLocationChange }) {
  useEffect(() => {
    import('leaflet/dist/leaflet.css');
  }, []);

  if (!lat || !lng) {
    return (
      <div className="rounded-lg border border-border bg-background flex items-center justify-center text-muted" style={{ height }}>
        No location set
      </div>
    );
  }

  return (
    <div style={{ height }} className="rounded-lg overflow-hidden border border-border">
      <MapContainer center={[lat, lng]} zoom={zoom} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
        <Marker position={[lat, lng]} />
      </MapContainer>
    </div>
  );
}
