import Papa from "papaparse";
import axios from "axios";
import { buildGoogleSheetCsvUrl, getEnvConfig } from "./env";
import type { SurveyRecord } from "../types";
import { recordFromRow } from "./normalize";

export async function fetchSurveyCsv(): Promise<string> {
  const { sheetId, sheetName, csvUrlOverride } = getEnvConfig();
  const url = csvUrlOverride || buildGoogleSheetCsvUrl(sheetId, sheetName);
  const fallbackUrl = "/data/sample.csv"; // optional local placeholder

  if (url) {
    try {
      const res = await axios.get<string>(url, { responseType: "text" });
      return res.data;
    } catch (e) {
      // Try fallback
    }
  }
  const res = await axios.get<string>(fallbackUrl, { responseType: "text" });
  return res.data;
}

export async function loadSurveyRecords(): Promise<SurveyRecord[]> {
  const csvText = await fetchSurveyCsv();
  const parsed = Papa.parse<Record<string, any>>(csvText, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false,
  });
  const rows = parsed.data || [];
  const records = rows.map((row, idx) => recordFromRow(row, idx));
  return records;
}