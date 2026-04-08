import { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { collection, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { MapPin, User, Clock, Tag, Coffee, Laptop, BookOpen, Star, Utensils } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { renderToStaticMarkup } from 'react-dom/server';

interface Location {
  id: string;
  title: string;
  description?: string;
  lat: number;
  lng: number;
  userId: string;
  userName: string;
  category: string;
  tags?: string[];
  createdAt: Timestamp;
}

interface MapProps {
  onMapClick: (lat: number, lng: number) => void;
  selectedLocation?: { lat: number, lng: number } | null;
  searchQuery: string;
  activeCategory: string;
}

const CATEGORY_ICONS: Record<string, any> = {
  'Work': <Laptop className="w-5 h-5 text-black" />,
  'Coffee': <Coffee className="w-5 h-5 text-black" />,
  'Study': <BookOpen className="w-5 h-5 text-black" />,
  'Hidden Gem': <Star className="w-5 h-5 text-black" />,
  'Food': <Utensils className="w-5 h-5 text-black" />,
  'Default': <MapPin className="w-5 h-5 text-black" />
};

const createCustomIcon = (category: string) => {
  const iconMarkup = renderToStaticMarkup(
    <div className="w-10 h-10 bg-brand-green border-2 border-black rounded-xl flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200">
      {CATEGORY_ICONS[category] || CATEGORY_ICONS['Default']}
    </div>
  );

  return L.divIcon({
    html: iconMarkup,
    className: 'custom-marker-icon',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
  });
};

export default function Map({ onMapClick, selectedLocation, searchQuery, activeCategory }: MapProps) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 4000);

    const q = query(collection(db, 'locations'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      clearTimeout(timeout);
      const locs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Location[];
      setLocations(locs);
      setLoading(false);
    }, (error) => {
      clearTimeout(timeout);
      console.error('Firestore error:', error.message);
      setLoading(false);
    });

    return () => {
      clearTimeout(timeout);
      unsubscribe();
    };
  }, []);

  const filteredLocations = useMemo(() => {
    return locations.filter(loc => {
      const matchesSearch = loc.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           loc.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           loc.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = activeCategory === 'All' || loc.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [locations, searchQuery, activeCategory]);

  function MapEvents() {
    useMapEvents({
      click(e) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      },
    });
    return null;
  }

  return (
    <div className="h-full w-full relative rounded-2xl overflow-hidden border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      {loading && (
        <div className="absolute inset-0 z-[1000] bg-black flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-white border-t-brand-green rounded-full animate-spin" />
            <p className="text-brand-green font-black uppercase tracking-[0.3em] text-sm">Loading Map...</p>
          </div>
        </div>
      )}
      
      <MapContainer 
        center={[20.5937, 78.9629]} 
        zoom={5} 
        className="h-full w-full"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        <MapEvents />

        {filteredLocations.map((loc) => (
          <Marker 
            key={loc.id} 
            position={[loc.lat, loc.lng]}
            icon={createCustomIcon(loc.category)}
          >
            <Popup className="custom-popup">
              <div className="p-4 min-w-[240px] bg-black text-white">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 bg-brand-green text-black text-[10px] font-black uppercase tracking-widest rounded">
                    {loc.category}
                  </span>
                </div>
                <h3 className="font-black text-xl text-brand-green mb-2 leading-tight">
                  {loc.title}
                </h3>
                {loc.description && (
                  <p className="text-slate-300 text-sm mb-4 leading-relaxed font-medium">
                    {loc.description}
                  </p>
                )}
                
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {loc.tags?.map((tag, i) => (
                    <span key={i} className="px-2 py-1 border border-brand-green text-brand-green text-[10px] font-bold rounded flex items-center gap-1">
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="pt-3 border-t-2 border-brand-green flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 bg-brand-green border border-black rounded-full flex items-center justify-center">
                      <User className="w-3 h-3 text-black" />
                    </div>
                    <span className="text-white">{loc.userName}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-500">
                    <Clock className="w-3 h-3" />
                    <span>{loc.createdAt?.toDate().toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {selectedLocation && (
          <Marker 
            position={[selectedLocation.lat, selectedLocation.lng]}
            icon={L.divIcon({
              className: 'custom-div-icon',
              html: `<div class="w-8 h-8 bg-white border-4 border-black rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-bounce flex items-center justify-center">
                <div class="w-2 h-2 bg-brand-green rounded-full"></div>
              </div>`,
              iconSize: [32, 32],
              iconAnchor: [16, 16]
            })}
          />
        )}
      </MapContainer>
    </div>
  );
}
