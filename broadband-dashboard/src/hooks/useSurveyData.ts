import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { loadSurveyRecords } from "../utils/fetchData";
import type { FiltersState, KpiSummary, SurveyRecord } from "../types";
import { isUnderserved100_20 } from "../utils/normalize";

export function useSurveyData() {
  return useQuery({
    queryKey: ["survey-data"],
    queryFn: loadSurveyRecords,
    staleTime: 5 * 60 * 1000,
  });
}

export function useFilteredData(records: SurveyRecord[] | undefined, filters: FiltersState) {
  return useMemo(() => {
    if (!records) return [];
    return records.filter((r) => {
      if (filters.county.length && r.county && !filters.county.includes(r.county)) return false;
      if (filters.municipality.length && r.municipality && !filters.municipality.includes(r.municipality)) return false;
      if (filters.provider.length && r.provider && !filters.provider.includes(r.provider)) return false;
      if (filters.demographics.incomeBracket.length && r.incomeBracket && !filters.demographics.incomeBracket.includes(r.incomeBracket)) return false;
      if (filters.demographics.ageBracket.length && r.ageBracket && !filters.demographics.ageBracket.includes(r.ageBracket)) return false;
      if (filters.demographics.raceEthnicity.length && r.raceEthnicity && !filters.demographics.raceEthnicity.includes(r.raceEthnicity)) return false;
      return true;
    });
  }, [records, filters]);
}

export function useKpis(records: SurveyRecord[] | undefined) {
  return useMemo<KpiSummary>(() => {
    const total = records?.length || 0;
    if (!total || !records) return {
      totalRespondents: 0,
      adoptionRatePct: 0,
      avgDownloadMbps: null,
      avgUploadMbps: null,
      underservedPct: 0,
    };

    const adopted = records.filter((r) => r.isAdopted === true).length;
    const downVals = records.map((r) => r.downloadMbps).filter((v): v is number => v != null);
    const upVals = records.map((r) => r.uploadMbps).filter((v): v is number => v != null);
    const avg = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null);

    const underservedCount = records.filter(isUnderserved100_20).length;

    return {
      totalRespondents: total,
      adoptionRatePct: (adopted / total) * 100,
      avgDownloadMbps: avg(downVals),
      avgUploadMbps: avg(upVals),
      underservedPct: (underservedCount / total) * 100,
    };
  }, [records]);
}