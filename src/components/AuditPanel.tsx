import React from 'react';
import { ShieldCheck, FileCheck, AlertTriangle, Database, Info } from 'lucide-react';
import { AnalysisResult } from '../types.ts';

interface AuditPanelProps {
  analysis: AnalysisResult;
}

export const AuditPanel: React.FC<AuditPanelProps> = ({ analysis }) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 lg:p-6 shadow-xl mb-8">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <FileCheck className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
            Scientific Auditability &amp; Reproducibility
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Cryptographic computation hash, satellite sensor metadata, and explicit scientific limitations
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left Column: Traceability & Pipeline Specs */}
        <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5 text-xs font-mono">
          <div className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[11px] mb-2 flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-sky-400" />
            Execution Pipeline Parameters
          </div>
          <div className="flex justify-between border-b border-slate-900 pb-1.5">
            <span className="text-slate-500">Analysis ID:</span>
            <span className="text-slate-900 dark:text-white font-bold">{analysis.analysis_id}</span>
          </div>
          <div className="flex justify-between border-b border-slate-900 pb-1.5">
            <span className="text-slate-500">Optical Sensor:</span>
            <span className="text-sky-300">{analysis.sensor}</span>
          </div>
          <div className="flex justify-between border-b border-slate-900 pb-1.5">
            <span className="text-slate-500">Ground Resolution:</span>
            <span className="text-slate-800 dark:text-slate-200">{analysis.resolution}</span>
          </div>
          <div className="flex justify-between border-b border-slate-900 pb-1.5">
            <span className="text-slate-500">Quality Index:</span>
            <span className="text-emerald-400 font-bold">
              {analysis.quality.score}/100 ({analysis.quality.level})
            </span>
          </div>
          <div className="flex justify-between border-b border-slate-900 pb-1.5">
            <span className="text-slate-500">Composite Passes:</span>
            <span className="text-slate-700 dark:text-slate-300">
              {analysis.quality.past_images} past / {analysis.quality.present_images} present
            </span>
          </div>
          <div className="flex justify-between border-b border-slate-900 pb-1.5">
            <span className="text-slate-500">Cloud Threshold:</span>
            <span className="text-slate-700 dark:text-slate-300">&lt; 20% pixel masking</span>
          </div>
          <div className="flex justify-between border-b border-slate-900 pb-1.5">
            <span className="text-slate-500">NDBI Development Diff:</span>
            <span className="text-slate-700 dark:text-slate-300">&gt; 0.15 threshold</span>
          </div>
          <div className="flex justify-between pt-1">
            <span className="text-slate-500">SHA-256 Hash:</span>
            <span className="text-slate-500 dark:text-slate-400 text-[10px] truncate max-w-[180px]">
              {analysis.audit.computation_hash}
            </span>
          </div>
        </div>

        {/* Right Column: Scientific Limitations */}
        <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
          <div className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[11px] mb-2 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            Scientific Boundaries &amp; Limitations
          </div>
          <ul className="space-y-2 text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
              <span>
                <strong>Phenology &amp; Seasonality:</strong> Agricultural crop cycles and monsoonal greening naturally alter vegetation indices across seasons. Same-quarter comparisons mitigate, but do not fully eliminate, seasonal variances.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
              <span>
                <strong>Spectral Ambiguity:</strong> High-albedo dry barren soil or quarry earth may occasionally exhibit spectral reflection akin to impervious concrete. Combined Dynamic World categorical verification suppresses false positives.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
              <span>
                <strong>Cadastral Non-Binding:</strong> 10-meter pixel-level estimations are designed for regional geospatial intelligence and decision support, not legal property demarcation.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
              <span>
                <strong>Scenario Nature:</strong> The 3 future scenarios represent empirical extrapolations under declared planning assumptions, not predetermined administrative outcomes.
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
