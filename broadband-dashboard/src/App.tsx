import { CssBaseline, ThemeProvider, Container, Box, Typography, Grid, Divider, Alert, Stack } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FiltersProvider, useFilters } from "./state/FiltersContext";
import { theme } from "./theme";
import { useFilteredData, useKpis, useSurveyData } from "./hooks/useSurveyData";
import { KpiCards } from "./components/KpiCards";
import { Filters } from "./components/Filters";
import { AdoptionBar } from "./components/charts/AdoptionBar";
import { SpeedByProviderLine } from "./components/charts/SpeedByProviderLine";
import { AffordabilityPie } from "./components/charts/AffordabilityPie";
import { SatisfactionPie } from "./components/charts/SatisfactionPie";
import { ServiceGapMap } from "./components/map/ServiceGapMap";
import { Exports } from "./components/Exports";
import { BarriersBar } from "./components/charts/BarriersBar";

const queryClient = new QueryClient();

function DashboardInner() {
  const { data, isLoading, error } = useSurveyData();
  const { filters } = useFilters();
  const filtered = useFilteredData(data, filters);
  const kpis = useKpis(filtered);

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ mb: 2 }} role="banner" aria-label="Dashboard header">
        <Typography variant="h4">Otsego County Broadband Survey Dashboard</Typography>
        <Typography variant="body2" color="text.secondary">Interactive summary of adoption, speeds, affordability, satisfaction, and service gaps. Use filters to explore.</Typography>
      </Box>

      {error && <Alert severity="error">Failed to load data. Ensure the Google Sheet is public or provide a CSV URL.</Alert>}
      {isLoading && <Alert severity="info">Loading data…</Alert>}

      {data && (
        <Stack spacing={2} role="main" aria-label="Dashboard content">
          <Filters data={data} />
          <KpiCards kpis={kpis} />
          <Grid container spacing={2} columns={12}>
            <Grid size={{ xs: 12, md: 8 }}>
              <AdoptionBar data={filtered} />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <AffordabilityPie data={filtered} />
            </Grid>
            <Grid size={{ xs: 12, md: 8 }}>
              <SpeedByProviderLine data={filtered} />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <SatisfactionPie data={filtered} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <ServiceGapMap data={filtered} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <BarriersBar data={filtered} />
            </Grid>
          </Grid>
          <Divider />
          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
            <Typography variant="body2" color="text.secondary">Export current view</Typography>
            <Exports data={filtered} kpis={kpis} />
          </Box>
        </Stack>
      )}
    </Container>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <FiltersProvider>
          <DashboardInner />
        </FiltersProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
