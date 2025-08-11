import { useMemo } from "react";
import { Card, CardContent, Typography } from "@mui/material";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { SurveyRecord } from "../../types";

export function AdoptionBar({ data }: { data: SurveyRecord[] }) {
  const grouped = useMemo(() => {
    const by: Record<string, { total: number; adopted: number }> = {};
    for (const r of data) {
      const key = r.municipality || r.county || "Unknown";
      if (!by[key]) by[key] = { total: 0, adopted: 0 };
      by[key].total += 1;
      if (r.isAdopted) by[key].adopted += 1;
    }
    return Object.entries(by)
      .map(([name, v]) => ({ name, adoption: Math.round((v.adopted / v.total) * 1000) / 10 }))
      .sort((a, b) => b.adoption - a.adoption)
      .slice(0, 15);
  }, [data]);

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>Adoption Rate by Municipality (Top 15)</Typography>
        <ResponsiveContainer width="100%" height={340}>
          <BarChart data={grouped} margin={{ left: 8, right: 8 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" interval={0} angle={-30} textAnchor="end" height={80} />
            <YAxis unit="%" domain={[0, 100]} />
            <Tooltip formatter={(v: number) => `${v.toFixed(1)}%`} />
            <Bar dataKey="adoption" fill="#2E7D32" name="Adoption %" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}