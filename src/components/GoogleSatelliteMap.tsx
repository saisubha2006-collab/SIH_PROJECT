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
    <div className="relative w-full h-full min-h-[340px] rounded-xl overflow-hidden border border-slate-800 shadow-inner bg-slate-950">
      {hasApiKey ? (
        <APIProvider apiKey={apiKey}>
          <Map
            center={{ lat: props.center[0], lng: props.center[1] }}
            zoom={props.zoom}
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
          <span className="font-bold text-white">Google Satellite Layer</span>
        </div>
        <span className="text-slate-500">|</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setMapType('hybrid')}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
              mapType === 'hybrid'
                ? 'bg-sky-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Hybrid
          </button>
          <button
            onClick={() => setMapType('satellite')}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
              mapType === 'satellite'
                ? 'bg-sky-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
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
      <div className="absolute bottom-2 left-2 z-20 bg-slate-950/85 backdrop-blur-md px-3 py-1 rounded-lg text-[11px] text-slate-300 border border-slate-800 font-mono flex items-center gap-2">
        <MapPin className="w-3 h-3 text-sky-400" />
        <span>
          {props.center[0].toFixed(5)}° N, {props.center[1].toFixed(5)}° E • High-Resolution Optical Earth Observation
        </span>
      </div>
    </div>
  );
};
