import React, { useState } from 'react';
import { ArrowRight, Layers, TableProperties, BarChart3 } from 'lucide-react';
import {
  LandCoverDistribution,
  TransitionItem,
  TransitionMatrixCell,
  LandCoverType,
} from '../types.ts';

interface TransitionMatrixProps {
  composition: LandCoverDistribution[];
  transitions: TransitionItem[];
  matrix: TransitionMatrixCell[];
  pastYear: number;
  presentYear: number;
}

export const TransitionMatrix: React.FC<TransitionMatrixProps> = ({
  composition,
  transitions,
  matrix,
  pastYear,
  presentYear,
}) => {
  const [activeTab, setActiveTab] = useState<'transitions' | 'matrix' | 'composition'>('transitions');
  const [hoveredCell, setHoveredCell] = useState<{ from: string; to: string; val: number } | null>(null);

  const matrixClasses: LandCoverType[] = ['trees', 'crops', 'built', 'water', 'grass', 'bare'];
  const labels: Record<string, string> = {
    trees: 'Trees',
    crops: 'Crops',
    built: 'Built-up',
    water: 'Water',
    grass: 'Grass',
    bare: 'Bare Soil',
  };

  const getMatrixVal = (from: LandCoverType, to: LandCoverType) => {
    const item = matrix.find((m) => m.from === from && m.to === to);
    return item ? item.hectares : 0;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 lg:p-6 shadow-xl mb-8">
      {/* Title & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-sky-400" />
            <span>Land-Cover Transitions (Dynamic World V1)</span>
          </h3>
          <p className="text-xs text-slate-400">
            Categorical conversion dynamics across Sentinel-2 10-meter ground sample pixels
          </p>
        </div>

        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('transitions')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'transitions'
                ? 'bg-sky-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>Top Transitions</span>
          </button>

          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'matrix'
                ? 'bg-sky-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <TableProperties className="w-3.5 h-3.5" />
            <span>Transition Matrix</span>
          </button>

          <button
            onClick={() => setActiveTab('composition')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'composition'
                ? 'bg-sky-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Class Composition</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Top Observed Transitions List */}
      {activeTab === 'transitions' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {transitions.map((t, idx) => {
              const isToBuilt = t.to === 'built';
              return (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isToBuilt
                      ? 'bg-rose-500/5 border-rose-500/30 hover:border-rose-500/60'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Rank #{idx + 1}
                    </span>
                    <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                      isToBuilt ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {t.percentage_of_aoi}% of AOI
                    </span>
                  </div>

                  <div className="flex items-center gap-2 font-bold text-white text-sm my-1">
                    <span className="truncate">{t.from_label}</span>
                    <ArrowRight className="w-4 h-4 text-sky-400 shrink-0" />
                    <span className={`truncate ${isToBuilt ? 'text-rose-400' : 'text-slate-200'}`}>
                      {t.to_label}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 mt-2 pt-2 border-t border-slate-800/80">
                    <span>Observed Shift</span>
                    <span className="font-extrabold text-white text-sm font-mono">{t.hectares} ha</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Full Transition Matrix Table */}
      {activeTab === 'matrix' && (
        <div className="overflow-x-auto">
          <div className="text-xs text-slate-400 mb-2 flex items-center justify-between">
            <span>Past ({pastYear}) Rows ↓ &nbsp;to&nbsp; Present ({presentYear}) Columns → (Values in Hectares)</span>
            {hoveredCell && (
              <span className="text-sky-400 font-mono font-semibold">
                {hoveredCell.from} → {hoveredCell.to}: {hoveredCell.val} ha
              </span>
            )}
          </div>
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950">
                <th className="p-2.5 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                  Past ({pastYear}) ↓
                </th>
                {matrixClasses.map((cls) => (
                  <th key={cls} className="p-2.5 text-slate-300 font-semibold text-center text-[11px]">
                    {labels[cls]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrixClasses.map((fromCls) => (
                <tr key={fromCls} className="border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors">
                  <td className="p-2.5 font-bold text-white bg-slate-950/60">
                    {labels[fromCls]}
                  </td>
                  {matrixClasses.map((toCls) => {
                    const val = getMatrixVal(fromCls, toCls);
                    const isDiagonal = fromCls === toCls;
                    const isConversionToBuilt = fromCls !== 'built' && toCls === 'built' && val > 0;

                    let bgStyle = 'text-slate-500';
                    if (isDiagonal && val > 0) {
                      bgStyle = 'bg-slate-800/40 text-slate-200 font-semibold';
                    } else if (isConversionToBuilt) {
                      bgStyle = 'bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30';
                    } else if (val > 0) {
                      bgStyle = 'text-slate-300 font-medium';
                    }

                    return (
                      <td
                        key={toCls}
                        onMouseEnter={() => setHoveredCell({ from: labels[fromCls], to: labels[toCls], val })}
                        onMouseLeave={() => setHoveredCell(null)}
                        className={`p-2.5 text-center font-mono transition-colors ${bgStyle}`}
                      >
                        {val > 0 ? val.toFixed(1) : '—'}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-2 text-[11px] text-slate-500">
            Diagonal cells represent persistent, unchanged land cover; off-diagonal values denote measured structural surface transitions.
          </div>
        </div>
      )}

      {/* Tab 3: Composition Comparison */}
      {activeTab === 'composition' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {composition.map((c) => (
              <div key={c.type} className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                    <span className="text-xs font-bold text-white">{c.label}</span>
                  </div>
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                    c.delta_ha > 0 ? 'bg-rose-500/20 text-rose-400' : c.delta_ha < 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {c.delta_ha > 0 ? `+${c.delta_ha} ha` : `${c.delta_ha} ha`}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-900 p-2 rounded border border-slate-800">
                    <div className="text-[10px] text-slate-400 uppercase">Past ({pastYear})</div>
                    <div className="font-bold text-slate-200 mt-0.5">{c.past_ha} ha ({c.past_pct}%)</div>
                  </div>
                  <div className="bg-slate-900 p-2 rounded border border-slate-800">
                    <div className="text-[10px] text-slate-400 uppercase">Present ({presentYear})</div>
                    <div className="font-bold text-sky-400 mt-0.5">{c.present_ha} ha ({c.present_pct}%)</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
