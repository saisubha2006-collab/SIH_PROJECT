import type { VercelRequest, VercelResponse } from '@vercel/node';
import { calculatePolygonArea, evaluateDataQuality } from '../server/engine.ts';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const { aoi, past_range, present_range } = req.body;
    const coords = aoi?.coordinates || [];
    const area = calculatePolygonArea(coords);
    const quality = evaluateDataQuality(
      past_range || ['2019-01-01', '2019-03-31'],
      present_range || ['2026-01-01', '2026-03-31'],
      area.hectares
    );

    res.json({
      valid: true,
      area_hectares: area.hectares,
      area_sqkm: area.sqkm,
      quality,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to preview area' });
  }
}
