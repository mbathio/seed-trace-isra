// frontend/src/pages/seeds/SeedLots.tsx - VERSION CORRIGÉE
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Plus,
  Search,
  Download,
  Eye,
  Package,
  QrCode,
  Filter,
  ChevronLeft,
  ChevronRight,
  Leaf,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { Badge } from "../../components/ui/badge";
import { toast } from "react-toastify";
import { api } from "../../services/api";
import type { SeedLot } from "../../types/entities";
import { SEED_LEVELS, LOT_STATUSES } from "../../constants";
import { formatDate, formatQuantity } from "../../utils/formatters";
import { useDebounce } from "../../hooks/useDebounce";
import { seedLotService } from "../../services/seedLotService"; // ✅ Utiliser le service

const SeedLots: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [selectedLot, setSelectedLot] = useState<SeedLot | null>(null);
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
  });

  const debouncedSearch = useDebounce(search, 500);

  // Requête pour récupérer les lots
  const {
    data: response,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [
      "seed-lots",
      pagination.page,
      pagination.pageSize,
      debouncedSearch,
      levelFilter,
      statusFilter,
    ],
    queryFn: async () => {
      const params: any = {
        page: pagination.page,
        pageSize: pagination.pageSize,
      };

      if (debouncedSearch) params.search = debouncedSearch;
      if (levelFilter) params.level = levelFilter;
      if (statusFilter) params.status = statusFilter;

      const response = await seedLotService.getAll(params);
      return response.data;
    },
  });

  // Extraction des données
  const seedLots = response?.data || [];
  const meta = response?.meta || null;

  // Fonction pour obtenir le QR Code
  const fetchQRCode = async (lotId: string) => {
    try {
      const response = await seedLotService.getQRCode(lotId);
      return response.data.data || null;
    } catch (error) {
      console.error("QR Code fetch error:", error);
      toast.error("Erreur lors de la génération du QR Code");
      return null;
    }
  };

  // Fonction pour sélectionner un lot et générer son QR Code
  const handleSelectLot = async (lot: SeedLot) => {
    setSelectedLot(lot);
    if (lot.qrCode) {
      setQrCodeData(lot.qrCode);
    } else {
      const qrCode = await fetchQRCode(lot.id);
      if (qrCode) {
        setQrCodeData(qrCode);
      }
    }
  };

  // Fonction pour télécharger le QR Code
  const handleDownloadQRCode = () => {
    if (!qrCodeData || !selectedLot) return;

    const link = document.createElement("a");
    link.download = `QR-${selectedLot.id}.png`;
    link.href = qrCodeData;
    link.click();
  };

  // Fonction pour obtenir la config du statut
  const getStatusConfig = (status: string) => {
    // Le statut vient maintenant en format UI (kebab-case)
    return (
      LOT_STATUSES.find((s) => s.value === status) || {
        value: status,
        label: status,
        color: "gray",
        icon: "Circle",
      }
    );
  };

  // Fonction pour obtenir la config du niveau
  const getLevelConfig = (level: string) => {
    return (
      SEED_LEVELS.find((l) => l.value === level) || {
        value: level,
        label: level,
      }
    );
  };

  // Gestion du changement de page
  const handlePageChange = (newPage: number) => {
    setPagination({ ...pagination, page: newPage });
  };

  // Fonction pour exporter les données
  const handleExport = async () => {
    try {
      toast.info("Export en cours...");
      const blob = await seedLotService.export("csv", {
        search: debouncedSearch,
        level: levelFilter,
        status: statusFilter,
      });

      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "lots_semences.csv";
      link.click();
      window.URL.revokeObjectURL(url);

      toast.success("Export réussi !");
    } catch (error) {
      toast.error("Erreur lors de l'export");
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertDescription>
            Erreur lors du chargement des lots de semences.
            {error && (
              <div className="mt-2 text-sm">
                Détails: {(error as any).message || "Erreur inconnue"}
              </div>
            )}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Lots de semences</h1>
          <p className="text-muted-foreground">
            Gérer et suivre les lots de semences de production
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button onClick={() => navigate("/dashboard/seed-lots/create")}>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau lot
          </Button>
        </div>
      </div>

      {/* Carte principale */}
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex items-center justify-between">
              <span>Liste des lots</span>
              {meta && (
                <span className="text-sm font-normal text-muted-foreground">
                  {meta.totalCount} {meta.totalCount > 1 ? "lots" : "lot"}
                </span>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filtres */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Rechercher un lot..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Tous les niveaux" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous les niveaux</SelectItem>
                {SEED_LEVELS.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous les statuts</SelectItem>
                {LOT_STATUSES.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <Filter className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Chargement des lots...</p>
              </div>
            ) : seedLots.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  {search || levelFilter || statusFilter
                    ? "Aucun lot trouvé avec ces critères"
                    : "Aucun lot de semences enregistré"}
                </p>
                {!search && !levelFilter && !statusFilter && (
                  <Button
                    onClick={() => navigate("/dashboard/seed-lots/create")}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Créer le premier lot
                  </Button>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Variété</TableHead>
                    <TableHead>Niveau</TableHead>
                    <TableHead>Quantité</TableHead>
                    <TableHead>Production</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {seedLots.map((lot: SeedLot) => {
                    const statusConfig = getStatusConfig(lot.status);
                    const levelConfig = getLevelConfig(lot.level);

                    return (
                      <TableRow
                        key={lot.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() =>
                          navigate(`/dashboard/seed-lots/${lot.id}`)
                        }
                      >
                        <TableCell className="font-mono">{lot.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Leaf className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">
                                {lot.variety?.name || "Sans variété"}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {lot.variety?.code}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{levelConfig.label}</Badge>
                        </TableCell>
                        <TableCell>{formatQuantity(lot.quantity)}</TableCell>
                        <TableCell>{formatDate(lot.productionDate)}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              statusConfig.color === "green"
                                ? "default"
                                : statusConfig.color === "red"
                                ? "destructive"
                                : statusConfig.color === "orange"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {statusConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div
                            className="flex gap-2 justify-end"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                navigate(`/dashboard/seed-lots/${lot.id}`)
                              }
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleSelectLot(lot)}
                            >
                              <QrCode className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <div className="text-sm text-muted-foreground">
                Affichage de {(meta.page - 1) * meta.pageSize + 1} à{" "}
                {Math.min(meta.page * meta.pageSize, meta.totalCount)} sur{" "}
                {meta.totalCount} résultats
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(meta.page - 1)}
                  disabled={meta.page <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Précédent
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(meta.page + 1)}
                  disabled={meta.page >= meta.totalPages}
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
      <Dialog
        open={!!selectedLot && !!qrCodeData}
        onOpenChange={() => {
          setSelectedLot(null);
          setQrCodeData(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>QR Code - Lot {selectedLot?.id}</DialogTitle>
            <DialogDescription>
              {selectedLot?.variety?.name} - Niveau {selectedLot?.level}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center py-4">
            {qrCodeData ? (
              <img
                src={qrCodeData}
                alt={`QR Code ${selectedLot?.id}`}
                className="w-64 h-64"
              />
            ) : (
              <div className="w-64 h-64 bg-muted flex items-center justify-center rounded">
                <p className="text-muted-foreground">Génération en cours...</p>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setSelectedLot(null);
                setQrCodeData(null);
              }}
            >
              Fermer
            </Button>
            <Button onClick={handleDownloadQRCode} disabled={!qrCodeData}>
              <Download className="h-4 w-4 mr-2" />
              Télécharger
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SeedLots;
