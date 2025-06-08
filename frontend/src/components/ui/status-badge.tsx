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

const statusMaps = {
  lot: {
    PENDING: { variant: "outline" as const, label: "En attente" },
    CERTIFIED: { variant: "default" as const, label: "Certifié" },
    REJECTED: { variant: "destructive" as const, label: "Rejeté" },
    IN_STOCK: { variant: "secondary" as const, label: "En stock" },
    ACTIVE: { variant: "default" as const, label: "Actif" },
    DISTRIBUTED: { variant: "secondary" as const, label: "Distribué" },
    SOLD: { variant: "outline" as const, label: "Vendu" },
  },
  production: {
    PLANNED: { variant: "outline" as const, label: "Planifiée" },
    IN_PROGRESS: { variant: "default" as const, label: "En cours" },
    COMPLETED: { variant: "secondary" as const, label: "Terminée" },
    CANCELLED: { variant: "destructive" as const, label: "Annulée" },
  },
  multiplier: {
    ACTIVE: { variant: "default" as const, label: "Actif" },
    INACTIVE: { variant: "secondary" as const, label: "Inactif" },
  },
  quality: {
    PASS: { variant: "default" as const, label: "Réussi" },
    FAIL: { variant: "destructive" as const, label: "Échec" },
  },
  // Autres mappings...
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  type = "lot",
  ...props
}) => {
  const statusMap = statusMaps[type] || statusMaps.lot;
  const config = statusMap[status] || {
    variant: "outline" as const,
    label: status,
  };

  return (
    <Badge variant={config.variant} {...props}>
      {config.label}
    </Badge>
  );
};
