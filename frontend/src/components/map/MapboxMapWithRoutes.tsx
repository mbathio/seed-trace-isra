// frontend/src/components/map/MapboxMapWithRoutes.tsx

import React, { useState, useRef, useCallback } from "react";
import Map, {
  Marker,
  Popup,
  NavigationControl,
  FullscreenControl,
  ScaleControl,
  GeolocateControl,
  MapRef,
  Source,
  Layer,
} from "react-map-gl";
import { MapPin, Navigation, X } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import "mapbox-gl/dist/mapbox-gl.css";

interface MapLocation {
  id: string | number;
  latitude: number;
  longitude: number;
  name: string;
  type: "parcel" | "multiplier" | "production";
  details?: any;
}

interface MapboxMapWithRoutesProps {
  locations: MapLocation[];
  center?: { latitude: number; longitude: number };
  zoom?: number;
  height?: string;
  onMarkerClick?: (location: MapLocation) => void;
  userLocation?: { latitude: number; longitude: number };
  showRoute?: boolean;
}

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

// Centre par défaut sur le Sénégal
const DEFAULT_CENTER = {
  latitude: 14.497401,
  longitude: -14.452362,
  zoom: 7,
};

export const MapboxMapWithRoutes: React.FC<MapboxMapWithRoutesProps> = ({
  locations = [],
  center = DEFAULT_CENTER,
  zoom = DEFAULT_CENTER.zoom,
  height = "500px",
  onMarkerClick,
  userLocation,
  showRoute = true,
}) => {
  const [popupInfo, setPopupInfo] = useState<MapLocation | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(
    null
  );
  const [routeData, setRouteData] = useState<any>(null);
  const [routeInfo, setRouteInfo] = useState<{
    distance: number;
    duration: number;
  } | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const mapRef = useRef<MapRef>(null);

  const [viewState, setViewState] = useState({
    longitude: center.longitude,
    latitude: center.latitude,
    zoom: zoom,
  });

  // Fonction pour obtenir l'itinéraire entre deux points
  const getRoute = async (start: [number, number], end: [number, number]) => {
    try {
      setIsLoadingRoute(true);
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?geometries=geojson&access_token=${MAPBOX_TOKEN}`
      );

      if (!response.ok)
        throw new Error("Erreur lors de la récupération de l'itinéraire");

      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        setRouteData(route.geometry);
        setRouteInfo({
          distance: route.distance / 1000, // Convertir en km
          duration: route.duration / 60, // Convertir en minutes
        });
      }
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setIsLoadingRoute(false);
    }
  };

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

  // Fonction pour afficher l'itinéraire vers une parcelle
  const showRouteToLocation = (location: MapLocation) => {
    if (userLocation) {
      setSelectedLocation(location);
      getRoute(
        [userLocation.longitude, userLocation.latitude],
        [location.longitude, location.latitude]
      );
    }
  };

  // Nettoyer l'itinéraire
  const clearRoute = () => {
    setRouteData(null);
    setRouteInfo(null);
    setSelectedLocation(null);
  };

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
        <NavigationControl position="top-right" />
        <FullscreenControl position="top-right" />
        <ScaleControl position="bottom-right" />
        <GeolocateControl
          position="top-left"
          onGeolocate={(e) => {
            console.log("Position actuelle:", e.coords);
          }}
        />

        {/* Marqueur de position utilisateur */}
        {userLocation && (
          <Marker
            longitude={userLocation.longitude}
            latitude={userLocation.latitude}
          >
            <div className="relative">
              <div className="absolute -inset-2 bg-blue-500 rounded-full opacity-25 animate-ping"></div>
              <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white"></div>
            </div>
          </Marker>
        )}

        {/* Marqueurs des parcelles */}
        {locations.map((location) => (
          <Marker
            key={location.id}
            longitude={location.longitude}
            latitude={location.latitude}
            onClick={(e) => {
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

        {/* Affichage de l'itinéraire */}
        {routeData && (
          <Source id="route" type="geojson" data={routeData}>
            <Layer
              id="route"
              type="line"
              layout={{
                "line-join": "round",
                "line-cap": "round",
              }}
              paint={{
                "line-color": "#3b82f6",
                "line-width": 5,
                "line-opacity": 0.75,
              }}
            />
          </Source>
        )}

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
              {showRoute && userLocation && (
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2 w-full"
                  onClick={() => showRouteToLocation(popupInfo)}
                >
                  <Navigation className="h-3 w-3 mr-1" />
                  Itinéraire
                </Button>
              )}
            </div>
          </Popup>
        )}
      </Map>

      {/* Panneau d'informations sur l'itinéraire */}
      {routeInfo && selectedLocation && (
        <Card className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold">
                Itinéraire vers {selectedLocation.name}
              </h4>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6"
                onClick={clearRoute}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {isLoadingRoute ? (
              <p className="text-sm text-muted-foreground">
                Calcul en cours...
              </p>
            ) : (
              <div className="space-y-1 text-sm">
                <p>
                  <span className="font-medium">Distance:</span>{" "}
                  {routeInfo.distance.toFixed(1)} km
                </p>
                <p>
                  <span className="font-medium">Durée estimée:</span>{" "}
                  {routeInfo.duration.toFixed(0)} minutes
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
