import { Button, Stack } from "@mui/material";
import { saveAs } from "file-saver";
import Papa from "papaparse";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { KpiSummary, SurveyRecord } from "../types";

export function Exports({ data, kpis }: { data: SurveyRecord[]; kpis: KpiSummary }) {
  const onExportCsv = () => {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    saveAs(blob, "broadband_survey_filtered.csv");
  };

  const onExportPdf = () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    doc.setFontSize(16);
    doc.text("Broadband Survey Summary", 40, 40);

    doc.setFontSize(11);
    const kpiLines = [
      `Respondents: ${kpis.totalRespondents.toLocaleString()}`,
      `Adoption Rate: ${kpis.adoptionRatePct.toFixed(1)}%`,
      `Avg Download: ${kpis.avgDownloadMbps == null ? "—" : Math.round(kpis.avgDownloadMbps)} Mbps` ,
      `Avg Upload: ${kpis.avgUploadMbps == null ? "—" : Math.round(kpis.avgUploadMbps)} Mbps`,
      `Underserved (100/20): ${kpis.underservedPct.toFixed(1)}%`,
    ];
    kpiLines.forEach((line, i) => doc.text(line, 40, 70 + i * 16));

    const topRows = data.slice(0, 50).map((r) => [
      r.county || "",
      r.municipality || "",
      r.provider || "",
      r.isAdopted ? "Yes" : "No",
      r.downloadMbps ?? "",
      r.uploadMbps ?? "",
      r.affordability || "",
      r.satisfaction || "",
    ]);

    autoTable(doc, {
      startY: 160,
      head: [["County", "Municipality", "Provider", "Adopted", "Down", "Up", "Affordability", "Satisfaction"]],
      body: topRows,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [14, 124, 123] },
      columnStyles: { 4: { halign: "right" }, 5: { halign: "right" } },
      margin: { left: 40, right: 40 },
    });

    doc.save("broadband_survey_summary.pdf");
  };

  return (
    <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
      <Button onClick={onExportCsv} variant="outlined">Export CSV</Button>
      <Button onClick={onExportPdf} variant="outlined">Export PDF</Button>
    </Stack>
  );
}