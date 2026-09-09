import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { AreaSelector } from './components/AreaSelector.tsx';
import { SatelliteMap } from './components/SatelliteMap.tsx';
import { KPIGrid } from './components/KPIGrid.tsx';
import { CompareSlider } from './components/CompareSlider.tsx';
import { AISummaryCard } from './components/AISummaryCard.tsx';
import { TransitionMatrix } from './components/TransitionMatrix.tsx';
import { TrendChart } from './components/TrendChart.tsx';
import { ScenarioCards } from './components/ScenarioCards.tsx';
import { AuditPanel } from './components/AuditPanel.tsx';
import { MetricModal } from './components/MetricModal.tsx';
import { ReportModal } from './components/ReportModal.tsx';
import { MethodologyModal } from './components/MethodologyModal.tsx';
import { AnalysisLoader } from './components/AnalysisLoader.tsx';
import { PRESET_AREAS } from './data/presets.ts';
import { PresetArea, AnalysisResult } from './types.ts';
import { Map, ChevronDown, ChevronUp, MapPin, Calendar, Clock, ExternalLink } from 'lucide-react';

export default function App() {
  const [selectedPreset, setSelectedPreset] = useState<PresetArea | null>(PRESET_AREAS[0]);
  const [pastYear, setPastYear] = useState<number>(2019);
  const [presentYear, setPresentYear] = useState<number>(2026);
  const [customCoords, setCustomCoords] = useState<[number, number][]>(PRESET_AREAS[0].coordinates);
  const [isDrawingMode, setIsDrawingMode] = useState<boolean>(false);
  const [isMapExpanded, setIsMapExpanded] = useState<boolean>(false);

  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modals
  const [activeMetricModal, setActiveMetricModal] = useState<
    'development' | 'vegetation' | 'overall' | 'intensity' | null
  >(null);
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);
  const [isMethodologyOpen, setIsMethodologyOpen] = useState<boolean>(false);

  // Run initial analysis on mount with first preset
  useEffect(() => {
    executeAnalysis(PRESET_AREAS[0].coordinates, PRESET_AREAS[0].name, 2019, 2026, PRESET_AREAS[0].id);
  }, []);

  const executeAnalysis = async (
    coords: [number, number][],
    name: string,
    pYear: number,
    prYear: number,
    presetId?: string
  ) => {
    setIsAnalyzing(true);
    setErrorMsg(null);

    const pastRange: [string, string] = [`${pYear}-01-01`, `${pYear}-03-31`];
    const presentRange: [string, string] = [`${prYear}-01-01`, `${prYear}-03-31`];

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aoi: { coordinates: coords },
          locationName: name,
          past_range: pastRange,
          present_range: presentRange,
          presetId,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to process satellite analysis');
      }

      const data: AnalysisResult = await res.json();
      setAnalysis(data);
    } catch (err: any) {
      console.error('Analysis error:', err);
      setErrorMsg(err.message || 'Error executing remote sensing pipeline');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectPreset = (preset: PresetArea) => {
    setSelectedPreset(preset);
    setCustomCoords(preset.coordinates);
    setPastYear(preset.default_past_year);
    setPresentYear(preset.default_present_year);
    setIsDrawingMode(false);
    executeAnalysis(
      preset.coordinates,
      preset.name,
      preset.default_past_year,
      preset.default_present_year,
      preset.id
    );
  };

  const handleTriggerAnalysis = () => {
    const name = selectedPreset ? selectedPreset.name : 'Custom Drawn AOI';
    executeAnalysis(customCoords, name, pastYear, presentYear, selectedPreset?.id);
  };

  const handlePolygonDrawn = (coords: [number, number][]) => {
    setCustomCoords(coords);
    setSelectedPreset(null);
  };

  const currentCenter: [number, number] = selectedPreset
    ? selectedPreset.center
    : customCoords.length > 0
    ? customCoords[0]
    : [20.6586, 85.5956];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        selectedPresetId={selectedPreset?.id}
        onSelectPreset={handleSelectPreset}
        onOpenReport={() => setIsReportOpen(true)}
        onOpenMethodology={() => setIsMethodologyOpen(true)}
        hasAnalysis={!!analysis}
      />

      {/* Main App Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6">
        
        {/* Error Notification */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
            <span>{errorMsg}</span>
            <button
              onClick={() => setErrorMsg(null)}
              className="text-slate-400 hover:text-white font-bold ml-4"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Area Selection & Time Controls */}
        <AreaSelector
          selectedPreset={selectedPreset}
          onSelectPreset={handleSelectPreset}
          pastYear={pastYear}
          presentYear={presentYear}
          onChangePastYear={setPastYear}
          onChangePresentYear={setPresentYear}
          isSameSeason={true}
          quality={analysis?.quality || null}
          onRunAnalysis={handleTriggerAnalysis}
          isAnalyzing={isAnalyzing}
          isDrawingMode={isDrawingMode}
          onToggleDrawingMode={() => {
            setIsDrawingMode(!isDrawingMode);
            setIsMapExpanded(true);
          }}
          onResetToPreset={() => handleSelectPreset(PRESET_AREAS[0])}
        />

        {/* Collapsible Satellite Map Preview / AOI Drawing Panel */}
        <div className="mb-6 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
          <button
            onClick={() => setIsMapExpanded(!isMapExpanded)}
            className="w-full px-5 py-3 flex items-center justify-between text-xs font-semibold text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800/60 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Map className="w-4 h-4 text-sky-400" />
              <span>Interactive Geospatial Map &amp; Boundary Demarcation</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                {customCoords.length} vertices
              </span>
            </span>
            <span className="flex items-center gap-1 text-slate-400 text-[11px]">
              {isMapExpanded ? 'Collapse Map' : 'Expand Interactive Map'}
              {isMapExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </span>
          </button>

          {isMapExpanded && (
            <div className="p-4 border-t border-slate-800 h-[340px]">
              <SatelliteMap
                coordinates={customCoords}
                center={currentCenter}
                zoom={selectedPreset?.zoom || 14}
                onPolygonDrawn={handlePolygonDrawn}
                isDrawingMode={isDrawingMode}
              />
            </div>
          )}
        </div>

        {/* Loading Pipeline State */}
        {isAnalyzing && (
          <AnalysisLoader
            locationName={selectedPreset ? selectedPreset.name : 'Selected Area of Interest'}
          />
        )}

        {/* Results Dashboard */}
        {!isAnalyzing && analysis && (
          <div className="space-y-6">
            
            {/* Location & Period Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-900/60 border border-slate-800/80 px-5 py-3 rounded-2xl">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-sky-400 shrink-0" />
                <div>
                  <span className="text-sm font-bold text-white">{analysis.aoi.name}</span>
                  <span className="text-xs text-slate-400 ml-2 font-mono">
                    ({analysis.aoi.area_hectares} ha • {analysis.aoi.area_sqkm} km²)
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                <span className="flex items-center gap-1 text-sky-400 font-semibold">
                  <Calendar className="w-3.5 h-3.5" />
                  {analysis.periods.past_year} → {analysis.periods.present_year}
                </span>
                <span>•</span>
                <span>ID: {analysis.analysis_id}</span>
              </div>
            </div>

            {/* 1. KPI Row */}
            <KPIGrid
              stats={analysis.stats}
              largestTransition={analysis.largest_transition}
              quality={analysis.quality}
              pastYear={analysis.periods.past_year}
              presentYear={analysis.periods.present_year}
              onOpenMetricModal={(metric) => setActiveMetricModal(metric)}
            />

            {/* 2. Primary Visual Experience: Split-screen Compare Slider & Heatmap */}
            <CompareSlider
              visualGrid={analysis.visual_grid}
              pastYear={analysis.periods.past_year}
              presentYear={analysis.periods.present_year}
              locationName={analysis.aoi.name}
              center={currentCenter}
              coordinates={customCoords}
            />

            {/* 3. Executive AI Synthesis (Gemini) */}
            <AISummaryCard
              summary={analysis.ai_summary}
              analysisId={analysis.analysis_id}
            />

            {/* 4. Dynamic World Land-Cover Transitions & Matrix */}
            <TransitionMatrix
              composition={analysis.land_cover_composition}
              transitions={analysis.transitions}
              matrix={analysis.transition_matrix}
              pastYear={analysis.periods.past_year}
              presentYear={analysis.periods.present_year}
            />

            {/* 5. Historical Development Trend Chart */}
            <TrendChart
              slopeHaPerYear={analysis.trend.slope_ha_per_year}
              rSquared={analysis.trend.r_squared}
              historicalPoints={analysis.trend.historical_points}
              futureProjections={analysis.trend.future_projections}
              totalAreaHa={analysis.aoi.area_hectares}
            />

            {/* 6. Three Evidence-Grounded Future Scenarios */}
            <ScenarioCards
              scenarios={analysis.scenarios}
              currentBuiltHa={analysis.stats.new_built_up_hectares * 2}
              totalAreaHa={analysis.aoi.area_hectares}
              presentYear={analysis.periods.present_year}
            />

            {/* 7. Scientific Auditability & Limitations */}
            <AuditPanel analysis={analysis} />

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <span className="font-semibold text-slate-400">SIH26167 Geospatial Intelligence</span>: Satellite Past vs Present Land Change &amp; Grounded Future Scenarios
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <span>Copernicus Sentinel-2</span>
            <span>•</span>
            <span>Google Dynamic World V1</span>
            <span>•</span>
            <span>Gemini API</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {analysis && (
        <MetricModal
          isOpen={!!activeMetricModal}
          metricKey={activeMetricModal}
          onClose={() => setActiveMetricModal(null)}
          stats={analysis.stats}
          aoiAreaHa={analysis.aoi.area_hectares}
        />
      )}

      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        analysis={analysis}
      />

      <MethodologyModal
        isOpen={isMethodologyOpen}
        onClose={() => setIsMethodologyOpen(false)}
      />
    </div>
  );
}
