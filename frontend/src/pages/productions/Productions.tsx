// frontend/src/pages/productions/Productions.tsx - CORRECTION DES BALISES JSX

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Plus,
  Tractor,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Calendar,
  User,
  MapPin,
  Package,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { Badge } from "../../components/ui/badge";
import { api } from "../../services/api";
import { Production } from "../../types/entities";
import { formatDate, formatNumber } from "../../utils/formatters";
import { useDebounce } from "../../hooks/useDebounce";
import { PRODUCTION_STATUSES, getStatusConfig } from "../../constants";

// Interfaces corrigées
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: PaginationMeta;
}

interface PaginationMeta {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface ProductionsResponse {
  productions: Production[];
  total: number;
  meta: PaginationMeta;
}

const Productions: React.FC = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  const debouncedSearch = useDebounce(search, 300);

  const {
    data: response,
    isLoading,
    error,
    refetch,
  } = useQuery<ApiResponse<ProductionsResponse>>({
    queryKey: ["productions", debouncedSearch, statusFilter, page, pageSize],
    queryFn: async () => {
      const params: any = {
        page,
        pageSize,
        sortBy: "startDate",
        sortOrder: "desc",
      };

      if (debouncedSearch) {
        params.search = debouncedSearch;
      }

      if (statusFilter && statusFilter !== "all") {
        params.status = statusFilter;
      }

      const response = await api.get("/productions", { params });
      return response.data;
    },
  });

  const productions = response?.data?.productions || [];
  const meta = response?.data?.meta;

  const getStatusBadge = (status: string) => {
    const config = getStatusConfig(status, PRODUCTION_STATUSES);
    const colorClasses = {
      blue: "bg-blue-100 text-blue-800",
      orange: "bg-orange-100 text-orange-800",
      green: "bg-green-100 text-green-800",
      red: "bg-red-100 text-red-800",
    };

    const colorClass =
      colorClasses[config.color as keyof typeof colorClasses] ||
      colorClasses.blue;

    return (
      <Badge className={`${colorClass} font-medium`}>{config.label}</Badge>
    );
  };

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setPage(1);
  };

  const stats = {
    total: meta?.totalCount || 0,
    planned: productions.filter((p: Production) => p.status === "planned")
      .length,
    inProgress: productions.filter(
      (p: Production) => p.status === "in-progress"
    ).length,
    completed: productions.filter((p: Production) => p.status === "completed")
      .length,
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Productions</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Erreur de chargement
              </h3>
              <p className="text-muted-foreground mb-4">
                Impossible de charger les productions
              </p>
              <Button onClick={() => refetch()}>Réessayer</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Tractor className="h-8 w-8 mr-3 text-green-600" />
            Productions
          </h1>
          <p className="text-muted-foreground">
            Suivez les cycles de production de semences
          </p>
        </div>
        <Button asChild>
          <Link to="/dashboard/productions/create">
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle production
          </Link>
        </Button>
      </div>

      {/* Statistiques rapides */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{stats.planned}</p>
                <p className="text-xs text-muted-foreground">Planifiées</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{stats.inProgress}</p>
                <p className="text-xs text-muted-foreground">En cours</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{stats.completed}</p>
                <p className="text-xs text-muted-foreground">Terminées</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filtres et recherche
            </div>
            <Button variant="outline" size="sm" onClick={resetFilters}>
              Réinitialiser
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Recherche */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par lot, multiplicateur..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filtre par statut */}
            <div className="w-full sm:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  {PRODUCTION_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des productions */}
      <Card>
        <CardHeader>
          <CardTitle>Productions ({meta?.totalCount || 0})</CardTitle>
          <CardDescription>
            Liste de tous les cycles de production
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : productions.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Lot</TableHead>
                    <TableHead>Multiplicateur</TableHead>
                    <TableHead>Parcelle</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Début</TableHead>
                    <TableHead>Quantité</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productions.map((production: Production) => (
                    <TableRow key={production.id}>
                      <TableCell className="font-mono">
                        #{production.id}
                      </TableCell>
                      <TableCell>
                        <Link
                          to={`/dashboard/seed-lots/${production.lotId}`}
                          className="text-blue-600 hover:underline font-mono"
                        >
                          {production.lotId}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{production.multiplier?.name || "N/A"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {production.parcel?.name ||
                              `Parcelle ${production.parcel?.id}` ||
                              "N/A"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(production.status)}</TableCell>
                      <TableCell>{formatDate(production.startDate)}</TableCell>
                      <TableCell>
                        {production.plannedQuantity
                          ? `${formatNumber(production.plannedQuantity)} kg`
                          : "N/A"}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link
                                to={`/dashboard/productions/${production.id}`}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Voir détails
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link
                                to={`/dashboard/productions/${production.id}/edit`}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Modifier
                              </Link>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {meta && meta.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {meta.page} sur {meta.totalPages}
                  </p>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={!meta.hasPreviousPage}
                    >
                      Précédent
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={!meta.hasNextPage}
                    >
                      Suivant
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <Tractor className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Aucune production trouvée
              </h3>
              <p className="text-muted-foreground mb-4">
                {search || statusFilter
                  ? "Aucune production ne correspond à vos critères de recherche."
                  : "Commencez par créer votre première production."}
              </p>
              <Button asChild>
                <Link to="/dashboard/productions/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvelle production
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Productions;
