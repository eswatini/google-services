import type { SurveyRecord } from "../types";

const columnAliases: Record<string, keyof SurveyRecord> = {
  // Location and geography
  county: "county",
  municipality: "municipality",
  town: "municipality",
  city: "municipality",
  village: "municipality",
  zip: "zip",
  zipcode: "zip",
  "zip code": "zip",
  address: "address",
  latitude: "latitude",
  lat: "latitude",
  longitude: "longitude",
  lon: "longitude",
  lng: "longitude",
  // Provider / service
  provider: "provider",
  isp: "provider",
  "service type": "serviceType",
  technology: "serviceType",
  // Adoption & speeds
  adoption: "adoptionStatus",
  "adoption status": "adoptionStatus",
  subscribed: "adoptionStatus",
  connected: "adoptionStatus",
  download: "downloadMbps",
  "download mbps": "downloadMbps",
  down: "downloadMbps",
  upload: "uploadMbps",
  "upload mbps": "uploadMbps",
  up: "uploadMbps",
  // Affordability & satisfaction
  affordability: "affordability",
  affordable: "affordability",
  cost: "monthlyCost",
  "monthly cost": "monthlyCost",
  satisfaction: "satisfaction",
  // Demographics
  income: "incomeBracket",
  "household income": "incomeBracket",
  age: "ageBracket",
  "age bracket": "ageBracket",
  race: "raceEthnicity",
  ethnicity: "raceEthnicity",
  // Barriers
  barrier: "barriers",
  barriers: "barriers",
};

function normalizeHeader(header: string): string {
  return header.trim().toLowerCase();
}

function parseNumber(value: any): number | null {
  if (value === null || value === undefined) return null;
  const cleaned = String(value).replace(/[^0-9.\-]/g, "");
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : null;
}

function parseBooleanish(value: any): boolean | undefined {
  if (value === null || value === undefined) return undefined;
  const v = String(value).trim().toLowerCase();
  if (["yes", "y", "true", "1", "subscribed", "connected"].includes(v)) return true;
  if (["no", "n", "false", "0", "not subscribed", "disconnected"].includes(v)) return false;
  return undefined;
}

export function recordFromRow(row: Record<string, any>, rowIndex: number): SurveyRecord {
  const mapped: Partial<SurveyRecord> = { id: `${rowIndex}` };
  for (const [rawKey, rawVal] of Object.entries(row)) {
    if (!rawKey) continue;
    const keyNorm = normalizeHeader(rawKey);
    const mappedKey = columnAliases[keyNorm];
    if (!mappedKey) continue;

    switch (mappedKey) {
      case "downloadMbps":
      case "uploadMbps":
      case "monthlyCost":
      case "latitude":
      case "longitude": {
        (mapped as any)[mappedKey] = parseNumber(rawVal);
        break;
      }
      case "adoptionStatus": {
        const truth = parseBooleanish(rawVal);
        (mapped as any)[mappedKey] = String(rawVal ?? "");
        if (truth !== undefined) mapped.isAdopted = truth;
        break;
      }
      default: {
        (mapped as any)[mappedKey] = rawVal == null ? undefined : String(rawVal);
      }
    }
  }

  if (mapped.isAdopted === undefined && mapped.adoptionStatus) {
    const truth = parseBooleanish(mapped.adoptionStatus);
    if (truth !== undefined) mapped.isAdopted = truth;
  }

  // Fallbacks
  if (mapped.isAdopted === undefined) mapped.isAdopted = false;

  return mapped as SurveyRecord;
}

export function isUnderserved100_20(rec: SurveyRecord): boolean {
  const down = rec.downloadMbps ?? 0;
  const up = rec.uploadMbps ?? 0;
  // If no speeds and not adopted, consider underserved
  if ((rec.isAdopted === false || rec.adoptionStatus?.toLowerCase() === "not subscribed") && (!rec.downloadMbps || !rec.uploadMbps)) {
    return true;
  }
  return down < 100 || up < 20;
}