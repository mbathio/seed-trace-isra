// frontend/src/pages/seeds/SeedLots.tsx - VERSION CORRIGÉE AVEC CONSTANTES
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Plus, Download, Eye, QrCode } from "lucide-react";
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
import { SearchInput } from "../../components/forms/SearchInput";
import { seedLotService } from "../../services/seedLotService";
import { SeedLot } from "../../types/entities";
import { ApiResponse, PaginationParams, FilterParams } from "../../types/api";
import { formatDate, formatNumber } from "../../utils/formatters";
import { SEED_LEVELS, LOT_STATUSES, getStatusConfig } from "../../constants"; // ✅ AJOUTÉ: Import des constantes et utilitaires
import { DataTransformer } from "../../utils/transformers"; // ✅ AJOUTÉ: Import du transformateur
import { useDebounce } from "../../hooks/useDebounce";
import { usePagination } from "../../hooks/usePagination";

const SeedLots: React.FC = () => {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<FilterParams>({});
  const debouncedSearch = useDebounce(search, 300);
  const { pagination, actions } = usePagination({ initialPageSize: 10 });

  // ✅ CORRIGÉ: Query avec transformation automatique
  const { data, isLoading, error } = useQuery<ApiResponse<SeedLot[]>>({
    queryKey: [
      "seed-lots",
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

      const response = await seedLotService.getAll(params);

      // ✅ Transformer les données reçues de l'API
      const transformedData = {
        ...response.data,
        data: response.data.data.map((lot) =>
          DataTransformer.transformSeedLotFromAPI(lot)
        ),
      };

      return transformedData;
    },
  });

  // ✅ CORRIGÉ: Utilisation des constantes pour les badges de statut
  const getStatusBadge = (status: string) => {
    const config = getStatusConfig(status, LOT_STATUSES);
    const colorClasses = {
      orange: "bg-orange-100 text-orange-800 border-orange-200",
      green: "bg-green-100 text-green-800 border-green-200",
      red: "bg-red-100 text-red-800 border-red-200",
      blue: "bg-blue-100 text-blue-800 border-blue-200",
      emerald: "bg-emerald-100 text-emerald-800 border-emerald-200",
      purple: "bg-purple-100 text-purple-800 border-purple-200",
      gray: "bg-gray-100 text-gray-800 border-gray-200",
    };

    const colorClass =
      colorClasses[config.color as keyof typeof colorClasses] ||
      colorClasses.gray;

    return (
      <Badge className={`${colorClass} font-medium`}>{config.label}</Badge>
    );
  };

  // ✅ CORRIGÉ: Fonction pour les badges de niveau (niveaux restent identiques UI/DB)
  const getLevelBadge = (level: string) => {
    const colors: Record<string, string> = {
      GO: "bg-red-100 text-red-800 border-red-200",
      G1: "bg-orange-100 text-orange-800 border-orange-200",
      G2: "bg-yellow-100 text-yellow-800 border-yellow-200",
      G3: "bg-green-100 text-green-800 border-green-200",
      G4: "bg-blue-100 text-blue-800 border-blue-200",
      R1: "bg-purple-100 text-purple-800 border-purple-200",
      R2: "bg-pink-100 text-pink-800 border-pink-200",
    };

    const colorClass =
      colors[level] || "bg-gray-100 text-gray-800 border-gray-200";

    return (
      <Badge className={`${colorClass} font-medium font-mono`}>{level}</Badge>
    );
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Erreur lors du chargement des lots</p>
        <p className="text-sm text-muted-foreground mt-2">
          Vérifiez que le serveur backend est démarré sur le port 3001
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Lots de semences</h1>
          <p className="text-muted-foreground">
            Gérez vos lots de semences et leur traçabilité
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button asChild>
            <Link to="/dashboard/seeds/create">
              <Plus className="h-4 w-4 mr-2" />
              Nouveau lot
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Rechercher par ID, variété, notes..."
              />
            </div>

            <Select
              value={filters.level || ""}
              onValueChange={(value) =>
                setFilters((prev) => ({ ...prev, level: value || undefined }))
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Niveau" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous les niveaux</SelectItem>
                {/* ✅ CORRIGÉ: Utilisation des constantes */}
                {SEED_LEVELS.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

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
                {/* ✅ CORRIGÉ: Utilisation des constantes */}
                {LOT_STATUSES.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle>{data?.meta?.totalCount || 0} lot(s) trouvé(s)</CardTitle>
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
                  <TableHead>ID</TableHead>
                  <TableHead>Variété</TableHead>
                  <TableHead>Niveau</TableHead>
                  <TableHead>Quantité</TableHead>
                  <TableHead>Production</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Multiplicateur</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.data?.map((lot) => (
                  <TableRow key={lot.id}>
                    <TableCell className="font-mono">{lot.id}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{lot.variety.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {lot.variety.code}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{getLevelBadge(lot.level)}</TableCell>
                    <TableCell>{formatNumber(lot.quantity)} kg</TableCell>
                    <TableCell>{formatDate(lot.productionDate)}</TableCell>
                    <TableCell>{getStatusBadge(lot.status)}</TableCell>
                    <TableCell>{lot.multiplier?.name || "-"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-1">
                        <Button
                          asChild
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                        >
                          <Link to={`/dashboard/seeds/${lot.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <QrCode className="h-4 w-4" />
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
              <p className="text-muted-foreground mb-4">
                {search || filters.level || filters.status
                  ? "Aucun lot ne correspond à vos critères de recherche."
                  : "Aucun lot de semences trouvé."}
              </p>
              <Button asChild>
                <Link to="/dashboard/seeds/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Créer le premier lot
                </Link>
              </Button>
            </div>
          )}

          {/* Pagination */}
          {data?.meta && data.meta.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Page {data.meta.page} sur {data.meta.totalPages}
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
    </div>
  );
};

export default SeedLots;
