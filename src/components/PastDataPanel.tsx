import React, { useState } from 'react';
import {
  History,
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart2,
  ArrowRight,
  Layers,
  Leaf,
  Droplets,
  Building2,
  SunMedium,
  TreePine,
  Wheat,
} from 'lucide-react';
import { LandCoverDistribution, ChangeStats } from '../types.ts';

interface PastDataPanelProps {
  composition: LandCoverDistribution[];
  stats: ChangeStats;
  pastYear: number;
  presentYear: number;
  totalAreaHa: number;
}

const COVER_META: Record<
  string,
  { label: string; color: string; bg: string; border: string; icon: React.ReactNode }
> = {
  built:   { label: 'Built-up / Urban', color: 'text-rose-400',    bg: 'bg-rose-500/10',    border: 'border-rose-500/30',    icon: <Building2 className="w-3.5 h-3.5" /> },
  trees:   { label: 'Trees / Forest',   color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', icon: <TreePine  className="w-3.5 h-3.5" /> },
  crops:   { label: 'Cropland',         color: 'text-lime-400',    bg: 'bg-lime-500/10',    border: 'border-lime-500/30',    icon: <Wheat     className="w-3.5 h-3.5" /> },
  grass:   { label: 'Grassland',        color: 'text-yellow-400',  bg: 'bg-yellow-500/10',  border: 'border-yellow-500/30',  icon: <Leaf      className="w-3.5 h-3.5" /> },
  water:   { label: 'Water Bodies',     color: 'text-sky-400',     bg: 'bg-sky-500/10',     border: 'border-sky-500/30',     icon: <Droplets  className="w-3.5 h-3.5" /> },
  bare:    { label: 'Bare Soil',        color: 'text-orange-400',  bg: 'bg-orange-500/10',  border: 'border-orange-500/30',  icon: <SunMedium className="w-3.5 h-3.5" /> },
  shrub:   { label: 'Shrubland',        color: 'text-violet-400',  bg: 'bg-violet-500/10',  border: 'border-violet-500/30',  icon: <Leaf      className="w-3.5 h-3.5" /> },
  flooded: { label: 'Flooded Veg.',     color: 'text-teal-400',    bg: 'bg-teal-500/10',    border: 'border-teal-500/30',    icon: <Droplets  className="w-3.5 h-3.5" /> },
};

const fallback = {
  label: 'Other', color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/30',
  icon: <Layers className="w-3.5 h-3.5" />,
};

function DeltaBadge({ delta }: { delta: number }) {
  if (Math.abs(delta) < 0.1)
    return <span className="flex items-center gap-0.5 text-slate-400 text-[10px] font-semibold"><Minus className="w-3 h-3" /> No change</span>;
  if (delta > 0)
    return <span className="flex items-center gap-0.5 text-emerald-400 text-[10px] font-semibold"><TrendingUp className="w-3 h-3" /> +{delta.toFixed(1)} ha</span>;
  return <span className="flex items-center gap-0.5 text-rose-400 text-[10px] font-semibold"><TrendingDown className="w-3 h-3" /> {delta.toFixed(1)} ha</span>;
}

export const PastDataPanel: React.FC<PastDataPanelProps> = ({
  composition,
  stats,
  pastYear,
  presentYear,
  totalAreaHa,
}) => {
  const [tab, setTab] = useState<'rates' | 'comparison'>('rates');
  const yearSpan = Math.max(presentYear - pastYear, 1);

  const builtupGrowthRate = totalAreaHa > 0 ? (stats.new_built_up_hectares / totalAreaHa) * 100 : 0;
  const annualBuiltRate   = stats.new_built_up_hectares / yearSpan;
  const annualBuiltPct    = builtupGrowthRate / yearSpan;
  const builtComp         = composition.find((c) => c.type === 'built');
  const pastBuiltHa       = builtComp ? builtComp.past_ha : 0;
  const presentBuiltHa    = builtComp ? builtComp.present_ha : 0;
  const relGrowthPct      = pastBuiltHa > 0 ? ((presentBuiltHa - pastBuiltHa) / pastBuiltHa) * 100 : 0;

  const vegTypes = ['trees', 'grass', 'crops', 'shrub'];
  const pastVegHa    = composition.filter((c) => vegTypes.includes(c.type)).reduce((s, c) => s + c.past_ha, 0);
  const presentVegHa = composition.filter((c) => vegTypes.includes(c.type)).reduce((s, c) => s + c.present_ha, 0);
  const vegDelta     = presentVegHa - pastVegHa;
  const vegDeltaPct  = pastVegHa > 0 ? (vegDelta / pastVegHa) * 100 : 0;

  const rateCards = [
    {
      title: 'Urban Expansion Rate', icon: <Building2 className="w-5 h-5" />, color: 'rose',
      main: `+${stats.new_built_up_hectares} ha`,
      sub: `+${builtupGrowthRate.toFixed(1)}% of AOI gained`,
      d1: `${annualBuiltRate.toFixed(1)} ha / yr`,
      d2: `${annualBuiltPct.toFixed(2)} % / yr`,
      extra: `Relative built-up growth: +${relGrowthPct.toFixed(1)}%`,
      note: `Past built-up: ${pastBuiltHa.toFixed(1)} ha → Present: ${presentBuiltHa.toFixed(1)} ha`,
      bar: Math.min(builtupGrowthRate * 3, 100),
    },
    {
      title: 'Vegetation Change Rate', icon: <TreePine className="w-5 h-5" />, color: vegDelta >= 0 ? 'emerald' : 'amber',
      main: `${vegDelta >= 0 ? '+' : ''}${vegDelta.toFixed(1)} ha`,
      sub: `${vegDeltaPct >= 0 ? '+' : ''}${vegDeltaPct.toFixed(1)}% relative change`,
      d1: `${(vegDelta / yearSpan).toFixed(1)} ha / yr`,
      d2: `${(vegDeltaPct / yearSpan).toFixed(2)} % / yr`,
      extra: `Trees, crops, grass, shrub combined`,
      note: `Past: ${pastVegHa.toFixed(1)} ha → Present: ${presentVegHa.toFixed(1)} ha`,
      bar: Math.min(Math.abs(vegDeltaPct) * 2, 100),
    },
    {
      title: 'Overall Land Change', icon: <BarChart2 className="w-5 h-5" />, color: 'sky',
      main: `${stats.overall_change_percent}%`,
      sub: `of AOI materially altered`,
      d1: `${(stats.overall_change_percent / yearSpan).toFixed(2)} % / yr`,
      d2: `Intensity: ${stats.intensity_rating}`,
      extra: `Development score: ${stats.development_intensity_score} / 100`,
      note: `Multi-spectral classification delta`,
      bar: Math.min(stats.overall_change_percent * 2, 100),
    },
  ];

  const cm: Record<string, { border: string; bg: string; text: string; bar: string; glow: string }> = {
    rose:    { border: 'border-rose-500/30',    bg: 'bg-rose-500/5',    text: 'text-rose-400',    bar: 'bg-rose-400',    glow: 'bg-rose-500/10'    },
    emerald: { border: 'border-emerald-500/30', bg: 'bg-emerald-500/5', text: 'text-emerald-400', bar: 'bg-emerald-400', glow: 'bg-emerald-500/10' },
    amber:   { border: 'border-amber-500/30',   bg: 'bg-amber-500/5',   text: 'text-amber-400',   bar: 'bg-amber-400',   glow: 'bg-amber-500/10'   },
    sky:     { border: 'border-sky-500/30',     bg: 'bg-sky-500/5',     text: 'text-sky-400',     bar: 'bg-sky-400',     glow: 'bg-sky-500/10'     },
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 lg:p-6 shadow-xl mb-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <History className="w-5 h-5 text-amber-400" />
            <span>Past Data &amp; Growth Analytics</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
              {pastYear} → {presentYear}
            </span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Annualized development &amp; vegetation rates · full past vs present land-cover breakdown
          </p>
        </div>

        <div className="flex items-center bg-slate-50 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs self-start sm:self-auto">
          <button
            onClick={() => setTab('rates')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
              tab === 'rates'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Growth Rates
          </button>
          <button
            onClick={() => setTab('comparison')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
              tab === 'comparison'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ArrowRight className="w-3.5 h-3.5" />
            Past vs Present
          </button>
        </div>
      </div>

      {/* ─── TAB: Growth Rates ─── */}
      {tab === 'rates' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {rateCards.map((card) => {
              const c = cm[card.color];
              return (
                <div key={card.title} className={`relative overflow-hidden rounded-2xl border ${c.border} ${c.bg} p-4 lg:p-5`}>
                  <div className={`absolute top-0 right-0 w-20 h-20 ${c.glow} rounded-full blur-2xl pointer-events-none`} />

                  <div className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider ${c.text} mb-3`}>
                    {card.icon}{card.title}
                  </div>

                  <div className={`text-2xl font-extrabold ${c.text} tracking-tight`}>{card.main}</div>
                  <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-0.5 mb-3">{card.sub}</div>

                  {/* progress bar */}
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mb-3">
                    <div className={`h-full ${c.bar} rounded-full transition-all duration-700`} style={{ width: `${card.bar}%` }} />
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400 border-t border-slate-200/60 dark:border-slate-800/60 pt-2">
                    <span>{card.d1}</span>
                    <span>{card.d2}</span>
                  </div>
                  <div className={`text-[10px] mt-1.5 font-semibold ${c.text}`}>{card.extra}</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">{card.note}</div>
                </div>
              );
            })}
          </div>

          {/* Past snapshot */}
          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <History className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Baseline Snapshot — {pastYear}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {composition.map((cover) => {
                const meta = COVER_META[cover.type] || fallback;
                return (
                  <div key={cover.type} className={`rounded-xl border ${meta.border} ${meta.bg} px-3 py-2.5`}>
                    <div className={`flex items-center gap-1.5 ${meta.color} text-[10px] font-bold uppercase tracking-wider mb-1`}>
                      {meta.icon}{meta.label}
                    </div>
                    <div className={`text-lg font-extrabold ${meta.color}`}>
                      {cover.past_ha.toFixed(1)}
                      <span className="text-xs font-semibold ml-0.5 text-slate-500 dark:text-slate-400">ha</span>
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                      {cover.past_pct.toFixed(1)}% of AOI
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB: Past vs Present ─── */}
      {tab === 'comparison' && (
        <div className="space-y-4">
          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-slate-400 inline-block" /> Past ({pastYear})</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-sky-400 inline-block" /> Present ({presentYear})</span>
            <span className="ml-auto font-mono text-[10px]">Area in hectares (ha) · % of total AOI</span>
          </div>

          {/* Per-category rows */}
          <div className="space-y-2">
            {composition.map((cover) => {
              const meta     = COVER_META[cover.type] || fallback;
              const maxHa    = Math.max(cover.past_ha, cover.present_ha, 1);
              const pastBar  = (cover.past_ha  / maxHa) * 100;
              const presBar  = (cover.present_ha / maxHa) * 100;
              const sign     = cover.delta_ha > 0 ? '+' : '';
              const relPct   = cover.past_ha > 0
                ? `${sign}${((cover.delta_ha / cover.past_ha) * 100).toFixed(1)}%`
                : cover.delta_ha > 0 ? 'New' : '—';

              return (
                <div key={cover.type} className="bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 rounded-xl p-3 lg:p-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                  {/* Row header */}
                  <div className="flex items-center justify-between mb-2.5">
                    <div className={`flex items-center gap-2 ${meta.color} text-xs font-bold`}>
                      <span className={`p-1 rounded ${meta.bg}`}>{meta.icon}</span>
                      {meta.label}
                    </div>
                    <div className="flex items-center gap-2 text-[11px]">
                      <DeltaBadge delta={cover.delta_ha} />
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                        cover.delta_ha > 0.5
                          ? 'bg-rose-500/10 text-rose-400'
                          : cover.delta_ha < -0.5
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                      }`}>
                        {relPct}
                      </span>
                    </div>
                  </div>

                  {/* Dual bars */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] w-12 text-right text-slate-400 font-mono shrink-0">{pastYear}</span>
                      <div className="flex-1 h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-slate-400 rounded-full transition-all duration-700" style={{ width: `${pastBar}%` }} />
                      </div>
                      <span className="text-[10px] w-24 text-slate-600 dark:text-slate-300 font-mono shrink-0">
                        {cover.past_ha.toFixed(1)} ha &nbsp;({cover.past_pct.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] w-12 text-right text-sky-400 font-mono shrink-0">{presentYear}</span>
                      <div className="flex-1 h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-sky-400 rounded-full transition-all duration-700" style={{ width: `${presBar}%` }} />
                      </div>
                      <span className="text-[10px] w-24 text-slate-600 dark:text-slate-300 font-mono shrink-0">
                        {cover.present_ha.toFixed(1)} ha &nbsp;({cover.present_pct.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary footer */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-3 text-center">
              <div className="text-[10px] uppercase tracking-wider text-rose-400 font-bold mb-1">New Urban Land</div>
              <div className="text-xl font-extrabold text-rose-400">+{stats.new_built_up_hectares} ha</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                {stats.new_built_up_percent}% of AOI · {yearSpan} yrs
              </div>
            </div>
            <div className={`${stats.vegetation_change_hectares < 0 ? 'bg-amber-500/5 border-amber-500/20' : 'bg-emerald-500/5 border-emerald-500/20'} border rounded-xl p-3 text-center`}>
              <div className={`text-[10px] uppercase tracking-wider ${stats.vegetation_change_hectares < 0 ? 'text-amber-400' : 'text-emerald-400'} font-bold mb-1`}>Vegetation Net</div>
              <div className={`text-xl font-extrabold ${stats.vegetation_change_hectares < 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {stats.vegetation_change_hectares > 0 ? '+' : ''}{stats.vegetation_change_hectares} ha
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">NDVI spectral delta</div>
            </div>
            <div className="bg-sky-500/5 border border-sky-500/20 rounded-xl p-3 text-center">
              <div className="text-[10px] uppercase tracking-wider text-sky-400 font-bold mb-1">Area Changed</div>
              <div className="text-xl font-extrabold text-sky-400">{stats.overall_change_percent}%</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                {(stats.overall_change_percent / yearSpan).toFixed(2)}% / yr avg
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
