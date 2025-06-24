// frontend/src/components/common/StatusBadge.tsx - NOUVEAU COMPOSANT

import React from "react";
import { Badge } from "../ui/badge";
import { getStatusConfig } from "../../constants";
import { cn } from "../../lib/utils";

interface StatusBadgeProps {
  status: string;
  statusList: Array<{
    label: string;
    value: string;
    color: string;
    variant?: "default" | "destructive" | "secondary" | "outline";
  }>;
  className?: string;
  showIcon?: boolean;
  icon?: React.ReactNode;
}

/**
 * Composant générique pour afficher un badge de statut
 * Gère automatiquement la transformation des valeurs et l'affichage
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  statusList,
  className,
  showIcon = false,
  icon,
}) => {
  // Obtenir la configuration du statut
  const config = getStatusConfig(status, statusList);

  // Si le statut n'est pas trouvé, afficher un badge par défaut
  if (!config) {
    return (
      <Badge
        variant="outline"
        className={cn("bg-gray-100 text-gray-800", className)}
      >
        {status || "Inconnu"}
      </Badge>
    );
  }

  return (
    <Badge
      variant={config.variant || "default"}
      className={cn(config.color, className)}
    >
      {showIcon && icon && <span className="mr-1">{icon}</span>}
      {config.label}
    </Badge>
  );
};

// Export des variantes spécifiques pour faciliter l'utilisation
export { StatusBadge as default };
