// frontend/src/pages/productions/ProductionDetail.tsx
import React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Edit,
  Tractor,
  Calendar,
  MapPin,
  User,
  Package,
  Activity,
  AlertTriangle,
  Eye,
  Plus,
  TrendingUp,
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
import { Production } from "../../types/entities";
import { formatDate, formatNumber } from "../../utils/formatters";
import {
  PRODUCTION_STATUSES,
  ACTIVITY_TYPES,
  ISSUE_TYPES,
  ISSUE_SEVERITIES,
  getStatusConfig,
} from "../../constants";
import { DataTransformer } from "../../utils/transformers";

const ProductionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: production,
    isLoading,
    error,
  } = useQuery<Production>({
    queryKey: ["production", id],
    queryFn: async () => {
      const response = await api.get(`/productions/${id}`);
      return DataTransformer.transformProductionFromAPI(response.data.data);
    },
    enabled: !!id,
  });

  const getStatusBadge = (status: string) => {
    const config = getStatusConfig(status, PRODUCTION_STATUSES);
    const colorClasses = {
      blue: "bg-blue-100 text-blue-800 border-blue-200",
      orange: "bg-orange-100 text-orange-800 border-orange-200",
      green: "bg-green-100 text-green-800 border-green-200",
      red: "bg-red-100 text-red-800 border-red-200",
    };

    const colorClass =
      colorClasses[config.color as keyof typeof colorClasses] ||
      colorClasses.blue;

    return (
      <Badge className={`${colorClass} font-medium`}>{config.label}</Badge>
    );
  };

  const getActivityTypeBadge = (type: string) => {
    const config = getStatusConfig(type, ACTIVITY_TYPES);
    return (
      <Badge variant="outline" className="text-xs">
        <span className="mr-1">{config.icon}</span>
        {config.label}
      </Badge>
    );
  };

  const getIssueTypeBadge = (type: string) => {
    const config = getStatusConfig(type, ISSUE_TYPES);
    return (
      <Badge variant="outline" className="text-xs">
        {config.label}
      </Badge>
    );
  };

  const getIssueSeverityBadge = (severity: string) => {
    const config = getStatusConfig(severity, ISSUE_SEVERITIES);
    const colorClasses = {
      green: "bg-green-100 text-green-800 border-green-200",
      orange: "bg-orange-100 text-orange-800 border-orange-200",
      red: "bg-red-100 text-red-800 border-red-200",
    };

    const colorClass =
      colorClasses[config.color as keyof typeof colorClasses] ||
      colorClasses.green;

    return (
      <Badge className={`${colorClass} font-medium text-xs`}>
        {config.label}
      </Badge>
    );
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

  if (error || !production) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">
          Erreur lors du chargement de la production
        </p>
        <Button
          onClick={() => navigate("/dashboard/productions")}
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
            onClick={() => navigate("/dashboard/productions")}
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <Tractor className="h-8 w-8 mr-3 text-green-600" />
              Production {production.lotId}
            </h1>
            <p className="text-muted-foreground">
              {getStatusBadge(production.status)} •{" "}
              {formatDate(production.startDate)}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter activité
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
              <Package className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">
                  {formatNumber(production.plannedQuantity || 0)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Quantité planifiée (kg)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">
                  {production.actualYield
                    ? formatNumber(production.actualYield)
                    : "N/A"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Rendement réel (t/ha)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">
                  {production._count?.activities || 0}
                </p>
                <p className="text-xs text-muted-foreground">Activités</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">
                  {production._count?.issues || 0}
                </p>
                <p className="text-xs text-muted-foreground">Problèmes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information */}
      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Informations</TabsTrigger>
          <TabsTrigger value="activities">Activités</TabsTrigger>
          <TabsTrigger value="issues">Problèmes</TabsTrigger>
          <TabsTrigger value="weather">Données météo</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Informations de production</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Lot de semences
                    </label>
                    <Link
                      to={`/dashboard/seed-lots/${production.lotId}`}
                      className="font-mono text-blue-600 hover:underline block"
                    >
                      {production.lotId}
                    </Link>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Statut
                    </label>
                    <p>{getStatusBadge(production.status)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Date de début
                    </label>
                    <p className="font-medium">
                      {formatDate(production.startDate)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Date de fin
                    </label>
                    <p className="font-medium">
                      {production.endDate
                        ? formatDate(production.endDate)
                        : "En cours"}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Date de semis
                    </label>
                    <p className="font-medium">
                      {formatDate(production.sowingDate)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Date de récolte
                    </label>
                    <p className="font-medium">
                      {production.harvestDate
                        ? formatDate(production.harvestDate)
                        : "Non définie"}
                    </p>
                  </div>
                </div>

                {production.notes && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Notes
                    </label>
                    <p className="mt-1 text-sm">{production.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Acteurs et localisation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Multiplicateur responsable
                  </label>
                  <div className="flex items-center space-x-2 mt-1">
                    <User className="h-4 w-4 text-green-600" />
                    <span className="font-medium">
                      {production.multiplier.name}
                    </span>
                    <Button asChild variant="ghost" size="sm" className="ml-2">
                      <Link
                        to={`/dashboard/multipliers/${production.multiplier.id}`}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Voir
                      </Link>
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Parcelle
                  </label>
                  <div className="flex items-center space-x-2 mt-1">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">
                      {production.parcel.name ||
                        `Parcelle ${production.parcel.id}`}
                    </span>
                    <Button asChild variant="ghost" size="sm" className="ml-2">
                      <Link to={`/dashboard/parcels/${production.parcel.id}`}>
                        <Eye className="h-4 w-4 mr-1" />
                        Voir
                      </Link>
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatNumber(production.parcel.area)} ha •{" "}
                    {production.parcel.soilType || "Sol non spécifié"}
                  </p>
                </div>

                <Separator />

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Variété cultivée
                  </label>
                  <div className="mt-1">
                    <p className="font-medium">
                      {production.seedLot.variety.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {production.seedLot.variety.cropType} • Niveau{" "}
                      {production.seedLot.level}
                    </p>
                  </div>
                </div>

                {production.weatherConditions && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Conditions météo
                    </label>
                    <p className="mt-1 text-sm">
                      {production.weatherConditions}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activities">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Activités de production
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvelle activité
                </Button>
              </CardTitle>
              <CardDescription>
                Historique des activités réalisées sur cette production
              </CardDescription>
            </CardHeader>
            <CardContent>
              {production.activities && production.activities.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Personnel</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {production.activities.map((activity) => (
                      <TableRow key={activity.id}>
                        <TableCell>
                          {formatDate(activity.activityDate)}
                        </TableCell>
                        <TableCell>
                          {getActivityTypeBadge(activity.type)}
                        </TableCell>
                        <TableCell>
                          <p className="max-w-xs truncate">
                            {activity.description}
                          </p>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {activity.personnel.slice(0, 2).join(", ")}
                            {activity.personnel.length > 2 &&
                              ` +${activity.personnel.length - 2}`}
                          </div>
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
                  <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    Aucune activité enregistrée
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Commencez par ajouter la première activité de cette
                    production.
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Première activité
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="issues">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Problèmes et incidents
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Signaler un problème
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {production.issues && production.issues.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Sévérité</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {production.issues.map((issue) => (
                      <TableRow key={issue.id}>
                        <TableCell>{formatDate(issue.issueDate)}</TableCell>
                        <TableCell>{getIssueTypeBadge(issue.type)}</TableCell>
                        <TableCell>
                          {getIssueSeverityBadge(issue.severity)}
                        </TableCell>
                        <TableCell>
                          <p className="max-w-xs truncate">
                            {issue.description}
                          </p>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={issue.resolved ? "default" : "secondary"}
                          >
                            {issue.resolved ? "Résolu" : "En cours"}
                          </Badge>
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
                  <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    Aucun problème signalé
                  </h3>
                  <p className="text-muted-foreground">
                    Cette production n'a pas encore de problèmes signalés.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weather">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Données météorologiques
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Données météo non disponibles
                </h3>
                <p className="text-muted-foreground">
                  Les données météorologiques pour cette production ne sont pas
                  encore disponibles.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductionDetail;
