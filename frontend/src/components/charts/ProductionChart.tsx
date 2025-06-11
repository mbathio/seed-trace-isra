// ===== CORRECTION 3: frontend/src/components/charts/ProductionChart.tsx =====

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

interface ProductionChartProps {
  data: Array<{
    month: string;
    productions: number;
    yield: number;
  }>;
  type?: "line" | "bar";
}

export const ProductionChart: React.FC<ProductionChartProps> = ({
  data,
  type = "line",
}) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      {type === "line" ? (
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="productions"
            stroke="#10b981"
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="yield"
            stroke="#3b82f6"
            strokeWidth={2}
          />
        </LineChart>
      ) : (
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="productions" fill="#10b981" />
          <Bar dataKey="yield" fill="#3b82f6" />
        </BarChart>
      )}
    </ResponsiveContainer>
  );
};
