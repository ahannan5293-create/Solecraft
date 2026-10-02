'use client';

import React, { useEffect, useState } from 'react';
import { ArrowRight, MapPin } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import styles from './StoreMap.module.css';

// PLACEHOLDER — replace with the real store location
const STORE_POSITION: [number, number] = [31.5099, 74.3436]; 

export default function StoreMap() {
  const [mounted, setMounted] = useState(false);
  const [mapDeps, setMapDeps] = useState<any>(null);

  useEffect(() => {
    // Dynamically load leaflet and react-leaflet only on the client
    Promise.all([
      import('leaflet'),
      import('react-leaflet')
    ]).then(([L, ReactLeaflet]) => {
      
      // Create a custom divIcon for our purple pin
      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="
            width: 36px; 
            height: 48px; 
            background-color: #7C6FE8; 
            border-radius: 50% 50% 50% 0; 
            transform: rotate(-45deg); 
            display: flex; 
            align-items: center; 
            justify-content: center;
            box-shadow: 2px 2px 10px rgba(0,0,0,0.3);
          ">
            <div style="
              width: 14px; 
              height: 14px; 
              background-color: white; 
              border-radius: 50%;
            "></div>
          </div>
        `,
        iconSize: [36, 48],
        iconAnchor: [18, 48], // Point of the pin
        popupAnchor: [0, -40] // Where the popup opens relative to the iconAnchor
      });

      setMapDeps({
        MapContainer: ReactLeaflet.MapContainer,
        TileLayer: ReactLeaflet.TileLayer,
        Marker: ReactLeaflet.Marker,
        Popup: ReactLeaflet.Popup,
        customIcon
      });
      setMounted(true);
    });
  }, []);

  if (!mounted || !mapDeps) {
    // Loading skeleton
    return (
      <div className="w-full aspect-square md:aspect-[4/3] lg:aspect-square bg-gray-100 rounded-3xl relative overflow-hidden flex items-center justify-center border border-gray-200 animate-pulse">
        <MapPin className="w-8 h-8 text-gray-300" strokeWidth={2} />
      </div>
    );
  }

  const { MapContainer, TileLayer, Marker, Popup, customIcon } = mapDeps;

  return (
    <div className={`w-full aspect-square md:aspect-[4/3] lg:aspect-square rounded-3xl relative overflow-hidden border border-gray-200 shadow-sm ${styles.mapContainer}`}>
      <MapContainer 
        center={STORE_POSITION} 
        zoom={16} 
        scrollWheelZoom={false} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={false} // We will add it manually to position it bottom-right
      >
        {/* We can use react-leaflet's ZoomControl component if needed, but since we disabled it above, we'd need to import ZoomControl. We can just keep it default and reposition via CSS, but let's re-enable and position it. */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?key=cb1_458r_1_febab36fa251c0021c9bcbd4"
          className={styles.mapTiles}
          detectRetina={true}
        />
        <Marker position={STORE_POSITION} icon={customIcon}>
          <Popup autoPan={true}>
            <div className="flex flex-col gap-2 p-1">
              <h4 className="font-extrabold text-[#0f0f1a] text-base m-0">Solecraft Flagship Store</h4>
              <p className="text-sm text-gray-500 m-0 leading-snug">123 Fashion Street,<br/>Lahore, Pakistan</p>
              <a 
                href={`https://www.google.com/maps/dir/?api=1&destination=${STORE_POSITION[0]},${STORE_POSITION[1]}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6C5CE7] hover:text-[#5a4cdb] mt-1 transition-colors group"
              >
                Get Directions
                <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
              </a>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
