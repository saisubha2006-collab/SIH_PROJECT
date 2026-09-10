import React, { useState } from 'react';
import { Sparkles, Copy, Check, ShieldCheck, Quote } from 'lucide-react';

interface AISummaryCardProps {
  summary: string;
  analysisId: string;
}

export const AISummaryCard: React.FC<AISummaryCardProps> = ({ summary, analysisId }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 lg:p-6 shadow-xl mb-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Executive Geospatial Synthesis (Gemini API)
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Grounded on Measured Pixels
          </span>
          <button
            onClick={handleCopy}
            className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-medium">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="relative pl-4 border-l-2 border-sky-500/60 bg-slate-950/40 p-4 rounded-r-xl">
        <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
          {summary}
        </p>
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 font-mono">
        <span>Analysis ID: {analysisId}</span>
        <span>Strict Zero-Hallucination Policy: Measurements provided directly by Earth Observation engine</span>
      </div>
    </div>
  );
};
