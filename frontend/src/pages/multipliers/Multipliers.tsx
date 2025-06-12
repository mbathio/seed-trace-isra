// frontend/src/pages/multipliers/Multipliers.tsx - CONTENU CORRIGÉ
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Plus, Download, Eye, Users, MapPin, Star } from "lucide-react";
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
import { api } from "../../services/api";
import { Multiplier } from "../../types/entities";
import { ApiResponse, PaginationParams, FilterParams } from "../../types/api";
import {
  MULTIPLIER_STATUSES,
  CERTIFICATION_LEVELS,
  CROP_TYPES,
  getStatusConfig,
} from "../../constants";
import { DataTransformer } from "../../utils/transformers";
import { useDebounce } from "../../hooks/useDebounce";
import { usePagination } from "../../hooks/usePagination";

const Multipliers: React.FC = () => {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<FilterParams>({});
  const debouncedSearch = useDebounce(search, 300);
  const { pagination, actions } = usePagination({ initialPageSize: 10 });

  const { data, isLoading, error } = useQuery<ApiResponse<Multiplier[]>>({
    queryKey: [
      "multipliers",
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

      const response = await api.get("/multipliers", { params });

      const transformedData = {
        ...response.data,
        data: response.data.data.map((multiplier: any) =>
          DataTransformer.transformMultiplierFromAPI(multiplier)
        ),
      };

      return transformedData;
    },
  });

  const getStatusBadge = (status: string) => {
    const config = getStatusConfig(status, MULTIPLIER_STATUSES);
    const colorClasses = {
      green: "bg-green-100 text-green-800 border-green-200",
      gray: "bg-gray-100 text-gray-800 border-gray-200",
    };

    const colorClass =
      colorClasses[config.color as keyof typeof colorClasses] ||
      colorClasses.gray;

    return (
      <Badge className={`${colorClass} font-medium`}>{config.label}</Badge>
    );
  };

  const getCertificationBadge = (level: string) => {
    const config = getStatusConfig(level, CERTIFICATION_LEVELS);
    const colorClasses = {
      yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
      blue: "bg-blue-100 text-blue-800 border-blue-200",
      green: "bg-green-100 text-green-800 border-green-200",
    };

    const colorClass =
      colorClasses[config.color as keyof typeof colorClasses] ||
      colorClasses.blue;
    const stars =
      config.experience === "0-2 ans"
        ? 1
        : config.experience === "2-5 ans"
        ? 2
        : 3;

    return (
      <div className="flex items-center space-x-2">
        <Badge className={`${colorClass} font-medium`}>{config.label}</Badge>
        <div className="flex">
          {Array.from({ length: 3 }).map((_, i) => (
            <Star
              key={i}
              className={`h-3 w-3 ${
                i < stars ? "text-yellow-400 fill-current" : "text-gray-300"
              }`}
            />
          ))}
        </div>
      </div>
    );
  };

  const getSpecializationBadge = (specialization: string) => {
    const config = getStatusConfig(specialization, CROP_TYPES);
    return (
      <Badge variant="outline" className="text-xs">
        <span className="mr-1">{config.icon}</span>
        {config.label}
      </Badge>
    );
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">
          Erreur lors du chargement des multiplicateurs
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Multiplicateurs</h1>
          <p className="text-muted-foreground">
            Gérez les multiplicateurs de semences
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button asChild>
            <Link to="/dashboard/multipliers/create">
              <Plus className="h-4 w-4 mr-2" />
              Nouveau multiplicateur
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
                placeholder="Rechercher par nom, adresse..."
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
                {MULTIPLIER_STATUSES.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.certificationLevel || ""}
              onValueChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  certificationLevel: value || undefined,
                }))
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Certification" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous les niveaux</SelectItem>
                {CERTIFICATION_LEVELS.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
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
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            {data?.meta?.totalCount || 0} multiplicateur(s) trouvé(s)
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
                  <TableHead>Statut</TableHead>
                  <TableHead>Certification</TableHead>
                  <TableHead>Expérience</TableHead>
                  <TableHead>Localisation</TableHead>
                  <TableHead>Spécialisations</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.data?.map((multiplier) => (
                  <TableRow key={multiplier.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{multiplier.name}</p>
                        {multiplier.email && (
                          <p className="text-xs text-muted-foreground">
                            {multiplier.email}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(multiplier.status)}</TableCell>
                    <TableCell>
                      {getCertificationBadge(multiplier.certificationLevel)}
                    </TableCell>
                    <TableCell>{multiplier.yearsExperience} ans</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{multiplier.address}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {multiplier.specialization
                          ?.slice(0, 2)
                          .map((spec, index) => (
                            <span key={index}>
                              {getSpecializationBadge(spec)}
                            </span>
                          ))}
                        {multiplier.specialization &&
                          multiplier.specialization.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{multiplier.specialization.length - 2}
                            </Badge>
                          )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                      >
                        <Link to={`/dashboard/multipliers/${multiplier.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Empty state */}
          {!isLoading && (!data?.data || data.data.length === 0) && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Aucun multiplicateur trouvé
              </h3>
              <p className="text-muted-foreground mb-4">
                {search || filters.status
                  ? "Aucun multiplicateur ne correspond à vos critères."
                  : "Commencez par ajouter votre premier multiplicateur."}
              </p>
              <Button asChild>
                <Link to="/dashboard/multipliers/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Nouveau multiplicateur
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

export default Multipliers;
