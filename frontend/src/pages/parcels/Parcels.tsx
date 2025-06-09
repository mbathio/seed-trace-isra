// frontend/src/pages/parcels/Parcels.tsx
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Plus,
  MapPin,
  Eye,
  Edit,
  MoreHorizontal,
  Filter,
  Search,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Input } from "../../components/ui/input";
import { api } from "../../services/api";
import { Parcel } from "../../types/entities";
import { ApiResponse } from "../../types/api";
import { formatNumber } from "../../utils/formatters";
import { useDebounce } from "../../hooks/useDebounce";

const Parcels: React.FC = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading, error } = useQuery<ApiResponse<Parcel[]>>({
    queryKey: ["parcels", debouncedSearch, statusFilter, typeFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (debouncedSearch) params.append("search", debouncedSearch);
      if (statusFilter) params.append("status", statusFilter);
      if (typeFilter) params.append("soilType", typeFilter);

      const response = await api.get(`/parcels?${params.toString()}`);
      return response.data;
    },
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      AVAILABLE: {
        variant: "default" as const,
        label: "Disponible",
        color: "bg-green-100 text-green-800",
      },
      IN_USE: {
        variant: "secondary" as const,
        label: "En cours",
        color: "bg-blue-100 text-blue-800",
      },
      RESTING: {
        variant: "outline" as const,
        label: "En repos",
        color: "bg-yellow-100 text-yellow-800",
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      variant: "outline" as const,
      label: status,
      color: "bg-gray-100 text-gray-800",
    };

    return <Badge className={config.color}>{config.label}</Badge>;
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Erreur lors du chargement des parcelles</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec titre et bouton d'ajout */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Gestion des Parcelles
          </h1>
          <p className="text-muted-foreground">
            Suivi et gestion des parcelles pour la production de semences
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" className="bg-white">
            <Filter className="h-4 w-4 mr-2" />
            Filtres
          </Button>
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une parcelle
          </Button>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <Card className="border-0 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Rechercher une parcelle..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous les statuts</SelectItem>
                <SelectItem value="AVAILABLE">Disponible</SelectItem>
                <SelectItem value="IN_USE">En cours</SelectItem>
                <SelectItem value="RESTING">En repos</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tous les types de sol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous les types</SelectItem>
                <SelectItem value="Argilo-limoneux">Argilo-limoneux</SelectItem>
                <SelectItem value="Sableux">Sableux</SelectItem>
                <SelectItem value="Limono-sableux">Limono-sableux</SelectItem>
                <SelectItem value="Argilo-sableux">Argilo-sableux</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Section des statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {data?.data?.filter((p) => p.status === "AVAILABLE").length || 0}
            </div>
            <p className="text-sm text-muted-foreground">
              Parcelles disponibles
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">
              {data?.data?.filter((p) => p.status === "IN_USE").length || 0}
            </div>
            <p className="text-sm text-muted-foreground">
              En cours d'utilisation
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">
              {data?.data?.filter((p) => p.status === "RESTING").length || 0}
            </div>
            <p className="text-sm text-muted-foreground">En repos</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-purple-600">
              {data?.data?.reduce((sum, p) => sum + p.area, 0).toFixed(1) ||
                "0"}
            </div>
            <p className="text-sm text-muted-foreground">Hectares totaux</p>
          </CardContent>
        </Card>
      </div>

      {/* Grille des parcelles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading
          ? // Skeleton loading
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          : data?.data?.map((parcel) => (
              <Card
                key={parcel.id}
                className="border-0 shadow-sm hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {parcel.name || `Parcelle ${parcel.id}`}
                      </h3>
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <MapPin className="h-4 w-4 mr-1" />
                        {parcel.address || "Localisation non spécifiée"}
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          Voir détails
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Modifier
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Superficie:
                      </span>
                      <span className="font-medium">
                        {formatNumber(parcel.area)} hectares
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Type de sol:
                      </span>
                      <span className="font-medium">
                        {parcel.soilType || "Non spécifié"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Irrigation:
                      </span>
                      <span className="font-medium">
                        {parcel.irrigationSystem || "Non spécifiée"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Statut:
                      </span>
                      {getStatusBadge(parcel.status)}
                    </div>

                    {parcel.multiplier && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Multiplicateur:
                        </span>
                        <span className="font-medium text-sm">
                          {parcel.multiplier.name}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2 mt-4 pt-4 border-t">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-4 w-4 mr-1" />
                      Voir détails
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="h-4 w-4 mr-1" />
                      Modifier
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>

      {!isLoading && (!data?.data || data.data.length === 0) && (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-12 text-center">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Aucune parcelle trouvée
            </h3>
            <p className="text-muted-foreground mb-4">
              {search || statusFilter || typeFilter
                ? "Aucune parcelle ne correspond à vos critères de recherche."
                : "Commencez par ajouter votre première parcelle."}
            </p>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une parcelle
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Parcels;
