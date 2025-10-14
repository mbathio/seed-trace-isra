// frontend/src/pages/parcels/ParcelDetail.tsx - PAGE DE DÉTAILS PARCELLE
import React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Edit,
  MapPin,
  Droplets,
  TestTube,
  Package,
  Tractor,
  Calendar,
  BarChart3,
  User,
  Eye,
  Plus,
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
import { Separator } from "../../components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { api } from "../../services/api";
import { Parcel } from "../../types/entities";
import { formatDate, formatNumber } from "../../utils/formatters";
import { PARCEL_STATUSES, getStatusConfig } from "../../constants";
import { DataTransformer } from "../../utils/transformers";

const ParcelDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: parcel,
    isLoading,
    error,
  } = useQuery<Parcel>({
    queryKey: ["parcel", id],
    queryFn: async () => {
      const response = await api.get(`/parcels/${id}`);
      return DataTransformer.transformParcelFromAPI(response.data.data);
    },
    enabled: !!id,
  });

  // Données des analyses de sol
  const { data: soilAnalyses } = useQuery({
    queryKey: ["parcel-soil-analyses", id],
    queryFn: async () => {
      const response = await api.get(`/parcels/${id}/soil-analyses`);
      return response.data.data;
    },
    enabled: !!id,
  });

  // Données des productions
  const { data: productions } = useQuery({
    queryKey: ["parcel-productions", id],
    queryFn: async () => {
      const response = await api.get(`/productions?parcelId=${id}`);
      return response.data.data.productions || [];
    },
    enabled: !!id,
  });

  const getStatusBadge = (status: string) => {
    const config = getStatusConfig(status, PARCEL_STATUSES);
    const colorClasses = {
      green: "bg-green-100 text-green-800 border-green-200",
      orange: "bg-orange-100 text-orange-800 border-orange-200",
      blue: "bg-blue-100 text-blue-800 border-blue-200",
    };

    const colorClass =
      colorClasses[config.color as keyof typeof colorClasses] ||
      colorClasses.green;

    return (
      <Badge className={`${colorClass} font-medium`}>{config.label}</Badge>
    );
  };

  const getLatestSoilAnalysis = () => {
    if (!soilAnalyses || soilAnalyses.length === 0) return null;
    return soilAnalyses.sort(
      (a: any, b: any) =>
        new Date(b.analysisDate).getTime() - new Date(a.analysisDate).getTime()
    )[0];
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

  if (error || !parcel) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Erreur lors du chargement de la parcelle</p>
        <Button onClick={() => navigate("/dashboard/parcels")} className="mt-4">
          Retour à la liste
        </Button>
      </div>
    );
  }

  const latestAnalysis = getLatestSoilAnalysis();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard/parcels")}
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <MapPin className="h-8 w-8 mr-3 text-green-600" />
              {parcel.name || `Parcelle ${parcel.id}`}
            </h1>
            <p className="text-muted-foreground">
              {getStatusBadge(parcel.status)} • {formatNumber(parcel.area)}{" "}
              hectares
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle analyse
          </Button>
          <Button>
            <Edit className="h-4 w-4 mr-2" />
            Modifier
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">
                  {formatNumber(parcel.area)}
                </p>
                <p className="text-xs text-muted-foreground">Hectares</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">
                  {parcel._count?.seedLots || 0}
                </p>
                <p className="text-xs text-muted-foreground">Lots produits</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Tractor className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">
                  {parcel._count?.productions || 0}
                </p>
                <p className="text-xs text-muted-foreground">Productions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <TestTube className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">
                  {latestAnalysis?.pH || "N/A"}
                </p>
                <p className="text-xs text-muted-foreground">pH du sol</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information */}
      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Informations</TabsTrigger>
          <TabsTrigger value="soil">Analyses de sol</TabsTrigger>
          <TabsTrigger value="productions">Productions</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Caractéristiques de la parcelle</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Nom
                    </label>
                    <p className="font-medium">
                      {parcel.name || `Parcelle ${parcel.id}`}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Statut
                    </label>
                    <p>{getStatusBadge(parcel.status)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Superficie
                    </label>
                    <p className="font-medium">
                      {formatNumber(parcel.area)} ha
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Type de sol
                    </label>
                    <p className="font-medium">
                      {parcel.soilType || "Non spécifié"}
                    </p>
                  </div>
                </div>

                <Separator />

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Adresse
                  </label>
                  <p className="mt-1">{parcel.address || "Non spécifiée"}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Latitude
                    </label>
                    <p className="font-mono text-sm">{parcel.latitude}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Longitude
                    </label>
                    <p className="font-mono text-sm">{parcel.longitude}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Infrastructure et gestion</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Système d'irrigation
                  </label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Droplets className="h-4 w-4 text-blue-500" />
                    <span>{parcel.irrigationSystem || "Non spécifié"}</span>
                  </div>
                </div>

                <Separator />

                {parcel.multiplier && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Station de production
                    </label>
                    <div className="flex items-center space-x-2 mt-1">
                      <User className="h-4 w-4 text-green-600" />
                      <span className="font-medium">
                        {parcel.multiplier.name}
                      </span>
                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="ml-2"
                      >
                        <Link
                          to={`/dashboard/multipliers/${parcel.multiplier.id}`}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Voir
                        </Link>
                      </Button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="text-muted-foreground">Créée le</label>
                    <p>{formatDate(parcel.createdAt)}</p>
                  </div>
                  <div>
                    <label className="text-muted-foreground">Modifiée le</label>
                    <p>{formatDate(parcel.updatedAt)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="soil">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <TestTube className="h-5 w-5 mr-2" />
                  Analyses de sol
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvelle analyse
                </Button>
              </CardTitle>
              <CardDescription>
                Historique des analyses chimiques et physiques du sol
              </CardDescription>
            </CardHeader>
            <CardContent>
              {soilAnalyses && soilAnalyses.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>pH</TableHead>
                      <TableHead>Matière org.</TableHead>
                      <TableHead>Azote</TableHead>
                      <TableHead>Phosphore</TableHead>
                      <TableHead>Potassium</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {soilAnalyses.map((analysis: any) => (
                      <TableRow key={analysis.id}>
                        <TableCell>
                          {formatDate(analysis.analysisDate)}
                        </TableCell>
                        <TableCell>
                          {analysis.pH ? analysis.pH.toFixed(1) : "N/A"}
                        </TableCell>
                        <TableCell>
                          {analysis.organicMatter
                            ? `${analysis.organicMatter.toFixed(1)}%`
                            : "N/A"}
                        </TableCell>
                        <TableCell>
                          {analysis.nitrogen
                            ? `${analysis.nitrogen.toFixed(1)} ppm`
                            : "N/A"}
                        </TableCell>
                        <TableCell>
                          {analysis.phosphorus
                            ? `${analysis.phosphorus.toFixed(1)} ppm`
                            : "N/A"}
                        </TableCell>
                        <TableCell>
                          {analysis.potassium
                            ? `${analysis.potassium.toFixed(1)} ppm`
                            : "N/A"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <TestTube className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    Aucune analyse de sol
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Commencez par effectuer une première analyse du sol de cette
                    parcelle.
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Première analyse
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="productions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Tractor className="h-5 w-5 mr-2" />
                Productions sur cette parcelle
              </CardTitle>
            </CardHeader>
            <CardContent>
              {productions && productions.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Lot</TableHead>
                      <TableHead>Période</TableHead>
                      <TableHead>Variété</TableHead>
                      <TableHead>Rendement</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productions.map((production: any) => (
                      <TableRow key={production.id}>
                        <TableCell className="font-mono">
                          {production.lotId}
                        </TableCell>
                        <TableCell>
                          {formatDate(production.startDate)}
                          {production.endDate &&
                            ` - ${formatDate(production.endDate)}`}
                        </TableCell>
                        <TableCell>
                          {production.seedLot?.variety?.name || "N/A"}
                        </TableCell>
                        <TableCell>
                          {production.actualYield
                            ? `${formatNumber(production.actualYield)} t/ha`
                            : "En cours"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{production.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            asChild
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <Link
                              to={`/dashboard/productions/${production.id}`}
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <Tractor className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    Aucune production
                  </h3>
                  <p className="text-muted-foreground">
                    Cette parcelle n'a pas encore été utilisée pour la
                    production.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Historique d'utilisation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Timeline des événements */}
                <div className="border-l-2 border-green-200 pl-4 space-y-4">
                  <div className="relative">
                    <div className="absolute -left-6 w-4 h-4 bg-green-500 rounded-full"></div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-medium">Création de la parcelle</h4>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(parcel.createdAt)}
                      </p>
                    </div>
                  </div>

                  {soilAnalyses?.map((analysis: any) => (
                    <div key={analysis.id} className="relative">
                      <div className="absolute -left-6 w-4 h-4 bg-blue-500 rounded-full"></div>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-medium">Analyse de sol</h4>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(analysis.analysisDate)}
                        </p>
                        {analysis.pH && (
                          <p className="text-sm">
                            pH: {analysis.pH.toFixed(1)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}

                  {productions?.map((production: any) => (
                    <div key={production.id} className="relative">
                      <div className="absolute -left-6 w-4 h-4 bg-orange-500 rounded-full"></div>
                      <div className="bg-orange-50 p-4 rounded-lg">
                        <h4 className="font-medium">
                          Production {production.lotId}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(production.startDate)}
                        </p>
                        <p className="text-sm">
                          Variété: {production.seedLot?.variety?.name || "N/A"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ParcelDetail;
