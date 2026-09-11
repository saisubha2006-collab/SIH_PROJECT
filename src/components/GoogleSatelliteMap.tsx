// Source: Google Maps Platform Code Assist
import React, { useEffect, useRef, useState } from 'react';
import { APIProvider, Map, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { Layers, MapPin, Sparkles, PenTool, CheckCircle2, RotateCcw } from 'lucide-react';

interface GoogleSatelliteMapProps {
  coordinates: [number, number][];
  center: [number, number];
  zoom: number;
  onPolygonDrawn?: (coords: [number, number][]) => void;
  isDrawingMode?: boolean;
}

// Inner component to handle polygon rendering, bounds fitting, and interactive drawing
const MapOverlayHandler: React.FC<{
  coordinates: [number, number][];
  center: [number, number];
  zoom: number;
  isDrawingMode: boolean;
  onPolygonDrawn?: (coords: [number, number][]) => void;
}> = ({ coordinates, center, zoom, isDrawingMode, onPolygonDrawn }) => {
  const map = useMap();
  const polygonRef = useRef<google.maps.Polygon | null>(null);
  const drawingMarkersRef = useRef<google.maps.Marker[]>([]);
  const drawingPolylineRef = useRef<google.maps.Polyline | null>(null);
  const drawnPointsRef = useRef<[number, number][]>([]);

  // Pan to center when preset changes
  useEffect(() => {
    if (!map) return;
    map.panTo({ lat: center[0], lng: center[1] });
    map.setZoom(zoom);
  }, [map, center[0], center[1], zoom]);

  // Render AOI Polygon
  useEffect(() => {
    if (!map || !window.google?.maps) return;

    // Clear previous polygon
    if (polygonRef.current) {
      polygonRef.current.setMap(null);
      polygonRef.current = null;
    }

    if (coordinates && coordinates.length >= 3) {
      const paths = coordinates.map(([lat, lng]) => ({ lat, lng }));

      const polygon = new google.maps.Polygon({
        paths,
        strokeColor: '#38bdf8',
        strokeOpacity: 0.95,
        strokeWeight: 2.5,
        fillColor: '#0284c7',
        fillOpacity: 0.25,
        clickable: false,
        zIndex: 10,
      });

      polygon.setMap(map);
      polygonRef.current = polygon;

      // Fit bounds to polygon
      const bounds = new google.maps.LatLngBounds();
      paths.forEach((p) => bounds.extend(p));
      map.fitBounds(bounds, 40);
    }

    return () => {
      if (polygonRef.current) {
        polygonRef.current.setMap(null);
      }
    };
  }, [map, coordinates]);

  // Handle Drawing Mode
  useEffect(() => {
    if (!map || !window.google?.maps) return;

    if (!isDrawingMode) {
      // Clear markers and polyline
      drawingMarkersRef.current.forEach((m) => m.setMap(null));
      drawingMarkersRef.current = [];
      if (drawingPolylineRef.current) {
        drawingPolylineRef.current.setMap(null);
        drawingPolylineRef.current = null;
      }
      drawnPointsRef.current = [];
      return;
    }

    const clickListener = map.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      const newPt: [number, number] = [lat, lng];
      drawnPointsRef.current.push(newPt);

      // Add temporary vertex marker
      const marker = new google.maps.Marker({
        position: e.latLng,
        map,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 6,
          fillColor: '#f59e0b',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
      });
      drawingMarkersRef.current.push(marker);

      // Update drawing polyline
      const path = drawnPointsRef.current.map(([pLat, pLng]) => ({ lat: pLat, lng: pLng }));
      if (!drawingPolylineRef.current) {
        drawingPolylineRef.current = new google.maps.Polyline({
          path,
          strokeColor: '#f59e0b',
          strokeWeight: 2,
          map,
        });
      } else {
        drawingPolylineRef.current.setPath(path);
      }

      if (drawnPointsRef.current.length >= 3 && onPolygonDrawn) {
        onPolygonDrawn([...drawnPointsRef.current]);
      }
    });

    return () => {
      google.maps.event.removeListener(clickListener);
    };
  }, [map, isDrawingMode, onPolygonDrawn]);

  return null;
};

// Fallback Leaflet Satellite Component (if Google Maps API Key is not set in environment)
const FallbackSatelliteView: React.FC<GoogleSatelliteMapProps> = ({
  coordinates,
  center,
  zoom,
  onPolygonDrawn,
  isDrawingMode,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const polyRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const polylineRef = useRef<any>(null);
  const pointsRef = useRef<[number, number][]>([]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    import('leaflet').then((L) => {
      const map = L.map(containerRef.current!, {
        center,
        zoom,
        zoomControl: true,
        attributionControl: false,
      });

      // Real Satellite Imagery Tile Layer (Sentinel-2 / Esri World Imagery)
      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 19 }
      ).addTo(map);

      // Reference Labels & Roads Overlay
      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png',
        { subdomains: 'abcd', maxZoom: 19 }
      ).addTo(map);

      mapRef.current = map;
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.setView(center, zoom);
  }, [center, zoom]);

  useEffect(() => {
    if (!mapRef.current) return;
    import('leaflet').then((L) => {
      if (polyRef.current) {
        polyRef.current.remove();
        polyRef.current = null;
      }
      if (coordinates && coordinates.length >= 3) {
        const poly = L.polygon(coordinates, {
          color: '#38bdf8',
          weight: 2.5,
          fillColor: '#0284c7',
          fillOpacity: 0.25,
        }).addTo(mapRef.current);
        polyRef.current = poly;
        mapRef.current.fitBounds(poly.getBounds(), { padding: [30, 30] });
      }
    });
  }, [coordinates]);

  useEffect(() => {
    if (!mapRef.current) return;
    if (!isDrawingMode) {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      if (polylineRef.current) {
        polylineRef.current.remove();
        polylineRef.current = null;
      }
      pointsRef.current = [];
      return;
    }

    import('leaflet').then((L) => {
      const handleMapClick = (e: any) => {
        const newPt: [number, number] = [e.latlng.lat, e.latlng.lng];
        pointsRef.current.push(newPt);

        const m = L.circleMarker(e.latlng, {
          radius: 5,
          color: '#f59e0b',
          fillColor: '#fbbf24',
          fillOpacity: 1,
        }).addTo(mapRef.current);
        markersRef.current.push(m);

        if (!polylineRef.current) {
          polylineRef.current = L.polyline(pointsRef.current, {
            color: '#f59e0b',
            weight: 2,
          }).addTo(mapRef.current);
        } else {
          polylineRef.current.setLatLngs(pointsRef.current);
        }

        if (pointsRef.current.length >= 3 && onPolygonDrawn) {
          onPolygonDrawn([...pointsRef.current]);
        }
      };

      mapRef.current.on('click', handleMapClick);
      return () => {
        mapRef.current?.off('click', handleMapClick);
      };
    });
  }, [isDrawingMode, onPolygonDrawn]);

  return <div ref={containerRef} className="w-full h-full" />;
};

export const GoogleSatelliteMap: React.FC<GoogleSatelliteMapProps> = (props) => {
  const apiKey = ((import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY as string) || '';
  const [mapType, setMapType] = useState<'hybrid' | 'satellite' | 'roadmap'>('hybrid');

  const hasApiKey = Boolean(apiKey && apiKey.trim().length > 0);

  return (
    <div className="relative w-full h-full min-h-[340px] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner bg-slate-50 dark:bg-slate-950">
      {hasApiKey ? (
        <APIProvider apiKey={apiKey}>
          <Map
            defaultCenter={{ lat: props.center[0], lng: props.center[1] }}
            defaultZoom={props.zoom}
            mapTypeId={mapType}
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            style={{ width: '100%', height: '100%' }}
            disableDefaultUI={false}
            mapTypeControl={false}
            streetViewControl={false}
            fullscreenControl={true}
          >
            <MapOverlayHandler
              coordinates={props.coordinates}
              center={props.center}
              zoom={props.zoom}
              isDrawingMode={props.isDrawingMode || false}
              onPolygonDrawn={props.onPolygonDrawn}
            />
          </Map>
        </APIProvider>
      ) : (
        <FallbackSatelliteView {...props} />
      )}

      {/* Floating Status & Map Controls */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-2 bg-slate-950/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 shadow-lg text-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold text-slate-900 dark:text-white">Google Satellite Layer</span>
        </div>
        <span className="text-slate-500">|</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setMapType('hybrid')}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
              mapType === 'hybrid'
                ? 'bg-sky-500 text-slate-950 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white'
            }`}
          >
            Hybrid
          </button>
          <button
            onClick={() => setMapType('satellite')}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
              mapType === 'satellite'
                ? 'bg-sky-500 text-slate-950 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white'
            }`}
          >
            Satellite Only
          </button>
        </div>
      </div>

      {/* Drawing Instructions Overlay */}
      {props.isDrawingMode && (
        <div className="absolute top-3 right-14 z-20 bg-amber-500/90 text-slate-950 font-bold px-3 py-1.5 rounded-xl shadow-lg text-xs flex items-center gap-1.5 animate-bounce">
          <PenTool className="w-3.5 h-3.5" />
          <span>Click on map to place polygon vertices</span>
        </div>
      )}

      {/* Coordinate & Sensor Info Footer */}
      <div className="absolute bottom-2 left-2 z-20 bg-slate-950/85 backdrop-blur-md px-3 py-1 rounded-lg text-[11px] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 font-mono flex items-center gap-2">
        <MapPin className="w-3 h-3 text-sky-400" />
        <span>
          {props.center[0].toFixed(5)}° N, {props.center[1].toFixed(5)}° E • High-Resolution Optical Earth Observation
        </span>
      </div>
    </div>
  );
};

// ─── Dual Synchronized Satellite Slider ──────────────────────────────────────
// Two fully synchronized Leaflet maps stacked with a CSS clip-path slider.
// PRESENT → current Esri World Imagery (live tiles, any location).
// PAST    → NASA GIBS Landsat historical tiles for the actual pastYear
//           (real year-specific satellite data, globally, any location you pan to).

export interface DualSyncSatelliteSliderProps {
  center: [number, number];
  zoom: number;
  coordinates?: [number, number][];
  pastYear: number;
  presentYear: number;
  sliderPos: number;          // 0–100
  onSliderChange: (pos: number) => void;
}

export const DualSyncSatelliteSlider: React.FC<DualSyncSatelliteSliderProps> = ({
  center,
  zoom,
  coordinates = [],
  pastYear,
  presentYear,
  sliderPos,
  onSliderChange,
}) => {
  const wrapperRef       = useRef<HTMLDivElement>(null);
  const presentDivRef    = useRef<HTMLDivElement>(null);
  const pastDivRef       = useRef<HTMLDivElement>(null);
  const presentMapRef    = useRef<any>(null);
  const pastMapRef       = useRef<any>(null);
  const presentPolyRef   = useRef<any>(null);
  const pastPolyRef      = useRef<any>(null);
  const pastModisRef     = useRef<any>(null);   // MODIS layer handle
  const pastLandsatRef   = useRef<any>(null);   // Landsat layer handle
  const isSyncingRef     = useRef(false);
  const isDraggingRef    = useRef(false);

  // NASA GIBS tile URL helpers ──────────────────────────────────────────────────
  // Landsat WELD 30 m monthly composite – maxNativeZoom 12
  const landsatUrl = (yr: number) =>
    `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/` +
    `Landsat_WELD_CorrectedReflectance_TrueColor_Global_Monthly/` +
    `default/${yr}-01-01/GoogleMapsCompatible_Level12/{z}/{y}/{x}.jpg`;

  // MODIS Terra 250 m – maxNativeZoom 9, global coverage since 2002
  const modisUrl = (yr: number) =>
    `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/` +
    `MODIS_Terra_CorrectedReflectance_TrueColor/` +
    `default/${yr}-03-15/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg`;

  // Initialize both Leaflet maps (once) ────────────────────────────────────────
  useEffect(() => {
    import('leaflet').then((L) => {
      if (!presentDivRef.current || !pastDivRef.current) return;
      if (presentMapRef.current || pastMapRef.current) return;

      // PRESENT map — current Esri World Imagery
      const presentMap = L.map(presentDivRef.current, {
        center, zoom, zoomControl: true, attributionControl: false,
      });
      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 19 }
      ).addTo(presentMap);
      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png',
        { subdomains: 'abcd', maxZoom: 19 }
      ).addTo(presentMap);
      presentMapRef.current = presentMap;

      // PAST map — historical tiles added by the pastYear effect below
      const pastMap = L.map(pastDivRef.current, {
        center, zoom, zoomControl: false, attributionControl: false,
      });
      pastMapRef.current = pastMap;

      // Bidirectional sync on move/zoom
      const syncP2Pa = () => {
        if (isSyncingRef.current || !pastMapRef.current) return;
        isSyncingRef.current = true;
        pastMapRef.current.setView(presentMap.getCenter(), presentMap.getZoom(), { animate: false });
        isSyncingRef.current = false;
      };
      const syncPa2P = () => {
        if (isSyncingRef.current || !presentMapRef.current) return;
        isSyncingRef.current = true;
        presentMapRef.current.setView(pastMap.getCenter(), pastMap.getZoom(), { animate: false });
        isSyncingRef.current = false;
      };
      presentMap.on('move zoom', syncP2Pa);
      pastMap.on('move zoom', syncPa2P);
    });

    return () => {
      if (presentMapRef.current) { presentMapRef.current.remove(); presentMapRef.current = null; }
      if (pastMapRef.current)    { pastMapRef.current.remove();    pastMapRef.current = null; }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Swap PAST tile layers when pastYear changes ─────────────────────────────────
  useEffect(() => {
    import('leaflet').then((L) => {
      const map = pastMapRef.current;
      if (!map) return;

      // Remove old layers
      if (pastModisRef.current)   { map.removeLayer(pastModisRef.current);   pastModisRef.current = null; }
      if (pastLandsatRef.current) { map.removeLayer(pastLandsatRef.current); pastLandsatRef.current = null; }

      // MODIS 250 m — global, low zoom base
      const modisTiles = L.tileLayer(modisUrl(pastYear), {
        maxZoom: 9, maxNativeZoom: 9, tileSize: 256, opacity: 1,
      });
      modisTiles.addTo(map);
      pastModisRef.current = modisTiles;

      // Landsat WELD 30 m — medium zoom detail
      const landsatTiles = L.tileLayer(landsatUrl(pastYear), {
        maxZoom: 12, maxNativeZoom: 12, tileSize: 256, opacity: 1,
      });
      landsatTiles.addTo(map);
      pastLandsatRef.current = landsatTiles;

      // Esri Wayback (~2014) fills in zoom > 12 where Landsat caps out
      L.tileLayer(
        'https://wayback.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/WMTS/1.0.0/default028mm/MapServer/tile/10/{z}/{y}/{x}',
        { minZoom: 13, maxZoom: 19, opacity: 0.9 }
      ).addTo(map);

      // Place name labels on top
      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png',
        { subdomains: 'abcd', maxZoom: 19, opacity: 0.7 }
      ).addTo(map);
    });
  }, [pastYear]); // eslint-disable-line react-hooks/exhaustive-deps

  // Pan/zoom to new center/zoom when props change ───────────────────────────────
  useEffect(() => {
    if (presentMapRef.current) presentMapRef.current.setView(center, zoom);
    if (pastMapRef.current)    pastMapRef.current.setView(center, zoom);
  }, [center[0], center[1], zoom]); // eslint-disable-line react-hooks/exhaustive-deps

  // Draw AOI polygon on both maps ───────────────────────────────────────────────
  useEffect(() => {
    import('leaflet').then((L) => {
      const pairs = [
        { mRef: presentMapRef, pRef: presentPolyRef },
        { mRef: pastMapRef,    pRef: pastPolyRef },
      ];
      pairs.forEach(({ mRef, pRef }) => {
        if (!mRef.current) return;
        if (pRef.current) { pRef.current.remove(); pRef.current = null; }
        if (coordinates && coordinates.length >= 3) {
          pRef.current = L.polygon(coordinates as [number, number][], {
            color: '#38bdf8', weight: 2.5, fillColor: '#0284c7', fillOpacity: 0.2,
          }).addTo(mRef.current);
        }
      });
      if (presentMapRef.current && coordinates && coordinates.length >= 3) {
        const bounds = L.latLngBounds(coordinates.map(([la, ln]) => [la, ln] as [number, number]));
        presentMapRef.current.fitBounds(bounds, { padding: [40, 40] });
      }
    });
  }, [coordinates]); // eslint-disable-line react-hooks/exhaustive-deps

  // Slider drag via Pointer Events ──────────────────────────────────────────────
  const onPtrDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPtrMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || !wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    const pct = Math.round(Math.max(0, Math.min((e.clientX - rect.left) / rect.width, 1)) * 100);
    onSliderChange(pct);
  };
  const onPtrUp = () => { isDraggingRef.current = false; };

  return (
    <div
      ref={wrapperRef}
      className="relative w-full h-full overflow-hidden select-none"
      onPointerMove={onPtrMove}
      onPointerUp={onPtrUp}
    >
      {/* PRESENT map — always visible beneath */}
      <div ref={presentDivRef} className="absolute inset-0 w-full h-full" />

      {/* PAST map — clipped to left portion; sepia tint marks it as "old" */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          clipPath: `inset(0 ${100 - sliderPos}% 0 0)`,
          filter: 'sepia(0.35) saturate(0.8) brightness(0.9)',
        }}
      >
        <div ref={pastDivRef} className="absolute inset-0 w-full h-full" />
      </div>

      {/* Divider line */}
      <div
        className="absolute top-0 bottom-0 z-30 w-0.5 bg-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.7)] pointer-events-none"
        style={{ left: `${sliderPos}%` }}
      />

      {/* Draggable handle */}
      <div
        className="absolute top-1/2 z-40 -translate-y-1/2 -translate-x-1/2 cursor-ew-resize touch-none"
        style={{ left: `${sliderPos}%` }}
        onPointerDown={onPtrDown}
      >
        <div className="w-9 h-9 rounded-full bg-sky-400 border-2 border-white shadow-xl flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            className="text-slate-950">
            <path d="M21 7H3M15 12H9m12 5H3"/>
          </svg>
        </div>
      </div>

      {/* Side labels */}
      <div className="absolute top-3 left-3 z-20 bg-slate-900/85 backdrop-blur-md px-2.5 py-1 rounded-lg text-[11px] font-bold text-amber-400 border border-slate-700 shadow pointer-events-none">
        PAST · {pastYear} &nbsp;·&nbsp; Landsat / MODIS
      </div>
      <div className="absolute top-3 right-3 z-20 bg-slate-900/85 backdrop-blur-md px-2.5 py-1 rounded-lg text-[11px] font-bold text-sky-400 border border-slate-700 shadow pointer-events-none">
        PRESENT · {presentYear} &nbsp;·&nbsp; Esri Satellite
      </div>

      {/* Footer hint */}
      <div className="absolute bottom-2 left-2 right-2 z-20 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] text-slate-400 border border-slate-800 font-mono flex items-center gap-2 pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
        <span>Pan or zoom to any location — both sides load live real satellite imagery</span>
      </div>
    </div>
  );
};
