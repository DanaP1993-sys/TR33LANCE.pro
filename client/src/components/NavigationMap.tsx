import { MapContainer, TileLayer, Marker, Popup, Polygon, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crosshair, Navigation } from "lucide-react";

// Fix Leaflet icon issue
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const contractorIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface NavMapProps {
  jobLocation: [number, number];
  contractorLocation: [number, number];
  boundaries: [number, number][];
}

export function NavigationMap({ jobLocation, contractorLocation, boundaries }: NavMapProps) {
  return (
    <Card className="relative w-full h-[300px] overflow-hidden border-lime-500/30 bg-zinc-950 shadow-[0_0_20px_rgba(163,230,53,0.1)]">
      {/* HUD Overlays */}
      <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2">
        <Badge variant="outline" className="bg-zinc-900/80 border-lime-500/50 text-lime-400 backdrop-blur-md px-2 py-1 flex items-center gap-2">
          <Navigation size={12} className="animate-pulse" />
          <span className="font-mono text-[10px] tracking-widest uppercase">Tactical Overlay Active</span>
        </Badge>
        <Badge variant="outline" className="bg-zinc-900/80 border-blue-500/50 text-blue-400 backdrop-blur-md px-2 py-1 flex items-center gap-2">
          <Crosshair size={12} />
          <span className="font-mono text-[10px] tracking-widest uppercase">Target Lock: Site Alpha</span>
        </Badge>
      </div>

      <div className="absolute bottom-4 right-4 z-[1000] bg-zinc-900/80 border border-lime-500/30 backdrop-blur-md p-2 rounded text-[9px] font-mono text-lime-500/70">
        LAT: {contractorLocation[0].toFixed(4)}<br/>
        LNG: {contractorLocation[1].toFixed(4)}
      </div>

      <MapContainer 
        center={jobLocation} 
        zoom={17} 
        scrollWheelZoom={false}
        className="h-full w-full grayscale contrast-125 invert-[0.05]"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Job Site Boundaries */}
        <Polygon 
          positions={boundaries}
          pathOptions={ { 
            color: '#84cc16', 
            fillColor: '#84cc16', 
            fillOpacity: 0.1, 
            weight: 2,
            dashArray: '5, 10'
          } }
        />

        {/* Inner Safety Zone */}
        <Circle 
          center={jobLocation} 
          radius={15} 
          pathOptions={ { color: '#ef4444', weight: 1, fillOpacity: 0.05, dashArray: '2, 5' } } 
        />

        {/* Contractor Marker */}
        <Marker position={contractorLocation} icon={contractorIcon}>
          <Popup className="font-mono text-xs">Contractor Unit: Delta-1</Popup>
        </Marker>

        {/* Job Center Target */}
        <Marker position={jobLocation}>
          <Popup className="font-mono text-xs">Primary Objective</Popup>
        </Marker>
      </MapContainer>

      {/* Futuristic Scanline Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] z-[1001] opacity-30" />
    </Card>
  );
}
