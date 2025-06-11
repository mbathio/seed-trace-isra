// frontend/src/pages/Dashboard.tsx - VERSION CORRIGÉE
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { StatsCard } from "../components/charts/StatsCard";
import { DashboardStats, SeedLot, Production } from "../types/entities";
import {
  Sprout,
  Users,
  FlaskConical,
  Tractor,
  TrendingUp,
  CheckCircle,
  Package,
  MapPin,
  Calendar,
  BarChart3,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { formatDate } from "../utils/formatters";
import {
  statisticsService,
  productionService,
  seedLotService,
} from "../services/api";

// ✅ CORRECTION: Types pour les réponses API
interface ProductionsResponse {
  data: Production[];
}

interface LotsResponse {
  data: SeedLot[];
}

const Dashboard: React.FC = () => {
  // ✅ CORRIGÉ: Utiliser le service spécialisé pour les statistiques
  const {
    data: stats,
    isLoading,
    error,
  } = useQuery<DashboardStats>({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const response = await statisticsService.getDashboard();
      return response.data.data;
    },
  });

  // ✅ CORRIGÉ: Utiliser le service de production
  const { data: recentProductionsResponse } = useQuery<ProductionsResponse>({
    queryKey: ["recent-productions"],
    queryFn: async () => {
      const response = await productionService.getAll({
        pageSize: 5,
        sortBy: "startDate",
        sortOrder: "desc",
      });
      return response.data;
    },
  });

  // ✅ CORRIGÉ: Utiliser le service de lots de semences
  const { data: recentLotsResponse } = useQuery<LotsResponse>({
    queryKey: ["recent-lots"],
    queryFn: async () => {
      const response = await seedLotService.getAll({
        pageSize: 5,
        sortBy: "productionDate",
        sortOrder: "desc",
      });
      return response.data;
    },
  });

  // ✅ CORRECTION: Extraction sécurisée des données avec transformation
  const recentActivities = React.useMemo(() => {
    if (!recentProductionsResponse?.data) return [];

    return recentProductionsResponse.data.map((production) => ({
      id: production.id.toString(),
      description: `Production ${getStatusLabel(production.status)} - ${
        production.seedLot?.variety?.name || "Variété inconnue"
      }`,
      createdAt: production.startDate,
      type: production.status,
    }));
  }, [recentProductionsResponse]);

  const recentLots = recentLotsResponse?.data || [];

  // ✅ AJOUT: Fonction utilitaire pour les labels de statut
  const getStatusLabel = (status: string): string => {
    const statusLabels: Record<string, string> = {
      PLANNED: "planifiée",
      IN_PROGRESS: "en cours",
      COMPLETED: "terminée",
      CANCELLED: "annulée",
    };
    return statusLabels[status] || status.toLowerCase();
  };

  // ✅ CORRECTION: Fonctions utilitaires pour les calculs sécurisés
  const getActiveMultipliers = () => {
    return stats?.overview?.activeMultipliers || 0;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">
            Chargement des données...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">
            Erreur lors du chargement des données
          </p>
          <p className="text-sm text-muted-foreground">
            Vérifiez que le serveur backend est démarré sur le port 3001
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            URL API:{" "}
            {import.meta.env.VITE_API_URL || "http://localhost:3001/api"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tableau de Bord</h1>
        <p className="text-muted-foreground">
          Vue d'ensemble du système de traçabilité des semences ISRA Saint-Louis
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Lots Actifs"
          value={stats?.overview?.activeSeedLots || 0}
          icon={Sprout}
          color="text-green-600"
          change={{
            value: 12,
            type: "increase",
          }}
        />
        <StatsCard
          title="Multiplicateurs"
          value={getActiveMultipliers()}
          icon={Users}
          color="text-blue-600"
          change={{
            value: 5,
            type: "increase",
          }}
        />
        <StatsCard
          title="Contrôles Qualité"
          value={stats?.overview?.totalQualityControls || 0}
          icon={FlaskConical}
          color="text-purple-600"
          change={{
            value: 8,
            type: "increase",
          }}
        />
        <StatsCard
          title="Productions"
          value={stats?.overview?.completedProductions || 0}
          icon={Tractor}
          color="text-orange-600"
          change={{
            value: 3,
            type: "increase",
          }}
        />
      </div>

      {/* Indicateurs de performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
              Taux de Réussite Qualité
            </CardTitle>
            <CardDescription>
              Pourcentage de lots ayant passé les contrôles qualité
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-2xl font-bold text-green-600">
                  {stats?.rates?.qualityPassRate?.toFixed(1) || "0"}%
                </span>
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <Progress
                value={stats?.rates?.qualityPassRate || 0}
                className="h-2"
              />
              <p className="text-sm text-muted-foreground">
                {stats?.overview?.passedQualityControls || 0} lots certifiés sur{" "}
                {stats?.overview?.totalQualityControls || 0} contrôlés
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
              Taux de Completion Production
            </CardTitle>
            <CardDescription>
              Pourcentage de productions terminées avec succès
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-2xl font-bold text-blue-600">
                  {stats?.rates?.productionCompletionRate?.toFixed(1) || "0"}%
                </span>
                <Tractor className="h-6 w-6 text-blue-600" />
              </div>
              <Progress
                value={stats?.rates?.productionCompletionRate || 0}
                className="h-2"
              />
              <p className="text-sm text-muted-foreground">
                {stats?.overview?.completedProductions || 0} productions
                terminées sur {stats?.overview?.totalProductions || 0} total
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Distribution des lots par niveau */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2 text-purple-600" />
              Distribution des Lots par Niveau
            </CardTitle>
            <CardDescription>
              Répartition des lots de semences par génération
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.distribution?.lotsByLevel?.map((item) => {
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
                  <div
                    key={item.level}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <Badge
                        className={
                          colors[item.level as keyof typeof colors] ||
                          "bg-gray-100 text-gray-800"
                        }
                      >
                        {item.level}
                      </Badge>
                      <span className="text-sm font-medium">
                        {item.count} lots
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {item.totalQuantity?.toFixed(1) || "0"} kg
                    </span>
                  </div>
                );
              }) || []}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Sprout className="h-5 w-5 mr-2 text-green-600" />
              Top Variétés
            </CardTitle>
            <CardDescription>Variétés les plus produites</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.distribution?.topVarieties
                ?.slice(0, 5)
                .map((item, index) => (
                  <div
                    key={item.variety?.id || index}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-800 text-xs font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {item.variety?.name || "Variété inconnue"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.variety?.code || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{item.count} lots</p>
                      <p className="text-xs text-muted-foreground">
                        {item.totalQuantity?.toFixed(1) || "0"} kg
                      </p>
                    </div>
                  </div>
                )) || []}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activités récentes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-blue-600" />
              Productions Récentes
            </CardTitle>
            <CardDescription>
              Dernières productions créées dans le système
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity, index) => (
                  <div
                    key={activity.id || index}
                    className="flex items-start space-x-3"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100">
                      <Tractor className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">
                        {activity.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(activity.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">
                  Aucune production récente
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Sprout className="h-5 w-5 mr-2 text-green-600" />
              Lots Récents
            </CardTitle>
            <CardDescription>Derniers lots de semences créés</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentLots.length > 0 ? (
                recentLots.map((lot) => {
                  const levelColors = {
                    GO: "bg-red-100 text-red-800",
                    G1: "bg-orange-100 text-orange-800",
                    G2: "bg-yellow-100 text-yellow-800",
                    G3: "bg-green-100 text-green-800",
                    G4: "bg-blue-100 text-blue-800",
                    R1: "bg-purple-100 text-purple-800",
                    R2: "bg-pink-100 text-pink-800",
                  };

                  return (
                    <div
                      key={lot.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-mono text-sm font-medium">
                            {lot.id}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {lot.variety?.name || "Variété inconnue"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          className={
                            levelColors[
                              lot.level as keyof typeof levelColors
                            ] || "bg-gray-100 text-gray-800"
                          }
                        >
                          {lot.level}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {lot.quantity} kg
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-muted-foreground text-sm">
                  Aucun lot récent
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Message si pas de données */}
      {stats &&
        Object.values(stats.overview || {}).every((val) => val === 0) && (
          <Card className="border-0 shadow-sm">
            <CardContent className="py-12 text-center">
              <Sprout className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Bienvenue dans ISRA Seeds
              </h3>
              <p className="text-muted-foreground mb-4">
                Aucune donnée disponible pour le moment. Commencez par créer des
                variétés et des lots de semences.
              </p>
              <div className="flex justify-center space-x-4">
                <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm">
                  Créer une variété
                </button>
                <button className="border border-green-600 text-green-600 hover:bg-green-50 px-4 py-2 rounded-md text-sm">
                  Créer un lot
                </button>
              </div>
            </CardContent>
          </Card>
        )}
    </div>
  );
};

export default Dashboard;
