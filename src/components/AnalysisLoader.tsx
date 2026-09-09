import React, { useState, useEffect } from 'react';
import { CheckCircle2, Loader2, Sparkles, Orbit } from 'lucide-react';

interface AnalysisLoaderProps {
  locationName: string;
}

export const AnalysisLoader: React.FC<AnalysisLoaderProps> = ({ locationName }) => {
  const [stepIndex, setStepIndex] = useState(0);

  const steps = [
    'Validating AOI geometry & spherical coordinate projection...',
    'Querying Copernicus Sentinel-2 SR Harmonized (10m optical passes)...',
    'Applying SCL cloud screening & shadow masking (<20% threshold)...',
    'Calculating multi-spectral indices (NDBI, NDVI, NDWI)...',
    'Quantifying candidate development pixels into surface hectares...',
    'Intersecting Dynamic World V1 8-class categorical transitions...',
    'Computing multi-year linear regression development momentum...',
    'Synthesizing executive summary and 3 grounded scenarios via Gemini...',
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setStepIndex((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 450);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl mb-8 flex flex-col items-center justify-center min-h-[380px] text-center relative overflow-hidden">
      <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative mb-6">
        <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 animate-pulse">
          <Orbit className="w-8 h-8 animate-spin" style={{ animationDuration: '6s' }} />
        </div>
      </div>

      <h3 className="text-lg font-bold text-white mb-1">
        Running Geospatial Change Intelligence Pipeline
      </h3>
      <p className="text-xs text-slate-400 mb-6 max-w-md font-sans">
        Target: <strong className="text-slate-200">{locationName}</strong>. Analyzing surface reflectance transformations across Sentinel-2 constellations.
      </p>

      {/* Progress Checklist */}
      <div className="w-full max-w-md bg-slate-950 p-4 rounded-xl border border-slate-800 text-left space-y-2">
        {steps.map((text, idx) => {
          const isDone = idx < stepIndex;
          const isCurrent = idx === stepIndex;
          return (
            <div
              key={idx}
              className={`flex items-center gap-2.5 text-xs transition-opacity duration-300 ${
                isDone
                  ? 'text-emerald-400'
                  : isCurrent
                  ? 'text-sky-300 font-semibold'
                  : 'text-slate-600'
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : isCurrent ? (
                <Loader2 className="w-4 h-4 text-sky-400 animate-spin shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-slate-700 shrink-0" />
              )}
              <span className="truncate">{text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
