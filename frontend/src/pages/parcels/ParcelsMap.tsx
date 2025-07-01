// frontend/src/pages/parcels/ParcelsMap.tsx
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { MapboxMap } from "../../components/map/MapboxMap";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { api } from "../../services/api";
import { Parcel } from "../../types/entities";
import { formatNumber } from "../../utils/formatters";

export const ParcelsMap: React.FC = () => {
  const { data: parcelsResponse, isLoading } = useQuery({
    queryKey: ["parcels-map"],
    queryFn: async () => {
      const response = await api.get("/parcels", {
        params: { pageSize: 100, includeRelations: true },
      });
      return response.data;
    },
  });

  const parcels = parcelsResponse?.data || [];

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

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
