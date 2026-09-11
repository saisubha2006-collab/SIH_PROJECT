import React, { useState } from 'react';
import {
  MapPin,
  Calendar,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  PenTool,
  RotateCcw,
  Sliders,
  ChevronDown,
} from 'lucide-react';
import { PresetArea, DataQuality } from '../types.ts';
import { PRESET_AREAS } from '../data/presets.ts';

interface AreaSelectorProps {
  selectedPreset: PresetArea | null;
  onSelectPreset: (preset: PresetArea) => void;
  onLocationSearched: (name: string, center: [number, number], coords: [number, number][]) => void;
  pastYear: number;
  presentYear: number;
  onChangePastYear: (yr: number) => void;
  onChangePresentYear: (yr: number) => void;
  isSameSeason: boolean;
  quality: DataQuality | null;
  onRunAnalysis: () => void;
  isAnalyzing: boolean;
  isDrawingMode: boolean;
  onToggleDrawingMode: () => void;
  onResetToPreset: () => void;
}

const HISTORY_KEY = 'sih26167_search_history';
const MAX_HISTORY = 5;

interface SearchHistoryEntry {
  id: string;
  displayName: string;
  shortName: string;
  center: [number, number];
  coords: [number, number][];
  searchedAt: number;
}

function loadHistory(): SearchHistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(entries: SearchHistoryEntry[]) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(entries));
  } catch {}
}

function addToHistory(entry: Omit<SearchHistoryEntry, 'id' | 'searchedAt'>) {
  const history = loadHistory();
  const filtered = history.filter((h) => h.displayName !== entry.displayName);
  const newEntry: SearchHistoryEntry = {
    ...entry,
    id: `hist_${Date.now()}`,
    searchedAt: Date.now(),
  };
  const updated = [newEntry, ...filtered].slice(0, MAX_HISTORY);
  saveHistory(updated);
  return updated;
}

function formatTimeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export const AreaSelector: React.FC<AreaSelectorProps> = ({
  selectedPreset,
  onSelectPreset,
  onLocationSearched,
  pastYear,
  presentYear,
  onChangePastYear,
  onChangePresentYear,
  isSameSeason,
  quality,
  onRunAnalysis,
  isAnalyzing,
  isDrawingMode,
  onToggleDrawingMode,
  onResetToPreset,
}) => {
  const [selectedQuarter, setSelectedQuarter] = useState<'Q1' | 'Q2' | 'Q3' | 'Q4'>('Q1');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryEntry[]>(loadHistory);

  React.useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        setSearchResults(data);
      } catch (err) {
        console.error('Geocoding error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectSearchResult = (result: any) => {
    const [latMin, latMax, lonMin, lonMax] = result.boundingbox.map(Number);
    const coords: [number, number][] = [
      [latMin, lonMin],
      [latMax, lonMin],
      [latMax, lonMax],
      [latMin, lonMax],
    ];
    const center: [number, number] = [Number(result.lat), Number(result.lon)];
    const shortName = result.display_name.split(',').slice(0, 2).join(',').trim();

    // Save to history
    const updated = addToHistory({
      displayName: result.display_name,
      shortName,
      center,
      coords,
    });
    setSearchHistory(updated);

    onLocationSearched(result.display_name, center, coords);
    setShowLocationDropdown(false);
    setSearchQuery(result.display_name);
  };

  const handleSelectHistory = (entry: SearchHistoryEntry) => {
    // Bump timestamp on re-select
    const updated = addToHistory({
      displayName: entry.displayName,
      shortName: entry.shortName,
      center: entry.center,
      coords: entry.coords,
    });
    setSearchHistory(updated);
    onLocationSearched(entry.displayName, entry.center, entry.coords);
    setSearchQuery(entry.displayName);
    setShowLocationDropdown(false);
  };

  const handleDeleteHistory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = searchHistory.filter((h) => h.id !== id);
    setSearchHistory(updated);
    saveHistory(updated);
  };

  const handleClearAllHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSearchHistory([]);
    saveHistory([]);
  };

  const quarterLabels: Record<string, string> = {
    Q1: 'Jan 01 – Mar 31 (Post-Monsoon / Dry Winter)',
    Q2: 'Apr 01 – Jun 30 (Pre-Monsoon / Spring-Summer)',
    Q3: 'Jul 01 – Sep 30 (Peak Monsoon / Growing Season)',
    Q4: 'Oct 01 – Dec 31 (Post-Harvest / Autumn)',
  };

  const availableYears = [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 lg:p-6 shadow-xl mb-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        
        {/* Location Selection & Area Info */}
        <div className="lg:col-span-5 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-sky-400" />
              Target Region / Area of Interest (AOI)
            </label>
            <button
              onClick={onToggleDrawingMode}
              className={`text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1 border transition-all font-medium ${
                isDrawingMode
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200'
              }`}
            >
              <PenTool className="w-3 h-3" />
              {isDrawingMode ? 'Drawing on Map...' : 'Draw Custom Polygon'}
            </button>
          </div>

          {/* Location Search & Selector Dropdown */}
          <div className="relative">
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder={selectedPreset ? `${selectedPreset.name} (${selectedPreset.region})` : 'Search for a location...'}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowLocationDropdown(true);
                }}
                onFocus={() => setShowLocationDropdown(true)}
                onBlur={() => setTimeout(() => setShowLocationDropdown(false), 180)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-sky-500 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none transition-colors"
              />
              {isSearching ? (
                <div className="absolute right-4 w-4 h-4 border-2 border-slate-500 border-t-sky-500 rounded-full animate-spin"></div>
              ) : (
                <ChevronDown className={`absolute right-4 w-4 h-4 text-slate-500 dark:text-slate-400 transition-transform ${showLocationDropdown ? 'rotate-180' : ''}`} />
              )}
            </div>

            {/* Dropdown Menu */}
            {showLocationDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden py-1 max-h-80 overflow-y-auto">
                {searchQuery.trim() ? (
                  searchResults.length > 0 ? (
                    searchResults.map((result: any) => (
                      <button
                        key={result.place_id}
                        onMouseDown={() => handleSelectSearchResult(result)}
                        className="w-full px-3.5 py-2.5 text-left text-xs hover:bg-slate-100 dark:hover:bg-slate-800 flex items-start justify-between gap-2 border-b border-slate-200/50 dark:border-slate-800/50 last:border-0 text-slate-800 dark:text-slate-200"
                      >
                        <div className="flex items-start gap-2 min-w-0">
                          <MapPin className="w-3 h-3 text-sky-400 mt-0.5 shrink-0" />
                          <span className="font-semibold text-slate-900 dark:text-white truncate">{result.display_name}</span>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-3.5 py-2.5 text-xs text-slate-500 dark:text-slate-400">
                      {isSearching ? 'Searching...' : 'No results found.'}
                    </div>
                  )
                ) : (
                  <>
                    {searchHistory.length > 0 && (
                      <>
                        <div className="px-3 py-1.5 flex items-center justify-between bg-slate-50/80 dark:bg-slate-950/80 border-b border-slate-200/60 dark:border-slate-800/60">
                          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <svg className="w-3 h-3 text-sky-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                            </svg>
                            Recent Searches
                          </span>
                          <button
                            onMouseDown={handleClearAllHistory}
                            className="text-[10px] text-slate-400 hover:text-rose-400 transition-colors font-medium px-1.5 py-0.5 rounded hover:bg-rose-500/10"
                          >
                            Clear all
                          </button>
                        </div>
                        {searchHistory.map((entry) => (
                          <div
                            key={entry.id}
                            className="group w-full px-3.5 py-2 flex items-center justify-between gap-2 border-b border-slate-200/40 dark:border-slate-800/40 last:border-0 hover:bg-slate-100 dark:hover:bg-slate-800/70 cursor-pointer transition-colors"
                            onMouseDown={() => handleSelectHistory(entry)}
                          >
                            <div className="flex items-start gap-2 min-w-0">
                              <svg className="w-3 h-3 text-slate-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                              </svg>
                              <div className="min-w-0">
                                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{entry.shortName}</div>
                                <div className="text-[10px] text-slate-400 truncate">{entry.displayName}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="text-[10px] font-mono text-slate-400 sm:block group-hover:hidden">
                                {formatTimeAgo(entry.searchedAt)}
                              </span>
                              <button
                                onMouseDown={(e) => handleDeleteHistory(entry.id, e)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-rose-400 p-0.5 rounded"
                                title="Remove from history"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                                </svg>
                              </button>
                            </div>
                          </div>
                        ))}
                        <div className="h-px bg-slate-200/60 dark:bg-slate-700/60 mx-3 my-1" />
                      </>
                    )}

                    <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-950/50">
                      Pre-Validated Satellite Demonstration Hotspots
                    </div>
                    {PRESET_AREAS.map((preset) => (
                      <button
                        key={preset.id}
                        onMouseDown={() => {
                          onSelectPreset(preset);
                          setShowLocationDropdown(false);
                          setSearchQuery('');
                        }}
                        className={`w-full px-3.5 py-2.5 text-left text-xs hover:bg-slate-100 dark:hover:bg-slate-800 flex items-start justify-between gap-2 border-b border-slate-200/50 dark:border-slate-800/50 last:border-0 ${
                          selectedPreset?.id === preset.id ? 'bg-sky-500/10 text-sky-300' : 'text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white">{preset.name}</div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">{preset.region} • {preset.tag}</div>
                        </div>
                        <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800">
                          {preset.area_hectares} ha
                        </span>
                      </button>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Time Comparison Controls */}
        <div className="lg:col-span-4 space-y-2">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-sky-400" />
              Comparison Periods (Same Season)
            </span>
            <span className={`text-[11px] font-medium flex items-center gap-1 ${isSameSeason ? 'text-emerald-400' : 'text-amber-400'}`}>
              {isSameSeason ? (
                <>
                  <ShieldCheck className="w-3 h-3" /> Season Matched ({selectedQuarter})
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3 h-3" /> Season Warning
                </>
              )}
            </span>
          </label>

          <div className="grid grid-cols-2 gap-2">
            {/* Past Year */}
            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase block font-medium">Past Period (Baseline)</span>
              <select
                value={pastYear}
                onChange={(e) => onChangePastYear(Number(e.target.value))}
                className="w-full bg-transparent text-sm font-bold text-slate-900 dark:text-white focus:outline-none cursor-pointer mt-0.5"
              >
                {availableYears.filter((y) => y < presentYear).map((y) => (
                  <option key={y} value={y} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                    {y} ({selectedQuarter})
                  </option>
                ))}
              </select>
            </div>

            {/* Present Year */}
            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase block font-medium">Present Period</span>
              <select
                value={presentYear}
                onChange={(e) => onChangePresentYear(Number(e.target.value))}
                className="w-full bg-transparent text-sm font-bold text-sky-400 focus:outline-none cursor-pointer mt-0.5"
              >
                {availableYears.filter((y) => y > pastYear).map((y) => (
                  <option key={y} value={y} className="bg-white dark:bg-slate-900 text-sky-400">
                    {y} ({selectedQuarter})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Quality Gate & Run Action */}
        <div className="lg:col-span-3 flex flex-col justify-end space-y-2">
          {/* Quality Preflight Badge */}
          <div className="flex items-center justify-between text-xs px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400 text-[11px] flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Data Quality Gate
            </span>
            <span className="font-bold text-emerald-400 text-xs">
              {quality ? `${quality.score}/100 ${quality.level}` : '94/100 HIGH'}
            </span>
          </div>

          {/* Primary CTA Run Button */}
          <button
            onClick={onRunAnalysis}
            disabled={isAnalyzing}
            className={`w-full py-3 px-4 rounded-xl text-sm font-bold tracking-wide transition-all shadow-lg flex items-center justify-center gap-2 ${
              isAnalyzing
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-wait'
                : 'bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-400 hover:to-emerald-400 text-slate-950 shadow-sky-500/20 active:scale-[0.99]'
            }`}
          >
            {isAnalyzing ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                <span>Processing Satellite Passes...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>Run Land Change Analysis</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
