// frontend/src/pages/genealogy/Genealogy.tsx - CORRIGÉ
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  GitBranch,
  Search,
  Eye,
  Download,
  ChevronRight,
  Leaf,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Input } from "../../components/ui/input";
import { seedLotService } from "../../services/seedLotService";
import { SeedLot } from "../../types/entities";
import { ApiResponse } from "../../types/api";
import { formatDate } from "../../utils/formatters";
import { useDebounce } from "../../hooks/useDebounce";

// ✅ CORRECTION: Interface GenealogyNode avec typage correct
interface GenealogyNode extends SeedLot {
  children?: GenealogyNode[];
}

const Genealogy: React.FC = () => {
  const [selectedLot, setSelectedLot] = useState<string>("");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  // ✅ CORRIGÉ: Déclarer d'abord la query
  const { data: seedLotsResponse } = useQuery<ApiResponse<SeedLot[]>>({
    queryKey: ["seed-lots-for-genealogy", debouncedSearch],
    queryFn: async () => {
      const params = {
        search: debouncedSearch || undefined,
        pageSize: 100,
      };

      const response = await seedLotService.getAll(params);
      return {
        success: true,
        message: "Lots récupérés avec succès",
        data: response.data.data,
        meta: response.data.meta,
      };
    },
  });

  // ✅ CORRIGÉ: Utiliser seedLotsResponse après sa déclaration
  const seedLots = seedLotsResponse?.data || [];

  // ✅ CORRIGÉ: Récupérer la généalogie avec le service unifié
  const { data: genealogyData, isLoading } = useQuery<GenealogyNode>({
    queryKey: ["genealogy", selectedLot],
    queryFn: async () => {
      const response = await seedLotService.getGenealogy(selectedLot);
      return response.data.data;
    },
    enabled: !!selectedLot,
  });

  const getLevelBadge = (level: string) => {
    const colors = {
      GO: "bg-red-100 text-red-800",
      G1: "bg-orange-100 text-orange-800",
      G2: "bg-yellow-100 text-yellow-800",
      G3: "bg-green-100 text-green-800",
      G4: "bg-blue-100 text-blue-800",
      R1: "bg-purple-100 text-purple-800",
      R2: "bg-pink-100 text-pink-800",
    };

    return (
      <Badge
        className={
          colors[level as keyof typeof colors] || "bg-gray-100 text-gray-800"
        }
      >
        {level}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { variant: "secondary" as const, label: "En attente" },
      CERTIFIED: { variant: "default" as const, label: "Certifié" },
      REJECTED: { variant: "destructive" as const, label: "Rejeté" },
      IN_STOCK: { variant: "outline" as const, label: "En stock" },
      ACTIVE: { variant: "default" as const, label: "Actif" },
      DISTRIBUTED: { variant: "secondary" as const, label: "Distribué" },
      SOLD: { variant: "outline" as const, label: "Vendu" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      variant: "outline" as const,
      label: status,
    };

    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const renderGenealogyTree = (node: GenealogyNode, depth = 0) => {
    const indentClass = depth > 0 ? `ml-${depth * 8}` : "";

    return (
      <div key={node.id} className={`space-y-4 ${indentClass}`}>
        <Card className="border-l-4 border-l-green-500 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <GitBranch className="h-5 w-5 text-green-600" />
                  <span className="font-mono font-semibold">{node.id}</span>
                  {getLevelBadge(node.level)}
                  {getStatusBadge(node.status)}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Variété:</span>
                    <span className="ml-2 font-medium">
                      {node.variety.name}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Quantité:</span>
                    <span className="ml-2 font-medium">{node.quantity} kg</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Production:</span>
                    <span className="ml-2 font-medium">
                      {formatDate(node.productionDate)}
                    </span>
                  </div>
                  {node.multiplier && (
                    <div>
                      <span className="text-muted-foreground">
                        Multiplicateur:
                      </span>
                      <span className="ml-2 font-medium">
                        {node.multiplier.name}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-1" />
                Détails
              </Button>
            </div>
          </CardContent>
        </Card>

        {node.children && node.children.length > 0 && (
          <div className="ml-6 border-l-2 border-gray-200 pl-6 space-y-4">
            <div className="flex items-center text-sm text-muted-foreground">
              <ChevronRight className="h-4 w-4 mr-1" />
              Lots dérivés ({node.children.length})
            </div>
            {node.children.map((child) =>
              renderGenealogyTree(child, depth + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Généalogie des Lots
          </h1>
          <p className="text-muted-foreground">
            Visualiser la généalogie complète des lots de semences
          </p>
        </div>
        <Button variant="outline" className="bg-white">
          <Download className="h-4 w-4 mr-2" />
          Exporter la généalogie
        </Button>
      </div>

      {/* Sélection du lot */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Leaf className="h-5 w-5 mr-2 text-green-600" />
            Sélection d'un Lot
          </CardTitle>
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
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Sélectionner un lot pour visualiser sa généalogie" />
              </SelectTrigger>
              <SelectContent>
                {seedLots.map((lot: SeedLot) => (
                  <SelectItem key={lot.id} value={lot.id}>
                    {lot.id} - {lot.variety.name} ({lot.level})
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
              Visualisation de la Généalogie
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
            ) : genealogyData ? (
              <div className="space-y-6">
                {renderGenealogyTree(genealogyData)}
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

      {!selectedLot && (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-12 text-center">
            <GitBranch className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Sélectionnez un lot pour visualiser sa généalogie
            </h3>
            <p className="text-muted-foreground">
              Choisissez un lot dans la liste ci-dessus pour afficher sa
              généalogie complète.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Genealogy;
