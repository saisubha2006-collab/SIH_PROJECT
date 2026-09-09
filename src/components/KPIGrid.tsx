import React from 'react';
import {
  TrendingUp,
  TreePine,
  Maximize2,
  Gauge,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { ChangeStats, DataQuality } from '../types.ts';

interface KPIGridProps {
  stats: ChangeStats;
  largestTransition: { from: string; to: string; hectares: number; pct: number };
  quality: DataQuality;
  pastYear: number;
  presentYear: number;
  onOpenMetricModal: (metricKey: 'development' | 'vegetation' | 'overall' | 'intensity') => void;
}

export const KPIGrid: React.FC<KPIGridProps> = ({
  stats,
  largestTransition,
  quality,
  pastYear,
  presentYear,
  onOpenMetricModal,
}) => {
  return (
    <div className="space-y-4 mb-8">
      {/* Top Notification Bar: Dominant Transition & Quality Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Largest Observed Transition:</span>
            <div className="flex items-center gap-1.5 font-bold text-sky-400 bg-sky-500/10 px-2.5 py-0.5 rounded-full border border-sky-500/20">
              <span>{largestTransition.from}</span>
              <ArrowRight className="w-3 h-3 text-sky-400" />
              <span>{largestTransition.to}</span>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded">
            {largestTransition.hectares} ha ({largestTransition.pct}%)
          </span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-300 font-semibold">Data Quality: {quality.level} ({quality.score}/100)</span>
          </div>
          <span className="text-slate-400 text-[11px]">
            {quality.past_images} past passes + {quality.present_images} present passes • 10m Sentinel-2
          </span>
        </div>
      </div>

      {/* 4 Hero KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Development / Built-up Growth */}
        <div className="bg-slate-900/90 border border-rose-500/30 rounded-2xl p-4 lg:p-5 relative overflow-hidden group hover:border-rose-500/60 transition-all shadow-lg">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl group-hover:bg-rose-500/10 transition-colors pointer-events-none" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4" />
              New Development
            </span>
            <button
              onClick={() => onOpenMetricModal('development')}
              className="text-slate-500 hover:text-slate-300 transition-colors p-1"
              title="Explain how development area is calculated"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              +{stats.new_built_up_hectares}
            </span>
            <span className="text-sm font-semibold text-rose-400">ha</span>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center justify-between pt-2 border-t border-slate-800/80">
            <span>≈ {stats.new_built_up_percent}% of selected area</span>
            <span className="text-[11px] font-mono text-slate-500">{pastYear} → {presentYear}</span>
          </div>
        </div>

        {/* KPI 2: Vegetation Change */}
        <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-4 lg:p-5 relative overflow-hidden group hover:border-emerald-500/60 transition-all shadow-lg">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors pointer-events-none" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <TreePine className="w-4 h-4" />
              Vegetation Shift
            </span>
            <button
              onClick={() => onOpenMetricModal('vegetation')}
              className="text-slate-500 hover:text-slate-300 transition-colors p-1"
              title="Explain how vegetation change is calculated"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-extrabold tracking-tight ${
              stats.vegetation_change_hectares < 0 ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {stats.vegetation_change_hectares > 0 ? `+${stats.vegetation_change_hectares}` : stats.vegetation_change_hectares}
            </span>
            <span className="text-sm font-semibold text-slate-400">ha</span>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center justify-between pt-2 border-t border-slate-800/80">
            <span>Spectral NDVI &amp; Canopy delta</span>
            <span className="text-[11px] text-emerald-400/80 font-medium">Dynamic World</span>
          </div>
        </div>

        {/* KPI 3: Overall Area Materially Changed */}
        <div className="bg-slate-900/90 border border-sky-500/30 rounded-2xl p-4 lg:p-5 relative overflow-hidden group hover:border-sky-500/60 transition-all shadow-lg">
          <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-full blur-2xl group-hover:bg-sky-500/10 transition-colors pointer-events-none" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
              <Maximize2 className="w-4 h-4" />
              Overall Change
            </span>
            <button
              onClick={() => onOpenMetricModal('overall')}
              className="text-slate-500 hover:text-slate-300 transition-colors p-1"
              title="Explain overall change percentage calculation"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {stats.overall_change_percent}
            </span>
            <span className="text-lg font-bold text-sky-400">%</span>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center justify-between pt-2 border-t border-slate-800/80">
            <span>Materially altered land</span>
            <span className="text-[11px] text-sky-400/80 font-medium">Multi-spectral mask</span>
          </div>
        </div>

        {/* KPI 4: Development Intensity Score */}
        <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-4 lg:p-5 relative overflow-hidden group hover:border-amber-500/60 transition-all shadow-lg">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-colors pointer-events-none" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Gauge className="w-4 h-4" />
              Development Intensity
            </span>
            <button
              onClick={() => onOpenMetricModal('intensity')}
              className="text-slate-500 hover:text-slate-300 transition-colors p-1"
              title="Explain the Development Intensity formula"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-400 tracking-tight">
              {stats.development_intensity_score}
            </span>
            <span className="text-sm font-semibold text-slate-400">/ 100</span>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center justify-between pt-2 border-t border-slate-800/80">
            <span className="font-semibold text-amber-300">{stats.intensity_rating} Pressure</span>
            <span className="text-[11px] text-slate-500">Transparent formula</span>
          </div>
        </div>

      </div>
    </div>
  );
};
