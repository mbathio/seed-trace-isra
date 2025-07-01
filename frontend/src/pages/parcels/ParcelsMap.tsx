import React from "react";
import { MapboxMap } from "../../components/map/MapboxMap";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Parcel } from "../../types/entities";
import { formatNumber } from "../../utils/formatters";

interface ParcelsMapProps {
  parcels: Parcel[];
}

export const ParcelsMap: React.FC<ParcelsMapProps> = ({ parcels }) => {
  const mapLocations = parcels.map((parcel: Parcel) => ({
    id: parcel.id,
    latitude: parcel.latitude,
    longitude: parcel.longitude,
    name: parcel.name || `Parcelle ${parcel.code}`,
    type: "parcel" as const,
    details: {
      surface: `${formatNumber(parcel.area)} ha`,
      statut: parcel.status,
      multiplicateur: parcel.multiplier?.name || "Non assigné",
    },
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Carte des parcelles</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <MapboxMap
          locations={mapLocations}
          height="600px"
          onMarkerClick={(location) => {
            console.log("Parcelle cliquée:", location);
            // Vous pouvez naviguer vers les détails
            // navigate(`/dashboard/parcels/${location.id}`);
          }}
        />
      </CardContent>
    </Card>
  );
};
