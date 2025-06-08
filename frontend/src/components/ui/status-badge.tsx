import React from "react";
import { Badge, BadgeProps } from "@/components/ui/badge";

interface StatusBadgeProps extends Omit<BadgeProps, "variant"> {
  status: string;
  type?:
    | "lot"
    | "production"
    | "user"
    | "multiplier"
    | "parcel"
    | "contract"
    | "quality";
}

// Définir les types de configuration de statut
type StatusConfig = {
  variant: "outline" | "default" | "secondary" | "destructive";
  label: string;
};

type StatusMap = Record<string, StatusConfig>;

// Mapping des statuts avec typage strict
const statusMaps: Record<string, StatusMap> = {
  lot: {
    PENDING: { variant: "outline", label: "En attente" },
    CERTIFIED: { variant: "default", label: "Certifié" },
    REJECTED: { variant: "destructive", label: "Rejeté" },
    IN_STOCK: { variant: "secondary", label: "En stock" },
    ACTIVE: { variant: "default", label: "Actif" },
    DISTRIBUTED: { variant: "secondary", label: "Distribué" },
    SOLD: { variant: "outline", label: "Vendu" },
  },
  production: {
    PLANNED: { variant: "outline", label: "Planifiée" },
    IN_PROGRESS: { variant: "default", label: "En cours" },
    COMPLETED: { variant: "secondary", label: "Terminée" },
    CANCELLED: { variant: "destructive", label: "Annulée" },
  },
  multiplier: {
    ACTIVE: { variant: "default", label: "Actif" },
    INACTIVE: { variant: "secondary", label: "Inactif" },
  },
  quality: {
    PASS: { variant: "default", label: "Réussi" },
    FAIL: { variant: "destructive", label: "Échec" },
  },
  user: {
    ACTIVE: { variant: "default", label: "Actif" },
    INACTIVE: { variant: "secondary", label: "Inactif" },
  },
  parcel: {
    AVAILABLE: { variant: "default", label: "Disponible" },
    IN_USE: { variant: "secondary", label: "En cours" },
    RESTING: { variant: "outline", label: "En repos" },
  },
  contract: {
    DRAFT: { variant: "outline", label: "Brouillon" },
    ACTIVE: { variant: "default", label: "Actif" },
    COMPLETED: { variant: "secondary", label: "Terminé" },
    CANCELLED: { variant: "destructive", label: "Annulé" },
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  type = "lot",
  ...props
}) => {
  // Obtenir le mapping pour le type spécifié avec fallback sécurisé
  const statusMap = statusMaps[type] || statusMaps.lot;

  // Obtenir la configuration du statut avec fallback sécurisé
  const config: StatusConfig = statusMap[status] || {
    variant: "outline",
    label: status,
  };

  return (
    <Badge variant={config.variant} {...props}>
      {config.label}
    </Badge>
  );
};
