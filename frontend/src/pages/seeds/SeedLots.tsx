// frontend/src/pages/seeds/SeedLots.tsx - VERSION CORRIGÉE

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Plus, Download, Eye, Package, QrCode, Leaf } from "lucide-react";
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
import { SearchInput } from "../../components/forms/SearchInput";
import { api } from "../../services/api";
import { SeedLot } from "../../types/entities";
import { ApiResponse, PaginationParams, FilterParams } from "../../types/api";
import {
  SEED_LEVELS,
  LOT_STATUSES,
  getStatusConfig,
  getSeedLevelConfig,
} from "../../constants";
import { useDebounce } from "../../hooks/useDebounce";
import { usePagination } from "../../hooks/usePagination";
import { formatDate, formatNumber } from "../../utils/formatters";

const SeedLots: React.FC = () => {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<FilterParams>({});
  const debouncedSearch = useDebounce(search, 300);
  const { pagination, actions } = usePagination({ initialPageSize: 10 });

  const { data, isLoading, error } = useQuery<ApiResponse<SeedLot[]>>({
    queryKey: [
      "seedLots",
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

      const response = await api.get("/seed-lots", { params });

      // Les données arrivent déjà transformées depuis le backend
      return response.data;
    },
  });

  const getStatusBadge = (status: string) => {
    // Le status arrive maintenant en minuscules grâce au middleware
    const config = getStatusConfig(status, LOT_STATUSES);
    return (
      <Badge variant={config.variant || "default"} className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getLevelBadge = (level: string) => {
    // Le niveau arrive maintenant en minuscules grâce au middleware
    const config = getSeedLevelConfig(level);
    return (
      <Badge variant="outline" className={config.color}>
        {config.label}
      </Badge>
    );
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card>
          <CardContent className="pt-6">
            <p className="text-red-600">
              Erreur lors du chargement des lots de semences
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
          <h1 className="text-3xl font-bold tracking-tight">
            Lots de Semences
          </h1>
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
            <Link to="/dashboard/seed-lots/create">
              <Plus className="h-4 w-4 mr-2" />
              Nouveau lot
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
                placeholder="Rechercher par code, variété, multiplicateur..."
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
                {LOT_STATUSES.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filters.level || "all"}
              onValueChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  level: value === "all" ? undefined : value.toUpperCase(),
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Tous les niveaux" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les niveaux</SelectItem>
                {SEED_LEVELS.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-pulse text-muted-foreground">
                Chargement des lots de semences...
              </div>
            </div>
          ) : data?.data && data.data.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code du lot</TableHead>
                    <TableHead>Variété</TableHead>
                    <TableHead>Niveau</TableHead>
                    <TableHead>Quantité</TableHead>
                    <TableHead>Production</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.data.map((lot) => (
                    <TableRow key={lot.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <QrCode className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p>{lot.id}</p>
                            {lot.batchNumber && (
                              <p className="text-sm text-muted-foreground">
                                Lot: {lot.batchNumber}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {lot.variety ? (
                          <div className="flex items-center space-x-2">
                            <Leaf className="h-4 w-4 text-green-600" />
                            <div>
                              <p>{lot.variety.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {lot.variety.code}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>{getLevelBadge(lot.level)}</TableCell>
                      <TableCell>
                        <div>
                          <p>{formatNumber(lot.quantity)} kg</p>
                          <p className="text-sm text-muted-foreground">
                            {formatNumber(lot.availableQuantity)} disponible
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{formatDate(lot.productionDate)}</p>
                          {lot.expiryDate && (
                            <p className="text-muted-foreground">
                              Exp: {formatDate(lot.expiryDate)}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(lot.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/dashboard/seed-lots/${lot.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {data.meta && data.meta.totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Page {data.meta.page} sur {data.meta.totalPages} • Total:{" "}
                    {data.meta.totalCount} lot(s)
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
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-2">
                {search || Object.keys(filters).length > 0
                  ? "Aucun lot ne correspond à vos critères"
                  : "Aucun lot de semences enregistré"}
              </p>
              <Button asChild>
                <Link to="/dashboard/seed-lots/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Créer un lot
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Package className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-2xl font-bold">
                  {data?.data?.filter((l) => l.status === "certified").length ||
                    0}
                </p>
                <p className="text-xs text-muted-foreground">Certifiés</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Package className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">
                  {data?.data?.filter((l) => l.status === "in-stock").length ||
                    0}
                </p>
                <p className="text-xs text-muted-foreground">En stock</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Package className="h-4 w-4 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">
                  {data?.data?.filter((l) => l.status === "pending").length ||
                    0}
                </p>
                <p className="text-xs text-muted-foreground">En attente</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Package className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">
                  {formatNumber(
                    data?.data?.reduce((sum, l) => sum + l.quantity, 0) || 0
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  Quantité totale (kg)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SeedLots;
