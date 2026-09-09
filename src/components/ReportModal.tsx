import React, { useState } from 'react';
import { X, Download, Printer, FileCode, Check } from 'lucide-react';
import { AnalysisResult } from '../types.ts';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: AnalysisResult | null;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  analysis,
}) => {
  const [downloading, setDownloading] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  if (!isOpen || !analysis) return null;

  const handleDownloadHtml = async () => {
    setDownloading(true);
    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysis }),
      });
      const data = await res.json();
      if (data.report_html) {
        const blob = new Blob([data.report_html], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = data.filename || `Land_Change_Report_${analysis.analysis_id}.html`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    // Open printable HTML window
    fetch('/api/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ analysis }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.report_html) {
          const printWindow = window.open('', '_blank');
          if (printWindow) {
            printWindow.document.write(data.report_html);
            printWindow.document.close();
            setTimeout(() => {
              printWindow.print();
            }, 500);
          }
        }
      });
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(analysis, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div>
            <h3 className="text-base font-bold text-white">
              Export Decision-Support Intelligence Report
            </h3>
            <p className="text-xs text-slate-400">
              Analysis ID: {analysis.analysis_id} • {analysis.aoi.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Report Overview Preview */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4 text-xs">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 font-sans">
            <div className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">
              Included Audit Sections (13 Core Domains)
            </div>
            <div className="grid grid-cols-2 gap-2 text-slate-300">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Location Extent ({analysis.aoi.area_hectares} ha)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Multi-Season Quality Check ({analysis.quality.score}/100)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>New Built Surface (+{analysis.stats.new_built_up_hectares} ha)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Vegetation Delta ({analysis.stats.vegetation_change_hectares} ha)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Dynamic World Transition Matrix</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Trend Velocity (+{analysis.trend.slope_ha_per_year} ha/yr)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Three Grounded Future Scenarios</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>SHA-256 Audit Computation Hash</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="text-[11px] font-semibold text-white mb-1">Executive Summary Excerpt:</div>
            <p className="text-slate-400 leading-relaxed italic">
              "{analysis.ai_summary.substring(0, 240)}..."
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={handleCopyJson}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <FileCode className="w-3.5 h-3.5" />}
            <span>{copiedJson ? 'Copied JSON' : 'Copy JSON'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>

            <button
              onClick={handleDownloadHtml}
              disabled={downloading}
              className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-lg shadow-sky-500/20"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{downloading ? 'Preparing...' : 'Download Full HTML Report'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
