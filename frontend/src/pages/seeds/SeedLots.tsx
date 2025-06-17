// frontend/src/pages/seeds/SeedLots.tsx - VERSION COMPLÈTE CORRIGÉE
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
import { Alert, AlertDescription } from "../../components/ui/alert";
import { Badge } from "../../components/ui/badge";
import { toast } from "react-toastify";
import { api } from "../../services/api";
import type { SeedLot } from "../../types/entities";
import type { PaginationParams, FilterParams } from "../../types/api";
import { SEED_LEVELS } from "../../constants";
import { formatDate, formatQuantity } from "../../utils/formatters";
import { useDebounce } from "../../hooks/useDebounce";

const SeedLots: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("");
  const [selectedLot, setSelectedLot] = useState<SeedLot | null>(null);
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
  });

  const debouncedSearch = useDebounce(search, 500);

  // Requête pour récupérer les lots
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
    ],
    queryFn: async () => {
      console.log("🔍 Fetching seed lots...");

      const params: PaginationParams & FilterParams = {
        page: pagination.page,
        pageSize: pagination.pageSize,
        search: debouncedSearch || undefined,
        level: levelFilter || undefined,
      };

      console.log("📤 Request params:", params);

      try {
        const response = await api.get("/seed-lots", { params });
        console.log("✅ Full API Response:", response);
        console.log("📦 Response data:", response.data);

        // Structure attendue du backend : { success: true, data: SeedLot[], meta: {...} }
        return response.data; // Retourner la réponse complète
      } catch (error) {
        console.error("❌ API Error:", error);
        throw error;
      }
    },
    retry: 2,
  });

  // Extraction des données depuis la structure standard de réponse
  const seedLots = response?.data || [];
  const meta = response?.meta || null;
  console.log("📋 Extracted seed lots:", seedLots);
  console.log("📊 Metadata:", meta);

  // Fonction pour obtenir le QR Code
  const fetchQRCode = async (lotId: string) => {
    try {
      const response = await api.get(`/seed-lots/${lotId}/qr-code`);
      // Le backend retourne: { success: true, data: { qrCode: "..." } }
      return response.data.data?.qrCode || null;
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

  // Fonction pour obtenir la classe CSS du statut
  const getStatusClass = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "IN_STOCK":
        return "bg-blue-100 text-blue-800";
      case "CERTIFIED":
        return "bg-emerald-100 text-emerald-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      case "DISTRIBUTED":
        return "bg-purple-100 text-purple-800";
      case "SOLD":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Fonction pour obtenir le label du statut
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "Actif";
      case "IN_STOCK":
        return "En stock";
      case "CERTIFIED":
        return "Certifié";
      case "PENDING":
        return "En attente";
      case "REJECTED":
        return "Rejeté";
      case "DISTRIBUTED":
        return "Distribué";
      case "SOLD":
        return "Vendu";
      default:
        return status;
    }
  };

  // Fonction pour obtenir la classe CSS du niveau
  const getLevelClass = (level: string) => {
    switch (level) {
      case "GO":
        return "bg-gray-200 text-gray-800";
      case "G1":
        return "bg-blue-200 text-blue-800";
      case "G2":
        return "bg-green-200 text-green-800";
      case "G3":
        return "bg-yellow-200 text-yellow-800";
      case "G4":
        return "bg-purple-200 text-purple-800";
      case "R1":
        return "bg-orange-200 text-orange-800";
      case "R2":
        return "bg-pink-200 text-pink-800";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  // Gestion du changement de page
  const handlePageChange = (newPage: number) => {
    setPagination({ ...pagination, page: newPage });
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
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Gestion des Lots
            </h1>
            <p className="text-gray-600">
              Gérer et visualiser les lots de semences
            </p>
          </div>
          <Button
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={() => navigate("/dashboard/seed-lots/create")}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouveau Lot
          </Button>
        </div>
      </div>

      {/* Card principale */}
      <div className="bg-white rounded-lg shadow">
        {/* Header de la card */}
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold mb-4">
            Liste des Lots {meta && `(${meta.totalCount} total)`}
          </h2>

          {/* Filtres */}
          <div className="flex gap-4">
            <div className="relative flex-1 max-w-md">
              <Input
                type="text"
                placeholder="Rechercher un lot..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
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

            <Button
              variant="outline"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <Filter className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p>Chargement des lots...</p>
            </div>
          ) : seedLots.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">
                {search || levelFilter
                  ? "Aucun lot trouvé avec ces critères"
                  : "Aucun lot de semences enregistré"}
              </p>
              {!search && !levelFilter && (
                <Button onClick={() => navigate("/dashboard/seed-lots/create")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Créer le premier lot
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Niveau</TableHead>
                  <TableHead>Identification</TableHead>
                  <TableHead>Quantité</TableHead>
                  <TableHead>Date de production</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {seedLots.map((lot: SeedLot) => (
                  <TableRow
                    key={lot.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => navigate(`/dashboard/seed-lots/${lot.id}`)}
                  >
                    <TableCell>
                      <Badge className={getLevelClass(lot.level)}>
                        {lot.level}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {lot.variety?.name || "Sans variété"}
                        </p>
                        <p className="text-sm text-gray-500">{lot.id}</p>
                      </div>
                    </TableCell>
                    <TableCell>{formatQuantity(lot.quantity)}</TableCell>
                    <TableCell>{formatDate(lot.productionDate)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusClass(lot.status)}>
                        {getStatusLabel(lot.status)}
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
                          className="hover:bg-gray-100"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleSelectLot(lot)}
                          className="hover:bg-gray-100"
                        >
                          <QrCode className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="px-4 py-3 border-t flex items-center justify-between">
            <div className="text-sm text-gray-700">
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
      </div>

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
              <div className="w-64 h-64 bg-gray-100 flex items-center justify-center">
                <p className="text-gray-500">Génération en cours...</p>
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
