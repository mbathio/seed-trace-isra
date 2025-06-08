// frontend/src/pages/Dashboard.tsx
import React from "react";
import { useApiQuery } from "../hooks/useApi";
import { StatsCard } from "../components/charts/StatsCard";
// ✅ Enlever les imports inutilisés
// import { ProductionChart } from "../components/charts/ProductionChart";
import { DashboardStats } from "../types/entities";
import {
  Sprout,
  Users,
  FlaskConical,
  Tractor,
  // ✅ Enlever les imports inutilisés
  // TrendingUp,
  // CheckCircle,
} from "lucide-react";

const Dashboard: React.FC = () => {
  const {
    data: stats,
    isLoading,
    error,
  } = useApiQuery<DashboardStats>(["dashboard-stats"], "/statistics/dashboard");

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
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Tableau de bord</h1>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Lots de semences"
          value={stats?.overview.totalSeedLots || 0}
          icon={Sprout}
          color="text-green-600"
        />
        <StatsCard
          title="Multiplicateurs actifs"
          value={stats?.overview.activeMultipliers || 0}
          icon={Users}
          color="text-blue-600"
        />
        <StatsCard
          title="Contrôles qualité"
          value={stats?.overview.totalQualityControls || 0}
          icon={FlaskConical}
          color="text-purple-600"
        />
        <StatsCard
          title="Productions"
          value={stats?.overview.totalProductions || 0}
          icon={Tractor}
          color="text-orange-600"
        />
      </div>

      {/* Message si pas de données */}
      {stats && Object.values(stats.overview).every((val) => val === 0) && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Aucune donnée disponible. Commencez par créer des variétés et des
            lots de semences.
          </p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
