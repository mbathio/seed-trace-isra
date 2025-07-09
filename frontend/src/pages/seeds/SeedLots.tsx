// frontend/src/pages/seeds/SeedLots.tsx
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Plus,
  Download,
  Eye,
  Package,
  QrCode,
  Leaf,
  Edit,
  Trash2,
  MoreVertical,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { Input } from "../../components/ui/input";
import { Checkbox } from "../../components/ui/checkbox";
import { QRCodeModal } from "../../components/qr-code/QRCodeModal";
import { DeleteSeedLotDialog } from "../../components/seeds/DeleteSeedLotDialog";
import { api } from "../../services/api";
import { seedLotService } from "../../services/seedLotService";
import { SeedLot } from "../../types/entities";
import { ApiResponse, SeedLotFilters } from "../../types/api";
import {
  SEED_LEVELS,
  LOT_STATUSES,
  getStatusConfig,
  getSeedLevelConfig,
} from "../../constants";
import { useDebounce } from "../../hooks/useDebounce";
import { usePagination } from "../../hooks/usePagination";
import { formatDate, formatNumber } from "../../utils/formatters";
import { toast } from "react-toastify";

// Types pour les filtres
type SeedLevel = "GO" | "G1" | "G2" | "G3" | "G4" | "R1" | "R2";
type SeedLotStatus =
  | "pending"
  | "certified"
  | "rejected"
  | "in-stock"
  | "active"
  | "distributed"
  | "sold";

interface FilterParamsExtended extends Partial<SeedLotFilters> {
  level?: SeedLevel;
  status?: SeedLotStatus;
}

const SeedLots: React.FC = () => {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<FilterParamsExtended>({});
  const [selectedLotForQR, setSelectedLotForQR] = useState<SeedLot | null>(
    null
  );
  const [selectedLotForDelete, setSelectedLotForDelete] =
    useState<SeedLot | null>(null);
  const [selectedLots, setSelectedLots] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const debouncedSearch = useDebounce(search, 300);
  const { pagination, actions } = usePagination({ initialPageSize: 10 });
  const queryClient = useQueryClient();

  // Requête principale pour récupérer les lots
  const { data, isLoading, error, refetch } = useQuery<ApiResponse<SeedLot[]>>({
    queryKey: [
      "seedLots",
      pagination.page,
      pagination.pageSize,
      debouncedSearch,
      filters,
      sortBy,
      sortOrder,
    ],
    queryFn: async () => {
      // Construire les paramètres proprement
      const params: Record<string, any> = {
        page: pagination.page,
        pageSize: pagination.pageSize,
      };

      // Ajouter search seulement si non vide
      if (debouncedSearch) {
        params.search = debouncedSearch;
      }

      // Ajouter les filtres seulement s'ils existent
      if (filters.status) {
        params.status = filters.status;
      }

      if (filters.level) {
        params.level = filters.level;
      }

      // Ajouter le tri
      params.sortBy = sortBy;
      params.sortOrder = sortOrder;
      params.includeRelations = true;

      const response = await api.get("/seed-lots", { params });
      return response.data;
    },
  });

  // Mutation pour supprimer un lot
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await seedLotService.delete(id);
    },
    onSuccess: () => {
      toast.success("Lot supprimé avec succès");
      queryClient.invalidateQueries({ queryKey: ["seedLots"] });
      setSelectedLotForDelete(null);
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Erreur lors de la suppression";
      toast.error(message);
    },
  });

  // Mutation pour export
  const exportMutation = useMutation({
    mutationFn: async (format: "csv" | "xlsx") => {
      return seedLotService.export(format, filters as Partial<SeedLotFilters>);
    },
    onError: () => {
      toast.error("Erreur lors de l'export");
    },
  });

  const getStatusBadge = (status: string) => {
    const config = getStatusConfig(status, LOT_STATUSES);
    return (
      <Badge variant={config.variant || "default"} className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getLevelBadge = (level: string) => {
    const config = getSeedLevelConfig(level);
    return (
      <Badge variant="outline" className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const handleQRClick = (lot: SeedLot) => {
    setSelectedLotForQR(lot);
  };

  const handleDeleteClick = (lot: SeedLot) => {
    setSelectedLotForDelete(lot);
  };

  const confirmDelete = () => {
    if (selectedLotForDelete) {
      deleteMutation.mutate(selectedLotForDelete.id);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = data?.data?.map((lot) => lot.id) || [];
      setSelectedLots(new Set(allIds));
    } else {
      setSelectedLots(new Set());
    }
  };

  const handleSelectLot = (lotId: string, checked: boolean) => {
    const newSelected = new Set(selectedLots);
    if (checked) {
      newSelected.add(lotId);
    } else {
      newSelected.delete(lotId);
    }
    setSelectedLots(newSelected);
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const handleExport = (format: "csv" | "xlsx") => {
    exportMutation.mutate(format);
  };

  const clearFilters = () => {
    setFilters({});
    setSearch("");
    setSortBy("createdAt");
    setSortOrder("desc");
    actions.firstPage();
  };

  const hasActiveFilters = Object.keys(filters).length > 0 || search !== "";

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
              onClick={() => refetch()}
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleExport("csv")}>
                Format CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("xlsx")}>
                Format Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par code, variété, multiplicateur..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select
                value={filters.status || "all"}
                onValueChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    status:
                      value === "all" ? undefined : (value as SeedLotStatus),
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
                    level:
                      value === "all"
                        ? undefined
                        : (value.toUpperCase() as SeedLevel),
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

            {hasActiveFilters && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Filtres actifs:{" "}
                  {Object.keys(filters).length + (search ? 1 : 0)}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-red-600 hover:text-red-700"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Réinitialiser
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Actions en masse */}
      {selectedLots.size > 0 && (
        <Card>
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <p className="text-sm">
                {selectedLots.size} lot(s) sélectionné(s)
              </p>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  Exporter sélection
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                >
                  Supprimer sélection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
                    <TableHead className="w-12">
                      <Checkbox
                        checked={
                          data.data.length > 0 &&
                          selectedLots.size === data.data.length
                        }
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="-ml-3 h-8"
                        onClick={() => handleSort("id")}
                      >
                        Code du lot
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>Variété</TableHead>
                    <TableHead>Niveau</TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="-ml-3 h-8"
                        onClick={() => handleSort("quantity")}
                      >
                        Quantité
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="-ml-3 h-8"
                        onClick={() => handleSort("productionDate")}
                      >
                        Production
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.data.map((lot) => (
                    <TableRow key={lot.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedLots.has(lot.id)}
                          onCheckedChange={(checked) =>
                            handleSelectLot(lot.id, checked as boolean)
                          }
                        />
                      </TableCell>
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
                            {formatNumber(
                              lot.availableQuantity || lot.quantity
                            )}{" "}
                            disponible
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
                        <div className="flex items-center justify-end space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleQRClick(lot)}
                            title="Générer QR Code"
                          >
                            <QrCode className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem asChild>
                                <Link to={`/dashboard/seed-lots/${lot.id}`}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Voir détails
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link
                                  to={`/dashboard/seed-lots/${lot.id}/edit`}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Modifier
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link
                                  to={`/dashboard/seed-lots/${lot.id}/transfer`}
                                >
                                  <Package className="h-4 w-4 mr-2" />
                                  Transférer
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleDeleteClick(lot)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {data.meta && data.meta.totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Page {data.meta?.page || 1} sur {data.meta?.totalPages || 1}{" "}
                    • Total: {data.meta?.totalCount || 0} lot(s)
                  </p>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={actions.firstPage}
                      disabled={!data.meta?.hasPreviousPage}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <ChevronLeft className="h-4 w-4 -ml-2" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={actions.previousPage}
                      disabled={!data.meta?.hasPreviousPage}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Précédent
                    </Button>
                    <div className="flex items-center space-x-1">
                      {Array.from(
                        { length: Math.min(5, data.meta.totalPages) },
                        (_, i) => {
                          const pageNumber = i + 1;
                          return (
                            <Button
                              key={pageNumber}
                              variant={
                                pageNumber === data.meta?.page
                                  ? "default"
                                  : "outline"
                              }
                              size="sm"
                              onClick={() => actions.setPage(pageNumber)}
                            >
                              {pageNumber}
                            </Button>
                          );
                        }
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={actions.nextPage}
                      disabled={!data.meta?.hasNextPage}
                    >
                      Suivant
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        actions.lastPage(data.meta?.totalPages || 1)
                      }
                      disabled={!data.meta?.hasNextPage}
                    >
                      <ChevronRight className="h-4 w-4" />
                      <ChevronRight className="h-4 w-4 -ml-2" />
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

      {/* Modals */}
      {selectedLotForQR && (
        <QRCodeModal
          isOpen={!!selectedLotForQR}
          onClose={() => setSelectedLotForQR(null)}
          seedLot={selectedLotForQR}
        />
      )}

      {selectedLotForDelete && (
        <DeleteSeedLotDialog
          isOpen={!!selectedLotForDelete}
          onClose={() => setSelectedLotForDelete(null)}
          onConfirm={confirmDelete}
          seedLotId={selectedLotForDelete.id}
          isDeleting={deleteMutation.isPending}
        />
      )}
    </div>
  );
};

export default SeedLots;
