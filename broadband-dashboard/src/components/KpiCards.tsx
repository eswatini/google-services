import { Card, CardContent, Grid, Typography, Stack } from "@mui/material";
import SpeedIcon from "@mui/icons-material/Speed";
import PeopleIcon from "@mui/icons-material/People";
import WifiIcon from "@mui/icons-material/Wifi";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import type { KpiSummary } from "../types";

function Kpi({ label, value, suffix, icon, color = "primary" as const }: { label: string; value: string; suffix?: string; icon: React.ReactNode; color?: "primary" | "success" | "error"; }) {
  return (
    <Card aria-label={label} sx={{ height: "100%" }}>
      <CardContent>
        <Stack direction="row" spacing={2} alignItems="center">
          <div aria-hidden>{icon}</div>
          <div>
            <Typography variant="overline" color="text.secondary">{label}</Typography>
            <Typography variant="h5" color={`${color}.main`}>{value}{suffix}</Typography>
          </div>
        </Stack>
      </CardContent>
    </Card>
  );
}

export function KpiCards({ kpis }: { kpis: KpiSummary }) {
  const pct = (n: number | null) => n == null ? "—" : (Math.round(n * 10) / 10).toString();
  const mbps = (n: number | null) => n == null ? "—" : Math.round(n).toString();

  return (
    <Grid container spacing={2} columns={12}>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Kpi label="Respondents" value={kpis.totalRespondents.toLocaleString()} icon={<PeopleIcon color="primary" />} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Kpi label="Adoption Rate" value={pct(kpis.adoptionRatePct)} suffix="%" icon={<WifiIcon color="success" />} color="success" />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Kpi label="Avg Download" value={mbps(kpis.avgDownloadMbps)} suffix=" Mbps" icon={<SpeedIcon color="primary" />} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Kpi label="Underserved (100/20)" value={pct(kpis.underservedPct)} suffix="%" icon={<ReportProblemIcon color="error" />} color="error" />
      </Grid>
    </Grid>
  );
}