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
import { DataTable } from "../../components/common/DataTable";
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
import { QUALITY_TEST_RESULTS } from "../../constants";
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
      return response.data;
    },
  });

  const getResultBadge = (result: string) => {
    const badgeMap = {
      pass: { variant: "default" as const, label: "Réussi" },
      fail: { variant: "destructive" as const, label: "Échec" },
    };
    const config = badgeMap[result as keyof typeof badgeMap] || {
      variant: "secondary" as const,
      label: result,
    };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const columns = [
    {
      key: "lotId" as const,
      header: "Lot",
      cell: (control: QualityControl) => (
        <div>
          <p className="font-mono text-sm">{control.lotId}</p>
          <p className="text-xs text-muted-foreground">
            {control.seedLot.variety.name}
          </p>
        </div>
      ),
    },
    {
      key: "controlDate" as const,
      header: "Date",
      cell: (control: QualityControl) => formatDate(control.controlDate),
    },
    {
      key: "germinationRate" as const,
      header: "Germination",
      cell: (control: QualityControl) => `${control.germinationRate}%`,
    },
    {
      key: "varietyPurity" as const,
      header: "Pureté",
      cell: (control: QualityControl) => `${control.varietyPurity}%`,
    },
    {
      key: "result" as const,
      header: "Résultat",
      cell: (control: QualityControl) => getResultBadge(control.result),
    },
    {
      key: "inspector" as const,
      header: "Inspecteur",
      cell: (control: QualityControl) => control.inspector.name,
    },
    {
      key: "actions" as const,
      header: "Actions",
      cell: (control: QualityControl) => (
        <div className="flex space-x-1">
          <Button asChild variant="ghost" size="icon" className="h-8 w-8">
            <Link to={`/quality/${control.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <FileText className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

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
            <Link to="/quality/create">
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
                setFilters((prev) => ({ ...prev, result: value || undefined }))
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Résultat" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous les résultats</SelectItem>
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

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FlaskConical className="h-5 w-5 mr-2" />
            {data?.meta?.totalCount || 0} contrôle(s) trouvé(s)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={data?.data || []}
            columns={columns}
            loading={isLoading}
            emptyMessage="Aucun contrôle qualité trouvé"
          />

          {/* Pagination */}
          {data?.meta && (
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
