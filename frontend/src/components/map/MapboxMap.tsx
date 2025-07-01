import React, { useState, useRef, useCallback } from "react";
import Map, {
  Marker,
  Popup,
  NavigationControl,
  FullscreenControl,
  ScaleControl,
  GeolocateControl,
} from "react-map-gl";
import { MapPin } from "lucide-react";
import "mapbox-gl/dist/mapbox-gl.css";

interface MapLocation {
  id: string | number;
  latitude: number;
  longitude: number;
  name: string;
  type: "parcel" | "multiplier" | "production";
  details?: any;
}

interface MapboxMapProps {
  locations: MapLocation[];
  center?: { latitude: number; longitude: number };
  zoom?: number;
  height?: string;
  onMarkerClick?: (location: MapLocation) => void;
}

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

// Centre par défaut sur le Sénégal
const DEFAULT_CENTER = {
  latitude: 14.497401,
  longitude: -14.452362,
  zoom: 7,
};

export const MapboxMap: React.FC<MapboxMapProps> = ({
  locations = [],
  center = DEFAULT_CENTER,
  zoom = DEFAULT_CENTER.zoom,
  height = "500px",
  onMarkerClick,
}) => {
  const [popupInfo, setPopupInfo] = useState<MapLocation | null>(null);
  const mapRef = useRef<any>(null);

  const [viewState, setViewState] = useState({
    longitude: center.longitude,
    latitude: center.latitude,
    zoom: zoom,
  });

  const getMarkerColor = (type: string) => {
    switch (type) {
      case "parcel":
        return "#10b981"; // green
      case "multiplier":
        return "#3b82f6"; // blue
      case "production":
        return "#f59e0b"; // amber
      default:
        return "#6b7280"; // gray
    }
  };

  const handleMarkerClick = useCallback(
    (location: MapLocation) => {
      setPopupInfo(location);
      if (onMarkerClick) {
        onMarkerClick(location);
      }
    },
    [onMarkerClick]
  );

  return (
    <div style={{ height, width: "100%", position: "relative" }}>
      <Map
        ref={mapRef}
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/outdoors-v12"
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: "100%", height: "100%" }}
      >
        {/* Contrôles de navigation */}
        <NavigationControl />
        <FullscreenControl />
        <ScaleControl />
        <GeolocateControl />

        {/* Marqueurs */}
        {locations.map((location) => (
          <Marker
            key={location.id}
            longitude={location.longitude}
            latitude={location.latitude}
            onClick={(e: any) => {
              e.originalEvent.stopPropagation();
              handleMarkerClick(location);
            }}
          >
            <div className="cursor-pointer transform hover:scale-110 transition-transform">
              <MapPin
                className="h-8 w-8"
                style={{ color: getMarkerColor(location.type) }}
                fill={getMarkerColor(location.type)}
              />
            </div>
          </Marker>
        ))}

        {/* Popup */}
        {popupInfo && (
          <Popup
            anchor="top"
            longitude={popupInfo.longitude}
            latitude={popupInfo.latitude}
            onClose={() => setPopupInfo(null)}
            closeButton={true}
            closeOnClick={false}
            className="mapbox-popup"
          >
            <div className="p-2">
              <h3 className="font-semibold text-sm">{popupInfo.name}</h3>
              <p className="text-xs text-gray-600 capitalize">
                {popupInfo.type}
              </p>
              {popupInfo.details && (
                <div className="mt-2 text-xs">
                  {Object.entries(popupInfo.details).map(([key, value]) => (
                    <div key={key}>
                      <span className="font-medium">{key}:</span>{" "}
                      {value as string}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
};
