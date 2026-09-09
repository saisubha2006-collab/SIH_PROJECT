import React from 'react';
import { Globe, FileText, HelpCircle, Layers, CheckCircle2 } from 'lucide-react';
import { PRESET_AREAS } from '../data/presets.ts';
import { PresetArea } from '../types.ts';

interface NavbarProps {
  selectedPresetId?: string;
  onSelectPreset: (preset: PresetArea) => void;
  onOpenReport: () => void;
  onOpenMethodology: () => void;
  hasAnalysis: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  selectedPresetId,
  onSelectPreset,
  onOpenReport,
  onOpenMethodology,
  hasAnalysis,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        {/* Brand & System Title */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 tracking-wider">
                SIH26167
              </span>
              <h1 className="text-base md:text-lg font-bold text-white tracking-tight">
                Land Change &amp; Development Intelligence
              </h1>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Satellite Past vs Present (10m) • Dynamic World LULC • 3 Evidence-Grounded Future Scenarios
            </p>
          </div>
        </div>

        {/* Preset Locations Quick Selector & Actions */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-1.5 bg-slate-950/70 p-1 rounded-lg border border-slate-800 text-xs">
            <span className="text-slate-400 px-1.5 flex items-center gap-1 font-medium">
              <Layers className="w-3.5 h-3.5 text-sky-400" /> Presets:
            </span>
            <div className="flex items-center gap-1 overflow-x-auto max-w-[280px] sm:max-w-[380px] py-0.5">
              {PRESET_AREAS.map((preset) => {
                const isSelected = selectedPresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => onSelectPreset(preset)}
                    className={`px-2.5 py-1 rounded whitespace-nowrap text-xs transition-all font-medium ${
                      isSelected
                        ? 'bg-sky-500 text-slate-950 font-semibold shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {preset.name.split(' ')[0]}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenMethodology}
              className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 text-xs font-medium flex items-center gap-1.5 transition-colors"
              title="Methodology & Limitations"
            >
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Methodology</span>
            </button>

            <button
              onClick={onOpenReport}
              disabled={!hasAnalysis}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                hasAnalysis
                  ? 'bg-sky-600 hover:bg-sky-500 text-white shadow-md shadow-sky-950'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Export Report</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
