// frontend/src/pages/varieties/VarietyDetail.tsx - CORRIGÉ
import React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Edit,
  Leaf,
  Calendar,
  MapPin,
  Package,
  BarChart3,
  Eye,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
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
import { api } from "../../services/api";
import { seedLotService } from "../../services/seedLotService"; // ✅ CORRIGÉ: Service spécialisé
import { Variety, SeedLot } from "../../types/entities";
import { formatDate, formatNumber } from "../../utils/formatters";

const VarietyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: variety,
    isLoading,
    error,
  } = useQuery<Variety>({
    queryKey: ["variety", id],
    queryFn: async () => {
      const response = await api.get(`/varieties/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });

  // ✅ CORRIGÉ: Récupérer les seed lots avec le service unifié
  const { data: seedLots } = useQuery<SeedLot[]>({
    queryKey: ["variety-seed-lots", id], // ✅ CORRIGÉ: Clé cohérente
    queryFn: async () => {
      const response = await seedLotService.getAll({ varietyId: id }); // ✅ CORRIGÉ: Service unifié
      return response.data;
    },
    enabled: !!id,
  });

  const getCropTypeBadge = (cropType: string) => {
    const typeMap: Record<
      string,
      {
        variant: "default" | "secondary" | "destructive" | "outline";
        label: string;
      }
    > = {
      RICE: { variant: "default", label: "Riz" },
      MAIZE: { variant: "secondary", label: "Maïs" },
      PEANUT: { variant: "outline", label: "Arachide" },
      SORGHUM: { variant: "destructive", label: "Sorgho" },
      COWPEA: { variant: "default", label: "Niébé" },
      MILLET: { variant: "secondary", label: "Mil" },
      WHEAT: { variant: "secondary", label: "Blé" },
    };

    const config = typeMap[cropType] || { variant: "outline", label: cropType };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error || !variety) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Erreur lors du chargement de la variété</p>
        <Button
          onClick={() => navigate("/dashboard/varieties")}
          className="mt-4"
        >
          Retour à la liste
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard/varieties")}
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <Leaf className="h-8 w-8 mr-3 text-green-600" />
              {variety.name}
            </h1>
            <p className="text-muted-foreground">
              Code: {variety.code} - {getCropTypeBadge(variety.cropType)}
            </p>
          </div>
        </div>
        <Button>
          <Edit className="h-4 w-4 mr-2" />
          Modifier
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{variety.maturityDays}</p>
                <p className="text-xs text-muted-foreground">
                  Jours de maturité
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">
                  {variety.yieldPotential
                    ? formatNumber(variety.yieldPotential)
                    : "N/A"}
                </p>
                <p className="text-xs text-muted-foreground">t/ha potentiel</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">
                  {variety.origin || "Non spécifiée"}
                </p>
                <p className="text-xs text-muted-foreground">Origine</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{seedLots?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Lots actifs</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Details and Seed Lots */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Variety Details */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Détails de la variété</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Description
              </label>
              <p className="text-sm mt-1">
                {variety.description || "Aucune description disponible"}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Année de création
              </label>
              <p className="text-sm mt-1">
                {variety.releaseYear || "Non spécifiée"}
              </p>
            </div>

            {variety.resistances && variety.resistances.length > 0 && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Résistances
                </label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {variety.resistances.map((resistance, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {resistance}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Seed Lots Table */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Lots de semences</CardTitle>
            <CardDescription>
              Lots disponibles pour cette variété
            </CardDescription>
          </CardHeader>
          <CardContent>
            {seedLots && seedLots.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Niveau</TableHead>
                    <TableHead>Quantité</TableHead>
                    <TableHead>Production</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {seedLots.map((lot) => (
                    <TableRow key={lot.id}>
                      <TableCell className="font-mono">{lot.id}</TableCell>
                      <TableCell>
                        <Badge>{lot.level}</Badge>
                      </TableCell>
                      <TableCell>{formatNumber(lot.quantity)} kg</TableCell>
                      <TableCell>{formatDate(lot.productionDate)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{lot.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          asChild
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                        >
                          <Link to={`/dashboard/seed-lots/${lot.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground">
                Aucun lot de semences pour cette variété.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VarietyDetail;
