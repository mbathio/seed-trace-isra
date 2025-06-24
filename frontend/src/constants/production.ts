// frontend/src/constants/production.ts - VERSION CORRIGÉE
import {
  Shovel,
  Sprout,
  Beaker,
  Droplets,
  Scissors,
  Bug,
  Package,
  Settings,
  Thermometer,
  Cloud,
  Sun,
  CloudRain,
  Wind,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp, // ✅ CORRIGÉ: Import ajouté
  type LucideIcon,
} from "lucide-react";

// ===== ICÔNES SPÉCIALISÉES POUR LES ACTIVITÉS AGRICOLES =====
export const PRODUCTION_ACTIVITY_ICONS: Record<string, LucideIcon> = {
  "soil-preparation": Shovel, // Préparation du sol
  sowing: Sprout, // Semis
  fertilization: Beaker, // Fertilisation
  irrigation: Droplets, // Irrigation
  weeding: Scissors, // Désherbage
  "pest-control": Bug, // Contrôle phytosanitaire
  harvest: Package, // Récolte
  other: Settings, // Autre
};

// ===== ICÔNES POUR LES TYPES DE PROBLÈMES =====
export const PRODUCTION_ISSUE_ICONS: Record<string, LucideIcon> = {
  disease: Zap, // Maladie
  pest: Bug, // Ravageur
  weather: Cloud, // Météo
  management: Settings, // Gestion
  other: AlertTriangle, // Autre
};

// ===== ICÔNES POUR LA SÉVÉRITÉ DES PROBLÈMES =====
export const ISSUE_SEVERITY_ICONS: Record<string, LucideIcon> = {
  low: CheckCircle, // Faible
  medium: AlertTriangle, // Moyenne
  high: AlertTriangle, // Élevée
};

// ===== ICÔNES MÉTÉOROLOGIQUES =====
export const WEATHER_ICONS: Record<string, LucideIcon> = {
  sunny: Sun,
  cloudy: Cloud,
  rainy: CloudRain,
  windy: Wind,
  temperature: Thermometer,
};

// ===== STATUTS DE PRODUCTION AVEC COULEURS COHÉRENTES =====
export const PRODUCTION_STATUS_COLORS = {
  planned: {
    background: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    icon: Clock,
  },
  "in-progress": {
    background: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
    icon: Settings,
  },
  completed: {
    background: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
    icon: CheckCircle,
  },
  cancelled: {
    background: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    icon: AlertTriangle,
  },
} as const;

// ===== PHASES DE PRODUCTION =====
export const PRODUCTION_PHASES = [
  {
    id: "preparation",
    name: "Préparation",
    description: "Préparation du sol et des semences",
    activities: ["soil-preparation"],
    icon: Shovel,
    color: "blue",
  },
  {
    id: "sowing",
    name: "Semis",
    description: "Plantation des semences",
    activities: ["sowing"],
    icon: Sprout,
    color: "green",
  },
  {
    id: "growing",
    name: "Croissance",
    description: "Entretien et croissance des plants",
    activities: ["fertilization", "irrigation", "weeding", "pest-control"],
    icon: Droplets,
    color: "cyan",
  },
  {
    id: "harvest",
    name: "Récolte",
    description: "Collecte et traitement des semences",
    activities: ["harvest"],
    icon: Package,
    color: "orange",
  },
] as const;

// ===== MÉTRIQUES DE PERFORMANCE =====
export const PRODUCTION_METRICS = {
  efficiency: {
    name: "Efficacité",
    unit: "%",
    icon: TrendingUp, // ✅ CORRIGÉ: Utilisation directe de l'import
    description: "Ratio quantité réelle / quantité planifiée",
  },
  duration: {
    name: "Durée",
    unit: "jours",
    icon: Clock,
    description: "Temps total du cycle de production",
  },
  yield: {
    name: "Rendement",
    unit: "t/ha",
    icon: Package,
    description: "Rendement par hectare",
  },
  quality: {
    name: "Qualité",
    unit: "%",
    icon: CheckCircle,
    description: "Score de qualité moyen",
  },
} as const;

// ===== SEUILS D'ALERTE =====
export const PRODUCTION_THRESHOLDS = {
  duration: {
    warning: 90, // Jours
    critical: 120,
  },
  efficiency: {
    warning: 80, // %
    critical: 60,
  },
  yield: {
    warning: 2.0, // t/ha
    critical: 1.5,
  },
} as const;

// ===== FONCTIONS UTILITAIRES =====

/**
 * Obtient l'icône appropriée pour une activité
 */
export const getActivityIcon = (activityType: string): LucideIcon => {
  return PRODUCTION_ACTIVITY_ICONS[activityType] || Settings;
};

/**
 * Obtient l'icône appropriée pour un problème
 */
export const getIssueIcon = (issueType: string): LucideIcon => {
  return PRODUCTION_ISSUE_ICONS[issueType] || AlertTriangle;
};

/**
 * Obtient l'icône appropriée pour la sévérité
 */
export const getSeverityIcon = (severity: string): LucideIcon => {
  return ISSUE_SEVERITY_ICONS[severity] || AlertTriangle;
};

/**
 * Obtient les couleurs pour un statut de production
 */
export const getStatusColors = (status: string) => {
  return (
    PRODUCTION_STATUS_COLORS[status as keyof typeof PRODUCTION_STATUS_COLORS] ||
    PRODUCTION_STATUS_COLORS.planned
  );
};

/**
 * Calcule l'efficacité d'une production
 */
export const calculateEfficiency = (
  actual: number,
  planned: number
): number => {
  if (!planned || planned === 0) return 0;
  return Math.round((actual / planned) * 100);
};

/**
 * Calcule la durée d'une production en jours
 */
export const calculateDuration = (
  startDate: string,
  endDate?: string
): number => {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
};

/**
 * Détermine le niveau d'alerte basé sur une métrique
 */
export const getAlertLevel = (
  metric: keyof typeof PRODUCTION_THRESHOLDS,
  value: number
): "normal" | "warning" | "critical" => {
  const thresholds = PRODUCTION_THRESHOLDS[metric];
  if (!thresholds) return "normal";

  if (value <= thresholds.critical) return "critical";
  if (value <= thresholds.warning) return "warning";
  return "normal";
};

/**
 * Obtient la phase actuelle basée sur les activités
 * ✅ CORRIGÉ: Gestion correcte du type any pour l'activité
 */
export const getCurrentPhase = (activities: any[]) => {
  if (!activities || activities.length === 0) return PRODUCTION_PHASES[0];

  const recentActivity = activities[activities.length - 1];
  const activityType =
    typeof recentActivity === "string" ? recentActivity : recentActivity?.type;

  return (
    PRODUCTION_PHASES.find((phase) =>
      phase.activities.includes(activityType)
    ) || PRODUCTION_PHASES[0]
  );
};

/**
 * Calcule le progrès d'une production (0-100%)
 */
export const calculateProgress = (
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
      // Calcul basé sur les activités et la durée
      const totalActivities = Object.keys(PRODUCTION_ACTIVITY_ICONS).length;
      const completedActivities = new Set(activities.map((a) => a.type)).size;
      const activityProgress = (completedActivities / totalActivities) * 70; // 70% pour les activités

      // 30% basé sur le temps écoulé
      const duration = calculateDuration(startDate, endDate);
      const expectedDuration = 120; // Durée moyenne en jours
      const timeProgress = Math.min((duration / expectedDuration) * 30, 30);

      return Math.min(Math.round(activityProgress + timeProgress), 95); // Max 95% pour "en cours"
    default:
      return 0;
  }
};

// Export des types pour TypeScript
export type ProductionPhase = (typeof PRODUCTION_PHASES)[number];
export type ProductionMetric = keyof typeof PRODUCTION_METRICS;
export type AlertLevel = "normal" | "warning" | "critical";
