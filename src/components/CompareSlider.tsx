import React, { useState, useRef, useEffect } from 'react';
import {
  SlidersHorizontal,
  Flame,
  Layers,
  Globe,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Sparkles,
} from 'lucide-react';
import { VisualTileData, LandCoverType } from '../types.ts';
import { GoogleSatelliteMap, DualSyncSatelliteSlider } from './GoogleSatelliteMap.tsx';

interface CompareSliderProps {
  visualGrid: VisualTileData;
  pastYear: number;
  presentYear: number;
  locationName: string;
  center?: [number, number];
  coordinates?: [number, number][];
}

type ViewMode = 'slider' | 'heatmap' | 'landcover' | 'google_satellite';

export const CompareSlider: React.FC<CompareSliderProps> = ({
  visualGrid,
  pastYear,
  presentYear,
  locationName,
  center = [20.6586, 85.5956],
  coordinates = [],
}) => {
  const [sliderPos, setSliderPos] = useState<number>(50); // 0 to 100
  const [viewMode, setViewMode] = useState<ViewMode>('slider');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Heatmap Layer Toggles
  const [showDev, setShowDev] = useState<boolean>(true);
  const [showVegLoss, setShowVegLoss] = useState<boolean>(true);
  const [showWater, setShowWater] = useState<boolean>(true);
  const [showBare, setShowBare] = useState<boolean>(true);
  const [heatmapOpacity, setHeatmapOpacity] = useState<number>(0.85);

  const containerRef = useRef<HTMLDivElement>(null);
  const pastCanvasRef = useRef<HTMLCanvasElement>(null);
  const presentCanvasRef = useRef<HTMLCanvasElement>(null);
  const heatmapCanvasRef = useRef<HTMLCanvasElement>(null);
  const lulcCanvasRef = useRef<HTMLCanvasElement>(null);

  const gridSize = visualGrid.grid_size || 40;

  // Land cover colors
  const coverColors: Record<LandCoverType, string> = {
    trees: '#15803d', // Deep green
    crops: '#65a30d', // Light olive/green
    built: '#dc2626', // Built red
    water: '#0284c7', // Cyan-blue
    grass: '#ca8a04', // Olive-gold
    bare: '#ea580c',  // Terracotta/sand
    shrub: '#9333ea', // Violet
    flooded: '#0d9488', // Teal
  };

  // Optical satellite simulation palettes
  const opticalColor = (type: LandCoverType, isPast: boolean): string => {
    switch (type) {
      case 'built':
        return '#cbd5e1'; // concrete grey / asphalt
      case 'crops':
        return isPast ? '#4d7c0f' : '#65a30d';
      case 'trees':
        return '#14532d'; // dark forest
      case 'water':
        return '#0369a1';
      case 'bare':
        return '#c2410c'; // red soil/sand
      case 'grass':
        return '#84cc16';
      default:
        return '#334155';
    }
  };

  // Render Canvases
  useEffect(() => {
    const canvasWidth = 800;
    const canvasHeight = 800;
    const cellPx = canvasWidth / gridSize;

    // 1. Render Past Canvas
    if (pastCanvasRef.current) {
      const ctx = pastCanvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        visualGrid.cells.forEach((cell) => {
          ctx.fillStyle = opticalColor(cell.pastCover, true);
          ctx.fillRect(cell.x * cellPx, cell.y * cellPx, cellPx + 0.5, cellPx + 0.5);

          // Render subtle road or parcel boundary lines
          if (cell.pastCover === 'crops' && (cell.x % 4 === 0 || cell.y % 4 === 0)) {
            ctx.strokeStyle = 'rgba(0,0,0,0.15)';
            ctx.strokeRect(cell.x * cellPx, cell.y * cellPx, cellPx, cellPx);
          }
          if (cell.pastCover === 'built') {
            ctx.fillStyle = '#94a3b8';
            ctx.fillRect(cell.x * cellPx + 2, cell.y * cellPx + 2, cellPx - 4, cellPx - 4);
          }
        });
      }
    }

    // 2. Render Present Canvas
    if (presentCanvasRef.current) {
      const ctx = presentCanvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        visualGrid.cells.forEach((cell) => {
          ctx.fillStyle = opticalColor(cell.presentCover, false);
          ctx.fillRect(cell.x * cellPx, cell.y * cellPx, cellPx + 0.5, cellPx + 0.5);

          if (cell.presentCover === 'built') {
            // Distinct crisp building blocks / industrial footprint
            ctx.fillStyle = cell.isChange ? '#f87171' : '#cbd5e1';
            ctx.fillRect(cell.x * cellPx + 1, cell.y * cellPx + 1, cellPx - 2, cellPx - 2);
            ctx.strokeStyle = 'rgba(15,23,42,0.4)';
            ctx.strokeRect(cell.x * cellPx + 1, cell.y * cellPx + 1, cellPx - 2, cellPx - 2);
          }
        });
      }
    }

    // 3. Render Heatmap Canvas
    if (heatmapCanvasRef.current) {
      const ctx = heatmapCanvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        // Base dark satellite background
        ctx.fillStyle = '#090d16';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        visualGrid.cells.forEach((cell) => {
          if (!cell.isChange) {
            ctx.fillStyle = 'rgba(30, 41, 59, 0.4)';
            ctx.fillRect(cell.x * cellPx, cell.y * cellPx, cellPx, cellPx);
            return;
          }

          if (cell.changeType === 'development' && showDev) {
            ctx.fillStyle = `rgba(239, 68, 68, ${heatmapOpacity})`; // Red: development gain
            ctx.fillRect(cell.x * cellPx, cell.y * cellPx, cellPx, cellPx);
          } else if (cell.changeType === 'vegetation_loss' && showVegLoss) {
            ctx.fillStyle = `rgba(249, 115, 22, ${heatmapOpacity})`; // Orange: bare/veg loss
            ctx.fillRect(cell.x * cellPx, cell.y * cellPx, cellPx, cellPx);
          } else if (cell.changeType === 'vegetation_gain' && showVegLoss) {
            ctx.fillStyle = `rgba(34, 197, 94, ${heatmapOpacity})`; // Green: vegetation gain
            ctx.fillRect(cell.x * cellPx, cell.y * cellPx, cellPx, cellPx);
          } else if (cell.changeType === 'water_gain' && showWater) {
            ctx.fillStyle = `rgba(6, 182, 212, ${heatmapOpacity})`; // Cyan: water gain
            ctx.fillRect(cell.x * cellPx, cell.y * cellPx, cellPx, cellPx);
          } else if (showBare) {
            ctx.fillStyle = `rgba(234, 179, 8, ${heatmapOpacity})`;
            ctx.fillRect(cell.x * cellPx, cell.y * cellPx, cellPx, cellPx);
          }
        });
      }
    }

    // 4. Render Land Cover Categorical Canvas (Dynamic World)
    if (lulcCanvasRef.current) {
      const ctx = lulcCanvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        visualGrid.cells.forEach((cell) => {
          ctx.fillStyle = coverColors[cell.presentCover] || '#64748b';
          ctx.fillRect(cell.x * cellPx, cell.y * cellPx, cellPx + 0.5, cellPx + 0.5);
        });
      }
    }
  }, [visualGrid, showDev, showVegLoss, showWater, showBare, heatmapOpacity]);

  // Handle Dragging Slider
  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const pct = Math.round((x / rect.width) * 100);
    setSliderPos(pct);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const touch = e.touches[0];
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(touch.clientX - rect.left, rect.width));
    const pct = Math.round((x / rect.width) * 100);
    setSliderPos(pct);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 lg:p-6 shadow-xl mb-8">
      {/* Visual Header & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Past vs Present Visual Experience</span>
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
              10m Ground Resolution
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {locationName} • Interactive split-screen and spectral delta masks
          </p>
        </div>

        {/* View Mode Tabs */}
        <div className="flex items-center bg-slate-50 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs self-start sm:self-auto">
          <button
            onClick={() => setViewMode('slider')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === 'slider'
                ? 'bg-sky-500 text-slate-950 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Before / After Slider</span>
          </button>

          <button
            onClick={() => setViewMode('heatmap')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === 'heatmap'
                ? 'bg-sky-500 text-slate-950 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Change Heatmap</span>
          </button>

          <button
            onClick={() => setViewMode('landcover')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === 'landcover'
                ? 'bg-sky-500 text-slate-950 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Dynamic World (LULC)</span>
          </button>

          <button
            onClick={() => setViewMode('google_satellite')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === 'google_satellite'
                ? 'bg-sky-500 text-slate-950 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Real Google Satellite</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        className="relative w-full aspect-[4/3] sm:aspect-[16/10] md:aspect-[16/9] max-h-[580px] bg-slate-50 dark:bg-slate-950 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 select-none cursor-ew-resize shadow-2xl"
      >
        {/* Hidden Canvases used for pixel rendering */}
        <canvas ref={pastCanvasRef} width={800} height={800} className="hidden" />
        <canvas ref={presentCanvasRef} width={800} height={800} className="hidden" />
        <canvas ref={heatmapCanvasRef} width={800} height={800} className="hidden" />
        <canvas ref={lulcCanvasRef} width={800} height={800} className="hidden" />

        {/* View Mode 1: Slider Mode */}
        {viewMode === 'slider' && (
          <>
            {/* PRESENT LAYER (Background Right) */}
            <div className="absolute inset-0 w-full h-full flex items-center justify-center">
              <canvas
                ref={(c) => {
                  if (c && presentCanvasRef.current) {
                    const ctx = c.getContext('2d');
                    ctx?.drawImage(presentCanvasRef.current, 0, 0, c.width, c.height);
                  }
                }}
                width={800}
                height={800}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 right-4 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 shadow-lg text-xs font-bold text-sky-400 flex items-center gap-1.5">
                <span>PRESENT</span>
                <span className="text-slate-900 dark:text-white font-mono">({presentYear})</span>
              </div>
            </div>

            {/* PAST LAYER (Clipped Left) */}
            <div
              className="absolute inset-y-0 left-0 overflow-hidden z-10 border-r-2 border-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.5)]"
              style={{ width: `${sliderPos}%` }}
            >
              <div
                className="absolute inset-y-0 left-0 w-full h-full"
                style={{ width: `${containerRef.current?.clientWidth || 800}px` }}
              >
                <canvas
                  ref={(c) => {
                    if (c && pastCanvasRef.current) {
                      const ctx = c.getContext('2d');
                      ctx?.drawImage(pastCanvasRef.current, 0, 0, c.width, c.height);
                    }
                  }}
                  width={800}
                  height={800}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute top-4 left-4 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 shadow-lg text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <span>PAST</span>
                <span className="text-slate-900 dark:text-white font-mono">({pastYear})</span>
              </div>
            </div>

            {/* Central Draggable Handle */}
            <div
              className="absolute top-0 bottom-0 z-30 flex items-center justify-center pointer-events-none"
              style={{ left: `${sliderPos}%`, transform: 'translateX(-50%)' }}
            >
              <div className="w-8 h-8 rounded-full bg-sky-400 text-slate-950 font-bold text-xs flex items-center justify-center shadow-lg border-2 border-white">
                <SlidersHorizontal className="w-4 h-4" />
              </div>
            </div>
          </>
        )}

        {/* View Mode 2: Heatmap Mode */}
        {viewMode === 'heatmap' && (
          <div className="absolute inset-0 w-full h-full">
            <canvas
              ref={(c) => {
                if (c && heatmapCanvasRef.current) {
                  const ctx = c.getContext('2d');
                  ctx?.drawImage(heatmapCanvasRef.current, 0, 0, c.width, c.height);
                }
              }}
              width={800}
              height={800}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 shadow-lg text-xs font-bold text-rose-400">
              CHANGE DETECTION HEATMAP ({pastYear} → {presentYear})
            </div>
          </div>
        )}

        {/* View Mode 3: Land Cover (Dynamic World) Mode */}
        {viewMode === 'landcover' && (
          <div className="absolute inset-0 w-full h-full">
            <canvas
              ref={(c) => {
                if (c && lulcCanvasRef.current) {
                  const ctx = c.getContext('2d');
                  ctx?.drawImage(lulcCanvasRef.current, 0, 0, c.width, c.height);
                }
              }}
              width={800}
              height={800}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 shadow-lg text-xs font-bold text-emerald-400">
              DYNAMIC WORLD V1 — LAND COVER CLASSIFICATION
            </div>
          </div>
        )}

        {/* View Mode 4: Real Satellite — two live synced Leaflet maps + clip slider */}
        {viewMode === 'google_satellite' && (
          <div className="absolute inset-0 w-full h-full">
            <DualSyncSatelliteSlider
              center={center}
              zoom={15}
              coordinates={coordinates}
              pastYear={pastYear}
              presentYear={presentYear}
              sliderPos={sliderPos}
              onSliderChange={setSliderPos}
            />
          </div>
        )}

        {/* Bottom Floating Control Bar on Viewer */}
        <div className="absolute bottom-3 inset-x-3 z-30 flex flex-wrap items-center justify-between gap-2 bg-slate-950/85 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
          {viewMode === 'slider' ? (
            <div className="flex items-center gap-3 w-full sm:w-auto flex-1 max-w-md">
              <span className="text-[11px] text-emerald-400 font-mono font-semibold whitespace-nowrap">
                ← {pastYear}
              </span>
              <input
                type="range"
                min="0"
                max="100"
                value={sliderPos}
                onChange={(e) => setSliderPos(Number(e.target.value))}
                className="w-full accent-sky-400 cursor-pointer h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg"
              />
              <span className="text-[11px] text-sky-400 font-mono font-semibold whitespace-nowrap">
                {presentYear} →
              </span>
            </div>
          ) : viewMode === 'heatmap' ? (
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showDev}
                  onChange={(e) => setShowDev(e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-700 text-rose-500 focus:ring-0"
                />
                <span className="flex items-center gap-1 text-slate-800 dark:text-slate-200">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Built-up Gain
                </span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showVegLoss}
                  onChange={(e) => setShowVegLoss(e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-700 text-emerald-500 focus:ring-0"
                />
                <span className="flex items-center gap-1 text-slate-800 dark:text-slate-200">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Vegetation Gain/Loss
                </span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showWater}
                  onChange={(e) => setShowWater(e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-700 text-cyan-500 focus:ring-0"
                />
                <span className="flex items-center gap-1 text-slate-800 dark:text-slate-200">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" /> Water Gain
                </span>
              </label>
            </div>
          ) : viewMode === 'google_satellite' ? (
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto flex-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Real Satellite Compare</span>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto flex-1 max-w-md">
                <span className="text-[11px] text-emerald-400 font-mono font-semibold whitespace-nowrap">
                  ← {pastYear}
                </span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sliderPos}
                  onChange={(e) => setSliderPos(Number(e.target.value))}
                  className="w-full accent-sky-400 cursor-pointer h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg"
                />
                <span className="text-[11px] text-sky-400 font-mono font-semibold whitespace-nowrap">
                  Present →
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2 text-[11px]">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-[#dc2626]" /> Built-up
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-[#65a30d]" /> Crops
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-[#15803d]" /> Trees
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-[#0284c7]" /> Water
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-[#ea580c]" /> Bare Soil
              </span>
            </div>
          )}

          <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 hidden md:block">
            Drag divider or adjust slider to compare periods
          </div>
        </div>
      </div>
    </div>
  );
};
