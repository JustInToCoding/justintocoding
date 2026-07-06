// Verkleint/comprimeert de bronfoto naar WebP + JPEG-fallback.
// Draait mee in `npm run build`. Slaat over als de bron ontbreekt.
import sharp from 'sharp';
import { existsSync } from 'node:fs';

const SRC = 'assets/photo-src.jpg';
const SIZE = 320; // ~2x weergavegrootte (140px) voor retina

if (!existsSync(SRC)) {
  console.warn(`[photos] ${SRC} niet gevonden — sla beeldverwerking over.`);
  process.exit(0);
}

const base = sharp(SRC).resize(SIZE, SIZE, { fit: 'cover', position: 'attention' });

await base.clone().webp({ quality: 82 }).toFile('public/photo.webp');
await base.clone().jpeg({ quality: 80, progressive: true, mozjpeg: true }).toFile('public/photo.jpg');

console.log('[photos] photo.webp en photo.jpg gegenereerd.');
