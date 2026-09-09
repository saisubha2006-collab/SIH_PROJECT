import React from 'react';
import { GoogleSatelliteMap } from './GoogleSatelliteMap.tsx';

interface SatelliteMapProps {
  coordinates: [number, number][];
  center: [number, number];
  zoom: number;
  onPolygonDrawn?: (coords: [number, number][]) => void;
  isDrawingMode?: boolean;
}

export const SatelliteMap: React.FC<SatelliteMapProps> = (props) => {
  return <GoogleSatelliteMap {...props} />;
};

