import React, { useState } from 'react';
import { TrendingUp, Activity, HelpCircle } from 'lucide-react';
import { HistoricalTrendPoint } from '../types.ts';

interface TrendChartProps {
  slopeHaPerYear: number;
  rSquared: number;
  historicalPoints: HistoricalTrendPoint[];
  futureProjections: {
    scenario_id: string;
    title: string;
    color: string;
    points: { year: number; built_hectares: number }[];
  }[];
  totalAreaHa: number;
}

export const TrendChart: React.FC<TrendChartProps> = ({
  slopeHaPerYear,
  rSquared,
  historicalPoints,
  futureProjections,
  totalAreaHa,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<{ year: number; value: number; label: string } | null>(null);

  // Calculate scales for SVG
  const allYears = [
    ...historicalPoints.map((p) => p.year),
    ...futureProjections.flatMap((f) => f.points.map((p) => p.year)),
  ];
  const minYear = Math.min(...allYears);
  const maxYear = Math.max(...allYears);

  const allVals = [
    ...historicalPoints.map((p) => p.built_hectares),
    ...futureProjections.flatMap((f) => f.points.map((p) => p.built_hectares)),
  ];
  const minVal = 0;
  const maxVal = Math.max(...allVals, 10) * 1.15;

  const chartWidth = 700;
  const chartHeight = 260;
  const padding = { top: 25, right: 30, bottom: 40, left: 55 };

  const getX = (year: number) => {
    return (
      padding.left +
      ((year - minYear) / (maxYear - minYear)) * (chartWidth - padding.left - padding.right)
    );
  };

  const getY = (val: number) => {
    return (
      chartHeight -
      padding.bottom -
      ((val - minVal) / (maxVal - minVal)) * (chartHeight - padding.top - padding.bottom)
    );
  };

  // Build SVG paths
  const historicalPath = historicalPoints
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(p.year)} ${getY(p.built_hectares)}`)
    .join(' ');

  const currentYearPoint = historicalPoints[historicalPoints.length - 1];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 lg:p-6 shadow-xl mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-sky-400" />
            <span>Historical Development Trend &amp; Scenario Horizon</span>
          </h3>
          <p className="text-xs text-slate-400">
            Multi-year built-up land accumulation (linear regression) extending into 3 scenario trajectories
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs font-semibold text-slate-400 uppercase">Trend Velocity</div>
            <div className="text-base font-extrabold text-sky-400 font-mono">
              +{slopeHaPerYear} ha/year
            </div>
          </div>
          <div className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-400">
            R² = {rSquared}
          </div>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-auto min-w-[560px] text-xs font-mono select-none"
        >
          {/* Horizontal Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1.0].map((ratio) => {
            const val = minVal + ratio * (maxVal - minVal);
            const y = getY(val);
            return (
              <g key={ratio}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={chartWidth - padding.right}
                  y2={y}
                  stroke="#1e293b"
                  strokeDasharray="3 3"
                />
                <text x={padding.left - 8} y={y + 4} fill="#64748b" textAnchor="end" fontSize="10">
                  {val.toFixed(0)} ha
                </text>
              </g>
            );
          })}

          {/* Historical Separation Vertical Divider */}
          {currentYearPoint && (
            <g>
              <line
                x1={getX(currentYearPoint.year)}
                y1={padding.top}
                x2={getX(currentYearPoint.year)}
                y2={chartHeight - padding.bottom}
                stroke="#38bdf8"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <rect
                x={padding.left}
                y={padding.top}
                width={getX(currentYearPoint.year) - padding.left}
                height={chartHeight - padding.top - padding.bottom}
                fill="#38bdf8"
                fillOpacity="0.03"
              />
              <text
                x={getX(currentYearPoint.year) - 10}
                y={padding.top + 12}
                fill="#38bdf8"
                textAnchor="end"
                fontSize="9"
                fontWeight="bold"
              >
                MEASURED HISTORY
              </text>
              <text
                x={getX(currentYearPoint.year) + 10}
                y={padding.top + 12}
                fill="#f59e0b"
                textAnchor="start"
                fontSize="9"
                fontWeight="bold"
              >
                SCENARIO HORIZON →
              </text>
            </g>
          )}

          {/* Historical Solid Line */}
          <path
            d={historicalPath}
            fill="none"
            stroke="#38bdf8"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Historical Points */}
          {historicalPoints.map((p) => {
            const isCurrent = p.year === currentYearPoint?.year;
            return (
              <g key={p.year}>
                <circle
                  cx={getX(p.year)}
                  cy={getY(p.built_hectares)}
                  r={isCurrent ? 6 : 4}
                  fill={isCurrent ? '#38bdf8' : '#0284c7'}
                  stroke="#ffffff"
                  strokeWidth={isCurrent ? 2 : 1.5}
                  className="cursor-pointer hover:r-7 transition-all"
                  onMouseEnter={() =>
                    setHoveredPoint({
                      year: p.year,
                      value: p.built_hectares,
                      label: isCurrent ? 'Present Measured' : 'Historical Satellite Pass',
                    })
                  }
                  onMouseLeave={() => setHoveredPoint(null)}
                />
                {/* Year label on X axis */}
                <text
                  x={getX(p.year)}
                  y={chartHeight - padding.bottom + 16}
                  fill="#94a3b8"
                  textAnchor="middle"
                  fontSize="10"
                >
                  {p.year}
                </text>
              </g>
            );
          })}

          {/* Future Projection Dashed Trajectories */}
          {futureProjections.map((traj) => {
            const pathData = traj.points
              .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(p.year)} ${getY(p.built_hectares)}`)
              .join(' ');

            return (
              <g key={traj.scenario_id}>
                <path
                  d={pathData}
                  fill="none"
                  stroke={traj.color}
                  strokeWidth="2.5"
                  strokeDasharray="5 4"
                  strokeLinecap="round"
                />
                {traj.points.slice(1).map((p) => (
                  <circle
                    key={p.year}
                    cx={getX(p.year)}
                    cy={getY(p.built_hectares)}
                    r={4}
                    fill={traj.color}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    className="cursor-pointer"
                    onMouseEnter={() =>
                      setHoveredPoint({
                        year: p.year,
                        value: p.built_hectares,
                        label: `${traj.title} Projection`,
                      })
                    }
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                ))}
                {/* Final Year Label */}
                <text
                  x={getX(traj.points[traj.points.length - 1].year)}
                  y={chartHeight - padding.bottom + 16}
                  fill="#94a3b8"
                  textAnchor="middle"
                  fontSize="10"
                >
                  {traj.points[traj.points.length - 1].year}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredPoint && (
          <div className="absolute top-2 right-4 bg-slate-950/95 border border-slate-700 px-3 py-1.5 rounded-lg text-xs shadow-xl font-mono">
            <span className="text-slate-400">{hoveredPoint.label} ({hoveredPoint.year}): </span>
            <span className="text-sky-400 font-bold">{hoveredPoint.value} ha</span>
          </div>
        )}
      </div>

      {/* Trajectory Legend */}
      <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-sky-400 rounded-full" />
            <span className="text-slate-300">Measured Observations (Solid)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-amber-400 border-b border-dashed border-amber-400" />
            <span className="text-amber-400 font-medium">Business as Usual</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-rose-500 border-b border-dashed border-rose-500" />
            <span className="text-rose-400 font-medium">Accelerated Growth</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-emerald-400 border-b border-dashed border-emerald-400" />
            <span className="text-emerald-400 font-medium">Managed Growth</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-500">
          Projections represent conditional mathematical extrapolations, not legal mandates.
        </div>
      </div>
    </div>
  );
};
