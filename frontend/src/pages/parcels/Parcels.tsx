// frontend/src/pages/parcels/Parcels.tsx - VERSION COMPLÈTE AVEC ITINÉRAIRES ET CRUD

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus,
  Download,
  Eye,
  MapPin,
  Droplets,
  TreePine,
  List,
  Map,
  Edit,
  Trash2,
  MoreVertical,
  FileText,
  Navigation,
} from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { SearchInput } from "../../components/forms/SearchInput";
import { MapboxMapWithRoutes } from "../../components/map/MapboxMapWithRoutes";
import { DeleteParcelDialog } from "./DeleteParcelDialog";
import { api } from "../../services/api";
import { parcelService } from "../../services/parcelService";
import { Parcel } from "../../types/entities";
import { ApiResponse, PaginationParams, FilterParams } from "../../types/api";
import { PARCEL_STATUSES, getStatusConfig } from "../../constants";
import { useDebounce } from "../../hooks/useDebounce";
import { usePagination } from "../../hooks/usePagination";
import { formatNumber } from "../../utils/formatters";

const Parcels: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<FilterParams>({});
  const [activeTab, setActiveTab] = useState("list");
  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [exportFormat, setExportFormat] = useState<"csv" | "xlsx" | "pdf">(
    "csv"
  );

  const debouncedSearch = useDebounce(search, 300);
  const { pagination, actions } = usePagination({ initialPageSize: 10 });

  // Obtenir la position de l'utilisateur au chargement
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Erreur de géolocalisation:", error);
        }
      );
    }
  }, []);

  // Query pour la liste avec pagination
  const { data, isLoading, error, refetch } = useQuery<ApiResponse<Parcel[]>>({
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
        includeRelations: true,
        ...filters,
      };

      const response = await api.get("/parcels", { params });
      return response.data;
    },
  });

  // Query séparée pour la carte (toutes les parcelles sans pagination)
  const { data: allParcelsData, isLoading: isLoadingMap } = useQuery<
    ApiResponse<Parcel[]>
  >({
    queryKey: ["parcels-map", debouncedSearch, filters],
    queryFn: async () => {
      const params: Record<string, any> = {
        pageSize: 1000, // Récupérer toutes les parcelles pour la carte
        search: debouncedSearch || undefined,
        includeRelations: true,
        ...filters,
      };

      const response = await api.get("/parcels", { params });
      return response.data;
    },
    enabled: activeTab === "map", // Ne charger que si on est sur l'onglet carte
  });

  // Query pour les statistiques
  const { data: statistics } = useQuery({
    queryKey: ["parcel-statistics"],
    queryFn: parcelService.getStatistics,
  });

  const getStatusBadge = (status: string) => {
    const config = getStatusConfig(status, PARCEL_STATUSES);
    return (
      <Badge variant={config.variant || "default"} className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getParcelFeatures = (parcel: Parcel) => {
    const features = [];

    if (parcel.irrigationSystem) {
      features.push(
        <div
          key="irrigation"
          className="flex items-center text-xs text-muted-foreground"
        >
          <Droplets className="h-3 w-3 mr-1" />
          {parcel.irrigationSystem}
        </div>
      );
    }

    if (parcel.soilType) {
      features.push(
        <div
          key="soil"
          className="flex items-center text-xs text-muted-foreground"
        >
          <TreePine className="h-3 w-3 mr-1" />
          {parcel.soilType}
        </div>
      );
    }

    return features.length > 0 ? (
      <div className="space-y-1">{features}</div>
    ) : null;
  };

  const handleExport = async () => {
    try {
      await parcelService.export(exportFormat, filters);
    } catch (error) {
      console.error("Erreur lors de l'export:", error);
    }
  };

  const handleDeleteClick = (parcel: Parcel) => {
    setSelectedParcel(parcel);
    setShowDeleteDialog(true);
  };

  const handleDeleteSuccess = () => {
    refetch();
    navigate("/dashboard/parcels");
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card>
          <CardContent className="pt-6">
            <p className="text-red-600">
              Erreur lors du chargement des parcelles
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Réessayer
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Parcelles</h1>
          <p className="text-muted-foreground">
            Gérez vos parcelles de production
          </p>
        </div>
        <div className="flex space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Format d'export</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setExportFormat("csv");
                  handleExport();
                }}
              >
                <FileText className="h-4 w-4 mr-2" />
                Export CSV
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setExportFormat("xlsx");
                  handleExport();
                }}
              >
                <FileText className="h-4 w-4 mr-2" />
                Export Excel
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setExportFormat("pdf");
                  handleExport();
                }}
              >
                <FileText className="h-4 w-4 mr-2" />
                Export PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
          <div className="grid gap-4 md:grid-cols-4">
            <div className="md:col-span-2">
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Rechercher par nom, code, adresse..."
                className="w-full"
              />
            </div>
            <Select
              value={filters.status || "all"}
              onValueChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  status: value === "all" ? undefined : value,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                {PARCEL_STATUSES.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filters.multiplierId?.toString() || "all"}
              onValueChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  multiplierId: value === "all" ? undefined : parseInt(value),
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Tous les multiplicateurs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les multiplicateurs</SelectItem>
                <SelectItem value="unassigned">Non assignées</SelectItem>
                {/* Ici, vous devriez charger la liste des multiplicateurs */}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs pour Liste et Carte */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Liste
          </TabsTrigger>
          <TabsTrigger value="map" className="flex items-center gap-2">
            <Map className="h-4 w-4" />
            Carte
          </TabsTrigger>
        </TabsList>

        {/* Vue Liste */}
        <TabsContent value="list" className="mt-6">
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-pulse text-muted-foreground">
                    Chargement des parcelles...
                  </div>
                </div>
              ) : data?.data && data.data.length > 0 ? (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Identification</TableHead>
                        <TableHead>Localisation</TableHead>
                        <TableHead>Surface</TableHead>
                        <TableHead>Multiplicateur</TableHead>
                        <TableHead>Caractéristiques</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.data.map((parcel) => (
                        <TableRow key={parcel.id}>
                          <TableCell className="font-medium">
                            <div>
                              <p>{parcel.name || `Parcelle ${parcel.code}`}</p>
                              <p className="text-sm text-muted-foreground">
                                {parcel.code}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-start space-x-1">
                              <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-sm">
                                  {parcel.address || "Non spécifiée"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {parcel.latitude.toFixed(4)},{" "}
                                  {parcel.longitude.toFixed(4)}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <p>{formatNumber(parcel.area)} ha</p>
                          </TableCell>
                          <TableCell>
                            {parcel.multiplier ? (
                              <div>
                                <p className="text-sm">
                                  {parcel.multiplier.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {parcel.multiplier.status === "active"
                                    ? "Actif"
                                    : "Inactif"}
                                </p>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>{getParcelFeatures(parcel)}</TableCell>
                          <TableCell>{getStatusBadge(parcel.status)}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link to={`/dashboard/parcels/${parcel.id}`}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    Voir détails
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link
                                    to={`/dashboard/parcels/${parcel.id}/edit`}
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Modifier
                                  </Link>
                                </DropdownMenuItem>
                                {userLocation && (
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setActiveTab("map");
                                      // Logique pour centrer sur cette parcelle
                                    }}
                                  >
                                    <Navigation className="h-4 w-4 mr-2" />
                                    Voir itinéraire
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleDeleteClick(parcel)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Supprimer
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  {data.meta && data.meta.totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-4 border-t">
                      <p className="text-sm text-muted-foreground">
                        Page {data.meta.page} sur {data.meta.totalPages} •
                        Total: {data.meta.totalCount} parcelle(s)
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
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-2">
                    {search || Object.keys(filters).length > 0
                      ? "Aucune parcelle ne correspond à vos critères"
                      : "Aucune parcelle enregistrée"}
                  </p>
                  <Button asChild>
                    <Link to="/dashboard/parcels/create">
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter une parcelle
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vue Carte avec itinéraires */}
        <TabsContent value="map" className="mt-6">
          {isLoadingMap ? (
            <Card>
              <CardContent className="flex items-center justify-center h-96">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                  <p className="text-muted-foreground">
                    Chargement de la carte...
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : allParcelsData?.data ? (
            <Card>
              <CardContent className="p-0">
                <MapboxMapWithRoutes
                  locations={allParcelsData.data.map((parcel: Parcel) => ({
                    id: parcel.id,
                    latitude: parcel.latitude,
                    longitude: parcel.longitude,
                    name: parcel.name || `Parcelle ${parcel.code}`,
                    type: "parcel" as const,
                    details: {
                      surface: `${formatNumber(parcel.area)} ha`,
                      statut: parcel.status,
                      multiplicateur: parcel.multiplier?.name || "Non assigné",
                      irrigation: parcel.irrigationSystem || "Non spécifié",
                      sol: parcel.soilType || "Non spécifié",
                    },
                  }))}
                  height="600px"
                  userLocation={userLocation || undefined}
                  showRoute={true}
                  onMarkerClick={(location) => {
                    // Option pour naviguer directement
                    if (
                      window.confirm(`Voir les détails de ${location.name} ?`)
                    ) {
                      navigate(`/dashboard/parcels/${location.id}`);
                    }
                  }}
                />
              </CardContent>
            </Card>
          ) : null}
        </TabsContent>
      </Tabs>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-2xl font-bold">
                  {statistics?.disponibles ||
                    data?.data?.filter((p) => p.status === "available")
                      .length ||
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
                  {statistics?.enUtilisation ||
                    data?.data?.filter((p) => p.status === "in-use").length ||
                    0}
                </p>
                <p className="text-xs text-muted-foreground">En utilisation</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-gray-600" />
              <div>
                <p className="text-2xl font-bold">
                  {statistics?.auRepos ||
                    data?.data?.filter((p) => p.status === "resting").length ||
                    0}
                </p>
                <p className="text-xs text-muted-foreground">Au repos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <TreePine className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">
                  {formatNumber(
                    statistics?.surfaceTotale ||
                      data?.data?.reduce((sum, p) => sum + p.area, 0) ||
                      0
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  Surface totale (ha)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog de suppression */}
      <DeleteParcelDialog
        parcel={selectedParcel}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
};

export default Parcels;
