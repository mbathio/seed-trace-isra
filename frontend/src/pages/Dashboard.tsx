// frontend/src/pages/Dashboard.tsx
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Seedling,
  Users,
  FlaskConical,
  Tractor,
  TrendingUp,
  TrendingDown,
  Plus,
  Activity,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { StatsCard } from "../components/charts/StatsCard";
import { api } from "../services/api";
import { DashboardStats } from "../types/entities";
import { formatNumber, formatPercentage } from "../utils/formatters";

const Dashboard: React.FC = () => {
  const {
    data: stats,
    isLoading,
    error,
  } = useQuery<DashboardStats>({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const response = await api.get("/statistics/dashboard");
      return response.data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Tableau de bord</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">
          Erreur lors du chargement des statistiques
        </p>
      </div>
    );
  }

  const statsCards = [
    {
      title: "Lots de semences",
      value: formatNumber(stats?.overview.totalSeedLots || 0),
      icon: Seedling,
      color: "text-green-600",
      description: `${stats?.overview.activeSeedLots || 0} actifs`,
    },
    {
      title: "Productions",
      value: formatNumber(stats?.overview.totalProductions || 0),
      icon: Tractor,
      color: "text-blue-600",
      description: `${formatPercentage(
        stats?.rates.productionCompletionRate || 0
      )} terminées`,
    },
    {
      title: "Contrôles qualité",
      value: formatNumber(stats?.overview.totalQualityControls || 0),
      icon: FlaskConical,
      color: "text-purple-600",
      description: `${formatPercentage(
        stats?.rates.qualityPassRate || 0
      )} réussis`,
    },
    {
      title: "Multiplicateurs",
      value: formatNumber(stats?.overview.activeMultipliers || 0),
      icon: Users,
      color: "text-orange-600",
      description: "actifs",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tableau de bord</h1>
          <p className="text-muted-foreground">
            Vue d'ensemble de votre système de traçabilité
          </p>
        </div>
        <div className="flex space-x-2">
          <Button asChild>
            <Link to="/seeds/create">
              <Plus className="h-4 w-4 mr-2" />
              Nouveau lot
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
          />
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Distribution par niveau */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Distribution des lots par niveau</CardTitle>
            <CardDescription>
              Répartition des semences selon leur génération
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.distribution.lotsByLevel.map((level) => (
                <div key={level.level} className="flex items-center space-x-4">
                  <div className="w-12 text-sm font-medium">{level.level}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>{level.count} lots</span>
                      <span>{formatNumber(level.totalQuantity)} kg</span>
                    </div>
                    <Progress
                      value={
                        (level.count / (stats?.overview.totalSeedLots || 1)) *
                        100
                      }
                      className="h-2"
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Activité récente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Activité récente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Nouveau lot créé</p>
                  <p className="text-xs text-muted-foreground">
                    Il y a 2 heures
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    Contrôle qualité effectué
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Il y a 4 heures
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 bg-purple-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Production terminée</p>
                  <p className="text-xs text-muted-foreground">Hier</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top variétés */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Variétés les plus produites</CardTitle>
            <CardDescription>
              Top 5 des variétés par nombre de lots
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.distribution.topVarieties
                .slice(0, 5)
                .map((item, index) => (
                  <div
                    key={item.variety.id}
                    className="flex items-center space-x-4"
                  >
                    <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{item.variety.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.variety.code}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{item.count} lots</p>
                          <p className="text-sm text-muted-foreground">
                            {formatNumber(item.totalQuantity)} kg
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions rapides */}
        <Card>
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild variant="outline" className="w-full justify-start">
              <Link to="/seeds/create">
                <Plus className="h-4 w-4 mr-2" />
                Créer un lot
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link to="/quality">
                <FlaskConical className="h-4 w-4 mr-2" />
                Nouveau contrôle
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link to="/varieties/create">
                <Seedling className="h-4 w-4 mr-2" />
                Ajouter variété
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link to="/reports">
                <TrendingUp className="h-4 w-4 mr-2" />
                Voir rapports
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
