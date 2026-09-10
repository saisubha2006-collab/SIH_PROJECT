import React from 'react';
import { X, HelpCircle, Calculator, CheckCircle2, ShieldAlert } from 'lucide-react';
import { ChangeStats } from '../types.ts';

interface MetricModalProps {
  isOpen: boolean;
  metricKey: 'development' | 'vegetation' | 'overall' | 'intensity' | null;
  onClose: () => void;
  stats: ChangeStats;
  aoiAreaHa: number;
}

export const MetricModal: React.FC<MetricModalProps> = ({
  isOpen,
  metricKey,
  onClose,
  stats,
  aoiAreaHa,
}) => {
  if (!isOpen || !metricKey) return null;

  const contentMap = {
    development: {
      title: 'How is Development (+X ha) Calculated?',
      formula: 'Development Mask = (NDBI_present - NDBI_past > 0.15) ∩ (Dynamic World Present == Built) ∩ (Dynamic World Past != Built)',
      explanation:
        'The remote sensing engine does not rely solely on raw classification or simple spectral diffing. It combines Normalized Difference Built-up Index (NDBI = [B11 - B8] / [B11 + B8]) spectral increase with Dynamic World 10m categorical evidence. Only pixels exhibiting both structural spectral gain and non-built baseline provenance are tagged as new development. The pixel count is converted to surface area using exact spherical geometry (100m² per 10m pixel).',
      disclaimer: 'This is an image-derived optical reflectance estimate, not a legal survey title.',
    },
    vegetation: {
      title: 'How is Vegetation Shift Calculated?',
      formula: 'NDVI = (B8 - B4) / (B8 + B4) • ΔVegetation = Present Tree/Crop/Grass area - Past area',
      explanation:
        'Normalized Difference Vegetation Index (NDVI) measures chlorophyll absorption in the Red band (B4) and high reflectance in the Near-Infrared band (B8). The system checks both continuous NDVI delta and Dynamic World vegetation classes (Trees, Crops, Grass). Seasonal matching (comparing identical astronomical quarters) is enforced to prevent mistaking annual monsoon greening or post-harvest drying for structural deforestation.',
      disclaimer: 'Seasonal rainfall variations and crop cycles can cause slight variance.',
    },
    overall: {
      title: 'How is Overall Change (X%) Calculated?',
      formula: 'Overall Change % = (Count of Altered Pixels / Total Pixels in AOI) × 100',
      explanation:
        'A pixel is designated as materially changed if it experienced any of: a major spectral built-up shift, vegetation clearing/growth, water surface expansion/contraction, or a confirmed Dynamic World land-cover transition. It represents the total footprint of dynamic transformation within the boundary, NOT solely urban construction.',
      disclaimer: 'Reflects all ecological and anthropogenic surface modifications.',
    },
    intensity: {
      title: 'How is the Development Intensity Score Calculated?',
      formula: stats.intensity_formula_breakdown,
      explanation:
        'Development Intensity (0–100) is a transparent composite metric designed for planners and decision-makers. It balances three empirical factors: the percentage of land converted to built-up (45% weight), the multi-year acceleration slope in hectares/year (35% weight), and associated vegetation canopy loss (20% weight). It provides a standardized metric to compare urban pressure across different districts.',
      disclaimer: 'This is an analytical communication score, not an international statutory index.',
    },
  };

  const item = contentMap[metricKey];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white p-1 rounded-lg hover:bg-slate-100 dark:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Calculator className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white pr-6">{item.title}</h3>
        </div>

        {/* Formula Box */}
        <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-mono text-sky-300 mb-4 break-words">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Mathematical Formula:</div>
          {item.formula}
        </div>

        {/* Scientific Explanation */}
        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
          {item.explanation}
        </p>

        {/* Disclaimer */}
        <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl text-[11px] text-amber-300">
          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{item.disclaimer}</span>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-700 text-slate-900 dark:text-white rounded-xl text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
