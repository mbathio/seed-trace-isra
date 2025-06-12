// frontend/src/pages/DashboardPage.tsx - PAGE DASHBOARD CORRIGÉE
import React from "react";
import { Link } from "react-router-dom";
import {
  Sprout,
  Users,
  FlaskConical,
  Tractor,
  TrendingUp,
  Package,
  CheckCircle,
  AlertTriangle,
  Clock,
  Leaf,
  BarChart3,
  PlusCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { StatsCard } from "../components/charts/StatsCard";
import { ProductionChart } from "../components/charts/ProductionChart";
import { useApiQuery } from "../hooks/useApi";
import { LoadingSpinner } from "../layouts/LoadingSpinner";
import { DashboardStats } from "../types/entities";

// ✅ CORRECTION: Type pour les données de graphique
interface ChartDataPoint {
  month: string;
  productions: number;
  yield: number;
}

const DashboardPage: React.FC = () => {
  // Récupération des statistiques du dashboard
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
  } = useApiQuery<DashboardStats>(
    ["dashboard", "stats"],
    "/statistics/dashboard",
    {},
    {
      refetchInterval: 5 * 60 * 1000, // Actualiser toutes les 5 minutes
    }
  );

  // Récupération des tendances mensuelles
  const { data: trends, isLoading: trendsLoading } = useApiQuery<
    ChartDataPoint[]
  >(["dashboard", "trends"], "/statistics/trends", { months: 6 });

  // ✅ CORRECTION: Données factices typées correctement
  const defaultChartData: ChartDataPoint[] = [
    { month: "Jan", productions: 12, yield: 8.5 },
    { month: "Fév", productions: 15, yield: 9.2 },
    { month: "Mar", productions: 18, yield: 9.8 },
    { month: "Avr", productions: 22, yield: 10.1 },
    { month: "Mai", productions: 25, yield: 9.9 },
    { month: "Jun", productions: 28, yield: 10.3 },
  ];

  // ✅ CORRECTION: Gestion des données du graphique avec type correct
  const chartData = trends || defaultChartData;

  if (statsLoading) {
    return (
      <LoadingSpinner size="lg" message="Chargement du tableau de bord..." />
    );
  }

  if (statsError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Erreur de chargement</h2>
          <p className="text-muted-foreground mb-4">
            Impossible de charger les données du tableau de bord
          </p>
          <Button onClick={() => window.location.reload()}>Réessayer</Button>
        </div>
      </div>
    );
  }

  // Statistiques par défaut si pas de données
  const defaultStats: DashboardStats = {
    overview: {
      totalSeedLots: 0,
      activeSeedLots: 0,
      totalProductions: 0,
      completedProductions: 0,
      totalQualityControls: 0,
      passedQualityControls: 0,
      activeMultipliers: 0,
      totalVarieties: 0,
    },
    rates: {
      productionCompletionRate: 0,
      qualityPassRate: 0,
    },
    distribution: {
      lotsByLevel: [],
      topVarieties: [],
    },
    activity: {
      recentProductions: 0,
    },
  };

  const dashboardData = stats || defaultStats;

  return (
    <div className="space-y-6">
      {/* En-tête du dashboard */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tableau de bord</h1>
          <p className="text-muted-foreground">
            Vue d'ensemble de votre système de traçabilité des semences
          </p>
        </div>
        <div className="flex space-x-2">
          <Button asChild>
            <Link to="/dashboard/seeds/create">
              <PlusCircle className="h-4 w-4 mr-2" />
              Nouveau lot
            </Link>
          </Button>
        </div>
      </div>

      {/* Cartes de statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Lots de semences"
          value={dashboardData.overview.totalSeedLots}
          icon={Package}
          color="text-blue-600"
          change={{
            value: dashboardData.overview.activeSeedLots,
            type: "increase",
          }}
        />
        <StatsCard
          title="Productions"
          value={dashboardData.overview.totalProductions}
          icon={Tractor}
          color="text-green-600"
          change={{
            value: Math.round(dashboardData.rates.productionCompletionRate),
            type: "increase",
          }}
        />
        <StatsCard
          title="Contrôles qualité"
          value={dashboardData.overview.totalQualityControls}
          icon={FlaskConical}
          color="text-purple-600"
          change={{
            value: Math.round(dashboardData.rates.qualityPassRate),
            type: "increase",
          }}
        />
        <StatsCard
          title="Multiplicateurs actifs"
          value={dashboardData.overview.activeMultipliers}
          icon={Users}
          color="text-orange-600"
        />
      </div>

      {/* Section des graphiques et aperçus */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graphique des productions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Évolution des productions
            </CardTitle>
            <CardDescription>
              Productions et rendements des 6 derniers mois
            </CardDescription>
          </CardHeader>
          <CardContent>
            {trendsLoading ? (
              <LoadingSpinner size="md" />
            ) : (
              <ProductionChart data={chartData} type="line" />
            )}
          </CardContent>
        </Card>

        {/* Distribution par niveau */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Sprout className="h-5 w-5 mr-2" />
              Distribution par niveau
            </CardTitle>
            <CardDescription>
              Répartition des lots de semences par niveau
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.distribution.lotsByLevel.length > 0 ? (
                dashboardData.distribution.lotsByLevel.map((item) => (
                  <div
                    key={item.level}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="font-medium">{item.level}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{item.count} lots</div>
                      <div className="text-sm text-muted-foreground">
                        {item.totalQuantity}kg
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Sprout className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Aucun lot de semences</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section des actions rapides et aperçus */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Actions rapides */}
        <Card>
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
            <CardDescription>
              Accès rapide aux fonctions principales
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild variant="outline" className="w-full justify-start">
              <Link to="/dashboard/seeds/create">
                <Package className="h-4 w-4 mr-2" />
                Créer un lot de semences
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link to="/dashboard/quality/create">
                <FlaskConical className="h-4 w-4 mr-2" />
                Nouveau contrôle qualité
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link to="/dashboard/varieties/create">
                <Leaf className="h-4 w-4 mr-2" />
                Ajouter une variété
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link to="/dashboard/productions/create">
                <Tractor className="h-4 w-4 mr-2" />
                Nouvelle production
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Aperçu des variétés principales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Variétés principales
              <Link to="/dashboard/varieties">
                <Button variant="ghost" size="sm">
                  Voir tout
                </Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData.distribution.topVarieties.length > 0 ? (
                dashboardData.distribution.topVarieties.slice(0, 5).map(
                  (
                    item // ✅ CORRECTION: Suppression du paramètre index inutilisé
                  ) => (
                    <div
                      key={item.variety.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium">
                          {item.variety.name}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold">
                          {item.count}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          lots
                        </div>
                      </div>
                    </div>
                  )
                )
              ) : (
                <div className="text-center py-8">
                  <Leaf className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Aucune variété
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Alertes et notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
              Alertes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg">
                <Clock className="h-4 w-4 text-orange-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Lots expirant bientôt</p>
                  <p className="text-xs text-muted-foreground">
                    3 lots expirent dans les 30 prochains jours
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Contrôles en attente</p>
                  <p className="text-xs text-muted-foreground">
                    5 lots nécessitent un contrôle qualité
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                <TrendingUp className="h-4 w-4 text-green-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Productions récentes</p>
                  <p className="text-xs text-muted-foreground">
                    {dashboardData.activity.recentProductions} nouvelles
                    productions ce mois
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section des liens rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link to="/dashboard/seeds">
            <CardContent className="p-6 text-center">
              <Package className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <h3 className="font-semibold">Lots de semences</h3>
              <p className="text-sm text-muted-foreground">
                {dashboardData.overview.totalSeedLots} lots
              </p>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link to="/dashboard/varieties">
            <CardContent className="p-6 text-center">
              <Leaf className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <h3 className="font-semibold">Variétés</h3>
              <p className="text-sm text-muted-foreground">
                {dashboardData.overview.totalVarieties} variétés
              </p>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link to="/dashboard/multipliers">
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-orange-600" />
              <h3 className="font-semibold">Multiplicateurs</h3>
              <p className="text-sm text-muted-foreground">
                {dashboardData.overview.activeMultipliers} actifs
              </p>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link to="/dashboard/quality">
            <CardContent className="p-6 text-center">
              <FlaskConical className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <h3 className="font-semibold">Contrôles qualité</h3>
              <p className="text-sm text-muted-foreground">
                {dashboardData.overview.totalQualityControls} contrôles
              </p>
            </CardContent>
          </Link>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
