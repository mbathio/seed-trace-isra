// frontend/src/components/dashboard/GlobalMap.tsx
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { MapboxMap } from "../map/MapboxMap";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { api } from "../../services/api";

export const GlobalMap: React.FC = () => {
  // Récupérer toutes les entités avec coordonnées
  const { data: parcels } = useQuery({
    queryKey: ["dashboard-parcels"],
    queryFn: async () => {
      const response = await api.get("/parcels", { params: { pageSize: 100 } });
      return response.data.data;
    },
  });

  const { data: multipliers } = useQuery({
    queryKey: ["dashboard-multipliers"],
    queryFn: async () => {
      const response = await api.get("/multipliers", {
        params: { pageSize: 100 },
      });
      return response.data.data;
    },
  });

  // Combiner toutes les locations
  const allLocations = [
    ...(parcels?.map((p: any) => ({
      id: `parcel-${p.id}`,
      latitude: p.latitude,
      longitude: p.longitude,
      name: p.name || `Parcelle ${p.code}`,
      type: "parcel" as const,
      details: { surface: `${p.area} ha`, statut: p.status },
    })) || []),
    ...(multipliers?.map((m: any) => ({
      id: `multiplier-${m.id}`,
      latitude: m.latitude,
      longitude: m.longitude,
      name: m.name,
      type: "multiplier" as const,
      details: {
        certification: m.certificationLevel,
        experience: `${m.yearsExperience} ans`,
      },
    })) || []),
  ];

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Vue globale</CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-1" />
              Parcelles ({parcels?.length || 0})
            </Badge>
            <Badge variant="outline" className="text-blue-600">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-1" />
              Multiplicateurs ({multipliers?.length || 0})
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <MapboxMap locations={allLocations} height="400px" />
      </CardContent>
    </Card>
  );
};
