// frontend/src/pages/varieties/Varieties.tsx
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Plus, Search, Filter, Download, Eye, Edit, Leaf } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
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
import { CROP_TYPES } from "../../constants";
import { useDebounce } from "../../hooks/useDebounce";
import { usePagination } from "../../hooks/usePagination";

const Varieties: React.FC = () => {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<FilterParams>({});
  const debouncedSearch = useDebounce(search, 300);
  const { pagination, actions } = usePagination({ initialPageSize: 10 });

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
      return response.data;
    },
  });

  const getCropTypeBadge = (cropType: string) => {
    const typeMap: Record<string, { variant: any; label: string }> = {
      RICE: { variant: "default", label: "Riz" },
      MAIZE: { variant: "secondary", label: "Maïs" },
      PEANUT: { variant: "outline", label: "Arachide" },
      SORGHUM: { variant: "destructive", label: "Sorgho" },
      COWPEA: { variant: "default", label: "Niébé" },
      MILLET: { variant: "secondary", label: "Mil" },
    };

    const config = typeMap[cropType] || { variant: "outline", label: cropType };
    return <Badge variant={config.variant}>{config.label}</Badge>;
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
            <Link to="/varieties/create">
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
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Type de culture" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous les types</SelectItem>
                {CROP_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
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
                          <Link to={`/varieties/${variety.code}`}>
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

export default Varieties;
