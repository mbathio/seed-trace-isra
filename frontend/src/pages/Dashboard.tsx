// frontend/src/pages/Dashboard.tsx
import React from "react";
import { useApiQuery } from "../hooks/useApi";
import { StatsCard } from "../components/charts/StatsCard";
import { ProductionChart } from "../components/charts/ProductionChart";
import { DashboardStats } from "../types/entities";
import {
  Sprout,
  Users,
  FlaskConical,
  Tractor,
  TrendingUp,
  CheckCircle,
} from "lucide-react";

const Dashboard: React.FC = () => {
  const { data: stats, isLoading } = useApiQuery<DashboardStats>(
    ["dashboard-stats"],
    "/statistics/dashboard"
  );

  if (isLoading) {
    return <div>Chargement...</div>;
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

      {/* More dashboard content... */}
    </div>
  );
};

export default Dashboard;
