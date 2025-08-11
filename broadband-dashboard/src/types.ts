export type SurveyRecord = {
  id: string;
  timestamp?: string;
  county?: string;
  municipality?: string;
  zip?: string;
  address?: string;
  latitude?: number | null;
  longitude?: number | null;
  provider?: string;
  serviceType?: string;
  adoptionStatus?: string; // e.g., Subscribed / Not Subscribed
  isAdopted?: boolean;
  downloadMbps?: number | null;
  uploadMbps?: number | null;
  affordability?: string; // e.g., Affordable / Not Affordable / Unsure
  monthlyCost?: number | null;
  satisfaction?: string; // e.g., Very Satisfied ... Very Dissatisfied
  incomeBracket?: string;
  ageBracket?: string;
  raceEthnicity?: string;
  barriers?: string; // free text or semicolon-separated categories
};

export type FiltersState = {
  county: string[];
  municipality: string[];
  provider: string[];
  demographics: {
    incomeBracket: string[];
    ageBracket: string[];
    raceEthnicity: string[];
  };
};

export type KpiSummary = {
  totalRespondents: number;
  adoptionRatePct: number; // 0-100
  avgDownloadMbps: number | null;
  avgUploadMbps: number | null;
  underservedPct: number; // 0-100 per 100/20 rule
};

export type AggregatedStat = {
  key: string;
  label: string;
  value: number;
};

export type SpeedStatsByGroup = {
  group: string;
  medianDown: number | null;
  medianUp: number | null;
};

export type EnvConfig = {
  sheetId?: string;
  sheetName?: string;
  csvUrlOverride?: string;
  mapStyleUrl?: string;
};