import { useMemo } from "react";
import { Card, CardContent, Typography } from "@mui/material";
import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import type { SurveyRecord } from "../../types";

function median(values: number[]): number | null {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function SpeedByProviderLine({ data }: { data: SurveyRecord[] }) {
  const series = useMemo(() => {
    const by: Record<string, { down: number[]; up: number[] }> = {};
    for (const r of data) {
      const key = r.provider || "Unknown";
      if (!by[key]) by[key] = { down: [], up: [] };
      if (typeof r.downloadMbps === "number") by[key].down.push(r.downloadMbps);
      if (typeof r.uploadMbps === "number") by[key].up.push(r.uploadMbps);
    }
    return Object.entries(by)
      .map(([provider, vals]) => ({
        provider,
        medianDown: median(vals.down),
        medianUp: median(vals.up),
      }))
      .filter((d) => d.medianDown != null || d.medianUp != null)
      .sort((a, b) => (b.medianDown ?? 0) - (a.medianDown ?? 0))
      .slice(0, 12);
  }, [data]);

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>Median Speeds by Provider</Typography>
        <ResponsiveContainer width="100%" height={340}>
          <LineChart data={series} margin={{ left: 8, right: 8 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="provider" interval={0} angle={-30} textAnchor="end" height={80} />
            <YAxis label={{ value: "Mbps", angle: -90, position: "insideLeft" }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="medianDown" name="Median Download" stroke="#2E86AB" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="medianUp" name="Median Upload" stroke="#0E7C7B" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}