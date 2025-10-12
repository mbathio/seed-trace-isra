// frontend/src/pages/Dashboard.tsx
import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";
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
  Loader2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

// =================== Types ===================
interface DashboardStats {
  overview: {
    totalSeedLots: number;
    activeSeedLots: number;
    totalProductions: number;
    completedProductions: number;
    totalQualityControls: number;
    passedQualityControls: number;
    activeMultipliers: number;
    totalVarieties: number;
  };
  rates: {
    productionCompletionRate: number;
    qualityPassRate: number;
  };
  distribution: {
    lotsByLevel: Array<{ level: string; count: number; totalQuantity: number }>;
    topVarieties: Array<{
      variety: { name: string; code: string };
      count: number;
      totalQuantity: number;
    }>;
  };
  activity: { recentProductions: number };
}

interface TrendPoint {
  month: string;
  count: number;
  avgYield: number;
}

// =================== Hooks ===================
const useDashboardStats = () => {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const response = await api.get("/statistics/dashboard");
      return response.data.data as DashboardStats;
    },
  });
};

const useDashboardTrends = () => {
  return useQuery({
    queryKey: ["dashboard-trends"],
    queryFn: async () => {
      const response = await api.get("/statistics/trends?months=6");
      return response.data.data.production as TrendPoint[];
    },
  });
};

const useCurrentProductions = () => {
  return useQuery({
    queryKey: ["current-productions"],
    queryFn: async () => {
      const response = await api.get("/productions", {
        params: { status: "in-progress", pageSize: 5 },
      });
      return response.data;
    },
  });
};

// =================== Composant Carte Stat ===================
const StatsCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  change?: { value: number; type: "increase" | "decrease" };
}> = ({ title, value, icon: Icon, color, change }) => (
  <Card className="hover:shadow-lg transition-shadow">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <div className="flex items-baseline mt-2">
            <p className="text-2xl font-bold">{value}</p>
            {change && (
              <span
                className={`ml-2 text-sm font-medium ${
                  change.type === "increase" ? "text-green-600" : "text-red-600"
                }`}
              >
                {change.type === "increase" ? "+" : "-"}
                {Math.abs(change.value)}%
              </span>
            )}
          </div>
        </div>
        <div
          className={`p-3 rounded-full bg-opacity-10 ${color.replace(
            "text-",
            "bg-"
          )}`}
        >
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
      </div>
    </CardContent>
  </Card>
);

// =================== Page principale ===================
export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: trends, isLoading: trendsLoading } = useDashboardTrends();
  const { data: productions, isLoading: productionsLoading } =
    useCurrentProductions();

  const isLoading = statsLoading || trendsLoading || productionsLoading;

  const COLORS = [
    "#10b981",
    "#3b82f6",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#06b6d4",
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
        <p>Impossible de charger les données du tableau de bord</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* ======== HEADER ======== */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tableau de bord</h1>
          <p className="text-muted-foreground">
            Vue d’ensemble du système de traçabilité des semences
          </p>
        </div>
        <Button asChild>
          <Link to="/dashboard/seed-lots/create">
            <PlusCircle className="h-4 w-4 mr-2" /> Nouveau lot
          </Link>
        </Button>
      </div>

      {/* ======== STATS CARDS ======== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Lots de semences"
          value={stats.overview.totalSeedLots}
          icon={Package}
          color="text-blue-600"
        />
        <StatsCard
          title="Productions"
          value={stats.overview.totalProductions}
          icon={Tractor}
          color="text-green-600"
          change={{
            value: Math.round(stats.rates.productionCompletionRate),
            type: "increase",
          }}
        />
        <StatsCard
          title="Contrôles qualité"
          value={stats.overview.totalQualityControls}
          icon={FlaskConical}
          color="text-purple-600"
          change={{
            value: Math.round(stats.rates.qualityPassRate),
            type: "increase",
          }}
        />
        <StatsCard
          title="Multiplicateurs actifs"
          value={stats.overview.activeMultipliers}
          icon={Users}
          color="text-orange-600"
        />
      </div>

      {/* ======== GRAPHES ======== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" /> Évolution des productions
            </CardTitle>
            <CardDescription>6 derniers mois</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#10b981"
                  name="Productions"
                />
                <Line
                  type="monotone"
                  dataKey="avgYield"
                  stroke="#3b82f6"
                  name="Rendement moyen"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <Sprout className="h-5 w-5 mr-2 inline" />
              Distribution par niveau
            </CardTitle>
            <CardDescription>Lots de semences actifs</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.distribution.lotsByLevel}
                  dataKey="count"
                  nameKey="level"
                  outerRadius={100}
                  label
                >
                  {stats.distribution.lotsByLevel.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* ======== ACTIONS RAPIDES / ALERTES / ACTIVITÉ ======== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Actions rapides */}
        <Card>
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
            <CardDescription>
              Accédez rapidement aux principales fonctionnalités
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild variant="outline" className="w-full justify-start">
              <Link to="/dashboard/seed-lots/create">
                <Package className="h-4 w-4 mr-2" /> Créer un lot
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link to="/dashboard/productions/create">
                <Tractor className="h-4 w-4 mr-2" /> Nouvelle production
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link to="/dashboard/quality-controls/create">
                <FlaskConical className="h-4 w-4 mr-2" /> Nouveau contrôle
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link to="/dashboard/varieties/create">
                <Leaf className="h-4 w-4 mr-2" /> Ajouter une variété
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Alertes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
              Alertes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start p-3 bg-orange-50 rounded-lg">
              <Clock className="h-4 w-4 text-orange-500 mt-1 mr-3" />
              <div>
                <p className="text-sm font-medium">Lots expirant bientôt</p>
                <p className="text-xs text-muted-foreground">
                  3 lots expirent dans les 30 prochains jours
                </p>
              </div>
            </div>

            <div className="flex items-start p-3 bg-blue-50 rounded-lg">
              <CheckCircle className="h-4 w-4 text-blue-500 mt-1 mr-3" />
              <div>
                <p className="text-sm font-medium">Contrôles en attente</p>
                <p className="text-xs text-muted-foreground">
                  5 lots nécessitent un contrôle qualité
                </p>
              </div>
            </div>

            <div className="flex items-start p-3 bg-green-50 rounded-lg">
              <TrendingUp className="h-4 w-4 text-green-500 mt-1 mr-3" />
              <div>
                <p className="text-sm font-medium">Productions récentes</p>
                <p className="text-xs text-muted-foreground">
                  {stats.activity.recentProductions} nouvelles productions ce
                  mois
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activité récente */}
        <Card>
          <CardHeader>
            <CardTitle>Activité récente</CardTitle>
            <CardDescription>
              Dernières actions effectuées sur la plateforme
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-green-100 rounded-full">
                <Package className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Nouveau lot créé</p>
                <p className="text-xs text-muted-foreground">
                  ISRIZ-15 - 500kg - Niveau G3
                </p>
              </div>
              <p className="text-xs text-muted-foreground">il y a 2h</p>
            </div>
            <Separator />
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-purple-100 rounded-full">
                <FlaskConical className="h-4 w-4 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Contrôle qualité réussi</p>
                <p className="text-xs text-muted-foreground">
                  Lot SL-G2-2024-045 - Germination 92%
                </p>
              </div>
              <p className="text-xs text-muted-foreground">il y a 4h</p>
            </div>
            <Separator />
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-100 rounded-full">
                <Tractor className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Production terminée</p>
                <p className="text-xs text-muted-foreground">
                  Parcelle Nord - Rendement 9.8 t/ha
                </p>
              </div>
              <p className="text-xs text-muted-foreground">hier</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
