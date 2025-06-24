// frontend/src/constants/production.ts - VERSION CORRIGÉE DÉFINITIVE

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
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

// ===== TYPES D'ACTIVITÉS =====
export type ActivityType =
  | "soil-preparation"
  | "sowing"
  | "fertilization"
  | "irrigation"
  | "weeding"
  | "pest-control"
  | "harvest"
  | "other";

// ===== ICÔNES SPÉCIALISÉES POUR LES ACTIVITÉS AGRICOLES =====
export const PRODUCTION_ACTIVITY_ICONS: Record<ActivityType, LucideIcon> = {
  "soil-preparation": Shovel,
  sowing: Sprout,
  fertilization: Beaker,
  irrigation: Droplets,
  weeding: Scissors,
  "pest-control": Bug,
  harvest: Package,
  other: Settings,
};

// ===== ICÔNES POUR LES TYPES DE PROBLÈMES =====
export const PRODUCTION_ISSUE_ICONS: Record<string, LucideIcon> = {
  disease: Zap,
  pest: Bug,
  weather: Cloud,
  management: Settings,
  other: AlertTriangle,
};

// ===== ICÔNES POUR LA SÉVÉRITÉ DES PROBLÈMES =====
export const ISSUE_SEVERITY_ICONS: Record<string, LucideIcon> = {
  low: CheckCircle,
  medium: AlertTriangle,
  high: AlertTriangle,
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
// ✅ CORRIGÉ: Définir explicitement les types pour éviter les conflits
type PhaseActivity = Exclude<ActivityType, "other">; // Exclure "other" des phases

interface ProductionPhase {
  id: string;
  name: string;
  description: string;
  activities: readonly PhaseActivity[];
  icon: LucideIcon;
  color: string;
}

export const PRODUCTION_PHASES: readonly ProductionPhase[] = [
  {
    id: "preparation",
    name: "Préparation",
    description: "Préparation du sol et des semences",
    activities: ["soil-preparation"] as const,
    icon: Shovel,
    color: "blue",
  },
  {
    id: "sowing",
    name: "Semis",
    description: "Plantation des semences",
    activities: ["sowing"] as const,
    icon: Sprout,
    color: "green",
  },
  {
    id: "growing",
    name: "Croissance",
    description: "Entretien et croissance des plants",
    activities: [
      "fertilization",
      "irrigation",
      "weeding",
      "pest-control",
    ] as const,
    icon: Droplets,
    color: "cyan",
  },
  {
    id: "harvest",
    name: "Récolte",
    description: "Collecte et traitement des semences",
    activities: ["harvest"] as const,
    icon: Package,
    color: "orange",
  },
] as const;

// ===== MÉTRIQUES DE PERFORMANCE =====
export const PRODUCTION_METRICS = {
  efficiency: {
    name: "Efficacité",
    unit: "%",
    icon: TrendingUp,
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
    warning: 90,
    critical: 120,
  },
  efficiency: {
    warning: 80,
    critical: 60,
  },
  yield: {
    warning: 2.0,
    critical: 1.5,
  },
} as const;

// ===== FONCTIONS UTILITAIRES =====

/**
 * Obtient l'icône appropriée pour une activité
 */
export const getActivityIcon = (activityType: string): LucideIcon => {
  return PRODUCTION_ACTIVITY_ICONS[activityType as ActivityType] || Settings;
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
 * ✅ CORRIGÉ: Logique simplifiée avec gestion du type "other"
 */
export const getCurrentPhase = (
  activities: Array<{ type: string }> | string[]
): ProductionPhase => {
  if (!activities || activities.length === 0) return PRODUCTION_PHASES[0];

  const recentActivity = activities[activities.length - 1];
  let activityType: string;

  if (typeof recentActivity === "string") {
    activityType = recentActivity;
  } else if (
    recentActivity &&
    typeof recentActivity === "object" &&
    "type" in recentActivity &&
    typeof recentActivity.type === "string"
  ) {
    activityType = recentActivity.type;
  } else {
    return PRODUCTION_PHASES[0];
  }

  // ✅ CORRIGÉ: Gestion spéciale pour "other"
  if (activityType === "other") {
    return PRODUCTION_PHASES[PRODUCTION_PHASES.length - 1]; // Retourner la dernière phase
  }

  // ✅ CORRIGÉ: Recherche avec type sûr
  const foundPhase = PRODUCTION_PHASES.find((phase) => {
    return phase.activities.some((activity) => activity === activityType);
  });

  return foundPhase || PRODUCTION_PHASES[0];
};

/**
 * Calcule le progrès d'une production (0-100%)
 */
export const calculateProgress = (
  status: string,
  startDate: string,
  endDate?: string,
  activities: Array<{ type: string }> = []
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
      const validActivityTypes = activities
        .map((a) => a.type)
        .filter(
          (type): type is ActivityType => type in PRODUCTION_ACTIVITY_ICONS
        );

      const completedActivities = new Set(validActivityTypes).size;
      const activityProgress = (completedActivities / totalActivities) * 70;

      // 30% basé sur le temps écoulé
      const duration = calculateDuration(startDate, endDate);
      const expectedDuration = 120;
      const timeProgress = Math.min((duration / expectedDuration) * 30, 30);

      return Math.min(Math.round(activityProgress + timeProgress), 95);
    default:
      return 0;
  }
};

// Export des types pour TypeScript
export type { ProductionPhase, ActivityType };
export type ProductionMetric = keyof typeof PRODUCTION_METRICS;
export type AlertLevel = "normal" | "warning" | "critical";
