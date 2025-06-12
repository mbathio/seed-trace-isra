// frontend/src/pages/varieties/Varieties.tsx - VERSION CORRIGÉE AVEC CONSTANTES
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Plus, Download, Eye, Edit, Leaf } from "lucide-react";
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
import { Variety } from "../../types/entities";
import { ApiResponse, PaginationParams, FilterParams } from "../../types/api";
import { formatNumber } from "../../utils/formatters";
import { CROP_TYPES, getStatusConfig } from "../../constants"; // ✅ AJOUTÉ: Import des constantes
import { DataTransformer } from "../../utils/transformers"; // ✅ AJOUTÉ: Import du transformateur
import { useDebounce } from "../../hooks/useDebounce";
import { usePagination } from "../../hooks/usePagination";

const Varieties: React.FC = () => {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<FilterParams>({});
  const debouncedSearch = useDebounce(search, 300);
  const { pagination, actions } = usePagination({ initialPageSize: 10 });

  // ✅ CORRIGÉ: Query avec transformation automatique
  const { data, isLoading, error } = useQuery<ApiResponse<Variety[]>>({
    queryKey: [
      "varieties",
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

      const response = await api.get("/varieties", { params });

      // ✅ Transformer les données reçues de l'API
      const transformedData = {
        ...response.data,
        data: response.data.data.map((variety: Variety) =>
          DataTransformer.transformVarietyFromAPI(variety)
        ),
      };

      return transformedData;
    },
  });

  // ✅ CORRIGÉ: Utilisation des constantes pour les badges de type de culture
  const getCropTypeBadge = (cropType: string) => {
    const typeConfig = getStatusConfig(cropType, CROP_TYPES);

    // Couleurs spécifiques pour les types de culture
    const colorClasses = {
      rice: "bg-green-100 text-green-800 border-green-200",
      maize: "bg-yellow-100 text-yellow-800 border-yellow-200",
      peanut: "bg-orange-100 text-orange-800 border-orange-200",
      sorghum: "bg-red-100 text-red-800 border-red-200",
      cowpea: "bg-purple-100 text-purple-800 border-purple-200",
      millet: "bg-blue-100 text-blue-800 border-blue-200",
    };

    const colorClass =
      colorClasses[cropType as keyof typeof colorClasses] ||
      "bg-gray-100 text-gray-800 border-gray-200";

    return (
      <Badge className={`${colorClass} font-medium`}>
        <span className="mr-1">{typeConfig.icon}</span>
        {typeConfig.label}
      </Badge>
    );
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Erreur lors du chargement des variétés</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Variétés</h1>
          <p className="text-muted-foreground">
            Gérez le catalogue des variétés de semences
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button asChild>
            <Link to="/dashboard/varieties/create">
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle variété
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
                placeholder="Rechercher par nom, code, description..."
              />
            </div>

            <Select
              value={filters.cropType || ""}
              onValueChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  cropType: value || undefined,
                }))
              }
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Type de culture" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous les types</SelectItem>
                {/* ✅ CORRIGÉ: Utilisation des constantes */}
                {CROP_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <span className="flex items-center space-x-2">
                      <span>{type.icon}</span>
                      <span>{type.label}</span>
                    </span>
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
          <CardTitle>
            {data?.meta?.totalCount || 0} variété(s) trouvée(s)
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
                  <TableHead>Code</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Maturité</TableHead>
                  <TableHead>Rendement</TableHead>
                  <TableHead>Origine</TableHead>
                  <TableHead>Année</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.data?.map((variety) => (
                  <TableRow key={variety.id}>
                    <TableCell className="font-mono font-medium">
                      {variety.code}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Leaf className="h-4 w-4 text-green-600" />
                        <span className="font-medium">{variety.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getCropTypeBadge(variety.cropType)}</TableCell>
                    <TableCell>{variety.maturityDays} jours</TableCell>
                    <TableCell>
                      {variety.yieldPotential
                        ? `${formatNumber(variety.yieldPotential)} t/ha`
                        : "-"}
                    </TableCell>
                    <TableCell>{variety.origin || "-"}</TableCell>
                    <TableCell>{variety.releaseYear || "-"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-1">
                        <Button
                          asChild
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                        >
                          <Link to={`/dashboard/varieties/${variety.code}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="h-4 w-4" />
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
              <Leaf className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Aucune variété trouvée
              </h3>
              <p className="text-muted-foreground mb-4">
                {search || filters.cropType
                  ? "Aucune variété ne correspond à vos critères de recherche."
                  : "Commencez par ajouter votre première variété."}
              </p>
              <Button asChild>
                <Link to="/dashboard/varieties/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter une variété
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

export default Varieties;
