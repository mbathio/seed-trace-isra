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
  Loader2,
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
        sortBy: sortBy,
        sortOrder: sortOrder,
        includeRelations: true, // Booléen, pas de string!
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
      <Badge className={`${config.color} text-white`}>{config.label}</Badge>
    );
  };

  const getLevelBadge = (level: string) => {
    const config = getSeedLevelConfig(level);
    return (
      <Badge className={`${config.color} text-white`}>{config.label}</Badge>
    );
  };

  const handleSelectAll = () => {
    if (selectedLots.size === data?.data?.length) {
      setSelectedLots(new Set());
    } else {
      const allIds = data?.data?.map((lot) => lot.id) || [];
      setSelectedLots(new Set(allIds));
    }
  };

  const handleSelectLot = (lotId: string) => {
    const newSelected = new Set(selectedLots);
    if (newSelected.has(lotId)) {
      newSelected.delete(lotId);
    } else {
      newSelected.add(lotId);
    }
    setSelectedLots(newSelected);
  };

  const handleExport = async () => {
    try {
      const blob = await exportMutation.mutateAsync("xlsx");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `lots_semences_${
        new Date().toISOString().split("T")[0]
      }.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Export réussi");
    } catch (error) {
      console.error("Export error:", error);
    }
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const clearFilters = () => {
    setSearch("");
    setFilters({});
    setSortBy("createdAt");
    setSortOrder("desc");
  };

  const hasActiveFilters = Boolean(search || filters.level || filters.status);

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <p className="text-red-600 mb-4">
                Une erreur est survenue lors du chargement des données.
              </p>
              <Button onClick={() => refetch()}>Réessayer</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Package className="w-8 h-8" />
            Gestion des Lots de Semences
          </h1>
          <p className="text-muted-foreground mt-2">
            Gérez vos lots de semences et suivez leur traçabilité
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={!data?.data?.length || exportMutation.isPending}
          >
            {exportMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Exporter
          </Button>
          <Link to="/seeds/lots/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nouveau Lot
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          {/* Filtres */}
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Rechercher par numéro de lot, variété..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                value={filters.level || "all"}
                onValueChange={(value) =>
                  setFilters({
                    ...filters,
                    level: value === "all" ? undefined : (value as SeedLevel),
                  })
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Niveau" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les niveaux</SelectItem>
                  {Object.entries(SEED_LEVELS).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center">{config.label}</div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={filters.status || "all"}
                onValueChange={(value) =>
                  setFilters({
                    ...filters,
                    status:
                      value === "all" ? undefined : (value as SeedLotStatus),
                  })
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  {Object.entries(LOT_STATUSES).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {hasActiveFilters && (
                <Button variant="ghost" onClick={clearFilters}>
                  <Filter className="w-4 h-4 mr-2" />
                  Réinitialiser
                </Button>
              )}
            </div>
          </div>

          {/* Tableau */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={
                        (data?.data?.length ?? 0) > 0 &&
                        selectedLots.size === (data?.data?.length ?? 0)
                      }
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("id")}
                      className="h-auto p-0 font-medium"
                    >
                      Numéro de Lot
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Niveau</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("variety.name")}
                      className="h-auto p-0 font-medium"
                    >
                      Variété
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("quantity")}
                      className="h-auto p-0 font-medium"
                    >
                      Quantité
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Producteur</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("productionDate")}
                      className="h-auto p-0 font-medium"
                    >
                      Date Production
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                      <p className="text-muted-foreground">Chargement...</p>
                    </TableCell>
                  </TableRow>
                ) : data?.data?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <Package className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">
                        {hasActiveFilters
                          ? "Aucun lot ne correspond aux critères de recherche"
                          : "Aucun lot de semences enregistré"}
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.data?.map((lot) => (
                    <TableRow key={lot.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedLots.has(lot.id)}
                          onCheckedChange={() => handleSelectLot(lot.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{lot.id}</TableCell>
                      <TableCell>{getLevelBadge(lot.level)}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{lot.variety?.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {lot.variety?.code}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{formatNumber(lot.quantity)} kg</TableCell>
                      <TableCell>
                        {lot.multiplier ? (
                          <div>
                            <p className="font-medium">{lot.multiplier.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {lot.multiplier.address}
                            </p>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">ISRA</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(lot.status)}</TableCell>
                      <TableCell>{formatDate(lot.productionDate)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <Link to={`/seeds/lots/${lot.id}`}>
                                <Eye className="w-4 h-4 mr-2" />
                                Voir les détails
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setSelectedLotForQR(lot)}
                            >
                              <QrCode className="w-4 h-4 mr-2" />
                              Générer QR Code
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link to={`/seeds/lots/${lot.id}/edit`}>
                                <Edit className="w-4 h-4 mr-2" />
                                Modifier
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link to={`/seeds/lots/${lot.id}/transfer`}>
                                <Leaf className="w-4 h-4 mr-2" />
                                Transférer
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => setSelectedLotForDelete(lot)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {data?.meta && data.meta.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Affichage de {(pagination.page - 1) * pagination.pageSize + 1} à{" "}
                {Math.min(
                  pagination.page * pagination.pageSize,
                  data.meta.totalCount
                )}{" "}
                sur {data.meta.totalCount} lots
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => actions.setPage(pagination.page - 1)}
                  disabled={!data.meta.hasPreviousPage}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Précédent
                </Button>
                <span className="text-sm">
                  Page {pagination.page} sur {data.meta.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => actions.setPage(pagination.page + 1)}
                  disabled={!data.meta.hasNextPage}
                >
                  Suivant
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal QR Code */}
      {selectedLotForQR && (
        <QRCodeModal
          seedLot={selectedLotForQR}
          isOpen={!!selectedLotForQR}
          onClose={() => setSelectedLotForQR(null)}
        />
      )}

      {/* Dialog de suppression */}
      {selectedLotForDelete && (
        <DeleteSeedLotDialog
          seedLot={selectedLotForDelete}
          isOpen={!!selectedLotForDelete}
          onClose={() => setSelectedLotForDelete(null)}
          onConfirm={() => {
            deleteMutation.mutate(selectedLotForDelete.id);
          }}
        />
      )}
    </div>
  );
};

export default SeedLots;
