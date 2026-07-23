// Cuts the owner's uploaded logo.png (solid white background) down to a
// transparent-background brand mark, in two crops:
//   public/brand/logo.png          — branch + "Ethereal Artisan" + tagline
//   public/brand/logo-compact.png  — branch + "Ethereal Artisan" only
// Run: node scripts/process-logo.mjs   (needs the "sharp" package)
import sharp from "sharp";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(root, "../public/brand/logo-source.png");
const outDir = path.join(root, "../public/brand");
mkdirSync(outDir, { recursive: true });

const PAD = 14;

async function cut(cropBox, outName) {
  const [x0, y0, x1, y1] = cropBox;
  const left = Math.max(0, x0 - PAD);
  const top = Math.max(0, y0 - PAD);
  const width = x1 - x0 + PAD * 2;
  const height = y1 - y0 + PAD * 2;

  const { data, info } = await sharp(src)
    .extract({ left, top, width, height })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width: w, height: h, channels } = info;
  const out = Buffer.from(data); // copy

  for (let i = 0; i < w * h; i++) {
    const o = i * channels;
    const r = data[o], g = data[o + 1], b = data[o + 2];
    // Distance from pure white in the channel that deviates least — i.e. how
    // "white" this pixel is. Near-white -> transparent; solid ink/leaf
    // colours stay fully opaque; only the 1-2px anti-aliased rim in between
    // gets a soft alpha ramp.
    const whiteness = Math.min(255 - r, 255 - g, 255 - b);
    let alpha;
    if (whiteness <= 6) alpha = 0;
    else if (whiteness >= 40) alpha = 255;
    else alpha = Math.round(((whiteness - 6) / 34) * 255);
    out[o + 3] = alpha;
  }

  await sharp(out, { raw: { width: w, height: h, channels } })
    .png()
    .toFile(path.join(outDir, outName));
  console.log(`✓ ${outName} (${w}x${h})`);
}

// [x0, y0, x1, y1] measured against the source 940x788 canvas
await cut([207, 284, 733, 486], "logo.png"); // branch + name + tagline
await cut([207, 284, 733, 430], "logo-compact.png"); // branch + name only

console.log("Done.");
