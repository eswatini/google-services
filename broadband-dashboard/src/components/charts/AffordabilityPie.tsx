import { useMemo } from "react";
import { Card, CardContent, Typography } from "@mui/material";
import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import type { SurveyRecord } from "../../types";

const COLORS = ["#2E7D32", "#ED6C02", "#C62828", "#6C757D"];

export function AffordabilityPie({ data }: { data: SurveyRecord[] }) {
  const series = useMemo(() => {
    const by: Record<string, number> = {};
    for (const r of data) {
      const key = r.affordability || "Unknown";
      by[key] = (by[key] || 0) + 1;
    }
    return Object.entries(by).map(([name, value]) => ({ name, value }));
  }, [data]);

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>Affordability</Typography>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={series}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
            >
              {series.map((_, idx) => (
                <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}