export type LandCoverType =
  | 'trees'
  | 'crops'
  | 'built'
  | 'water'
  | 'grass'
  | 'bare'
  | 'shrub'
  | 'flooded';

export interface DataQuality {
  score: number;
  level: 'HIGH' | 'MEDIUM' | 'LOW';
  past_images: number;
  present_images: number;
  cloud_cover_ok: boolean;
  season_match: boolean;
  sensor_match: boolean;
  missing_data_pct: number;
  season_warning?: string;
}

export interface AOIInfo {
  name: string;
  region: string;
  country: string;
  center: [number, number]; // [lat, lng]
  zoom: number;
  area_hectares: number;
  area_sqkm: number;
  coordinates: [number, number][]; // [lat, lng][]
}

export interface ChangeStats {
  overall_change_percent: number;
  new_built_up_hectares: number;
  new_built_up_percent: number;
  vegetation_change_hectares: number;
  water_change_hectares: number;
  bare_change_hectares: number;
  development_intensity_score: number;
  intensity_rating: 'Low' | 'Moderate' | 'High' | 'Very High';
  intensity_formula_breakdown: string;
}

export interface LandCoverDistribution {
  type: LandCoverType;
  label: string;
  color: string;
  past_ha: number;
  past_pct: number;
  present_ha: number;
  present_pct: number;
  delta_ha: number;
}

export interface TransitionItem {
  from: LandCoverType;
  from_label: string;
  to: LandCoverType;
  to_label: string;
  hectares: number;
  percentage_of_aoi: number;
}

export interface TransitionMatrixCell {
  from: LandCoverType;
  to: LandCoverType;
  hectares: number;
}

export interface HistoricalTrendPoint {
  year: number;
  built_hectares: number;
  vegetation_hectares?: number;
  water_hectares?: number;
  isMeasured: boolean;
}

export interface FutureScenario {
  id: string;
  title: string;
  tagline: string;
  archetype: 'business_as_usual' | 'accelerated_development' | 'managed_growth';
  badge_color: string;
  assumption: string;
  calculation: string;
  projected_year: number;
  projected_built_up_hectares: number;
  projected_built_up_percent: number;
  net_built_increase_hectares: number;
  retained_vegetation_hectares: number;
  land_change_description: string;
  environmental_or_infrastructure_impact: string;
  confidence_level: 'High' | 'Moderate' | 'Low';
  confidence_note: string;
  main_uncertainty: string;
  risk_index: number; // 0-100
}

export interface VisualGridCell {
  x: number;
  y: number;
  pastCover: LandCoverType;
  presentCover: LandCoverType;
  isChange: boolean;
  changeType: 'development' | 'vegetation_loss' | 'vegetation_gain' | 'water_gain' | 'water_loss' | 'bare_gain' | 'none';
  intensity: number; // 0 to 1
}

export interface VisualTileData {
  resolution_meters: number;
  grid_size: number;
  past_optical_url?: string;
  present_optical_url?: string;
  cells: VisualGridCell[];
}

export interface AnalysisResult {
  analysis_id: string;
  timestamp: string;
  sensor: string;
  resolution: string;
  aoi: AOIInfo;
  periods: {
    past_year: number;
    past_range: [string, string];
    present_year: number;
    present_range: [string, string];
    is_same_season: boolean;
  };
  quality: DataQuality;
  stats: ChangeStats;
  largest_transition: {
    from: string;
    to: string;
    hectares: number;
    pct: number;
  };
  land_cover_composition: LandCoverDistribution[];
  transitions: TransitionItem[];
  transition_matrix: TransitionMatrixCell[];
  trend: {
    slope_ha_per_year: number;
    intercept: number;
    r_squared: number;
    historical_points: HistoricalTrendPoint[];
    future_projections: {
      scenario_id: string;
      title: string;
      color: string;
      points: { year: number; built_hectares: number }[];
    }[];
  };
  ai_summary: string;
  scenarios: FutureScenario[];
  visual_grid: VisualTileData;
  audit: {
    dataset_sources: string[];
    processing_version: string;
    computation_hash: string;
    cloud_mask_threshold: number;
    spectral_ndbi_threshold: number;
    spectral_ndvi_threshold: number;
  };
}

export interface PresetArea {
  id: string;
  name: string;
  region: string;
  country: string;
  description: string;
  tag: string;
  center: [number, number];
  zoom: number;
  area_hectares: number;
  coordinates: [number, number][];
  default_past_year: number;
  default_present_year: number;
  thumbnail_preview: string;
}
