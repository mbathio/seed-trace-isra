// frontend/src/pages/seeds/SeedLots.tsx - VERSION CORRIGÉE
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Eye, Download, QrCode, AlertCircle } from "lucide-react";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Alert, AlertDescription } from "../../components/ui/alert";
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
import { api } from "../../services/api";
import { SeedLot } from "../../types/entities";
import { ApiResponse, PaginationParams, FilterParams } from "../../types/api";
import { formatDate } from "../../utils/formatters";
import { SEED_LEVELS } from "../../constants";
import { useDebounce } from "../../hooks/useDebounce";
import { usePagination } from "../../hooks/usePagination";
import { toast } from "react-toastify";

const SeedLots: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [selectedLot, setSelectedLot] = useState<SeedLot | null>(null);
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search, 300);
  const { pagination, actions } = usePagination({ initialPageSize: 10 });

  // Query pour récupérer les lots
  const {
    data: response,
    isLoading,
    error,
    isError,
  } = useQuery({
    queryKey: [
      "seed-lots",
      pagination.page,
      pagination.pageSize,
      debouncedSearch,
      levelFilter,
    ],
    queryFn: async () => {
      console.log("Fetching seed lots...");

      const params: PaginationParams & FilterParams = {
        page: pagination.page,
        pageSize: pagination.pageSize,
        search: debouncedSearch || undefined,
        level: levelFilter || undefined,
      };

      try {
        const response = await api.get("/seed-lots", { params });
        console.log("API Response:", response.data);
        return response.data;
      } catch (error) {
        console.error("API Error:", error);
        throw error;
      }
    },
    retry: 2,
  });

  // Extraire les données de la réponse
  const seedLots = response?.data?.lots || response?.data || [];
  const meta = response?.meta || null;

  console.log("Seed lots data:", seedLots);
  console.log("Meta data:", meta);

  // Fonction pour obtenir le QR Code
  const fetchQRCode = async (lotId: string) => {
    try {
      const response = await api.get(`/seed-lots/${lotId}/qr-code`);
      return response.data.data?.qrCode || response.data.qrCode;
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
    link.href = qrCodeData;
    link.download = `QR_Code_${selectedLot.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("QR Code téléchargé");
  };

  // Fonction pour obtenir la classe CSS du statut
  const getStatusClass = (status: string) => {
    const upperStatus = status?.toUpperCase() || "";
    switch (upperStatus) {
      case "CERTIFIED":
        return "bg-red-500 text-white";
      case "PENDING":
        return "bg-yellow-500 text-white";
      case "ACTIVE":
        return "bg-green-500 text-white";
      case "IN_STOCK":
        return "bg-blue-500 text-white";
      case "DISTRIBUTED":
        return "bg-purple-500 text-white";
      case "SOLD":
        return "bg-gray-500 text-white";
      default:
        return "bg-gray-400 text-white";
    }
  };

  // Fonction pour obtenir le label du statut
  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      PENDING: "En attente",
      CERTIFIED: "Éliminé",
      REJECTED: "Rejeté",
      IN_STOCK: "En stock",
      ACTIVE: "Actif",
      DISTRIBUTED: "Distribué",
      SOLD: "Vendu",
    };
    return statusMap[status?.toUpperCase()] || status || "Inconnu";
  };

  // Fonction pour formater la quantité
  const formatQuantity = (quantity: number) => {
    return `${quantity || 0} kg`;
  };

  // Gestion des erreurs
  if (isError) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Erreur lors du chargement des lots.
            {error && (
              <div className="mt-2 text-sm">
                Détails: {error.message || "Erreur inconnue"}
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

      {/* Liste des Lots Card */}
      <div className="bg-white rounded-lg shadow">
        {/* Header de la card */}
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold mb-4">
            Liste des Lots{" "}
            {Array.isArray(seedLots) &&
              seedLots.length > 0 &&
              `(${seedLots.length})`}
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
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p>Chargement des lots...</p>
            </div>
          ) : !Array.isArray(seedLots) || seedLots.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">
                {search || levelFilter
                  ? "Aucun lot ne correspond à vos critères de recherche."
                  : "Aucun lot de semences trouvé."}
              </p>
              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => navigate("/dashboard/seed-lots/create")}
              >
                <Plus className="h-4 w-4 mr-2" />
                Créer le premier lot
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-medium text-gray-700">
                    Niveau
                  </TableHead>
                  <TableHead className="font-medium text-gray-700">
                    Variété
                  </TableHead>
                  <TableHead className="font-medium text-gray-700">
                    Quantité
                  </TableHead>
                  <TableHead className="font-medium text-gray-700">
                    Date de production
                  </TableHead>
                  <TableHead className="font-medium text-gray-700">
                    Statut
                  </TableHead>
                  <TableHead className="font-medium text-gray-700">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {seedLots.map((lot: SeedLot) => (
                  <TableRow
                    key={lot.id}
                    className={`hover:bg-gray-50 cursor-pointer ${
                      selectedLot?.id === lot.id ? "bg-blue-50" : ""
                    }`}
                    onClick={() => handleSelectLot(lot)}
                  >
                    <TableCell>
                      <span
                        className={`inline-flex items-center justify-center px-3 py-1 text-xs font-medium rounded-full ${
                          lot.level === "GO"
                            ? "bg-gray-200 text-gray-800"
                            : lot.level === "G1"
                            ? "bg-blue-200 text-blue-800"
                            : lot.level === "G2"
                            ? "bg-green-200 text-green-800"
                            : lot.level === "G3"
                            ? "bg-yellow-200 text-yellow-800"
                            : "bg-purple-200 text-purple-800"
                        }`}
                      >
                        {lot.level}
                      </span>
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
                      <span
                        className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded ${getStatusClass(
                          lot.status
                        )}`}
                      >
                        {getStatusLabel(lot.status)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div
                        className="flex gap-2"
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
          <div className="p-4 border-t flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Page {meta.page} sur {meta.totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={actions.previousPage}
                disabled={!meta.hasPreviousPage}
              >
                Précédent
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={actions.nextPage}
                disabled={!meta.hasNextPage}
              >
                Suivant
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* QR Code Section */}
      <div className="mt-6 bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">QR Code</h2>

        {selectedLot && qrCodeData ? (
          <div className="space-y-4">
            {/* Informations du lot sélectionné */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Lot sélectionné</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-600">ID:</span>
                  <span className="ml-2 font-medium">{selectedLot.id}</span>
                </div>
                <div>
                  <span className="text-gray-600">Variété:</span>
                  <span className="ml-2 font-medium">
                    {selectedLot.variety?.name || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Niveau:</span>
                  <span className="ml-2 font-medium">{selectedLot.level}</span>
                </div>
                <div>
                  <span className="text-gray-600">Quantité:</span>
                  <span className="ml-2 font-medium">
                    {formatQuantity(selectedLot.quantity)}
                  </span>
                </div>
              </div>
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 bg-white border-2 border-gray-200 rounded-lg">
                <img
                  src={qrCodeData}
                  alt={`QR Code for ${selectedLot.id}`}
                  className="w-64 h-64"
                />
              </div>

              <Button
                onClick={handleDownloadQRCode}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                Télécharger le QR Code
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <QrCode className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">
              Sélectionnez un lot pour générer son QR code
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SeedLots;
