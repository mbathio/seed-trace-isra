// frontend/src/pages/parcels/Parcels.tsx - PAGE DE LISTE DES PARCELLES
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Plus, MapPin, Eye, Edit, Download, Search } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
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
import { ApiResponse, PaginationParams, FilterParams } from "../../types/api";
import { formatDate, formatNumber } from "../../utils/formatters";
import { PARCEL_STATUSES, getStatusConfig } from "../../constants";
import { useDebounce } from "../../hooks/useDebounce";
import { usePagination } from "../../hooks/usePagination";

const Parcels: React.FC = () => {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<FilterParams>({});
  const debouncedSearch = useDebounce(search, 300);
  const { pagination, actions } = usePagination({ initialPageSize: 10 });

  const { data, isLoading, error } = useQuery<ApiResponse<Parcel[]>>({
    queryKey: [
      "parcels",
      pagination.page,
      pagination.pageSize,
      debouncedSearch,
      filters,
    ],
    queryFn: async () => {
      const params: PaginationParams & FilterParams = {
        page: pagination.page,
        pageSize: pagination.pageSize,
        search: debouncedSearch || undefined,
        ...filters,
      };

      const response = await api.get("/parcels", { params });
      return response.data;
    },
  });

  const getStatusBadge = (status: string) => {
    const config = getStatusConfig(status, PARCEL_STATUSES);

    const colorClasses = {
      green: "bg-green-100 text-green-800 border-green-200",
      orange: "bg-orange-100 text-orange-800 border-orange-200",
      blue: "bg-blue-100 text-blue-800 border-blue-200",
    };

    const colorClass =
      colorClasses[config.color as keyof typeof colorClasses] ||
      colorClasses.green;

    return (
      <Badge className={`${colorClass} font-medium`}>{config.label}</Badge>
    );
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Parcelles</h1>
          <p className="text-muted-foreground">
            Gérez les parcelles de production
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button asChild>
            <Link to="/dashboard/parcels/create">
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle parcelle
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom, adresse, multiplicateur..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select
              value={filters.status || ""}
              onValueChange={(value) =>
                setFilters((prev) => ({ ...prev, status: value || undefined }))
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous les statuts</SelectItem>
                {PARCEL_STATUSES.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.multiplierId?.toString() || ""}
              onValueChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  multiplierId: value ? parseInt(value) : undefined,
                }))
              }
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Multiplicateur" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous multiplicateurs</SelectItem>
                {/* TODO: Charger la liste des multiplicateurs */}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            {data?.meta?.totalCount || 0} parcelle(s) trouvée(s)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p>Chargement...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Superficie</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Multiplicateur</TableHead>
                  <TableHead>Type de sol</TableHead>
                  <TableHead>Localisation</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.data?.map((parcel) => (
                  <TableRow key={parcel.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {parcel.name || `Parcelle ${parcel.id}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ID: {parcel.id}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {formatNumber(parcel.area)} ha
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(parcel.area * 10000).toLocaleString()} m²
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(parcel.status)}</TableCell>
                    <TableCell>
                      {parcel.multiplier ? (
                        <div>
                          <p className="font-medium">
                            {parcel.multiplier.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {parcel.multiplier.yearsExperience} ans d'exp.
                          </p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">
                          Non assigné
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {parcel.soilType || (
                        <span className="text-muted-foreground">
                          Non spécifié
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-xs font-mono">
                          {parcel.latitude.toFixed(4)},{" "}
                          {parcel.longitude.toFixed(4)}
                        </p>
                        {parcel.address && (
                          <p className="text-xs text-muted-foreground truncate max-w-[120px]">
                            {parcel.address}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-1">
                        <Button
                          asChild
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                        >
                          <Link to={`/dashboard/parcels/${parcel.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          asChild
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                        >
                          <Link to={`/dashboard/parcels/${parcel.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Empty state */}
          {!isLoading && (!data?.data || data.data.length === 0) && (
            <div className="text-center py-12">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Aucune parcelle trouvée
              </h3>
              <p className="text-muted-foreground mb-4">
                {search || filters.status
                  ? "Aucune parcelle ne correspond à vos critères de recherche."
                  : "Commencez par créer votre première parcelle."}
              </p>
              <Button asChild>
                <Link to="/dashboard/parcels/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvelle parcelle
                </Link>
              </Button>
            </div>
          )}

          {/* Pagination */}
          {data?.meta && data.meta.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Page {data.meta.page} sur {data.meta.totalPages} • Total:{" "}
                {data.meta.totalCount} parcelle(s)
              </p>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={actions.previousPage}
                  disabled={!data.meta.hasPreviousPage}
                >
                  Précédent
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={actions.nextPage}
                  disabled={!data.meta.hasNextPage}
                >
                  Suivant
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-2xl font-bold">
                  {data?.data?.filter((p) => p.status === "AVAILABLE").length ||
                    0}
                </p>
                <p className="text-xs text-muted-foreground">Disponibles</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">
                  {data?.data?.filter((p) => p.status === "IN_USE").length || 0}
                </p>
                <p className="text-xs text-muted-foreground">En utilisation</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">
                  {data?.data?.filter((p) => p.status === "RESTING").length ||
                    0}
                </p>
                <p className="text-xs text-muted-foreground">En repos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">
                  {formatNumber(
                    data?.data?.reduce((acc, parcel) => acc + parcel.area, 0) ||
                      0
                  )}
                </p>
                <p className="text-xs text-muted-foreground">Hectares total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Parcels;
