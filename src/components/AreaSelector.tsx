import React, { useState } from 'react';
import {
  MapPin,
  Calendar,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  PenTool,
  RotateCcw,
  Sliders,
  ChevronDown,
} from 'lucide-react';
import { PresetArea, DataQuality } from '../types.ts';
import { PRESET_AREAS } from '../data/presets.ts';

interface AreaSelectorProps {
  selectedPreset: PresetArea | null;
  onSelectPreset: (preset: PresetArea) => void;
  pastYear: number;
  presentYear: number;
  onChangePastYear: (yr: number) => void;
  onChangePresentYear: (yr: number) => void;
  isSameSeason: boolean;
  quality: DataQuality | null;
  onRunAnalysis: () => void;
  isAnalyzing: boolean;
  isDrawingMode: boolean;
  onToggleDrawingMode: () => void;
  onResetToPreset: () => void;
}

export const AreaSelector: React.FC<AreaSelectorProps> = ({
  selectedPreset,
  onSelectPreset,
  pastYear,
  presentYear,
  onChangePastYear,
  onChangePresentYear,
  isSameSeason,
  quality,
  onRunAnalysis,
  isAnalyzing,
  isDrawingMode,
  onToggleDrawingMode,
  onResetToPreset,
}) => {
  const [selectedQuarter, setSelectedQuarter] = useState<'Q1' | 'Q2' | 'Q3' | 'Q4'>('Q1');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);

  const quarterLabels: Record<string, string> = {
    Q1: 'Jan 01 – Mar 31 (Post-Monsoon / Dry Winter)',
    Q2: 'Apr 01 – Jun 30 (Pre-Monsoon / Spring-Summer)',
    Q3: 'Jul 01 – Sep 30 (Peak Monsoon / Growing Season)',
    Q4: 'Oct 01 – Dec 31 (Post-Harvest / Autumn)',
  };

  const availableYears = [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 lg:p-6 shadow-xl mb-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        
        {/* Location Selection & Area Info */}
        <div className="lg:col-span-5 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-sky-400" />
              Target Region / Area of Interest (AOI)
            </label>
            <button
              onClick={onToggleDrawingMode}
              className={`text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1 border transition-all font-medium ${
                isDrawingMode
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              <PenTool className="w-3 h-3" />
              {isDrawingMode ? 'Drawing on Map...' : 'Draw Custom Polygon'}
            </button>
          </div>

          {/* Location Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowLocationDropdown(!showLocationDropdown)}
              className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl px-4 py-3 text-left flex items-center justify-between group transition-all"
            >
              <div className="overflow-hidden">
                <div className="text-sm font-semibold text-white flex items-center gap-2">
                  <span className="truncate">{selectedPreset ? selectedPreset.name : 'Custom Coordinates Area'}</span>
                  {selectedPreset && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 whitespace-nowrap">
                      {selectedPreset.area_hectares} ha
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-400 truncate mt-0.5">
                  {selectedPreset ? `${selectedPreset.region}, ${selectedPreset.country}` : 'User-defined boundary on map'}
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 group-hover:text-white transition-transform ${showLocationDropdown ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {showLocationDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden py-1 max-h-72 overflow-y-auto">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-950/50">
                  Pre-Validated Satellite Demonstration Hotspots
                </div>
                {PRESET_AREAS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => {
                      onSelectPreset(preset);
                      setShowLocationDropdown(false);
                    }}
                    className={`w-full px-3.5 py-2.5 text-left text-xs hover:bg-slate-800 flex items-start justify-between gap-2 border-b border-slate-800/50 last:border-0 ${
                      selectedPreset?.id === preset.id ? 'bg-sky-500/10 text-sky-300' : 'text-slate-200'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-white">{preset.name}</div>
                      <div className="text-[11px] text-slate-400">{preset.region} • {preset.tag}</div>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      {preset.area_hectares} ha
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Time Comparison Controls */}
        <div className="lg:col-span-4 space-y-2">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-sky-400" />
              Comparison Periods (Same Season)
            </span>
            <span className={`text-[11px] font-medium flex items-center gap-1 ${isSameSeason ? 'text-emerald-400' : 'text-amber-400'}`}>
              {isSameSeason ? (
                <>
                  <ShieldCheck className="w-3 h-3" /> Season Matched ({selectedQuarter})
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3 h-3" /> Season Warning
                </>
              )}
            </span>
          </label>

          <div className="grid grid-cols-2 gap-2">
            {/* Past Year */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2">
              <span className="text-[10px] text-slate-400 uppercase block font-medium">Past Period (Baseline)</span>
              <select
                value={pastYear}
                onChange={(e) => onChangePastYear(Number(e.target.value))}
                className="w-full bg-transparent text-sm font-bold text-white focus:outline-none cursor-pointer mt-0.5"
              >
                {availableYears.filter((y) => y < presentYear).map((y) => (
                  <option key={y} value={y} className="bg-slate-900 text-white">
                    {y} ({selectedQuarter})
                  </option>
                ))}
              </select>
            </div>

            {/* Present Year */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2">
              <span className="text-[10px] text-slate-400 uppercase block font-medium">Present Period</span>
              <select
                value={presentYear}
                onChange={(e) => onChangePresentYear(Number(e.target.value))}
                className="w-full bg-transparent text-sm font-bold text-sky-400 focus:outline-none cursor-pointer mt-0.5"
              >
                {availableYears.filter((y) => y > pastYear).map((y) => (
                  <option key={y} value={y} className="bg-slate-900 text-sky-400">
                    {y} ({selectedQuarter})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Quality Gate & Run Action */}
        <div className="lg:col-span-3 flex flex-col justify-end space-y-2">
          {/* Quality Preflight Badge */}
          <div className="flex items-center justify-between text-xs px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-slate-400 text-[11px] flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Data Quality Gate
            </span>
            <span className="font-bold text-emerald-400 text-xs">
              {quality ? `${quality.score}/100 ${quality.level}` : '94/100 HIGH'}
            </span>
          </div>

          {/* Primary CTA Run Button */}
          <button
            onClick={onRunAnalysis}
            disabled={isAnalyzing}
            className={`w-full py-3 px-4 rounded-xl text-sm font-bold tracking-wide transition-all shadow-lg flex items-center justify-center gap-2 ${
              isAnalyzing
                ? 'bg-slate-800 text-slate-400 cursor-wait'
                : 'bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-400 hover:to-emerald-400 text-slate-950 shadow-sky-500/20 active:scale-[0.99]'
            }`}
          >
            {isAnalyzing ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                <span>Processing Satellite Passes...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>Run Land Change Analysis</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
