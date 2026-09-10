import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PRESET_AREAS } from '../src/data/presets.ts';
import { runFullAnalysis } from '../server/engine.ts';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const { aoi, locationName, regionName, countryName, past_range, present_range, presetId } = req.body;

    let aoiCoords: [number, number][] = aoi?.coordinates;
    let finalLocationName = locationName || 'Custom AOI';

    if (presetId) {
      const preset = PRESET_AREAS.find((p) => p.id === presetId);
      if (preset) {
        if (!aoiCoords || aoiCoords.length < 3) {
          aoiCoords = preset.coordinates;
        }
        finalLocationName = preset.name;
      }
    }

    if (!aoiCoords || aoiCoords.length < 3) {
      return res.status(400).json({
        error: 'Invalid AOI polygon. A closed boundary with at least 3 coordinates is required.',
      });
    }

    const pastRangeFinal: [string, string] = past_range || ['2019-01-01', '2019-03-31'];
    const presentRangeFinal: [string, string] = present_range || ['2026-01-01', '2026-03-31'];

    const result = await runFullAnalysis({
      aoiCoords,
      locationName: finalLocationName,
      regionName,
      countryName,
      pastRange: pastRangeFinal,
      presentRange: presentRangeFinal,
      presetId,
    });

    res.json(result);
  } catch (err: any) {
    console.error('Analysis execution error:', err);
    res.status(500).json({ error: err.message || 'Error executing remote sensing analysis' });
  }
}
