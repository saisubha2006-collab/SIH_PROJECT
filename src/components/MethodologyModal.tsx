import React from 'react';
import { X, BookOpen, Layers, CheckCircle2, ShieldAlert, Cpu } from 'lucide-react';

interface MethodologyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MethodologyModal: React.FC<MethodologyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Scientific Methodology &amp; Engineering Blueprint
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                SIH26167 Remote Sensing Architecture &amp; Gemini AI Grounding Rules
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white p-1 rounded-lg hover:bg-slate-100 dark:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 space-y-4 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1.5 flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-400" />
              1. Same-Season Optical Compositing
            </h4>
            <p className="text-slate-700 dark:text-slate-300">
              Comparing arbitrary single-date satellite tiles introduces acute cloud-cover contamination and false-positive vegetation shifts driven by natural rainfall cycles. We utilize cloud-screened median composites (&lt;20% cloudy pixels) from Copernicus Sentinel-2 SR Harmonized across identical seasonal quarters (e.g. Q1 to Q1).
            </p>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1.5 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-sky-400" />
              2. Spectral Indexing &amp; Dual Verification
            </h4>
            <p className="text-slate-700 dark:text-slate-300">
              Development quantification is derived from multi-band spectral indices:
            </p>
            <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-[11px] my-2 text-sky-300 space-y-1">
              <div>NDBI = (SWIR_B11 - NIR_B8) / (SWIR_B11 + NIR_B8)  [Built-up Signal]</div>
              <div>NDVI = (NIR_B8 - RED_B4) / (NIR_B8 + RED_B4)      [Vegetation Signal]</div>
              <div>NDWI = (GREEN_B3 - NIR_B8) / (GREEN_B3 + NIR_B8)  [Water Signal]</div>
            </div>
            <p className="text-slate-700 dark:text-slate-300">
              Crucially, a candidate development pixel is confirmed only when NDBI exhibits a positive delta (&gt;0.15) AND Dynamic World categorical classification confirms present built surface over non-built baseline provenance.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1.5 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              3. The Critical Zero-Hallucination AI Rule
            </h4>
            <p className="text-slate-700 dark:text-slate-300">
              Gemini 3.8 Flash is NEVER the source of raw satellite measurements. All spatial calculations (hectares, percentages, slopes, transition matrices) are computed deterministically by the remote sensing engine. Gemini is fed ONLY measured data and explicit scenario assumptions to synthesize decision-support explanations and structured scenarios.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1.5 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              4. Scenario Reliability &amp; Guardrails
            </h4>
            <p className="text-slate-700 dark:text-slate-300">
              The 3 future scenarios represent empirical extrapolations under declared planning assumptions:
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-1 text-slate-500 dark:text-slate-400">
              <li><strong>Business as Usual:</strong> Measured linear growth continues (+slope ha/yr).</li>
              <li><strong>Accelerated Development:</strong> Infrastructure momentum expands rate by 65%.</li>
              <li><strong>Managed Growth:</strong> Infill densification and green buffering reduce rate by 55%.</li>
            </ul>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl text-xs transition-colors"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
