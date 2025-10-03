import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useEffect } from 'react';

// Custom icon (Leaflet's default icons need manual import when bundling)
import 'leaflet/dist/leaflet.css';

// Fix default icon paths (Vite bundling)
const icon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export interface HospitalLocation {
  name: string;
  nameKey: string;
  address: string;
  rating: number;
  phone: string;
  category: string;
  services: { key: string; name: string }[];
  timings: string;
  coordinates: { lat: number; lng: number };
}

interface HospitalMapProps {
  hospitals: HospitalLocation[];
  filtered: HospitalLocation[];
  onSelect?: (hospital: HospitalLocation) => void;
}

const NABHA_CENTER: [number, number] = [30.3755, 76.1515];

export const HospitalMap = ({ hospitals, filtered, onSelect }: HospitalMapProps) => {
  // Force Leaflet invalidation if needed when filters change
  useEffect(() => {
    // Future: could fit bounds to filtered markers
  }, [filtered]);

  return (
    <div className="relative h-64 w-full rounded-lg overflow-hidden">
      <MapContainer
        center={NABHA_CENTER}
        zoom={14}
        className="h-full w-full z-0"
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {filtered.map(h => (
          <Marker
            key={h.name}
            position={[h.coordinates.lat, h.coordinates.lng]}
            icon={icon}
            eventHandlers={{
              click: () => onSelect?.(h)
            }}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">{h.name}</p>
                <p className="text-xs text-muted-foreground mb-1">{h.address}</p>
                <p className="text-xs">Rating: {h.rating} ⭐</p>
                <p className="text-xs">Services: {h.services.slice(0,3).join(', ')}{h.services.length>3 ? '…' : ''}</p>
                <button
                  className="mt-2 text-primary underline text-xs"
                  onClick={() => onSelect?.(h)}
                >View details</button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default HospitalMap;
