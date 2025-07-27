import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Plus, FlaskConical, Eye, FileText, Download } from "lucide-react";
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
import { QualityControl } from "../../types/entities";
import { ApiResponse, PaginationParams, FilterParams } from "../../types/api";
import { formatDate } from "../../utils/formatters";
import { QUALITY_TEST_RESULTS, getStatusConfig } from "../../constants";
import { useDebounce } from "../../hooks/useDebounce";
import { usePagination } from "../../hooks/usePagination";

const QualityControls: React.FC = () => {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<FilterParams>({});
  const debouncedSearch = useDebounce(search, 300);
  const { pagination, actions } = usePagination({ initialPageSize: 10 });

  const { data, isLoading, error } = useQuery<ApiResponse<QualityControl[]>>({
    queryKey: [
      "quality-controls",
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

      const response = await api.get("/quality-controls", { params });
      // Les données arrivent déjà transformées depuis le backend
      return response.data;
    },
  });

  const getResultBadge = (result: string) => {
    // Le résultat arrive déjà transformé en minuscules depuis le backend
    const config = getStatusConfig(result, QUALITY_TEST_RESULTS);

    const colorClasses = {
      green: "bg-green-100 text-green-800 border-green-200",
      red: "bg-red-100 text-red-800 border-red-200",
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
        <p className="text-red-600">Erreur lors du chargement des contrôles</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Contrôles qualité</h1>
          <p className="text-muted-foreground">
            Gérez les tests et certifications
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button asChild>
            <Link to="/dashboard/quality-controls/create">
              <Plus className="h-4 w-4 mr-2" />
              Nouveau contrôle
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
                placeholder="Rechercher par lot, variété, inspecteur..."
              />
            </div>

            <Select
              value={filters.result || ""}
              onValueChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  result: value === "tous" ? undefined : value,
                }))
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Résultat" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Tous les résultats</SelectItem>
                {QUALITY_TEST_RESULTS.map((result) => (
                  <SelectItem key={result.value} value={result.value}>
                    {result.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FlaskConical className="h-5 w-5 mr-2" />
            {data?.meta?.totalCount || 0} contrôle(s) trouvé(s)
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
                  <TableHead>Lot</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Germination</TableHead>
                  <TableHead>Pureté</TableHead>
                  <TableHead>Résultat</TableHead>
                  <TableHead>Inspecteur</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.data?.map((control) => (
                  <TableRow key={control.id}>
                    <TableCell>
                      <div>
                        <Link
                          to={`/dashboard/seed-lots/${control.lotId}`}
                          className="font-mono text-sm text-blue-600 hover:underline"
                        >
                          {control.lotId}
                        </Link>
                        {control.seedLot && (
                          <p className="text-xs text-muted-foreground">
                            {control.seedLot.variety.name}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(control.controlDate)}</TableCell>
                    <TableCell>
                      <span
                        className={`font-medium ${
                          control.germinationRate >= 85
                            ? "text-green-600"
                            : control.germinationRate >= 70
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        {control.germinationRate}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`font-medium ${
                          control.varietyPurity >= 95
                            ? "text-green-600"
                            : control.varietyPurity >= 85
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        {control.varietyPurity}%
                      </span>
                    </TableCell>
                    <TableCell>{getResultBadge(control.result)}</TableCell>
                    <TableCell>{control.inspector.name}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-1">
                        <Button
                          asChild
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                        >
                          <Link
                            to={`/dashboard/quality-controls/${control.id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        {control.certificateUrl && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                              // Télécharger le certificat
                              window.open(control.certificateUrl, "_blank");
                            }}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        )}
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
              <FlaskConical className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Aucun contrôle qualité trouvé
              </h3>
              <p className="text-muted-foreground mb-4">
                {search || filters.result
                  ? "Aucun contrôle ne correspond à vos critères de recherche."
                  : "Commencez par effectuer votre premier contrôle qualité."}
              </p>
              <Button asChild>
                <Link to="/dashboard/quality-controls/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Nouveau contrôle
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

export default QualityControls;
