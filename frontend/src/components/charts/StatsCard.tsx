import React from "react";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  change?: {
    value: number;
    type: "increase" | "decrease";
  };
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  color,
  change,
}) => (
  <div className="bg-white overflow-hidden shadow rounded-lg">
    <div className="p-5">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">
              {title}
            </dt>
            <dd className="flex items-baseline">
              <div className="text-2xl font-semibold text-gray-900">
                {value}
              </div>
              {change && (
                <div
                  className={`ml-2 flex items-baseline text-sm font-semibold ${
                    change.type === "increase"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {change.type === "increase" ? "+" : "-"}
                  {Math.abs(change.value)}%
                </div>
              )}
            </dd>
          </dl>
        </div>
      </div>
    </div>
  </div>
);
