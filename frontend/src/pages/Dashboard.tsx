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
//import { Badge } from "@/components/ui/badge";
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

// Types
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
    lotsByLevel: Array<{
      level: string;
      count: number;
      totalQuantity: number;
    }>;
    topVarieties: Array<{
      variety: {
        id: number;
        name: string;
        code: string;
      };
      count: number;
      totalQuantity: number;
    }>;
  };
  activity: {
    recentProductions: number;
  };
}

interface ChartDataPoint {
  month: string;
  productions: number;
  yield: number;
}

// Composant de carte de statistiques
const StatsCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  change?: {
    value: number;
    type: "increase" | "decrease";
  };
}> = ({ title, value, icon: Icon, color, change }) => (
  <Card className="hover:shadow-lg transition-shadow">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
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

// Hook simulé pour les données (remplace useApiQuery)
const useDashboardData = () => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [stats, setStats] = React.useState<DashboardStats | null>(null);
  const [trends, setTrends] = React.useState<ChartDataPoint[]>([]);

  React.useEffect(() => {
    // Simuler le chargement des données
    setTimeout(() => {
      // Données de statistiques
      setStats({
        overview: {
          totalSeedLots: 524,
          activeSeedLots: 187,
          totalProductions: 42,
          completedProductions: 28,
          totalQualityControls: 156,
          passedQualityControls: 148,
          activeMultipliers: 12,
          totalVarieties: 18,
        },
        rates: {
          productionCompletionRate: 66.7,
          qualityPassRate: 94.9,
        },
        distribution: {
          lotsByLevel: [
            { level: "G0", count: 12, totalQuantity: 450 },
            { level: "G1", count: 24, totalQuantity: 1200 },
            { level: "G2", count: 36, totalQuantity: 2800 },
            { level: "G3", count: 48, totalQuantity: 4500 },
            { level: "G4", count: 28, totalQuantity: 2100 },
            { level: "R1", count: 32, totalQuantity: 3200 },
            { level: "R2", count: 7, totalQuantity: 500 },
          ],
          topVarieties: [
            {
              variety: { id: 1, name: "ISRIZ 15", code: "ISRIZ-15" },
              count: 45,
              totalQuantity: 3500,
            },
            {
              variety: { id: 2, name: "Sahel 108", code: "SAHEL-108" },
              count: 38,
              totalQuantity: 2800,
            },
            {
              variety: { id: 3, name: "ISRIZ 13", code: "ISRIZ-13" },
              count: 32,
              totalQuantity: 2400,
            },
            {
              variety: { id: 4, name: "Sahel 117", code: "SAHEL-117" },
              count: 28,
              totalQuantity: 2100,
            },
            {
              variety: { id: 5, name: "ISRIZ 17", code: "ISRIZ-17" },
              count: 24,
              totalQuantity: 1800,
            },
          ],
        },
        activity: {
          recentProductions: 8,
        },
      });

      // Données de tendances
      setTrends([
        { month: "Jan", productions: 12, yield: 8.5 },
        { month: "Fév", productions: 15, yield: 9.2 },
        { month: "Mar", productions: 18, yield: 9.8 },
        { month: "Avr", productions: 22, yield: 10.1 },
        { month: "Mai", productions: 25, yield: 9.9 },
        { month: "Jun", productions: 28, yield: 10.3 },
      ]);

      setIsLoading(false);
    }, 1000);
  }, []);

  return { stats, trends, isLoading };
};

// Composant principal
export default function DashboardPage() {
  const { stats, trends, isLoading } = useDashboardData();

  // Couleurs pour les graphiques
  const COLORS = [
    "#10b981",
    "#3b82f6",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#06b6d4",
    "#f97316",
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">
            Chargement du tableau de bord...
          </p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Erreur de chargement</h2>
          <p className="text-muted-foreground">
            Impossible de charger les données du tableau de bord
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tableau de bord</h1>
          <p className="text-muted-foreground">
            Vue d'ensemble de votre système de traçabilité des semences
          </p>
        </div>
        <div className="flex space-x-2">
          <Button asChild>
            <Link to="/dashboard/seed-lots/create">
              <PlusCircle className="h-4 w-4 mr-2" />
              Nouveau lot
            </Link>
          </Button>
        </div>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Lots de semences"
          value={stats.overview.totalSeedLots}
          icon={Package}
          color="text-blue-600"
          change={{
            value: Math.round(
              (stats.overview.activeSeedLots / stats.overview.totalSeedLots) *
                100
            ),
            type: "increase",
          }}
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

      {/* Graphiques */}
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
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="productions"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Productions"
                />
                <Line
                  type="monotone"
                  dataKey="yield"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Rendement (t/ha)"
                />
              </LineChart>
            </ResponsiveContainer>
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
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.distribution.lotsByLevel}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ level, count }) => `${level}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {stats.distribution.lotsByLevel.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Sections supplémentaires */}
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
              <Link to="/dashboard/seed-lots/create">
                <Package className="h-4 w-4 mr-2" />
                Créer un lot de semences
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link to="/dashboard/quality-controls/create">
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

        {/* Top variétés */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Variétés principales</span>
              <Button asChild variant="ghost" size="sm">
                <Link to="/dashboard/varieties">Voir tout</Link>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.distribution.topVarieties.map((item, index) => (
                <div
                  key={item.variety.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <div>
                      <p className="font-medium">{item.variety.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.variety.code}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{item.count}</p>
                    <p className="text-xs text-muted-foreground">lots</p>
                  </div>
                </div>
              ))}
            </div>
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
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg">
                <Clock className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">Lots expirant bientôt</p>
                  <p className="text-xs text-muted-foreground">
                    3 lots expirent dans les 30 prochains jours
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">Contrôles en attente</p>
                  <p className="text-xs text-muted-foreground">
                    5 lots nécessitent un contrôle qualité
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                <TrendingUp className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">Productions récentes</p>
                  <p className="text-xs text-muted-foreground">
                    {stats.activity.recentProductions} nouvelles productions ce
                    mois
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statistiques détaillées */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link to="/dashboard/seed-lots">
            <CardContent className="p-6 text-center">
              <Package className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <h3 className="font-semibold">Lots de semences</h3>
              <p className="text-2xl font-bold text-blue-600">
                {stats.overview.totalSeedLots}
              </p>
              <p className="text-sm text-muted-foreground">
                {stats.overview.activeSeedLots} actifs
              </p>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link to="/dashboard/varieties">
            <CardContent className="p-6 text-center">
              <Leaf className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <h3 className="font-semibold">Variétés</h3>
              <p className="text-2xl font-bold text-green-600">
                {stats.overview.totalVarieties}
              </p>
              <p className="text-sm text-muted-foreground">Enregistrées</p>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link to="/dashboard/multipliers">
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-orange-600" />
              <h3 className="font-semibold">Multiplicateurs</h3>
              <p className="text-2xl font-bold text-orange-600">
                {stats.overview.activeMultipliers}
              </p>
              <p className="text-sm text-muted-foreground">Actifs</p>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link to="/dashboard/quality-controls">
            <CardContent className="p-6 text-center">
              <FlaskConical className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <h3 className="font-semibold">Taux de réussite</h3>
              <p className="text-2xl font-bold text-purple-600">
                {Math.round(stats.rates.qualityPassRate)}%
              </p>
              <p className="text-sm text-muted-foreground">Contrôles réussis</p>
            </CardContent>
          </Link>
        </Card>
      </div>

      {/* Activité récente */}
      <Card>
        <CardHeader>
          <CardTitle>Activité récente</CardTitle>
          <CardDescription>Dernières actions dans le système</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-green-100 rounded-full">
                <Package className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Nouveau lot créé</p>
                <p className="text-sm text-muted-foreground">
                  ISRIZ-15 - 500kg - Niveau G3
                </p>
              </div>
              <p className="text-sm text-muted-foreground">Il y a 2h</p>
            </div>

            <Separator />

            <div className="flex items-center space-x-4">
              <div className="p-2 bg-purple-100 rounded-full">
                <FlaskConical className="h-4 w-4 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Contrôle qualité réussi</p>
                <p className="text-sm text-muted-foreground">
                  Lot SL-G2-2024-045 - Germination 92%
                </p>
              </div>
              <p className="text-sm text-muted-foreground">Il y a 4h</p>
            </div>

            <Separator />

            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-100 rounded-full">
                <Tractor className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Production terminée</p>
                <p className="text-sm text-muted-foreground">
                  Parcelle Nord - Rendement 9.8 t/ha
                </p>
              </div>
              <p className="text-sm text-muted-foreground">Hier</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
