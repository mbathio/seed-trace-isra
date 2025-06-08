import React from "react";
import { Package } from "lucide-react";

interface EmptyStateProps {
  icon?: React.ComponentType<any>;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Package,
  title,
  description,
  action,
}) => (
  <div className="text-center py-12">
    <Icon className="mx-auto h-12 w-12 text-gray-400" />
    <h3 className="mt-4 text-lg font-medium text-gray-900">{title}</h3>
    <p className="mt-2 text-gray-500">{description}</p>
    {action && <div className="mt-6">{action}</div>}
  </div>
);
