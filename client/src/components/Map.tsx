import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useApp } from '@/lib/context';
import L from 'leaflet';

// Fix for default markers in react-leaflet not showing up
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Custom icon for contractors (Green)
const contractorIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export default function Map() {
  const { jobs, contractors } = useApp();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="w-full h-[400px] bg-muted/20 animate-pulse rounded-xl" />;

  return (
    <div className="w-full h-[400px] rounded-xl overflow-hidden border border-border shadow-lg relative z-0">
       <MapContainer 
        center={[29.7604, -95.3698]} 
        zoom={12} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        {jobs.map(job => (
          <Marker key={`job-${job.id}`} position={[job.lat, job.lng]} icon={icon}>
            <Popup>
              <div className="p-1">
                <h3 className="font-bold text-sm">{job.title}</h3>
                <p className="text-xs text-muted-foreground">${job.price}</p>
                <span className="text-[10px] uppercase font-bold tracking-wider text-primary">{job.status}</span>
              </div>
            </Popup>
          </Marker>
        ))}

        {contractors.map(c => (
          <Marker key={`contractor-${c.id}`} position={[c.lat, c.lng]} icon={contractorIcon}>
            <Popup>
              <div className="p-1">
                <h3 className="font-bold text-sm">{c.name}</h3>
                <p className="text-xs text-muted-foreground">Rating: {c.rating}⭐</p>
                <span className="text-[10px] uppercase font-bold tracking-wider text-green-500">Available</span>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
