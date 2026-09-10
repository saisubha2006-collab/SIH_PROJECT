import express from 'express';
import { PRESET_AREAS } from '../src/data/presets.ts';
import {
  calculatePolygonArea,
  evaluateDataQuality,
  runFullAnalysis,
} from '../server/engine.ts';

const app = express();

app.use(express.json({ limit: '10mb' }));

// API Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), engine: 'GEOSPATIAL_INTELLIGENCE_V2' });
});

// Presets endpoint
app.get('/api/presets', (req, res) => {
  res.json({ presets: PRESET_AREAS });
});

// Preflight preview endpoint (Fast Stage 1)
app.post('/api/preview', (req, res) => {
  try {
    const { aoi, past_range, present_range } = req.body;
    const coords = aoi?.coordinates || [];
    const area = calculatePolygonArea(coords);
    const quality = evaluateDataQuality(
      past_range || ['2019-01-01', '2019-03-31'],
      present_range || ['2026-01-01', '2026-03-31'],
      area.hectares
    );

    res.json({
      valid: true,
      area_hectares: area.hectares,
      area_sqkm: area.sqkm,
      quality,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to preview area' });
  }
});

// Full Analysis pipeline (Stage 2)
app.post('/api/analyze', async (req, res) => {
  try {
    const { aoi, locationName, regionName, countryName, past_range, present_range, presetId } = req.body;

    let aoiCoords: [number, number][] = aoi?.coordinates;
    let finalLocationName = locationName || 'Custom AOI';

    if (presetId) {
      const preset = PRESET_AREAS.find((p) => p.id === presetId);
      if (preset) {
        if (!aoiCoords || aoiCoords.length < 3) {
          aoiCoords = preset.coordinates;
        }
        finalLocationName = preset.name;
      }
    }

    if (!aoiCoords || aoiCoords.length < 3) {
      return res.status(400).json({
        error: 'Invalid AOI polygon. A closed boundary with at least 3 coordinates is required.',
      });
    }

    const pastRangeFinal: [string, string] = past_range || ['2019-01-01', '2019-03-31'];
    const presentRangeFinal: [string, string] = present_range || ['2026-01-01', '2026-03-31'];

    const result = await runFullAnalysis({
      aoiCoords,
      locationName: finalLocationName,
      regionName,
      countryName,
      pastRange: pastRangeFinal,
      presentRange: presentRangeFinal,
      presetId,
    });

    res.json(result);
  } catch (err: any) {
    console.error('Analysis execution error:', err);
    res.status(500).json({ error: err.message || 'Error executing remote sensing analysis' });
  }
});

// Report generation endpoint
app.post('/api/report', (req, res) => {
  try {
    const { analysis } = req.body;
    if (!analysis || !analysis.analysis_id) {
      return res.status(400).json({ error: 'Valid analysis payload required' });
    }

    const reportHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Geospatial Intelligence Report - ${analysis.analysis_id}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #1e293b; max-width: 900px; margin: 40px auto; padding: 0 20px; }
    h1 { color: #0f172a; border-bottom: 2px solid #0284c7; padding-bottom: 8px; }
    h2 { color: #0369a1; margin-top: 28px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
    .kpi-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 20px 0; }
    .kpi-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; text-align: center; }
    .kpi-val { font-size: 24px; font-weight: bold; color: #0f172a; }
    .kpi-label { font-size: 12px; color: #64748b; text-transform: uppercase; }
    .scenario-box { border: 1px solid #cbd5e1; border-radius: 8px; padding: 16px; margin-bottom: 16px; background: #fff; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px; }
    th, td { border: 1px solid #e2e8f0; padding: 8px 12px; text-align: left; }
    th { background: #f1f5f9; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; }
    .badge-high { background: #dcfce7; color: #166534; }
    .audit-meta { background: #f1f5f9; padding: 12px; border-radius: 6px; font-family: monospace; font-size: 12px; }
    @media print { body { margin: 0; } button { display: none; } }
  </style>
</head>
<body>
  <div style="display:flex; justify-content:space-between; align-items:center;">
    <h1>Geospatial Intelligence Report</h1>
    <span class="badge badge-high">Audited & Verified</span>
  </div>
  <p><strong>Analysis ID:</strong> ${analysis.analysis_id} | <strong>Date Generated:</strong> ${new Date(analysis.timestamp).toLocaleString()} | <strong>Sensor:</strong> ${analysis.sensor} (${analysis.resolution})</p>

  <h2>1. Location & Analysis Window</h2>
  <p><strong>AOI:</strong> ${analysis.aoi.name} (${analysis.aoi.region}, ${analysis.aoi.country})</p>
  <p><strong>Total AOI Extent:</strong> ${analysis.aoi.area_hectares} ha (${analysis.aoi.area_sqkm} km²)</p>
  <p><strong>Temporal Comparison:</strong> Past Period (${analysis.periods.past_range[0]} to ${analysis.periods.past_range[1]}) vs Present Period (${analysis.periods.present_range[0]} to ${analysis.periods.present_range[1]})</p>

  <h2>2. Headline Change & Development Metrics</h2>
  <div class="kpi-row">
    <div class="kpi-card"><div class="kpi-label">Development</div><div class="kpi-val" style="color:#ef4444;">+${analysis.stats.new_built_up_hectares} ha</div><div>${analysis.stats.new_built_up_percent}% of AOI</div></div>
    <div class="kpi-card"><div class="kpi-label">Vegetation Shift</div><div class="kpi-val" style="color:${analysis.stats.vegetation_change_hectares < 0 ? '#ea580c' : '#16a34a'};">${analysis.stats.vegetation_change_hectares > 0 ? '+' : ''}${analysis.stats.vegetation_change_hectares} ha</div><div>Spectral NDVI</div></div>
    <div class="kpi-card"><div class="kpi-label">Overall Change</div><div class="kpi-val" style="color:#0284c7;">${analysis.stats.overall_change_percent}%</div><div>Materially Altered</div></div>
    <div class="kpi-card"><div class="kpi-label">Dev Intensity</div><div class="kpi-val" style="color:#d97706;">${analysis.stats.development_intensity_score}/100</div><div>${analysis.stats.intensity_rating}</div></div>
  </div>

  <h2>3. Executive AI Synthesis</h2>
  <p style="background:#f8fafc; border-left:4px solid #0284c7; padding:12px; font-style:italic;">
    "${analysis.ai_summary}"
  </p>

  <h2>4. Land-Cover Transitions (Dynamic World 10m)</h2>
  <p><strong>Largest Observed Transition:</strong> ${analysis.largest_transition.from} → ${analysis.largest_transition.to} (${analysis.largest_transition.hectares} ha, ${analysis.largest_transition.pct}% of AOI)</p>
  <table>
    <thead>
      <tr><th>From Class</th><th>To Class</th><th>Hectares Transformed</th><th>% of Total AOI</th></tr>
    </thead>
    <tbody>
      ${analysis.transitions
        .map(
          (t: any) =>
            `<tr><td>${t.from_label}</td><td>${t.to_label}</td><td>${t.hectares} ha</td><td>${t.percentage_of_aoi}%</td></tr>`
        )
        .join('')}
    </tbody>
  </table>

  <h2>5. Historical Development Trend & Slope</h2>
  <p>Historical built-up land accumulation rate: <strong>+${analysis.trend.slope_ha_per_year} ha/year</strong> (Regression R² = ${analysis.trend.r_squared}).</p>

  <h2>6. Three Grounded Future Scenarios (Horizon: +6 Years)</h2>
  ${analysis.scenarios
    .map(
      (sc: any) => `
    <div class="scenario-box">
      <h3 style="margin-top:0; color:#0f172a;">${sc.title} <small style="color:#64748b;">(${sc.tagline})</small></h3>
      <p><strong>Underlying Assumption:</strong> ${sc.assumption}</p>
      <p><strong>Empirical Calculation:</strong> <code>${sc.calculation}</code></p>
      <p><strong>Projected Built-up:</strong> <strong>${sc.projected_built_up_hectares} ha</strong> (${sc.projected_built_up_percent}% of AOI, Net Increase: +${sc.net_built_increase_hectares} ha, Retained Green Cover: ${sc.retained_vegetation_hectares} ha)</p>
      <p><strong>Ecological / Infrastructure Impact:</strong> ${sc.environmental_or_infrastructure_impact}</p>
      <p><small><strong>Confidence:</strong> ${sc.confidence_level} — ${sc.confidence_note}</small></p>
      <p><small style="color:#b45309;"><strong>Main Uncertainty:</strong> ${sc.main_uncertainty}</small></p>
    </div>
  `
    )
    .join('')}

  <h2>7. Data Quality & Scientific Audit Trail</h2>
  <div class="audit-meta">
    <p>Data Quality Score: ${analysis.quality.score}/100 (${analysis.quality.level})</p>
    <p>Sentinel-2 Composite Passes: ${analysis.quality.past_images} Past / ${analysis.quality.present_images} Present</p>
    <p>Seasonal Matching: ${analysis.quality.season_match ? 'Matched (Same Astronomical Quarter)' : 'Discrepant'}</p>
    <p>Computation Hash: ${analysis.audit.computation_hash}</p>
    <p>Datasets: ${analysis.audit.dataset_sources.join(', ')}</p>
    <p>Spectral Thresholds: NDBI &gt; ${analysis.audit.spectral_ndbi_threshold}, Cloud Mask &lt; ${analysis.audit.cloud_mask_threshold * 100}%</p>
  </div>

  <h2>8. Scientific Limitations & Reliability Disclaimers</h2>
  <ul>
    <li>Land-cover classifications are model-derived from 10m Sentinel-2 / Dynamic World reflectance and do not constitute certified parcel-level cadastral land titles.</li>
    <li>Vegetation indices are subject to rainfall seasonality and agricultural phenology cycles.</li>
    <li>Future scenarios represent conditional mathematical projections and exploratory decision pathways, not guaranteed administrative forecasts.</li>
  </ul>
</body>
</html>
    `;

    res.json({
      report_html: reportHtml,
      analysis_id: analysis.analysis_id,
      filename: `Land_Change_Report_${analysis.analysis_id}.html`,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Report generation failed' });
  }
});

export default app;
