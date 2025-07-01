// frontend/src/components/map/LocationPicker.tsx
import React, { useState, useCallback } from "react";
import Map, { Marker, NavigationControl } from "react-map-gl";
import { MapPin } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import "mapbox-gl/dist/mapbox-gl.css";

interface LocationPickerProps {
  latitude: number;
  longitude: number;
  onChange: (coords: { latitude: number; longitude: number }) => void;
  readOnly?: boolean;
}

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

export const LocationPicker: React.FC<LocationPickerProps> = ({
  latitude,
  longitude,
  onChange,
  readOnly = false,
}) => {
  const [viewState, setViewState] = useState({
    longitude,
    latitude,
    zoom: 12,
  });

  const [marker, setMarker] = useState({
    longitude,
    latitude,
  });

  const handleMapClick = useCallback(
    (event: any) => {
      if (readOnly) return;

      const { lng, lat } = event.lngLat;
      setMarker({ longitude: lng, latitude: lat });
      onChange({ latitude: lat, longitude: lng });
    },
    [onChange, readOnly]
  );

  const handleInputChange = (
    field: "latitude" | "longitude",
    value: string
  ) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;

    const newCoords = {
      ...marker,
      [field]: numValue,
    };

    setMarker(newCoords);
    setViewState({
      ...viewState,
      ...newCoords,
    });
    onChange(newCoords);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="latitude">Latitude</Label>
          <Input
            id="latitude"
            type="number"
            step="any"
            value={marker.latitude}
            onChange={(e) => handleInputChange("latitude", e.target.value)}
            readOnly={readOnly}
          />
        </div>
        <div>
          <Label htmlFor="longitude">Longitude</Label>
          <Input
            id="longitude"
            type="number"
            step="any"
            value={marker.longitude}
            onChange={(e) => handleInputChange("longitude", e.target.value)}
            readOnly={readOnly}
          />
        </div>
      </div>

      <div className="h-96 rounded-lg overflow-hidden border">
        <Map
          {...viewState}
          onMove={(evt) => setViewState(evt.viewState)}
          mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
          mapboxAccessToken={MAPBOX_TOKEN}
          onClick={handleMapClick}
          style={{ width: "100%", height: "100%" }}
          cursor={readOnly ? "default" : "pointer"}
        >
          <NavigationControl position="top-right" />

          <Marker
            longitude={marker.longitude}
            latitude={marker.latitude}
            anchor="bottom"
            draggable={!readOnly}
            onDragEnd={(evt: mapboxgl.MapLayerMouseEvent) => {
              const { lng, lat } = evt.lngLat;
              setMarker({ longitude: lng, latitude: lat });
              onChange({ latitude: lat, longitude: lng });
            }}
          >
            <MapPin className="h-8 w-8 text-red-500" fill="currentColor" />
          </Marker>
        </Map>
      </div>

      {!readOnly && (
        <p className="text-sm text-muted-foreground">
          Cliquez sur la carte ou glissez le marqueur pour sélectionner une
          position
        </p>
      )}
    </div>
  );
};
