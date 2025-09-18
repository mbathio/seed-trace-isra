// frontend/src/pages/seeds/SeedLots.tsx - VERSION FINALE CORRIGÉE
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
  AlertTriangle,
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
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";
import { QRCodeModal } from "../../components/qr-code/QRCodeModal";
import { DeleteSeedLotDialog } from "../../components/seeds/DeleteSeedLotDialog";
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

const SeedLots: React.FC = () => {
  // ===== ÉTATS LOCAUX =====
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Partial<SeedLotFilters>>({});
  const [selectedLotForQR, setSelectedLotForQR] = useState<SeedLot | null>(
    null
  );
  const [selectedLotForDelete, setSelectedLotForDelete] =
    useState<SeedLot | null>(null);
  const [selectedLots, setSelectedLots] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // ===== HOOKS =====
  const debouncedSearch = useDebounce(search, 300);
  const { pagination, actions } = usePagination({ initialPageSize: 10 });
  const queryClient = useQueryClient();

  // ✅ CORRECTION MAJEURE: Fonction simplifiée - Ne pas sur-transformer les enums
  const cleanFiltersForAPI = (filters: Partial<SeedLotFilters>) => {
    const cleaned: any = {};

    Object.entries(filters).forEach(([key, value]) => {
      // Garder les valeurs UI telles quelles, juste supprimer les valeurs spéciales
      if (
        value !== undefined &&
        value !== null &&
        value !== "" &&
        value !== "__all"
      ) {
        cleaned[key] = value;
      }
    });

    console.log("🧹 [SeedLots] Cleaned filters:", cleaned);
    return cleaned;
  };

  // ===== REQUÊTE PRINCIPALE =====
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
      const params: Record<string, any> = {
        page: pagination.page,
        pageSize: pagination.pageSize,
        sortBy: sortBy,
        sortOrder: sortOrder,
        includeRelations: true,
      };

      // Ajouter search seulement si non vide
      if (debouncedSearch && debouncedSearch.trim()) {
        params.search = debouncedSearch.trim();
      }

      // ✅ CORRECTION: Utiliser la fonction simplifiée sans transformation d'enum
      const cleanedFilters = cleanFiltersForAPI(filters);
      Object.entries(cleanedFilters).forEach(([key, value]) => {
        params[key] = value;
      });

      console.log("🔍 [SeedLots] Final API params:", params);

      try {
        const response = await seedLotService.getAll(params);

        console.log("📦 [SeedLots] API Response success:", {
          totalCount: response.meta?.totalCount,
          resultsCount: response.data?.length,
          page: response.meta?.page,
        });

        return response;
      } catch (error: any) {
        console.error("❌ [SeedLots] API Error:", {
          status: error?.response?.status,
          message: error?.response?.data?.message,
          errors: error?.response?.data?.errors,
        });
        throw error;
      }
    },
    retry: (failureCount, error: any) => {
      // Ne pas retry sur les erreurs 422 (erreurs de validation)
      if (error?.response?.status === 422) {
        console.warn("🚫 [SeedLots] Not retrying 422 error");
        return false;
      }
      return failureCount < 2;
    },
    refetchOnWindowFocus: false,
  });

  // ===== MUTATIONS =====

  // Mutation pour supprimer un lot
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log("🗑️ [SeedLots] Deleting seed lot:", id);
      await seedLotService.delete(id);
    },
    onSuccess: (_, deletedId) => {
      toast.success("Lot supprimé avec succès");
      queryClient.invalidateQueries({ queryKey: ["seedLots"] });
      setSelectedLotForDelete(null);

      // Retirer de la sélection si sélectionné
      if (selectedLots.has(deletedId)) {
        const newSelected = new Set(selectedLots);
        newSelected.delete(deletedId);
        setSelectedLots(newSelected);
      }
    },
    onError: (error: any) => {
      console.error("❌ [SeedLots] Delete error:", error);
      const message =
        error?.response?.data?.message || "Erreur lors de la suppression";
      toast.error(message);
    },
  });

  // Mutation pour export
  const exportMutation = useMutation({
    mutationFn: async (format: "csv" | "xlsx") => {
      console.log("📄 [SeedLots] Exporting format:", format);
      const cleanedFilters = cleanFiltersForAPI(filters);
      return seedLotService.export(format, cleanedFilters);
    },
    onSuccess: (blob, format) => {
      // Créer le lien de téléchargement
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `lots_semences_${
        new Date().toISOString().split("T")[0]
      }.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Export réussi");
    },
    onError: (error: any) => {
      console.error("❌ [SeedLots] Export error:", error);
      toast.error("Erreur lors de l'export");
    },
  });

  // ===== FONCTIONS DE TRAITEMENT DES BADGES =====

  const getStatusBadge = (status: string) => {
    const config = getStatusConfig(status, LOT_STATUSES);
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getLevelBadge = (level: string) => {
    const config = getSeedLevelConfig(level);
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  // ===== FONCTIONS DE GESTION DE SÉLECTION =====

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

  // ===== FONCTIONS DE GESTION D'ACTIONS =====

  const handleExport = async (format: "csv" | "xlsx" = "xlsx") => {
    try {
      await exportMutation.mutateAsync(format);
    } catch (error) {
      console.error("❌ [SeedLots] Export failed:", error);
    }
  };

  const handleSort = (field: string) => {
    console.log("🔄 [SeedLots] Sorting by:", field);
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const clearFilters = () => {
    console.log("🧹 [SeedLots] Clearing all filters");
    setSearch("");
    setFilters({});
    setSortBy("createdAt");
    setSortOrder("desc");
  };

  const handleRetry = () => {
    console.log("🔄 [SeedLots] Retrying query");
    refetch();
  };

  // ===== FONCTIONS UTILITAIRES =====

  const hasActiveFilters = Boolean(
    search ||
      filters.level ||
      filters.status ||
      filters.varietyId ||
      filters.multiplierId
  );

  const getSortIcon = (field: string) => {
    if (sortBy !== field) return <ArrowUpDown className="ml-2 h-4 w-4" />;
    return <span className="ml-2">{sortOrder === "asc" ? "↑" : "↓"}</span>;
  };

  // ===== GESTION D'ERREUR AMÉLIORÉE =====

  if (error) {
    console.error("❌ [SeedLots] Query error:", error);

    const apiError = error as { response?: { status?: number; data?: any } };
    const is422Error = apiError?.response?.status === 422;
    const errorData = apiError?.response?.data;

    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Package className="w-8 h-8" />
              Gestion des Lots de Semences
            </h1>
          </div>
        </div>

        <Card>
          <CardContent className="py-8">
            <div className="text-center space-y-4">
              <AlertTriangle className="w-16 h-16 text-red-500 mx-auto" />

              <div>
                <h2 className="text-xl font-semibold mb-2">
                  {is422Error ? "Paramètres invalides" : "Erreur de chargement"}
                </h2>

                {is422Error && (
                  <Alert
                    variant="destructive"
                    className="text-left max-w-2xl mx-auto"
                  >
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Erreur de validation (422)</AlertTitle>
                    <AlertDescription>
                      <div className="space-y-2">
                        <p>
                          {errorData?.message ||
                            "Paramètres de requête invalides"}
                        </p>

                        {errorData?.errors && errorData.errors.length > 0 && (
                          <div className="mt-3">
                            <p className="font-medium">Détails:</p>
                            <ul className="list-disc list-inside text-sm">
                              {errorData.errors.map(
                                (error: any, index: number) => (
                                  <li key={index}>
                                    {typeof error === "string"
                                      ? error
                                      : error.message || JSON.stringify(error)}
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                        )}

                        {process.env.NODE_ENV === "development" && (
                          <details className="mt-4">
                            <summary className="cursor-pointer text-sm font-medium">
                              Détails techniques (dev)
                            </summary>
                            <pre className="mt-2 text-xs bg-red-50 p-3 rounded overflow-auto">
                              {JSON.stringify(errorData, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {!is422Error && (
                  <p className="text-muted-foreground">
                    Une erreur est survenue lors du chargement des données.
                  </p>
                )}
              </div>

              <div className="flex gap-2 justify-center">
                <Button onClick={handleRetry}>Réessayer</Button>
                <Button variant="outline" onClick={clearFilters}>
                  Réinitialiser les filtres
                </Button>
              </div>
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
            onClick={() => handleExport()}
            disabled={!data?.data?.length || exportMutation.isPending}
          >
            {exportMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Exporter
          </Button>
          <Link to="/dashboard/seed-lots/create">
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
                value={filters.level || "__all"}
                onValueChange={(value) => {
                  setFilters({
                    ...filters,
                    level:
                      value === "__all"
                        ? undefined
                        : (value as SeedLotFilters["level"]),
                  });
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Niveau" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all">Tous les niveaux</SelectItem>

                  {SEED_LEVELS.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      <div className="flex items-center">{level.label}</div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={filters.status || "__all"}
                onValueChange={(value) => {
                  setFilters({
                    ...filters,
                    status:
                      value === "__all"
                        ? undefined
                        : (value as SeedLotFilters["status"]),
                  });
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all">Tous les statuts</SelectItem>
                  {LOT_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
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
                              <Link to={`/dashboard/seed-lots/${lot.id}`}>
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
                              <Link to={`/dashboard/seed-lots/${lot.id}/edit`}>
                                <Edit className="w-4 h-4 mr-2" />
                                Modifier
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link
                                to={`/dashboard/seed-lots/${lot.id}/transfer`}
                              >
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
