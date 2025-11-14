// frontend/src/pages/productions/ProductionDetail.tsx - VERSION CORRIGÉE

import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Edit,
  Tractor,
  Calendar,
  User,
  MapPin,
  Package,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Plus,
  Eye,
  Activity,
  Cloud,
  MoreHorizontal,
  Trash2,
  PlayCircle,
  PauseCircle,
  StopCircle,
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
import { Progress } from "../../components/ui/progress";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../components/ui/alert-dialog";
import { api } from "../../services/api";
import { Production } from "../../types/entities";
import { formatDate, formatNumber } from "../../utils/formatters";
import { toast } from "react-toastify";
import {
  PRODUCTION_STATUSES,
  ACTIVITY_TYPES,
  ISSUE_TYPES,
  ISSUE_SEVERITIES,
  getStatusConfig,
} from "../../constants";

// Composants modaux pour les actions
import { AddActivityModal } from "../../components/production/AddActivityModal";
import { AddIssueModal } from "../../components/production/AddIssueModal";
import { AddWeatherModal } from "../../components/production/AddWeatherModal";

// ✅ AJOUT: Fonctions utilitaires pour les calculs
const calculateProgress = (
  status: string,
  startDate: string,
  endDate?: string,
  activities: any[] = []
): number => {
  switch (status) {
    case "planned":
      return 0;
    case "completed":
      return 100;
    case "cancelled":
      return 0;
    case "in-progress":
      // Calcul basé sur les activités (70%) et le temps écoulé (30%)
      const totalActivities = 8; // Types d'activités possibles
      const completedActivities = new Set(activities.map((a) => a.type)).size;
      const activityProgress = (completedActivities / totalActivities) * 70;

      // 30% basé sur le temps écoulé
      const start = new Date(startDate);
      const now = new Date();
      const end = endDate
        ? new Date(endDate)
        : new Date(start.getTime() + 120 * 24 * 60 * 60 * 1000); // 120 jours par défaut
      const totalDuration = end.getTime() - start.getTime();
      const elapsedDuration = now.getTime() - start.getTime();
      const timeProgress = Math.min((elapsedDuration / totalDuration) * 30, 30);

      return Math.min(Math.round(activityProgress + timeProgress), 95);
    default:
      return 0;
  }
};

const calculateDuration = (startDate: string, endDate?: string): number => {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
};

const calculateEfficiency = (actual: number, planned: number): number => {
  if (!planned || planned === 0) return 0;
  return Math.round((actual / planned) * 100);
};

const ProductionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // États pour les modals
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showWeatherModal, setShowWeatherModal] = useState(false);

  const {
    data: production,
    isLoading,
    error,
  } = useQuery<Production>({
    queryKey: ["production", id],
    queryFn: async () => {
      const response = await api.get(`/productions/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });

  // Mutations pour les actions
  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      return api.put(`/productions/${id}`, { status: newStatus });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["production", id] });
      toast.success("Statut mis à jour avec succès");
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour du statut");
    },
  });

  const deleteProductionMutation = useMutation({
    mutationFn: async () => {
      return api.delete(`/productions/${id}`);
    },
    onSuccess: () => {
      toast.success("Production supprimée avec succès");
      navigate("/dashboard/productions");
    },
    onError: () => {
      toast.error("Erreur lors de la suppression");
    },
  });

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

  // Calculs des métriques
  const progress = calculateProgress(
    production.status,
    production.startDate,
    production.endDate,
    production.activities
  );

  const duration = calculateDuration(production.startDate, production.endDate);

  const efficiency =
    production.plannedQuantity && production.actualYield
      ? calculateEfficiency(production.actualYield, production.plannedQuantity)
      : null;

  const getStatusBadge = (status: string) => {
    const config = getStatusConfig(status, PRODUCTION_STATUSES);
    let colorClass = "bg-gray-100 text-gray-800";

    switch (status) {
      case "planned":
        colorClass = "bg-blue-100 text-blue-800";
        break;
      case "in-progress":
        colorClass = "bg-orange-100 text-orange-800";
        break;
      case "completed":
        colorClass = "bg-green-100 text-green-800";
        break;
      case "cancelled":
        colorClass = "bg-red-100 text-red-800";
        break;
    }

    return (
      <Badge className={`${colorClass} font-medium`}>{config.label}</Badge>
    );
  };

  const getStatusActions = () => {
    const actions = [];

    switch (production.status) {
      case "planned":
        actions.push({
          label: "Démarrer",
          action: () => updateStatusMutation.mutate("in-progress"),
          icon: PlayCircle,
          variant: "default" as const,
        });
        break;
      case "in-progress":
        actions.push({
          label: "Terminer",
          action: () => updateStatusMutation.mutate("completed"),
          icon: CheckCircle,
          variant: "default" as const,
        });
        actions.push({
          label: "Suspendre",
          action: () => updateStatusMutation.mutate("planned"),
          icon: PauseCircle,
          variant: "outline" as const,
        });
        break;
      case "completed":
        actions.push({
          label: "Rouvrir",
          action: () => updateStatusMutation.mutate("in-progress"),
          icon: PlayCircle,
          variant: "outline" as const,
        });
        break;
    }

    if (production.status !== "cancelled") {
      actions.push({
        label: "Annuler",
        action: () => updateStatusMutation.mutate("cancelled"),
        icon: StopCircle,
        variant: "destructive" as const,
      });
    }

    return actions;
  };

  return (
    <div className="space-y-6">
      {/* Header avec actions */}
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
              Production #{production.id}
            </h1>
            <div className="flex items-center space-x-2 mt-1">
              {getStatusBadge(production.status)}
              <Badge variant="outline">Lot {production.lotId}</Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Actions rapides */}
          <Button
            variant="outline"
            onClick={() => setShowActivityModal(true)}
            disabled={
              production.status === "completed" ||
              production.status === "cancelled"
            }
          >
            <Plus className="h-4 w-4 mr-2" />
            Activité
          </Button>

          <Button
            variant="outline"
            onClick={() => setShowIssueModal(true)}
            disabled={
              production.status === "completed" ||
              production.status === "cancelled"
            }
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Problème
          </Button>

          {/* Menu d'actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to={`/dashboard/productions/${production.id}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {getStatusActions().map((action, index) => (
                <DropdownMenuItem
                  key={index}
                  onClick={action.action}
                  className={
                    action.variant === "destructive" ? "text-red-600" : ""
                  }
                >
                  <action.icon className="h-4 w-4 mr-2" />
                  {action.label}
                </DropdownMenuItem>
              ))}

              <DropdownMenuSeparator />

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Supprimer la production</AlertDialogTitle>
                    <AlertDialogDescription>
                      Cette action est irréversible. Toutes les données de cette
                      production seront définitivement supprimées.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => deleteProductionMutation.mutate()}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Supprimer
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Métriques de performance */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-bold">{duration}</p>
                  <p className="text-xs text-muted-foreground">Jours</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Progrès</p>
                <p className="text-sm font-medium">{progress}%</p>
              </div>
            </div>
            <Progress value={progress} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">
                  {formatNumber(production.plannedQuantity || 0)}
                </p>
                <p className="text-xs text-muted-foreground">Kg planifiés</p>
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
                  Rendement (t/ha)
                </p>
              </div>
            </div>
            {efficiency && (
              <div className="mt-1">
                <p className="text-xs text-muted-foreground">
                  Efficacité: {efficiency}%
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">
                  {production._count?.activities}
                </p>
                <p className="text-xs text-muted-foreground">Activités</p>
              </div>
            </div>
            {production._count?.issues && production._count.issues > 0 && (
              <div className="mt-1">
                <p className="text-xs text-red-600">
                  {production._count.issues} problème(s)
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Contenu principal avec onglets */}
      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Informations</TabsTrigger>
          <TabsTrigger value="activities">Activités</TabsTrigger>
          <TabsTrigger value="issues">Problèmes</TabsTrigger>
          <TabsTrigger value="weather">Météo</TabsTrigger>
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
                    <div className="mt-1">
                      {getStatusBadge(production.status)}
                    </div>
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
                        : "À venir"}
                    </p>
                  </div>
                </div>

                {production.notes && (
                  <>
                    <Separator />
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Notes
                      </label>
                      <p className="mt-1 text-sm">{production.notes}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Acteurs et localisation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {production.multiplier && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Station
                    </label>
                    <div className="flex items-center space-x-2 mt-1">
                      <User className="h-4 w-4 text-green-600" />
                      <span className="font-medium">
                        {production.multiplier.name}
                      </span>
                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="ml-2"
                      >
                        <Link
                          to={`/dashboard/multipliers/${production.multiplier.id}`}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Voir
                        </Link>
                      </Button>
                    </div>
                  </div>
                )}

                {production.parcel && (
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
                      <span className="text-sm text-muted-foreground">
                        ({formatNumber(production.parcel.area)} ha)
                      </span>
                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="ml-2"
                      >
                        <Link to={`/dashboard/parcels/${production.parcel.id}`}>
                          <Eye className="h-4 w-4 mr-1" />
                          Voir
                        </Link>
                      </Button>
                    </div>
                  </div>
                )}

                {production.seedLot?.variety && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Variété
                    </label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Package className="h-4 w-4 text-purple-600" />
                      <span className="font-medium">
                        {production.seedLot.variety.name}
                      </span>
                      <Badge variant="outline">
                        {production.seedLot.level}
                      </Badge>
                    </div>
                  </div>
                )}

                <Separator />

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="text-muted-foreground">Créée le</label>
                    <p>{formatDate(production.createdAt)}</p>
                  </div>
                  <div>
                    <label className="text-muted-foreground">Modifiée le</label>
                    <p>{formatDate(production.updatedAt)}</p>
                  </div>
                </div>
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
                <Button
                  onClick={() => setShowActivityModal(true)}
                  disabled={
                    production.status === "completed" ||
                    production.status === "cancelled"
                  }
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvelle activité
                </Button>
              </CardTitle>
              <CardDescription>
                Historique des activités agricoles
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
                    {production.activities.map((activity) => {
                      const activityConfig = getStatusConfig(
                        activity.type,
                        ACTIVITY_TYPES
                      );
                      return (
                        <TableRow key={activity.id}>
                          <TableCell>
                            {formatDate(activity.activityDate)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <span>{activityConfig.label}</span>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {activity.description}
                          </TableCell>
                          <TableCell>
                            {activity.personnel?.join(", ") || "Non spécifié"}
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
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    Aucune activité
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Commencez par enregistrer les activités de cette production.
                  </p>
                  <Button onClick={() => setShowActivityModal(true)}>
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
                  Problèmes rencontrés
                </div>
                <Button onClick={() => setShowIssueModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Signaler un problème
                </Button>
              </CardTitle>
              <CardDescription>
                Incidents et problèmes survenus pendant la production
              </CardDescription>
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
                    {production.issues.map((issue) => {
                      const issueConfig = getStatusConfig(
                        issue.type,
                        ISSUE_TYPES
                      );
                      const severityConfig = getStatusConfig(
                        issue.severity,
                        ISSUE_SEVERITIES
                      );
                      return (
                        <TableRow key={issue.id}>
                          <TableCell>{formatDate(issue.issueDate)}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <span>{issueConfig.label}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <span>{severityConfig.label}</span>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {issue.description}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                issue.resolved ? "default" : "destructive"
                              }
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
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Aucun problème</h3>
                  <p className="text-muted-foreground">
                    Parfait ! Cette production n'a rencontré aucun problème.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weather">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Cloud className="h-5 w-5 mr-2" />
                  Données météorologiques
                </div>
                <Button onClick={() => setShowWeatherModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter données
                </Button>
              </CardTitle>
              <CardDescription>
                Conditions météorologiques pendant la production
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                {production.weatherConditions || "Non renseigné"}
              </p>
            </CardContent>
          </Card>

          {/* 🌧️ Nouvelle carte : données météo détaillées */}
          <Card>
            <CardHeader>
              <CardTitle>Données météorologiques</CardTitle>
              <CardDescription>
                Historique des relevés météo associés à cette production
              </CardDescription>
            </CardHeader>
            <CardContent>
              {production.weatherData && production.weatherData.length > 0 ? (
                <div className="border rounded-lg overflow-hidden">
                  <div className="grid grid-cols-5 gap-2 px-4 py-2 text-xs font-semibold bg-muted">
                    <span>Date</span>
                    <span>Temp. (°C)</span>
                    <span>Pluie (mm)</span>
                    <span>Humidité (%)</span>
                    <span>Source</span>
                  </div>
                  {production.weatherData.map((w: any) => (
                    <div
                      key={w.id}
                      className="grid grid-cols-5 gap-2 px-4 py-2 text-xs border-t"
                    >
                      <span>{formatDate(w.recordDate)}</span>
                      <span>{w.temperature}</span>
                      <span>{w.rainfall}</span>
                      <span>{w.humidity}</span>
                      <span>{w.source || "-"}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Aucune donnée météorologique enregistrée pour cette
                  production.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <AddActivityModal
        open={showActivityModal}
        onOpenChange={setShowActivityModal}
        productionId={production.id}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["production", id] });
          setShowActivityModal(false);
        }}
      />

      <AddIssueModal
        open={showIssueModal}
        onOpenChange={setShowIssueModal}
        productionId={production.id}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["production", id] });
          setShowIssueModal(false);
        }}
      />

      <AddWeatherModal
        open={showWeatherModal}
        onOpenChange={setShowWeatherModal}
        productionId={production.id}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["production", id] });
          setShowWeatherModal(false);
        }}
      />
    </div>
  );
};

export default ProductionDetail;
