import React, { useState } from 'react';
import {
  Compass,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  ShieldAlert,
  HelpCircle,
  Layers,
  Sparkles,
} from 'lucide-react';
import { FutureScenario } from '../types.ts';

interface ScenarioCardsProps {
  scenarios: FutureScenario[];
  currentBuiltHa: number;
  totalAreaHa: number;
  presentYear: number;
}

export const ScenarioCards: React.FC<ScenarioCardsProps> = ({
  scenarios,
  currentBuiltHa,
  totalAreaHa,
  presentYear,
}) => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(
    scenarios[0]?.id || 'scenario-bau'
  );

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 lg:p-6 shadow-xl mb-8">
      {/* Title & Philosophy Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Three Evidence-Grounded Future Scenarios (Horizon: +6 Years)
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Conditional extrapolations derived from measured historical momentum. Not arbitrary forecasts.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
          <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
          <span>Status: <strong>Trend-Based Scenarios</strong> (Not guaranteed predictions)</span>
        </div>
      </div>

      {/* 3 Interactive Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {scenarios.map((sc) => {
          const isSelected = selectedScenarioId === sc.id;
          const isRose = sc.badge_color === 'rose';
          const isEmerald = sc.badge_color === 'emerald';
          const isAmber = sc.badge_color === 'amber';

          const borderStyle = isSelected
            ? isRose
              ? 'border-rose-500 ring-1 ring-rose-500/40 bg-white dark:bg-slate-900'
              : isEmerald
              ? 'border-emerald-500 ring-1 ring-emerald-500/40 bg-white dark:bg-slate-900'
              : 'border-amber-500 ring-1 ring-amber-500/40 bg-white dark:bg-slate-900'
            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:border-slate-700 bg-slate-950/60';

          return (
            <div
              key={sc.id}
              onClick={() => setSelectedScenarioId(sc.id)}
              className={`rounded-2xl border p-5 transition-all flex flex-col justify-between cursor-pointer relative overflow-hidden shadow-lg ${borderStyle}`}
            >
              {/* Header Badge & Title */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                      isRose
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        : isEmerald
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    }`}
                  >
                    {sc.archetype.replace(/_/g, ' ')}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    Horizon: {sc.projected_year}
                  </span>
                </div>

                <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">{sc.title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{sc.tagline}</p>

                {/* Visual Progress Bar: Projected Built-up % */}
                <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800/80 mb-4">
                  <div className="flex items-center justify-between text-xs mb-1.5 font-mono">
                    <span className="text-slate-500 dark:text-slate-400">Projected Built-up:</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {sc.projected_built_up_hectares} ha ({sc.projected_built_up_percent}%)
                    </span>
                  </div>

                  {/* Dual progress comparison bar */}
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden flex">
                    {/* Current baseline part */}
                    <div
                      style={{ width: `${Math.min(100, (currentBuiltHa / totalAreaHa) * 100)}%` }}
                      className="bg-slate-500 h-full"
                      title={`Current built: ${currentBuiltHa} ha`}
                    />
                    {/* Additional expansion part */}
                    <div
                      style={{
                        width: `${Math.max(
                          0,
                          sc.projected_built_up_percent - (currentBuiltHa / totalAreaHa) * 100
                        )}%`,
                      }}
                      className={`h-full ${
                        isRose ? 'bg-rose-500' : isEmerald ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                      title={`Additional growth: +${sc.net_built_increase_hectares} ha`}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1.5 font-mono">
                    <span>Baseline: {currentBuiltHa} ha</span>
                    <span
                      className={`font-bold ${
                        isRose ? 'text-rose-400' : isEmerald ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      +{sc.net_built_increase_hectares} ha growth
                    </span>
                  </div>
                </div>

                {/* Explicit Assumption */}
                <div className="space-y-2.5 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                      Underlying Assumption:
                    </span>
                    <p className="text-slate-700 dark:text-slate-300 mt-0.5 leading-relaxed bg-white/60 dark:bg-slate-900/60 p-2 rounded-lg border border-slate-800/60">
                      {sc.assumption}
                    </p>
                  </div>

                  {/* Calculation Formula */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                      Defensible Calculation:
                    </span>
                    <code className="text-[11px] font-mono text-sky-300 block bg-slate-50 dark:bg-slate-950 p-2 rounded border border-slate-200 dark:border-slate-800 break-all mt-0.5">
                      {sc.calculation}
                    </code>
                  </div>

                  {/* Impact narrative */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                      Environmental &amp; Infrastructure Stress:
                    </span>
                    <p className="text-slate-700 dark:text-slate-300 mt-0.5 leading-relaxed text-[11px]">
                      {sc.environmental_or_infrastructure_impact}
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer Confidence & Uncertainty Note */}
              <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-800/80 text-[11px] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Confidence:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{sc.confidence_level}</span>
                </div>
                <div className="text-slate-500 text-[10px]">
                  <strong>Key Uncertainty:</strong> {sc.main_uncertainty}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
