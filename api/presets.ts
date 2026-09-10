import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PRESET_AREAS } from '../src/data/presets.ts';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.json({ presets: PRESET_AREAS });
}
