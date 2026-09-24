import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useAuthStore } from '../../store/authStore';
import { MapPin, Navigation, SignalHigh, Car, Clock, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Default center (India)
const defaultCenter = [20.5937, 78.9629];

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Car Icon
const carIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3204/3204098.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40]
});

export default function Location() {
  const { superAdminToken, adminToken } = useAuthStore();
  const token = superAdminToken || adminToken;

  const [mapsApiKey, setMapsApiKey] = useState(null);
  const [activeDrivers, setActiveDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [map, setMap] = useState(null);

  // Fetch config and initial snapshot
  const initializeTracking = async () => {
    try {
      // 1. Get Geoapify API Key from Backend
      const configRes = await axios.get(`${API_URL}/api/config`);
      if (configRes.data.success) {
        setMapsApiKey(configRes.data.data.apiKeys?.geoapify);
      }

      // 2. Fetch Active Drivers
      const { data } = await axios.get(`${API_URL}/api/admins/operations/active-drivers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) {
        setActiveDrivers(data.data);
      }
    } catch (error) {
      console.error('Error initializing tracking:', error);
    }
  };

  useEffect(() => {
    initializeTracking();

    // 2. Connect to Socket.io
    const socket = io(API_URL, {
      withCredentials: true
    });

    socket.on('connect', () => {
      console.log('Connected to socket tracking server');
      socket.emit('admin_connect');
    });

    socket.on('admin_driver_update', (drivers) => {
      console.log('Received active drivers update:', drivers);
      setActiveDrivers(drivers);
    });

    return () => {
      socket.disconnect();
    };
    // eslint-disable-next-line
  }, [token]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  };

  return (
    <div className="p-4 md:p-6 h-full flex flex-col space-y-4">
      {/* Header Panel */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center shrink-0">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center relative">
            <MapPin className="w-5 h-5" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Live Operations Map</h2>
            <p className="text-xs text-gray-500 flex items-center">
              <SignalHigh className="w-3 h-3 text-green-500 mr-1" />
              Tracking {activeDrivers.length} drivers in real-time
            </p>
          </div>
        </div>
        
        {/* Active Driver Badges */}
        <div className="hidden md:flex space-x-2 overflow-x-auto max-w-md no-scrollbar">
          {activeDrivers.map(d => (
            <button 
              key={d.driverId}
              onClick={() => {
                setSelectedDriver(d);
                if (map && d.location) {
                  map.setView([d.location.lat, d.location.lng], 15);
                }
              }}
              className="flex items-center space-x-2 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 border border-gray-200 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-700 transition-colors whitespace-nowrap"
            >
              <Car className="w-3 h-3" />
              <span>{d.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative" style={{ height: 'calc(100vh - 160px)' }}>
        {!mapsApiKey ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 text-gray-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
            <p className="font-semibold text-sm">Loading Configuration...</p>
          </div>
        ) : (
          <MapContainer 
            center={activeDrivers.length > 0 && activeDrivers[0].location ? [activeDrivers[0].location.lat, activeDrivers[0].location.lng] : defaultCenter} 
            zoom={5} 
            style={{ height: '100%', width: '100%' }}
            ref={setMap}
          >
            <TileLayer
              url={`https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${mapsApiKey}`}
              attribution='&copy; <a href="https://www.geoapify.com/">Geoapify</a> | &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />

            {activeDrivers.map((driver) => (
              driver.location && driver.location.lat && driver.location.lng && (
                <Marker 
                  key={driver.driverId} 
                  position={[driver.location.lat, driver.location.lng]}
                  icon={carIcon}
                  eventHandlers={{
                    click: () => setSelectedDriver(driver),
                  }}
                >
                  <Popup>
                    <div className="min-w-[150px]">
                      <div className="flex items-center space-x-2 border-b border-gray-100 pb-2 mb-2">
                        <Car className="w-4 h-4 text-blue-600" />
                        <div>
                          <p className="font-bold text-gray-900 text-sm m-0">{driver.name}</p>
                          <p className="text-xs text-gray-500 font-mono m-0">{driver.vehicleNumber}</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 flex items-center m-0">
                        <Navigation className="w-3 h-3 mr-1 text-blue-500" />
                        Status: <span className="ml-1 font-bold text-green-600">Online</span>
                      </p>
                      <p className="text-xs text-gray-500 flex items-center mt-1 m-0">
                        <Clock className="w-3 h-3 mr-1 text-gray-400" />
                        {formatDate(driver.lastUpdated)}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              )
            ))}
          </MapContainer>
        )}

        {/* Floating status indicator */}
        <div className="absolute bottom-6 left-6 z-[1000] bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-lg border border-gray-100 flex items-center space-x-3 pointer-events-none">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
          <p className="text-sm font-bold text-gray-700 m-0">Live Sync Active</p>
        </div>
      </div>
    </div>
  );
}
