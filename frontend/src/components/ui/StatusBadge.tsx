import React from "react";
import {
  CheckCircle,
  Clock,
  XCircle,
  Package,
  AlertTriangle,
} from "lucide-react";

interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md";
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = "md",
}) => {
  const statusConfig = {
    certified: {
      color: "bg-green-100 text-green-800",
      icon: CheckCircle,
      label: "Certifié",
    },
    pending: {
      color: "bg-yellow-100 text-yellow-800",
      icon: Clock,
      label: "En attente",
    },
    rejected: {
      color: "bg-red-100 text-red-800",
      icon: XCircle,
      label: "Rejeté",
    },
    "in-stock": {
      color: "bg-blue-100 text-blue-800",
      icon: Package,
      label: "En stock",
    },
    active: {
      color: "bg-green-100 text-green-800",
      icon: CheckCircle,
      label: "Actif",
    },
    distributed: {
      color: "bg-purple-100 text-purple-800",
      icon: Package,
      label: "Distribué",
    },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || {
    color: "bg-gray-100 text-gray-800",
    icon: AlertTriangle,
    label: status,
  };

  const Icon = config.icon;
  const iconSize = size === "sm" ? "w-3 h-3" : "w-4 h-4";
  const textSize = size === "sm" ? "text-xs" : "text-sm";

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-medium ${config.color} ${textSize}`}
    >
      <Icon className={`${iconSize} mr-1`} />
      {config.label}
    </span>
  );
};
