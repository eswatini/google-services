import type { EnvConfig } from "../types";

export function getEnvConfig(): EnvConfig {
  const sheetId = import.meta.env.VITE_SHEET_ID as string | undefined;
  const sheetName = import.meta.env.VITE_SHEET_NAME as string | undefined;
  const csvUrlOverride = import.meta.env.VITE_DATA_CSV_URL as string | undefined;
  const mapStyleUrl =
    (import.meta.env.VITE_MAP_STYLE_URL as string | undefined) ||
    "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

  return { sheetId, sheetName, csvUrlOverride, mapStyleUrl };
}

export function buildGoogleSheetCsvUrl(sheetId?: string, sheetName?: string): string | null {
  if (!sheetId) return null;
  const base = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`;
  return sheetName ? `${base}&sheet=${encodeURIComponent(sheetName)}` : base;
}