// ===== 3. CORRECTION: frontend/src/components/charts/ProductionChart.tsx =====

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
  const Chart = type === "line" ? LineChart : BarChart;
  // ✅ CORRECTION: Supprimer la variable non utilisée

  return (
    <ResponsiveContainer width="100%" height={300}>
      <Chart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        {type === "line" ? (
          <>
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
          </>
        ) : (
          <>
            <Bar dataKey="productions" fill="#10b981" />
            <Bar dataKey="yield" fill="#3b82f6" />
          </>
        )}
      </Chart>
    </ResponsiveContainer>
  );
};
