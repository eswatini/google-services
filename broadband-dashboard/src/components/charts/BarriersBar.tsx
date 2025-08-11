import { useMemo } from "react";
import { Card, CardContent, Typography } from "@mui/material";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { SurveyRecord } from "../../types";

function splitBarriers(text?: string): string[] {
  if (!text) return [];
  return text
    .split(/[;,]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => s.replace(/\s+/g, " "));
}

export function BarriersBar({ data }: { data: SurveyRecord[] }) {
  const series = useMemo(() => {
    const by: Record<string, number> = {};
    for (const r of data) {
      const items = splitBarriers(r.barriers);
      for (const it of items) by[it] = (by[it] || 0) + 1;
    }
    return Object.entries(by)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .reverse();
  }, [data]);

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>Top Reported Barriers</Typography>
        <ResponsiveContainer width="100%" height={340}>
          <BarChart data={series} layout="vertical" margin={{ left: 8, right: 8 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" allowDecimals={false} />
            <YAxis type="category" dataKey="name" width={160} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="count" name="Responses" fill="#C62828" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}