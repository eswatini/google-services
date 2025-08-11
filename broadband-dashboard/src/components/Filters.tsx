import { useMemo } from "react";
import { Box, Stack, Autocomplete, TextField, Button } from "@mui/material";
import type { SurveyRecord } from "../types";
import { useFilters } from "../state/FiltersContext";

function uniqueNonEmpty(values: (string | undefined)[]): string[] {
  return Array.from(new Set(values.filter((v): v is string => !!v))).sort((a, b) => a.localeCompare(b));
}

export function Filters({ data }: { data: SurveyRecord[] }) {
  const { filters, setFilters, reset } = useFilters();

  const options = useMemo(() => ({
    counties: uniqueNonEmpty(data.map((d) => d.county)),
    municipalities: uniqueNonEmpty(data.map((d) => d.municipality)),
    providers: uniqueNonEmpty(data.map((d) => d.provider)),
    income: uniqueNonEmpty(data.map((d) => d.incomeBracket)),
    age: uniqueNonEmpty(data.map((d) => d.ageBracket)),
    race: uniqueNonEmpty(data.map((d) => d.raceEthnicity)),
  }), [data]);

  return (
    <Box sx={{ p: 2, bgcolor: "background.paper", borderRadius: 1 }}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} useFlexGap flexWrap="wrap" alignItems="center">
        <Autocomplete
          multiple
          options={options.counties}
          value={filters.county}
          onChange={(_, v) => setFilters((prev) => ({ ...prev, county: v }))}
          renderInput={(params) => <TextField {...params} label="County" size="small" />}
          sx={{ minWidth: 220 }}
        />
        <Autocomplete
          multiple
          options={options.municipalities}
          value={filters.municipality}
          onChange={(_, v) => setFilters((prev) => ({ ...prev, municipality: v }))}
          renderInput={(params) => <TextField {...params} label="Municipality" size="small" />}
          sx={{ minWidth: 240 }}
        />
        <Autocomplete
          multiple
          options={options.providers}
          value={filters.provider}
          onChange={(_, v) => setFilters((prev) => ({ ...prev, provider: v }))}
          renderInput={(params) => <TextField {...params} label="Provider" size="small" />}
          sx={{ minWidth: 220 }}
        />
        <Autocomplete
          multiple
          options={options.income}
          value={filters.demographics.incomeBracket}
          onChange={(_, v) => setFilters((prev) => ({ ...prev, demographics: { ...prev.demographics, incomeBracket: v } }))}
          renderInput={(params) => <TextField {...params} label="Income" size="small" />}
          sx={{ minWidth: 200 }}
        />
        <Autocomplete
          multiple
          options={options.age}
          value={filters.demographics.ageBracket}
          onChange={(_, v) => setFilters((prev) => ({ ...prev, demographics: { ...prev.demographics, ageBracket: v } }))}
          renderInput={(params) => <TextField {...params} label="Age" size="small" />}
          sx={{ minWidth: 180 }}
        />
        <Autocomplete
          multiple
          options={options.race}
          value={filters.demographics.raceEthnicity}
          onChange={(_, v) => setFilters((prev) => ({ ...prev, demographics: { ...prev.demographics, raceEthnicity: v } }))}
          renderInput={(params) => <TextField {...params} label="Race/Ethnicity" size="small" />}
          sx={{ minWidth: 220 }}
        />
        <Button onClick={reset} color="secondary" variant="outlined">Reset</Button>
      </Stack>
    </Box>
  );
}