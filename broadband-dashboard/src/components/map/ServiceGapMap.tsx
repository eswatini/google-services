import { useMemo } from "react";
import Map, { Layer, Source, type LayerProps } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { Card, CardContent, Typography, Box } from "@mui/material";
import type { SurveyRecord } from "../../types";
import { getEnvConfig } from "../../utils/env";
import { isUnderserved100_20 } from "../../utils/normalize";

const pointLayer: LayerProps = {
  id: "points",
  type: "circle",
  paint: {
    "circle-radius": 5,
    "circle-color": [
      "case",
      ["==", ["get", "underserved"], 1], "#C62828",
      "#2E7D32",
    ] as any,
    "circle-stroke-color": "#FFFFFF",
    "circle-stroke-width": 1,
    "circle-opacity": 0.8,
  },
};

export function ServiceGapMap({ data }: { data: SurveyRecord[] }) {
  const { mapStyleUrl } = getEnvConfig();

  const features = useMemo(() => {
    const feats = [] as any[];
    for (const r of data) {
      if (typeof r.latitude === "number" && typeof r.longitude === "number") {
        feats.push({
          type: "Feature",
          geometry: { type: "Point", coordinates: [r.longitude, r.latitude] },
          properties: {
            underserved: isUnderserved100_20(r) ? 1 : 0,
            provider: r.provider || "Unknown",
            municipality: r.municipality || "Unknown",
            download: r.downloadMbps ?? null,
            upload: r.uploadMbps ?? null,
          },
        });
      }
    }
    return { type: "FeatureCollection", features: feats } as const;
  }, [data]);

  const hasPoints = features.features.length > 0;

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>Service Gaps Map</Typography>
        {!hasPoints ? (
          <Box sx={{ p: 2, color: "text.secondary" }}>
            No geocoded points available. Provide latitude/longitude columns or a municipalities GeoJSON for choropleth.
          </Box>
        ) : (
          <Box sx={{ height: 420 }}>
            <Map
              initialViewState={{ longitude: -75.06, latitude: 42.63, zoom: 8 }}
              style={{ width: "100%", height: "100%" }}
              mapStyle={mapStyleUrl!}
              reuseMaps={true}
              attributionControl={false}
            >
              <Source id="survey-points" type="geojson" data={features}>
                <Layer {...pointLayer} />
              </Source>
            </Map>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}