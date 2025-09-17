// frontend/src/pages/genealogy/Genealogy.tsx - VERSION SÉCURISÉE
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  GitBranch,
  Search,
  Package,
  Calendar,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  Download,
  Printer,
} from "lucide-react";
import { seedLotService } from "@/services/seedLotService";
import { SeedLot } from "@/types/entities";
import { formatDate } from "@/utils/formatters";
import { toast } from "react-toastify";

// Définition de l'interface GenealogyNode
interface GenealogyNode {
  id: string;
  level: string;
  variety?: {
    id: number;
    name: string;
    code: string;
  };
  varietyName?: string;
  quantity: number;
  productionDate: string;
  status: string;
  multiplier?: {
    id: number;
    name: string;
  };
  multiplierName?: string;
  parentLotId?: string;
  children: GenealogyNode[];
  depth?: number;
  path?: string[];
  isCurrentLot?: boolean;
}

export default function Genealogy() {
  const [seedLots, setSeedLots] = useState<SeedLot[]>([]);
  const [selectedLot, setSelectedLot] = useState<string>("");
  const [genealogyData, setGenealogyData] = useState<GenealogyNode | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // Charger la liste des lots au montage
  useEffect(() => {
    loadSeedLots();
  }, []);

  // Charger la généalogie quand un lot est sélectionné
  useEffect(() => {
    if (selectedLot) {
      loadGenealogy(selectedLot);
    }
  }, [selectedLot]);

  const loadSeedLots = async () => {
    try {
      const response = await seedLotService.getAll({
        pageSize: 100,
        includeRelations: true,
      });
      setSeedLots(response.data || []);
    } catch (error) {
      console.error("Erreur lors du chargement des lots:", error);
      toast.error("Impossible de charger la liste des lots");
    }
  };

  const loadGenealogy = async (lotId: string) => {
    setIsLoading(true);
    setError(null);
    setGenealogyData(null);

    try {
      const response = await seedLotService.getGenealogy(lotId);
      if (response.data) {
        setGenealogyData(response.data);
        // Expand the current lot and its immediate children by default
        const nodesToExpand = new Set<string>();
        nodesToExpand.add(response.data.id);
        if (response.data.children && response.data.children.length > 0) {
          response.data.children.forEach((child: GenealogyNode) =>
            nodesToExpand.add(child.id)
          );
        }
        setExpandedNodes(nodesToExpand);
      }
    } catch (error: any) {
      console.error("Erreur lors du chargement de la généalogie:", error);
      setError(
        error.response?.data?.message ||
          "Erreur lors du chargement de la généalogie"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const toggleNodeExpansion = (nodeId: string) => {
    setExpandedNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const renderGenealogyNode = (node: GenealogyNode, isRoot = false) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const levelColors: Record<string, string> = {
      GO: "bg-purple-100 text-purple-800",
      G1: "bg-blue-100 text-blue-800",
      G2: "bg-green-100 text-green-800",
      G3: "bg-yellow-100 text-yellow-800",
      G4: "bg-orange-100 text-orange-800",
      R1: "bg-red-100 text-red-800",
      R2: "bg-pink-100 text-pink-800",
    };

    return (
      <div key={node.id} className="w-full">
        <div
          className={`
            border rounded-lg p-4 transition-all duration-200
            ${
              node.isCurrentLot
                ? "border-primary bg-primary/5 shadow-md"
                : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
            }
            ${!isRoot ? "ml-8" : ""}
          `}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              {hasChildren && (
                <button
                  onClick={() => toggleNodeExpansion(node.id)}
                  className="mt-1 p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-mono text-sm font-medium">
                    {node.id}
                  </span>
                  <Badge className={levelColors[node.level] || ""}>
                    {node.level}
                  </Badge>
                  {node.isCurrentLot && (
                    <Badge
                      variant="outline"
                      className="border-primary text-primary"
                    >
                      Lot actuel
                    </Badge>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Package className="h-3 w-3" />
                    {/* ✅ CORRECTION : Sécurisation avec valeur par défaut */}
                    <span>Variété: {node.varietyName ?? "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>Production: {formatDate(node.productionDate)}</span>
                  </div>
                  <div>Quantité: {node.quantity ?? 0} kg</div>
                  <div>Statut: {node.status ?? "Non défini"}</div>
                  {node.multiplierName && (
                    <div className="col-span-2">
                      Multiplicateur: {node.multiplierName}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {node.depth !== undefined && (
                <span className="text-xs text-gray-500">
                  Niveau {node.depth}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Render children if expanded */}
        {hasChildren && isExpanded && (
          <div className="mt-2 space-y-2">
            {node.children.map((child: GenealogyNode) =>
              renderGenealogyNode(child, false)
            )}
          </div>
        )}
      </div>
    );
  };

  const handleExportGenealogy = () => {
    if (!genealogyData) return;

    try {
      const dataStr = JSON.stringify(genealogyData, null, 2);
      const dataUri =
        "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

      const exportFileDefaultName = `genealogy_${selectedLot}_${
        new Date().toISOString().split("T")[0]
      }.json`;

      const linkElement = document.createElement("a");
      linkElement.setAttribute("href", dataUri);
      linkElement.setAttribute("download", exportFileDefaultName);
      linkElement.click();

      toast.success("Généalogie exportée avec succès");
    } catch (error) {
      toast.error("Erreur lors de l'export de la généalogie");
    }
  };

  const handlePrintGenealogy = () => {
    window.print();
  };

  // ✅ CORRECTION : Filtrage sécurisé des lots
  const filteredLots = seedLots.filter((lot) => {
    if (!search.trim()) return true;

    const searchLower = search.toLowerCase();

    // Vérification sécurisée de l'ID du lot
    const idMatch = lot.id?.toLowerCase().includes(searchLower) ?? false;

    // Vérification sécurisée du nom de la variété
    const varietyMatch =
      lot.variety?.name?.toLowerCase().includes(searchLower) ?? false;

    // Vérification sécurisée du code de la variété
    const codeMatch =
      lot.variety?.code?.toLowerCase().includes(searchLower) ?? false;

    return idMatch || varietyMatch || codeMatch;
  });

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <GitBranch className="h-8 w-8 text-primary" />
          Généalogie des Semences
        </h1>
        {genealogyData && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportGenealogy}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Exporter
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrintGenealogy}
              className="flex items-center gap-2"
            >
              <Printer className="h-4 w-4" />
              Imprimer
            </Button>
          </div>
        )}
      </div>

      {/* Carte de sélection */}
      <Card>
        <CardHeader>
          <CardTitle>Sélection du Lot</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Rechercher un lot..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedLot} onValueChange={setSelectedLot}>
              <SelectTrigger className="w-[400px]">
                <SelectValue placeholder="Sélectionner un lot pour visualiser sa généalogie" />
              </SelectTrigger>
              <SelectContent>
                {filteredLots.map((lot: SeedLot) => (
                  <SelectItem key={lot.id} value={lot.id}>
                    {/* ✅ CORRECTION : Affichage sécurisé */}
                    {lot.id} - {lot.variety?.name ?? "Variété inconnue"} (
                    {lot.level})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedLot && (
            <div className="text-sm text-muted-foreground">
              Lot sélectionné:{" "}
              <span className="font-mono font-medium">{selectedLot}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Visualisation de la généalogie */}
      {selectedLot && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <GitBranch className="h-5 w-5 mr-2 text-green-600" />
              Arbre Généalogique
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                <p className="text-muted-foreground">
                  Chargement de la généalogie...
                </p>
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : genealogyData ? (
              <div className="space-y-4">
                {renderGenealogyNode(genealogyData, true)}
              </div>
            ) : (
              <div className="text-center py-12">
                <GitBranch className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Aucune généalogie trouvée
                </h3>
                <p className="text-muted-foreground">
                  Ce lot ne semble pas avoir de relations généalogiques
                  enregistrées.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
