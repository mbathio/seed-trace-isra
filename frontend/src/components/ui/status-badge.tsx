// frontend/src/components/ui/status-badge.tsx
import React from "react";
import { Badge, BadgeProps } from "@/components/ui/badge";

interface StatusBadgeProps extends Omit<BadgeProps, "variant"> {
  status: string;
  statusMap?: Record<string, { variant: BadgeProps["variant"]; label: string }>;
}

const defaultStatusMap: Record<
  string,
  { variant: BadgeProps["variant"]; label: string }
> = {
  active: { variant: "default", label: "Actif" },
  inactive: { variant: "secondary", label: "Inactif" },
  pending: { variant: "outline", label: "En attente" },
  approved: { variant: "default", label: "Approuvé" },
  rejected: { variant: "destructive", label: "Rejeté" },
  draft: { variant: "secondary", label: "Brouillon" },
  published: { variant: "default", label: "Publié" },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  statusMap = defaultStatusMap,
  ...props
}) => {
  const config = statusMap[status] || { variant: "outline", label: status };

  return (
    <Badge variant={config.variant} {...props}>
      {config.label}
    </Badge>
  );
};
